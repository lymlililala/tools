// 2) 聚类：DeepSeek 对源文池语义聚类，产出**锚定站内某工具页**的英文科普选题（每簇 2-6 篇）。
//    站内文章表 tools_articles.tool_path 非空，故每个选题必须绑定一个真实工具 path。
// 数据源：tools_wx_sources（读最近 N 天，无需重爬）。
// 用法：node scripts/wechat/2-cluster.mjs --days 14 --max-clusters 8

import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { DeepSeek } from './deepseek.mjs'
import { DATA_DIR } from './lib/env.mjs'
import { fetchSources } from './lib/sources.mjs'
import { loadToolCatalog, catalogForPrompt, normalizeToolPath } from './lib/tools.mjs'

function arg(name, def) {
  const i = process.argv.indexOf(name)
  return i === -1 ? def : process.argv[i + 1]
}
const MAX_CLUSTERS = Number(arg('--max-clusters', 8))
const DAYS = Number(arg('--days', 14))

mkdirSync(DATA_DIR, { recursive: true })
const OUT = join(DATA_DIR, 'clusters.json')

const catalog = loadToolCatalog()
if (!catalog.length) { console.error('未扫描到站内工具（src/tools/*），无法做工具感知聚类'); process.exit(1) }

const sources = await fetchSources({ sinceDays: DAYS, minBodyLen: 200 })
console.log(`读取源文最近 ${DAYS} 天：${sources.length} 篇（tools_wx_sources 或本地 sources.json），站内工具 ${catalog.length} 个`)
if (!sources.length) { console.error('源文为空，先跑 1-crawl.mjs'); process.exit(1) }

// 给模型的精简清单（不含全文，省 token）
const list = sources.map((s, i) => ({ id: i, account: s.account, title: s.title, digest: (s.digest || '').slice(0, 80) }))

const ds = new DeepSeek()

const sys = `You are a senior content editor for an English developer-tools website (it-tools: online utilities like JSON/regex/encoding/hashing/converters). You will get a batch of Chinese tech/efficiency WeChat articles (title + digest only).

Task: cluster them into topics that can each be written up as an EVERGREEN English explainer/how-to article ANCHORED TO ONE EXISTING TOOL on our site.

You MUST map every cluster to exactly one tool_path from this catalog (path | keywords). Only create a cluster when the source articles genuinely relate to that tool's topic — do NOT force weak matches.

TOOL CATALOG:
${catalogForPrompt(catalog)}

Requirements:
1. Each cluster picks 2-6 semantically related source articles (give their ids) that inform an article about ONE tool's topic.
2. tool_path MUST be copied verbatim from the catalog above (e.g. /json-format, /regex-tester, /hash-text).
3. Exclude: time-sensitive news, ads/promotions, recruitment, vendor PR, anything with no evergreen how-to value. Skip topics with no matching tool.
4. Prefer practical developer value: what the concept is, when/why to use it, common pitfalls, best practices, worked examples — the kind of thing that complements a hands-on tool.
5. At most ${MAX_CLUSTERS} clusters. Quality over quantity. Do not map two clusters to the same tool_path.

Return ONLY JSON:
{"clusters":[{
  "tool_path":"/exact-path-from-catalog",
  "topic":"short English topic name",
  "working_title":"proposed English article title (specific, not clickbait)",
  "angle":"what the reader gets, one sentence",
  "source_ids":[array of ints],
  "suggested_category":"short English category, e.g. Crypto, Converter, Web, Development, Data, Text",
  "suggested_keywords":["english lowercase keywords for SEO"]
}]}`

console.log(`对 ${list.length} 篇源文做工具感知聚类（最多 ${MAX_CLUSTERS} 簇）…`)
const out = await ds.chatJSON(
  [{ role: 'system', content: sys }, { role: 'user', content: JSON.stringify(list) }],
  { maxTokens: 4000 },
)

const seenTool = new Set()
const clusters = []
for (const c of (out.clusters || [])) {
  if (!Array.isArray(c.source_ids) || c.source_ids.length < 2) continue
  const tp = normalizeToolPath(c.tool_path, catalog)
  if (!tp) { console.log(`  ⊘ 丢弃：tool_path 无效 "${c.tool_path}"  (${c.working_title})`); continue }
  if (seenTool.has(tp)) { console.log(`  ⊘ 丢弃：同工具页重复 ${tp}  (${c.working_title})`); continue }
  seenTool.add(tp)
  c.tool_path = tp
  // 回填源文引用（sn / title），供下一步取全文
  c.sources = c.source_ids.map(id => sources[id]).filter(Boolean).map(s => ({ sn: s.sn, account: s.account, title: s.title }))
  clusters.push(c)
}

writeFileSync(OUT, JSON.stringify(clusters, null, 2))
console.log(`\n产出 ${clusters.length} 个主题簇 → ${OUT}`)
for (const c of clusters) console.log(`  · ${c.tool_path}  「${c.working_title}」 (${c.source_ids.length} 源文)`)
console.log('用量:', ds.costEstimate())
console.log('⚠️  请打开 clusters.json 审一遍工具归并/选题是否合理，再跑 3-synthesize.mjs')
