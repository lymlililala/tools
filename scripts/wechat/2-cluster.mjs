// 2) 聚类：DeepSeek 对源文池语义聚类，产出选题。双模式：
//    --mode blog（默认，主线）：开发者主题博客选题，tool_path 留空（站内已有大量同类博客文）。
//    --mode tool（补充）       ：锚定站内某工具页的科普选题（配合 1-search 按工具关键词采的源文）。
// 数据源：tools_wx_sources（读最近 N 天，无需重爬）。
// 用法：node scripts/wechat/2-cluster.mjs --mode blog --days 14 --max-clusters 8

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
const MODE = arg('--mode', 'blog')
const MAX_CLUSTERS = Number(arg('--max-clusters', 8))
const DAYS = Number(arg('--days', 14))

mkdirSync(DATA_DIR, { recursive: true })
const OUT = join(DATA_DIR, 'clusters.json')

const sources = await fetchSources({ sinceDays: DAYS, minBodyLen: 200 })
console.log(`[mode=${MODE}] 读取源文最近 ${DAYS} 天：${sources.length} 篇`)
if (!sources.length) { console.error('源文为空，先跑 1-crawl.mjs / 1-search.mjs'); process.exit(1) }

// 给模型的精简清单（不含全文，省 token）
const list = sources.map((s, i) => ({ id: i, account: s.account, title: s.title, digest: (s.digest || '').slice(0, 80) }))

const ds = new DeepSeek()

// ── 两套 system prompt ───────────────────────────────────────────────────────
function blogSys() {
  return `You are a senior content editor for it-tools, an English developer-tools website that also runs a developer blog. You will get a batch of Chinese tech/dev WeChat articles (title + digest only).

Task: cluster them into topics that can each be written up as an ORIGINAL ENGLISH developer blog post — a synthesis/round-up/explainer with lasting value to an international developer audience.

Good blog angles: AI/ML trends & explainers, open-source project round-ups, programming techniques & best practices, frontend/backend/devops trends, productivity & tooling, career/engineering practices. Prefer synthesis ("what's happening and why it matters", comparisons, how-to, lessons) over single time-sensitive news items.

Requirements:
1. Each cluster picks 2-6 semantically related source articles (give their ids) that together inform ONE blog post.
2. Exclude: pure gossip/PR, recruitment, ads, personal/emotional posts, single breaking-news with no lasting angle.
3. category: a short English topic label (e.g. AI, Machine Learning, Frontend, Backend, Open Source, DevOps, Tools, Career, Security, Data).
4. At most ${MAX_CLUSTERS} clusters. Quality over quantity. Avoid two clusters on the same narrow topic.

Return ONLY JSON:
{"clusters":[{
  "kind":"blog",
  "topic":"short English topic name",
  "working_title":"proposed English blog title (specific, not clickbait)",
  "angle":"what the reader gets, one sentence",
  "source_ids":[ints],
  "suggested_category":"short English category",
  "suggested_keywords":["english lowercase SEO keywords"]
}]}`
}

function toolSys(catalog) {
  return `You are a senior content editor for it-tools (online utilities: JSON/regex/encoding/hashing/converters). You will get Chinese tech WeChat articles (title + digest only).

Task: cluster them into EVERGREEN English explainer/how-to topics, each ANCHORED TO ONE EXISTING TOOL. Map every cluster to exactly one tool_path from this catalog (path | keywords). Only create a cluster when the sources genuinely relate to that tool's topic — do NOT force weak matches.

TOOL CATALOG:
${catalogForPrompt(catalog)}

Requirements:
1. Each cluster: 2-6 related source ids informing an article about ONE tool's topic.
2. tool_path MUST be copied verbatim from the catalog (e.g. /json-format, /regex-tester, /hash-text).
3. Exclude time-sensitive news, ads, recruitment. Skip topics with no matching tool.
4. At most ${MAX_CLUSTERS} clusters. Do not map two clusters to the same tool_path.

Return ONLY JSON:
{"clusters":[{
  "kind":"tool",
  "tool_path":"/exact-path-from-catalog",
  "topic":"short English topic name",
  "working_title":"proposed English article title",
  "angle":"one sentence",
  "source_ids":[ints],
  "suggested_category":"short English category",
  "suggested_keywords":["english lowercase keywords"]
}]}`
}

const catalog = MODE === 'tool' ? loadToolCatalog() : []
if (MODE === 'tool' && !catalog.length) { console.error('未扫描到站内工具（src/tools/*）'); process.exit(1) }
const sys = MODE === 'tool' ? toolSys(catalog) : blogSys()

console.log(`对 ${list.length} 篇源文聚类（mode=${MODE}，最多 ${MAX_CLUSTERS} 簇）…`)
const out = await ds.chatJSON(
  [{ role: 'system', content: sys }, { role: 'user', content: JSON.stringify(list) }],
  { maxTokens: 4000 },
)

const seenTool = new Set()
const clusters = []
for (const c of (out.clusters || [])) {
  if (!Array.isArray(c.source_ids) || c.source_ids.length < 2) continue
  c.kind = MODE
  if (MODE === 'tool') {
    const tp = normalizeToolPath(c.tool_path, catalog)
    if (!tp) { console.log(`  ⊘ 丢弃：tool_path 无效 "${c.tool_path}"  (${c.working_title})`); continue }
    if (seenTool.has(tp)) { console.log(`  ⊘ 丢弃：同工具页重复 ${tp}`); continue }
    seenTool.add(tp)
    c.tool_path = tp
  } else {
    c.tool_path = null
  }
  c.sources = c.source_ids.map(id => sources[id]).filter(Boolean).map(s => ({ sn: s.sn, account: s.account, title: s.title }))
  clusters.push(c)
}

writeFileSync(OUT, JSON.stringify(clusters, null, 2))
console.log(`\n产出 ${clusters.length} 个主题簇 → ${OUT}`)
for (const c of clusters) console.log(`  · [${c.kind}] ${c.tool_path || c.suggested_category || ''}  「${c.working_title}」 (${c.source_ids.length} 源文)`)
console.log('用量:', ds.costEstimate())
console.log('⚠️  审一遍 clusters.json，再跑 3-synthesize.mjs')
