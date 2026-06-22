// 增强配图：给每篇文章 ① 一张「全局唯一」的封面图（插正文最前）
//           ② 正文中段插 2-3 张配图（分散在小节之间，篇内不重复、不与封面同图）。
// 先剥掉之前 backfill 加的旧封面再重分配，可重复运行（幂等）。
// 用法：
//   node scripts/wechat/enrich-images.mjs --dry-run            # 只统计图池/分配，不写库
//   node scripts/wechat/enrich-images.mjs --dry-run --limit 30
//   node scripts/wechat/enrich-images.mjs                      # 实际写库
//   node scripts/wechat/enrich-images.mjs --body 3 --pages 4   # 每篇正文 3 张、每主题翻 4 页

import { loadEnv } from './lib/env.mjs'
import { getSupabase, hasSupabase } from './lib/supabase.mjs'

loadEnv()
function arg(name, def) {
  const i = process.argv.indexOf(name)
  if (i === -1) return def
  const v = process.argv[i + 1]
  return v && !v.startsWith('--') ? v : true
}
const DRY = arg('--dry-run', false) === true
const LIMIT = arg('--limit', null) ? Number(arg('--limit', null)) : null
const BODY = Number(arg('--body', 3))     // 每篇正文最多插几张
const PAGES = Number(arg('--pages', 4))   // 每主题 Pexels 翻几页（每页 80）

if (!hasSupabase()) { console.error('需要 SUPABASE_SECRET_KEY'); process.exit(1) }
const PEXELS = process.env.PEXELS_API_KEY
const UNSPLASH = process.env.UNSPLASH_ACCESS_KEY
const sleep = ms => new Promise(r => setTimeout(r, ms))

const THEME_QUERY = {
  development: 'software developer coding', 'software engineering': 'software engineer programming',
  'developer tools': 'programming code screen', toolchain: 'programming workflow', tools: 'developer tools desk',
  backend: 'server backend code', database: 'database server room', databases: 'database server room',
  data: 'data analytics dashboard', 'data engineering': 'data pipeline analytics', 'data-science': 'data science chart',
  web: 'web development laptop', frontend: 'frontend web design', 'web development': 'web design code',
  devops: 'devops server cloud', cloud: 'cloud computing data center', 'system design': 'network architecture diagram',
  architecture: 'system architecture network', performance: 'speed performance technology', network: 'network server cables',
  security: 'cyber security lock', crypto: 'cryptocurrency blockchain', converter: 'code terminal screen',
  text: 'typography text screen', utilities: 'code on laptop', 'ai/ml engineering': 'artificial intelligence',
  ai: 'artificial intelligence technology', 'ai/ml': 'machine learning neural network', python: 'python programming',
  math: 'mathematics abstract numbers', measurement: 'measurement metrics gauge',
  'images and videos': 'digital creative media', mobile: 'mobile app development', typescript: 'javascript code editor',
}
const DEFAULT_QUERY = 'programming code technology'
const normCat = c => String(c || '').trim().toLowerCase()
const themeFor = c => THEME_QUERY[normCat(c)] || DEFAULT_QUERY

const FALLBACK_IDS = [
  '1461749280684-dccba630e2f6', '1518770660439-4636190af475', '1555066931-4365d14bab8c',
  '1542831371-29b0f74f9713', '1607799279861-4dd421887fb3', '1551288049-bebda4e38f71',
]
const fallbackUrl = id => `https://images.unsplash.com/photo-${id}?w=1200&q=80&auto=format&fit=crop`

async function pexels(query, page) {
  if (!PEXELS) return []
  try {
    const r = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=80&page=${page}&orientation=landscape`, { headers: { Authorization: PEXELS } })
    if (!r.ok) return []
    return ((await r.json()).photos || []).map(p => p.src?.large || p.src?.original).filter(Boolean)
  } catch { return [] }
}
async function unsplash(query) {
  if (!UNSPLASH) return []
  try {
    const r = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=30&orientation=landscape`, { headers: { Authorization: `Client-ID ${UNSPLASH}` } })
    if (!r.ok) return []
    return ((await r.json()).results || []).map(p => { const b = p.urls?.raw || p.urls?.regular; return b ? `${b}${b.includes('?') ? '&' : '?'}w=1200&q=80&fit=crop` : '' }).filter(Boolean)
  } catch { return [] }
}

// ── 读取全部文章 ─────────────────────────────────────────────────────────────
const sb = getSupabase()
let from = 0, all = []
for (;;) { const { data, error } = await sb.from('tools_articles').select('slug,title,category,content').range(from, from + 999); if (error) { console.error(error.message); process.exit(1) } all.push(...data); if (data.length < 1000) break; from += 1000 }
let targets = all
if (LIMIT) targets = targets.slice(0, LIMIT)
console.log(`共 ${all.length} 篇，本次处理 ${targets.length} 篇${DRY ? '（DRY-RUN）' : ''}，每篇封面1 + 正文≤${BODY}\n`)

