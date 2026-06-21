// 4) 发布：质量闸门 + DeepSeek 英文自评分。过线 → upsert 进 Supabase tools_articles（站内 /api/articles 立即可见）。
//    未过线 → 仅写 data/published.json 记录 + 草稿留档（不入库），待人工复核。
//    可选：解析正文 ![alt](IMG: kw) 占位为真实图（需 PEXELS_API_KEY / UNSPLASH_ACCESS_KEY）。
// 用法：
//   node scripts/wechat/4-publish.mjs --dry-run      # 只打印评分与判定，不写库
//   node scripts/wechat/4-publish.mjs                # 实际 upsert 入库
//   node scripts/wechat/4-publish.mjs --threshold 75 --max-publish 4

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { DeepSeek } from './deepseek.mjs'
import { checkQuality } from './lib/quality.mjs'
import { ImageFinder } from './lib/images.mjs'
import { DATA_DIR } from './lib/env.mjs'
import { hasSupabase, getSupabase } from './lib/supabase.mjs'

function arg(name, def) {
  const i = process.argv.indexOf(name)
  if (i === -1) return def
  const v = process.argv[i + 1]
  return v && !v.startsWith('--') ? v : true
}
const DRY = arg('--dry-run', false) === true
const THRESHOLD = Number(arg('--threshold', 80))
const MAX_PUBLISH = Number(arg('--max-publish', 6)) // 单次最多入库几篇（防一晚灌水伤 SEO）

// ── 配图（可选）─────────────────────────────────────────────────────────────
// 仅当正文含 ![alt](IMG: kw) 占位时才生效（synthesize 加 --images 才会产出）。
// 兜底图池：少量通用「技术/代码」题材 Unsplash 图（已带压缩参数，无防盗链问题）。
const FALLBACK_IDS = [
  '1461749280684-dccba630e2f6', // code on screen
  '1518770660439-4636190af475', // circuit board
  '1555066931-4365d14bab8c',    // code closeup
  '1542831371-29b0f74f9713',    // colorful code
  '1607799279861-4dd421887fb3', // terminal
  '1551288049-bebda4e38f71',    // data dashboard
]
function imgUrl(id) { return `https://images.unsplash.com/photo-${id}?w=1200&q=85` }
function fallbackUrl(used, seed) {
  const fresh = FALLBACK_IDS.filter(id => !used.has(id))
  const pool = fresh.length ? fresh : FALLBACK_IDS
  const id = pool[seed % pool.length]
  used.add(id)
  return imgUrl(id)
}

/** 把正文里的 ![alt](IMG: kw) 占位替换为真实图：优先搜图，未命中回退兜底池。 */
async function resolveImages(content, slug, finder) {
  const used = new Set()
  let seed = (slug || '').length
  const matches = [...(content || '').matchAll(/!\[([^\]]*)\]\(\s*IMG:\s*([^)]*)\)/gi)]
  let out = content || ''
  for (const m of matches) {
    const [whole, alt, kw] = m
    let url = null
    const hit = await finder.find(kw.trim(), alt.trim())
    if (hit) url = hit.url
    if (!url) url = fallbackUrl(used, seed++)
    out = out.replace(whole, `![${alt.trim()}](${url})`)
  }
  return out
}

const DRAFTS = join(DATA_DIR, 'drafts.json')
const OUT = join(DATA_DIR, 'published.json')
if (!existsSync(DRAFTS)) {
  console.log('没有 drafts.json（本轮无草稿），跳过发布。这是正常情况（今日无可锚定工具的常青选题）。')
  process.exit(0)
}
const drafts = JSON.parse(readFileSync(DRAFTS, 'utf8'))
if (!drafts.length) {
  console.log('drafts.json 为空（本轮 0 草稿），跳过发布。')
  process.exit(0)
}

const ds = new DeepSeek()
const finder = new ImageFinder()

