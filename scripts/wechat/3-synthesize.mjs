// 3) 合成：逐簇取成员源文全文（中文），DeepSeek 综合提炼 + 翻译，产出一篇全新原创**英文**
//    开发者工具科普/实践文（对齐 tools_articles 字段与站内文风）。
// 用法：node scripts/wechat/3-synthesize.mjs
//       node scripts/wechat/3-synthesize.mjs --limit 3   # 只合成前 3 簇试跑
//       node scripts/wechat/3-synthesize.mjs --images    # 让正文插入 ![alt](IMG: kw) 配图占位

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

// meta description 兜底裁剪到 ≤158（质量闸门上限 165，留余量）：按词边界截断。
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
// 站内现有 slug 集合（判重 + 唯一化）。从库内拉，无库则空集。
const existingPosts = await loadExistingPosts()
const existingSlugs = new Set((existingPosts || []).map(p => p.slug))
console.log(`站内现有 ${existingSlugs.size} 篇文章。开始合成 ${clusters.length} 篇 …\n`)

const IMG_RULE = WANT_IMAGES
  ? `6. Insert 2-4 inline images at natural points (after the intro, then spread through). Use EXACTLY this placeholder syntax — do NOT invent image URLs (real URLs are filled in later):
   ![descriptive alt text](IMG: short comma-separated visual keywords)
   The IMG keywords name a concrete, photographable subject (e.g. "server racks, data center" or "code on screen, terminal"). Avoid abstract concepts that cannot be photographed. Do not put images inside tables.`
  : `6. Do NOT insert any images. This is a text + code + table explainer.`

const SYS = `You are a senior technical writer for it-tools, an English developer-tools website offering free online utilities (JSON/regex/encoding/hashing/converters/generators).
You will be given several Chinese tech WeChat articles on one topic as REFERENCE MATERIAL. Synthesize them into a brand-new, well-structured, ORIGINAL ENGLISH article that explains the topic and complements a specific on-site tool.

IRON RULES:
1. This is original synthesis + translation, NOT a literal translation or rewrite of any single source. Never copy/paraphrase any one source paragraph-by-paragraph. Re-organise, distil the consensus, add your own logical framework. The output must read as native technical English — no leftover Chinese, no "本文/小编/公众号/扫码关注".
2. Audience: developers and technical users. Be concrete and practical: what the concept is, why it matters, when to use it, common pitfalls, security/perf considerations, and worked examples. No marketing fluff, no fabricated benchmarks/figures.
3. Body in GitHub-flavored Markdown matching this site's article style:
   - Open with a short 1-2 sentence intro paragraph (no heading), then use ## and ### section headings.
   - Use bullet lists with - , ordered lists for steps, | pipe | tables for comparisons/reference, and fenced code blocks with a language tag for any code/CLI/config examples.
   - Bold key terms with **...**. Do NOT invent fake URLs, version numbers, or exact figures you are unsure of.
4. Naturally reference the companion tool ONCE or twice with a relative Markdown link to its tool_path (given below), e.g. "Try it in our [JSON formatter](/json-format)." Do NOT invent other site paths.
5. Length: 900-1600 English words. Genuinely useful depth, no padding. Include at least 3-5 section headings and at least one table or one code block where it helps.
${IMG_RULE}

Return ONLY JSON:
{
 "slug":"clean-lowercase-hyphenated-slug, max 6 words, start with the topic, NO date, NO random suffix",
 "title":"English title (45-70 chars, specific, includes the topic)",
 "description":"English meta description, STRICTLY 120-158 characters, one sentence, no trailing ellipsis",
 "content":"full Markdown body (short intro paragraph, then ## sections; includes a code block and/or table; references the tool path as a relative link)",
 "keywords":["6-10 english lowercase SEO keywords"],
 "category":"short English category, e.g. Crypto, Converter, Web, Development, Data, Text"
}`

const drafts = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : []
const doneTopics = new Set(drafts.map(d => d._topic))
if (existingPosts) console.log(`判重库：tools_articles 已有 ${existingPosts.length} 篇\n`)
let skippedDup = 0

for (const c of clusters) {
  if (doneTopics.has(c.topic)) { console.log(`✓ 已合成跳过: ${c.topic}`); continue }
  const toolPath = normalizeToolPath(c.tool_path, catalog)
  if (!toolPath) { console.log(`✗ tool_path 无效跳过: ${c.tool_path}`); continue }
  const members = (c.sources || []).map(s => bySn.get(s.sn)).filter(Boolean)
  if (members.length < 2) { console.log(`✗ 源文不足跳过: ${c.topic}`); continue }

  // 判重：与库内已有文章实质重复则跳过（省合成费 + 防伤 SEO）
  const dup = await isDuplicate({ ...c, tool_path: toolPath }, existingPosts, ds)
  if (dup.dup) { console.log(`⊘ 判重跳过: ${c.working_title}  [${dup.reason}] ↔ ${dup.match || ''}`); skippedDup++; continue }

  const material = members
    .map((m, i) => `### Source ${i + 1}: ${m.title}（WeChat account: ${m.account}）\n${truncate(m.body_text, 5000)}`)
    .join('\n\n---\n\n')

  const userMsg = `Companion tool_path: ${toolPath}\nTopic: ${c.topic}\nWorking title: ${c.working_title}\nAngle: ${c.angle}\nSuggested category: ${c.suggested_category || ''}\nSuggested keywords: ${(c.suggested_keywords || []).join(', ')}\n\nReference material (Chinese):\n\n${material}`

  console.log(`合成中: ${c.working_title}  → ${toolPath}  (${members.length} 源文)`)
  try {
    const d = await ds.chatJSON([{ role: 'system', content: SYS }, { role: 'user', content: userMsg }], { maxTokens: 9000, temperature: 0.6 })
    d.slug = uniqueSlug(d.slug || c.working_title, existingSlugs)
    d.description = clampDesc(d.description)
    d.toolPath = toolPath
    d.category = d.category || c.suggested_category || 'Development'
    d.keywords = Array.isArray(d.keywords) && d.keywords.length ? d.keywords : (c.suggested_keywords || [])
    // provenance：记录来源，备查与合规追溯（不入文章，仅留 data/）
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
console.log('用量:', ds.costEstimate())
console.log('⚠️  抽查 drafts.json 1-2 篇（原创度/英文质量/toolPath/字数/代码块），再跑 4-publish.mjs')