// ── 构建「全局去重」图池（每主题翻 PAGES 页 + Unsplash），记录每主题列表（互不相交）──
const themes = [...new Set(targets.map(a => themeFor(a.category)))]
const seen = new Set()
const byTheme = new Map()
for (const q of themes) {
  const list = []
  for (let p = 1; p <= PAGES; p++) { const imgs = await pexels(q, p); await sleep(320); for (const u of imgs) { const k = u.split('?')[0]; if (!seen.has(k)) { seen.add(k); list.push(u) } } }
  if (list.length < 60) { for (const u of await unsplash(q)) { const k = u.split('?')[0]; if (!seen.has(k)) { seen.add(k); list.push(u) } } await sleep(320) }
  byTheme.set(q, list)
}
const totalPool = [...byTheme.values()].reduce((s, l) => s + l.length, 0)
console.log(`图池：${totalPool} 张（全局去重），覆盖 ${themes.length} 个主题`)
for (const [q, l] of byTheme) console.log(`   ${l.length} 张  ${q}`)

// ── 分配：封面全局唯一（优先本主题，用尽则借其他主题）；正文取本主题、篇内不重复 ──
const groups = new Map()
for (const a of targets) { const q = themeFor(a.category); if (!groups.has(q)) groups.set(q, []); groups.get(q).push(a) }
const coverUsed = new Set()
const allPoolFlat = [...byTheme.values()].flat()
const plan = new Map() // slug -> { cover, body:[] }
let fb = 0
function takeCover(theme) {
  for (const u of (byTheme.get(theme) || [])) if (!coverUsed.has(u)) { coverUsed.add(u); return u }
  for (const u of allPoolFlat) if (!coverUsed.has(u)) { coverUsed.add(u); return u } // 借
  return fallbackUrl(FALLBACK_IDS[fb++ % FALLBACK_IDS.length])
}
for (const [q, arts] of groups) {
  const pool = byTheme.get(q) || []
  for (const a of arts) {
    const cover = takeCover(q)
    // 正文图：从本主题池按偏移取，跳过封面与篇内已用；不足则从全局补
    const body = []
    const inArticle = new Set([cover.split('?')[0]])
    const src = pool.length >= BODY + 1 ? pool : allPoolFlat
    let idx = (a.slug.length * 7) % Math.max(1, src.length)
    let guard = 0
    while (body.length < BODY && guard++ < src.length) {
      const u = src[idx % src.length]; idx++
      const k = u.split('?')[0]
      if (!inArticle.has(k)) { inArticle.add(k); body.push(u) }
    }
    plan.set(a.slug, { cover, body })
  }
}

// ── 改写正文：剥掉所有旧图（封面+正文，保证幂等）→ 顶部加封面 → 小节间插 body 图 ──
function stripAllImages(content) {
  // 删掉「整行就是一张图」的行（封面/正文配图都是这种），保留正文里行内引用
  const kept = content.split('\n').filter(l => !/^\s*!\[[^\]]*\]\([^)]*\)\s*$/.test(l))
  return kept.join('\n').replace(/\n{3,}/g, '\n\n').replace(/^\n+/, '')
}
function build(content, title, cover, body) {
  const alt = String(title || 'cover').replace(/[\[\]]/g, '').slice(0, 80)
  const body2 = stripAllImages(content)
  const lines = body2.split('\n')
  // 找 ## 小节标题行号（跳过第 1 个，从中段开始插，均匀分布）
  const heads = []
  for (let i = 0; i < lines.length; i++) if (/^##\s+\S/.test(lines[i])) heads.push(i)
  const targetsHeads = heads.slice(1) // 跳过开头第一个小节
  const picks = []
  if (targetsHeads.length && body.length) {
    const step = Math.max(1, Math.floor(targetsHeads.length / body.length))
    for (let i = 0, used = 0; i < targetsHeads.length && used < body.length; i += step, used++) picks.push([targetsHeads[i], body[used]])
  }
  // 从后往前插，避免行号错位
  for (let p = picks.length - 1; p >= 0; p--) {
    const [lineNo, url] = picks[p]
    lines.splice(lineNo, 0, `![${alt} illustration](${url})`, '')
  }
  return `![${alt}](${cover})\n\n${lines.join('\n')}`
}

const entries = [...plan.entries()]
const bySlug = new Map(targets.map(a => [a.slug, a]))
const uniqCovers = new Set([...plan.values()].map(p => p.cover.split('?')[0])).size
console.log(`\n分配完成：封面唯一 ${uniqCovers}/${entries.length}，正文图兜底 ${fb} 张`)

if (DRY) {
  console.log('\n样例（前 6）：')
  for (const [slug, p] of entries.slice(0, 6)) console.log(`  ${slug}: 封面 ${p.cover.split('/').pop().split('?')[0]} + 正文 ${p.body.length} 张`)
  console.log('\n[DRY-RUN] 未写库。')
} else {
  let written = 0
  for (let i = 0; i < entries.length; i += 25) {
    const chunk = entries.slice(i, i + 25)
    const res = await Promise.all(chunk.map(([slug, p]) =>
      sb.from('tools_articles').update({ content: build(bySlug.get(slug).content, bySlug.get(slug).title, p.cover, p.body), updated_at: new Date().toISOString() }).eq('slug', slug)
        .then(({ error }) => (error ? { slug, error: error.message } : null)),
    ))
    const errs = res.filter(Boolean)
    written += chunk.length - errs.length
    if (errs.length) console.log('  ⚠️ 失败:', errs.slice(0, 2).map(e => e.slug + '(' + e.error + ')').join(', '))
    console.log(`  …已写 ${written}/${entries.length}`)
  }
  console.log(`\n✅ 完成：${written} 篇（封面唯一 ${uniqCovers}，每篇正文≤${BODY} 张）。`)
  console.log('提示：需一次 Vercel 重建让预渲染页带图（curl Deploy Hook 或 Redeploy）。')
}