const SCORE_SYS = `You are a strict content quality reviewer for an English developer-tools site. Score this article on 4 dimensions (each 0-100) and give an overall:
- originality (reads like original synthesis, not a rewrite/translation patchwork)
- depth (useful, specific, technically accurate for a developer)
- accuracy (no obvious errors / fabricated facts, figures, or APIs)
- readability (native technical English, clear structure, good code/tables)
Return ONLY JSON: {"originality":int,"depth":int,"accuracy":int,"readability":int,"overall":int,"issues":["short issue"]}`

const results = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : []
const donePub = new Set(results.filter(r => r.action && r.action !== 'error').map(r => r.slug))

const canDB = hasSupabase()
if (!DRY && !canDB) console.log('⚠️  未配置 SUPABASE_SECRET_KEY，无法入库；将只写 published.json 记录。')

if (!DRY) mkdirSync(DATA_DIR, { recursive: true })

let pub = 0, held = 0

for (const d of drafts) {
  if (donePub.has(d.slug)) { console.log(`✓ 已处理跳过 ${d.slug}`); continue }

  // 硬性闸门
  const q = checkQuality(d)
  let score = null, decision, reasonText

  if (!q.pass) {
    decision = 'hold'
    reasonText = `闸门未过: ${q.reasons.join(',')}`
  } else {
    // 软性：AI 自评分
    try {
      score = await ds.chatJSON(
        [{ role: 'system', content: SCORE_SYS }, { role: 'user', content: `Title: ${d.title}\nTool: ${d.toolPath}\n\n${d.content}` }],
        { maxTokens: 600 },
      )
    } catch (e) {
      score = { overall: 0, issues: ['评分失败:' + e.message] }
    }
    decision = (score.overall ?? 0) >= THRESHOLD ? 'publish' : 'hold'
    reasonText = `overall=${score.overall} (阈值${THRESHOLD}) len=${q.len} headings=${q.headings} img=${q.images}`
  }

  // 单次发布上限：已达上限的，过线也转 hold，留待后续放行
  if (decision === 'publish' && pub >= MAX_PUBLISH) {
    decision = 'hold'
    reasonText += ` | 超过单次上限 ${MAX_PUBLISH}，暂留`
  }

  console.log(`${decision === 'publish' ? '🟢 入库' : '🟡 暂留'}  ${d.slug}  → ${d.toolPath}`)
  console.log(`     ${reasonText}`)
  if (score?.issues?.length) console.log(`     问题: ${score.issues.join('; ')}`)

  // 解析正文配图占位（无占位则原样返回）
  const content = await resolveImages(d.content, d.slug, finder)

  const publishedAt = new Date().toISOString().slice(0, 10) // DATE 列
  let action = decision

  if (!DRY && decision === 'publish') {
    if (!canDB) {
      action = 'publish:no-db'
    } else {
      try {
        const { error } = await getSupabase().from('tools_articles').upsert({
          slug: d.slug,
          tool_path: d.toolPath,
          title: d.title,
          description: d.description || '',
          keywords: d.keywords || [],
          category: d.category || 'Development',
          published_at: publishedAt,
          content,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'slug' })
        if (error) throw new Error(error.message)
        action = 'publish:written'
      } catch (e) {
        action = 'error'
        console.log(`     ✗ 入库失败: ${e.message}`)
      }
    }
  }

  results.push({
    slug: d.slug,
    title: d.title,
    tool_path: d.toolPath,
    decision,
    action,
    score: score?.overall ?? null,
    quality: q.reasons,
    sources: d._sources?.map(s => s.url),
  })
  if (!DRY) writeFileSync(OUT, JSON.stringify(results, null, 2))
  if (decision === 'publish' && action.startsWith('publish')) pub++; else held++
}

console.log(`\n${DRY ? '[DRY-RUN] ' : ''}完成：入库 ${pub}，暂留 ${held}`)
if (!DRY) console.log(`记录写入 ${OUT}`)
console.log('DeepSeek 用量:', ds.costEstimate())
if (finder.enabled) console.log('配图来源:', finder.stats)
console.log('提示：入库后站内经 /api/articles 即可读到（边缘缓存 s-maxage=300，约 5 分钟生效）。')
