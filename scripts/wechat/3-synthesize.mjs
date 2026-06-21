// 3) 合成：逐簇取成员源文全文（中文），DeepSeek 综合提炼 + 翻译，产出全新原创**英文**文章。
//    按每簇 kind 选模板：
//      blog → 开发者主题博客（tool_path 留空，可自然引用站内工具）。
//      tool → 锚定某工具页的科普/实践文。
// 用法：node scripts/wechat/3-synthesize.mjs            # 处理 clusters.json 全部
//       node scripts/wechat/3-synthesize.mjs --limit 3  # 只合成前 3 簇试跑
//       node scripts/wechat/3-synthesize.mjs --images   # 正文插入 ![alt](IMG: kw) 配图占位

import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { DeepSeek } from './deepseek.mjs'
import { truncate } from './lib/clean-html.mjs'
import { uniqueSlug } from './lib/slug.mjs'
import { loadExistingPosts, isDuplicate } from './lib/dedup.mjs'
import { fetchSources } from './lib/sources.mjs'
import { loadToolCatalog, normalizeToolPath } from './lib/tools.mjs'
import { DATA_DIR } from './lib/env.mjs'

function arg(name, def) {
  const i = process.argv.indexOf(name)
  return i === -1 ? def : process.argv[i + 1]
}
const has = name => process.argv.includes(name)

function clampDesc(s, max = 158) {
  const desc = (s || '').trim()
  if (desc.length <= max) return desc
  const cut = desc.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > 80 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.\-–—]+$/, '')
}
const LIMIT = arg('--limit', null) ? Number(arg('--limit', null)) : null
const DAYS = Number(arg('--days', 14))
const WANT_IMAGES = has('--images')

const CLU = join(DATA_DIR, 'clusters.json')
const OUT = join(DATA_DIR, 'drafts.json')
if (!existsSync(CLU)) { console.error('缺少 clusters.json，先跑 2-cluster.mjs'); process.exit(1) }

const catalog = loadToolCatalog()
const sources = await fetchSources({ sinceDays: DAYS })
const bySn = new Map(sources.map(s => [s.sn, s]))
let clusters = JSON.parse(readFileSync(CLU, 'utf8'))
if (LIMIT) clusters = clusters.slice(0, LIMIT)

const ds = new DeepSeek()
const existingPosts = await loadExistingPosts()
const existingSlugs = new Set((existingPosts || []).map(p => p.slug))
console.log(`站内现有 ${existingSlugs.size} 篇文章。开始合成 ${clusters.length} 篇 …\n`)

const IMG_RULE = WANT_IMAGES
  ? `Images: use EXACTLY this placeholder (real URLs filled in later): ![descriptive alt](IMG: concrete photographable keywords). Place ONE near the top right after the intro paragraph (a cover), and optionally 1-2 more at natural section breaks. The keywords MUST name a concrete, photographable subject (e.g. "qr code on phone screen", "mechanical keyboard keys", "server racks") — NOT an abstract concept. If the topic has no real photographable subject (e.g. text escaping, hashing, encoding), insert NO images rather than forcing generic stock filler. Never put images inside tables.`
  : `Do NOT insert any images. Text + code + tables only.`

// ── 两套 system prompt ───────────────────────────────────────────────────────
const SYS_BLOG = `You are a senior technical writer for the it-tools developer blog. You will be given several Chinese tech WeChat articles on one topic as REFERENCE MATERIAL. Synthesize them into a brand-new, ORIGINAL ENGLISH developer blog post.

IRON RULES:
1. Original synthesis + translation, NOT a literal translation or rewrite of any one source. Re-organise, distil the consensus, add your own framework. Native technical English — no leftover Chinese, no "本文/小编/公众号/扫码关注".
2. Audience: international developers. Be concrete and useful: explain what's happening and why it matters, give context, comparisons, practical takeaways, pitfalls. No marketing fluff, no fabricated figures/benchmarks/quotes. Prefer an evergreen or "state of X" angle over a single dated news blip.
3. GitHub-flavored Markdown: short 1-2 sentence intro (no heading), then ## / ### sections, bullet/ordered lists, | tables | for comparison, fenced code blocks with a language tag where relevant. Bold key terms. No invented URLs/versions/exact numbers you are unsure of.
4. Length: 900-1500 English words, with at least 3 section headings. You MAY (optional) link once to a relevant it-tools utility with a relative path if it genuinely fits (e.g. [JSON formatter](/json-format)); do not force it and do not invent paths.
5. ${IMG_RULE}

Return ONLY JSON:
{"slug":"clean-lowercase-hyphenated, max 6 words, no date/suffix","title":"English title 45-70 chars","description":"meta description 120-158 chars, one sentence, no trailing ellipsis","content":"full Markdown body","keywords":["6-10 lowercase SEO keywords"],"category":"short English category"}`

