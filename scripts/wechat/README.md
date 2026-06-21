# 公众号内容流水线 → it-tools 文章（开发者工具主题）

为本站（**it-tools**：开发者实用工具 / 在线转换 / 效率工具）聚合优质中文公众号内容，
合成为**英文工具科普/实践文**，每篇锚定一个站内工具页，直接 upsert 进 Supabase
`tools_articles`，经 `/api/articles` 对外可见。

> 采集层复用零依赖的次幂数据客户端（`cimidata/`，Node 18+ 原生 fetch）。
> 合成/评分用 DeepSeek（OpenAI 兼容）。配图可选（Pexels/Unsplash）。

## 与旅游版（chinatravel）的关键差异

| 维度 | chinatravel | **本仓库 it-tools** |
|---|---|---|
| 文章载体 | Astro `.md` 文件 | Supabase 表 `tools_articles`（无 .md） |
| 选题 | 自由目的地/文化选题 | **必须锚定一个站内工具页**（`tool_path` 非空） |
| 正文 | 旅游指南 | 开发者工具科普/实践（含代码块/表格） |
| 配图 | 强制 ≥3 张 | 默认关闭（站内文多为纯文字/表格），`--images` 可开 |
| 源文表 | `dc_wx_sources` | `tools_wx_sources` |

## 目录结构

```
scripts/wechat/
├── cimidata/                次幂数据 API 客户端（零依赖，可复用）
├── lib/
│   ├── env.mjs              共享 .env 加载 + 路径常量
│   ├── supabase.mjs         Supabase 客户端（根 .env 的 SUPABASE_SECRET_KEY）
│   ├── sources.mjs          源文持久层（tools_wx_sources / 本地 sources.json 双实现）
│   ├── tools.mjs            扫描 src/tools/*，产出工具目录（工具感知聚类用）
│   ├── dedup.mjs            合成前判重（查 tools_articles）
│   ├── quality.mjs          英文工具文质量闸门
│   ├── images.mjs           配图（Pexels→Unsplash，通用技术题材）
│   ├── clean-html.mjs       正文 HTML → 纯文本
│   └── slug.mjs             英文 slug 生成 + 唯一化
├── deepseek.mjs             DeepSeek 客户端
├── accounts.mjs             ★种子名单 → 解析 wxid → accounts.json
├── discover.mjs             关键词扫号扩充候选
├── verify-cimi.mjs          凭证 / 出口 IP 自检
├── 1-crawl.mjs              采集公众号正文 → tools_wx_sources
├── 2-cluster.mjs            工具感知聚类 → data/clusters.json
├── 3-synthesize.mjs         合成英文工具文 → data/drafts.json
├── 4-publish.mjs            质量闸门 + 入库 tools_articles
├── run-all.sh               串联全流程（nightly 入口）
├── create-wx-sources-table.sql   建源文表 SQL（首次执行一次）
├── accounts.json            公众号解析结果（提交入库供复核）
└── data/                    各阶段产物（gitignored）
```

## 一次性准备

```bash
# 1. 次幂凭证
cp scripts/wechat/cimidata/.env.example scripts/wechat/cimidata/.env   # 填 app_id/app_secret
# 2. DeepSeek（聚类/合成/评分）
cp scripts/wechat/.env.example scripts/wechat/.env                     # 填 DEEPSEEK_API_KEY
# 3. 入库用 secret key：放项目根 .env 的 SUPABASE_SECRET_KEY（与 supabase-admin.mjs 共用）
# 4. 建源文表（在 Supabase SQL Editor 跑一次）
#    scripts/wechat/create-wx-sources-table.sql
# 5. 自检
node scripts/wechat/verify-cimi.mjs
```

## 找号（第 0 步）

```bash
node scripts/wechat/accounts.mjs          # 解析精选种子名单 → accounts.json
node scripts/wechat/discover.mjs          # 可选：关键词发现更多候选，人工筛后补进 accounts.mjs
```

种子名单按与「在线工具/开发者效率」主题的贴合度分组精选（粉丝多、更新勤、质量高）：
开源/GitHub 工具发现、效率工具/软件推荐、开发者综合/前后端、AI 前沿。详见 `accounts.mjs`。

## 跑流水线

```bash
# 一键（nightly）
bash scripts/wechat/run-all.sh

# 或分步：
node scripts/wechat/1-crawl.mjs --today                 # 采集当天新文
node scripts/wechat/2-cluster.mjs --days 14             # 工具感知聚类（审 clusters.json）
node scripts/wechat/3-synthesize.mjs                    # 合成（审 drafts.json）；加 --images 配图
node scripts/wechat/4-publish.mjs --dry-run             # 先看评分
node scripts/wechat/4-publish.mjs                       # 过线则 upsert 进 tools_articles
```

## 各阶段产物

- `tools_wx_sources`（DB）：采集到的源文（sn 去重，含正文）。
- `data/clusters.json`：聚类选题（每簇含 `tool_path` + 选中的源文 id）。
- `data/drafts.json`：合成草稿（含 `slug/toolPath/title/description/keywords/category/content` + `_sources` 溯源）。
- `data/published.json`：发布记录（决策/评分/动作/来源链接）。
- `tools_articles`（DB）：最终入库文章，前端读它。

## 护栏与质量

- **工具锚定**：聚类/合成阶段强制 `tool_path` 归一到 `src/tools/*` 真实路径（含 `redirectFrom` 纠错），无效即丢弃。
- **判重**：合成前查 `tools_articles`（精确 slug/标题 + DeepSeek 近似判重，优先同工具页比对）。
- **质量闸门**：薄内容、AI 套话指纹、残留中文、标题/描述长度、≥3 个标题、必须有 `tool_path`。
- **自评分**：DeepSeek 4 维打分（原创/深度/准确/可读），过阈值（默认 80）才入库。
- **单次上限**：`--max-publish`（默认 6）防一晚灌水伤 SEO；超额转「暂留」。

## 合规

公众号正文受原作者版权。本流水线把正文仅作**数据源**：经语义综合 + 翻译 + 重组为**全新英文原创**
后入库，非全文转载。`_sources` 留存原文链接备查。配图走 Pexels/Unsplash（自带授权），
公众号 mmbiz 图有防盗链、不使用。
