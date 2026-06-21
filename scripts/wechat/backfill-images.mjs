// 给站内「无图」文章批量补一张封面图（插在正文最前）。
// 策略：按分类→视觉主题归并，每个主题搜一个图池（Pexels 优先→Unsplash），
//       池内不同图分发给该主题各篇（不重复），主题搜不到则用兜底技术图池。
// 用法：
//   node scripts/wechat/backfill-images.mjs --dry-run          # 只打印分配，不写库
//   node scripts/wechat/backfill-images.mjs --dry-run --limit 20
//   node scripts/wechat/backfill-images.mjs                    # 实际写库
//   node scripts/wechat/backfill-images.mjs --only json-format,base64-encode

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
const ONLY = arg('--only', null) ? String(arg('--only', null)).split(',').map(s => s.trim()).filter(Boolean) : null

if (!hasSupabase()) { console.error('需要 SUPABASE_SECRET_KEY'); process.exit(1) }
const PEXELS = process.env.PEXELS_API_KEY
const UNSPLASH = process.env.UNSPLASH_ACCESS_KEY
if (!PEXELS && !UNSPLASH) console.warn('⚠️ 未配置 PEXELS/UNSPLASH key，全部走兜底图池（图会重复）。')

const sleep = ms => new Promise(r => setTimeout(r, ms))

// ── 分类（小写归一）→ 视觉搜索词。覆盖不到的归到 default。 ───────────────────
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
function normCat(c) { return String(c || '').trim().toLowerCase() }
function themeFor(cat) { return THEME_QUERY[normCat(cat)] || DEFAULT_QUERY }

// ── 兜底技术图池（Unsplash 写死图，无防盗链） ───────────────────────────────
const FALLBACK_IDS = [
  '1461749280684-dccba630e2f6', '1518770660439-4636190af475', '1555066931-4365d14bab8c',
  '1542831371-29b0f74f9713', '1607799279861-4dd421887fb3', '1551288049-bebda4e38f71',
  '1516116216624-53e697fedbea', '1504384308090-c894fdcc538d', '1488590528505-98d2b5aba04b',
  '1517180102446-f3ece451e9d8', '1526374965328-7f61d4dc18c5', '1550751827-4bd374c3f58b',
]
const fallbackUrl = id => `https://images.unsplash.com/photo-${id}?w=1200&q=80&auto=format&fit=crop`

// ── 图源搜索（取大图池） ─────────────────────────────────────────────────────
async function pexelsSearch(query, perPage = 80, page = 1) {
  if (!PEXELS) return []
  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}&orientation=landscape`
    const res = await fetch(url, { headers: { Authorization: PEXELS } })
    if (!res.ok) return []
    const j = await res.json()
    return (j.photos || []).map(p => p.src?.large || p.src?.original).filter(Boolean)
  } catch { return [] }
}
async function unsplashSearch(query, perPage = 30) {
  if (!UNSPLASH) return []
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`
    const res = await fetch(url, { headers: { Authorization: `Client-ID ${UNSPLASH}` } })
    if (!res.ok) return []
    const j = await res.json()
    return (j.results || []).map(p => { const b = p.urls?.raw || p.urls?.regular; return b ? `${b}${b.includes('?') ? '&' : '?'}w=1200&q=80&fit=crop` : '' }).filter(Boolean)
  } catch { return [] }
}

// ── 读取无图文章 ─────────────────────────────────────────────────────────────
const sb = getSupabase()
let from = 0, all = []
for (;;) { const { data, error } = await sb.from('tools_articles').select('slug,title,category,content').range(from, from + 999); if (error) { console.error(error.message); process.exit(1) } all.push(...data); if (data.length < 1000) break; from += 1000 }
const hasImg = c => /!\[[^\]]*\]\([^)]+\)/.test(c || '')
let targets = all.filter(a => !hasImg(a.content))
if (ONLY) targets = targets.filter(a => ONLY.includes(a.slug))
if (LIMIT) targets = targets.slice(0, LIMIT)
console.log(`无图文章 ${all.filter(a => !hasImg(a.content)).length} 篇，本次处理 ${targets.length} 篇${DRY ? '（DRY-RUN）' : ''}\n`)

// ── 按主题分组 ───────────────────────────────────────────────────────────────
const groups = new Map() // query -> [articles]
for (const a of targets) { const q = themeFor(a.category); if (!groups.has(q)) groups.set(q, []); groups.get(q).push(a) }

// ── 每主题取图池 → 分发（主题内循环取图，跨主题允许少量重复） ────────────────
const assign = new Map() // slug -> url
let pexN = 0, unsN = 0, fbN = 0
for (const [query, arts] of groups) {
  let pool = await pexelsSearch(query, 80, 1); await sleep(400)
  if (pool.length < arts.length) { pool = pool.concat(await pexelsSearch(query, 80, 2)); await sleep(400) }
  if (pool.length < arts.length) { pool = pool.concat(await unsplashSearch(query)); await sleep(400) }
  pool = [...new Set(pool)] // 去重，但不跨主题剔除（避免后面主题被吃空）
  let i = 0
  for (const a of arts) {
    let url
    if (pool.length) { url = pool[i % pool.length]; if (url.includes('pexels')) pexN++; else unsN++ }
    else { url = fallbackUrl(FALLBACK_IDS[fbN % FALLBACK_IDS.length]); fbN++ }
    i++
    assign.set(a.slug, url)
  }
  console.log(`  主题「${query}」: ${arts.length} 篇 → 图池 ${pool.length} 张`)
}

// ── 写回（封面插在正文最前） ─────────────────────────────────────────────────
function withCover(content, title, url) {
  const alt = String(title || 'cover').replace(/[\[\]]/g, '').slice(0, 80)
  return `![${alt}](${url})\n\n${content}`
}
let written = 0
const bySlug = new Map(targets.map(a => [a.slug, a]))
const entries = [...assign.entries()]
if (DRY) {
  console.log('\n样例分配（前 12）：')
  for (const [slug, url] of entries.slice(0, 12)) console.log('  ', slug, '→', url.slice(0, 72))
  console.log(`\n[DRY-RUN] 将给 ${entries.length} 篇补封面图（pexels ${pexN} / unsplash ${unsN} / 兜底 ${fbN}）。未写库。`)
} else {
  for (let i = 0; i < entries.length; i += 25) {
    const chunk = entries.slice(i, i + 25)
    // 用 update（只改 content/updated_at）避免触碰 tool_path 等 NOT NULL 列
    const results = await Promise.all(chunk.map(([slug, url]) =>
      sb.from('tools_articles')
        .update({ content: withCover(bySlug.get(slug).content, bySlug.get(slug).title, url), updated_at: new Date().toISOString() })
        .eq('slug', slug)
        .then(({ error }) => (error ? { slug, error: error.message } : null)),
    ))
    const errs = results.filter(Boolean)
    written += chunk.length - errs.length
    if (errs.length) console.log(`  ⚠️ ${errs.length} 篇失败:`, errs.slice(0, 2).map(e => e.slug + '(' + e.error + ')').join(', '))
    console.log(`  …已写 ${written}/${entries.length}`)
  }
  console.log(`\n✅ 完成：${written} 篇补图（pexels ${pexN} / unsplash ${unsN} / 兜底 ${fbN}）。`)
  console.log('提示：需要一次 Vercel 重建让预渲染页带上封面图（curl Deploy Hook 或 Redeploy）。')
}