const SYS_TOOL = `You are a senior technical writer for it-tools (online developer utilities). You will be given several Chinese tech WeChat articles on one topic as REFERENCE MATERIAL. Synthesize them into a brand-new, ORIGINAL ENGLISH explainer that complements a specific on-site tool. The tool already has a basic intro article, so go DEEPER on the given angle.

IRON RULES:
1. Original synthesis + translation, NOT a literal rewrite of any one source. Native technical English — no leftover Chinese.
2. Audience: developers. Concrete and practical for the SPECIFIC angle given: what the concept is, why it matters, when to use it, pitfalls, security/perf, and at least one fully worked end-to-end example. Teach durable, evergreen knowledge — do NOT include time-sensitive news, dated version numbers, benchmark figures, funding/market claims, or any fact you cannot stand behind. No fabricated figures.
3. GitHub-flavored Markdown structure (use most of these): short intro, ## / ### sections, a worked example with a fenced code block, a comparison | table | where it helps, a short bulleted "Common pitfalls" list, and a 3-5 item "## FAQ" with ### question subheads. Bold key terms. No invented URLs/versions. When writing regex/escape sequences in code spans or code blocks, use a SINGLE backslash — the rendered article must show \\d, \\w, \\s (one backslash), never a doubled backslash.
4. Reference the companion tool ONCE or twice with a relative Markdown link to its tool_path (given below), e.g. "Try it in our [JSON formatter](/json-format)." Do NOT invent other site paths.
5. Length: 1100-1700 English words (substantial), at least 5 section headings. Depth and worked examples over filler.
6. ${IMG_RULE}

Return ONLY JSON:
{"slug":"clean-lowercase-hyphenated, max 6 words, no date/suffix","title":"English title 45-70 chars","description":"meta description 120-158 chars","content":"full Markdown body referencing the tool path","keywords":["6-10 lowercase SEO keywords"],"category":"short English category"}`

const drafts = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : []
const doneTopics = new Set(drafts.map(d => d._topic))
if (existingPosts) console.log(`判重库：tools_articles 已有 ${existingPosts.length} 篇\n`)
let skippedDup = 0

for (const c of clusters) {
  if (doneTopics.has(c.topic)) { console.log(`✓ 已合成跳过: ${c.topic}`); continue }
  const kind = c.kind === 'tool' ? 'tool' : 'blog'
  let toolPath = null
  if (kind === 'tool') {
    toolPath = normalizeToolPath(c.tool_path, catalog)
    if (!toolPath) { console.log(`✗ tool_path 无效跳过: ${c.tool_path}`); continue }
  }
  const members = (c.sources || []).map(s => bySn.get(s.sn)).filter(Boolean)
  if (members.length < 2) { console.log(`✗ 源文不足跳过: ${c.topic}`); continue }

  const dup = await isDuplicate({ ...c, tool_path: toolPath }, existingPosts, ds)
  if (dup.dup) { console.log(`⊘ 判重跳过: ${c.working_title}  [${dup.reason}] ↔ ${dup.match || ''}`); skippedDup++; continue }

  const material = members
    .map((m, i) => `### Source ${i + 1}: ${m.title}（WeChat account: ${m.account}）\n${truncate(m.body_text, 5000)}`)
    .join('\n\n---\n\n')

  const sys = kind === 'tool' ? SYS_TOOL : SYS_BLOG
  const head = kind === 'tool' ? `Companion tool_path: ${toolPath}\n` : ''
  const userMsg = `${head}Topic: ${c.topic}\nWorking title: ${c.working_title}\nAngle: ${c.angle}\nSuggested category: ${c.suggested_category || ''}\nSuggested keywords: ${(c.suggested_keywords || []).join(', ')}\n\nReference material (Chinese):\n\n${material}`

  console.log(`合成中[${kind}]: ${c.working_title}  ${toolPath ? '→ ' + toolPath : ''}  (${members.length} 源文)`)
  try {
    const d = await ds.chatJSON([{ role: 'system', content: sys }, { role: 'user', content: userMsg }], { maxTokens: 9000, temperature: 0.6 })
    d.slug = uniqueSlug(d.slug || c.working_title, existingSlugs)
    d.description = clampDesc(d.description)
    d.kind = kind
    d.toolPath = toolPath // blog 为 null
    d.category = d.category || c.suggested_category || (kind === 'tool' ? 'Development' : 'Blog')
    d.keywords = Array.isArray(d.keywords) && d.keywords.length ? d.keywords : (c.suggested_keywords || [])
    d._topic = c.topic
    d._sources = members.map(m => ({ sn: m.sn, account: m.account, title: m.title, url: m.content_url }))
    drafts.push(d)
    writeFileSync(OUT, JSON.stringify(drafts, null, 2))
    console.log(`  ✓ ${d.slug}  ${(d.content || '').length} 字符`)
  } catch (e) {
    console.log(`  ✗ 合成失败: ${e.message}`)
  }
}

console.log(`\n已写入 ${OUT}（共 ${drafts.length} 篇草稿，本次判重跳过 ${skippedDup}）`)
// 无条件落盘一次：即使本轮 0 簇/0 草稿，也保证 drafts.json 存在，让 4-publish 平稳处理。
writeFileSync(OUT, JSON.stringify(drafts, null, 2))
console.log('用量:', ds.costEstimate())
console.log('⚠️  抽查 drafts.json 1-2 篇，再跑 4-publish.mjs')
