/**
 * prerender-static.mjs
 * 构建后为核心工具路由生成独立的 HTML 文件（含唯一 SEO meta、H1、canonical）
 * 运行: node scripts/prerender-static.mjs
 *
 * 输出结构:
 *   dist/tools/{slug}/index.html  — 每个工具页的预渲染 HTML
 *   dist/404.html                 — 404 页（noindex，无 canonical）
 *
 * Vercel / Netlify 会先尝试命中预渲染静态文件，
 * 再 fallback 到 SPA（index.html），完全不存在的路径返回 404。
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import { parse as parseYaml } from 'yaml'
import { marked } from 'marked'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '..')
const distDir = path.join(rootDir, 'dist')
const templatePath = path.join(distDir, 'index.html')

if (!fs.existsSync(templatePath)) {
  console.error('❌ dist/index.html not found. Run pnpm build first.')
  process.exit(1)
}

// 保存原始模板快照（仅在第一次 / build 后写入时），后续运行从快照读取保证幂等
const snapshotPath = path.join(distDir, '.index-template.html')
const currentHtml = fs.readFileSync(templatePath, 'utf-8')

// 判断是否是"干净"的 dist/index.html（不含预渲染注入的痕迹）
const isPristine = !currentHtml.includes('<!-- Page-specific SEO (prerendered) -->')
  && !currentHtml.includes('<!-- JSON-LD: prerendered -->')
  && !currentHtml.includes('h1 style="position:absolute')

if (isPristine) {
  // 写入快照
  fs.writeFileSync(snapshotPath, currentHtml, 'utf-8')
  console.log('📦 已保存模板快照: dist/.index-template.html')
} else if (!fs.existsSync(snapshotPath)) {
  console.error('❌ dist/index.html 看起来已被修改，且找不到模板快照。请重新运行 pnpm build。')
  process.exit(1)
} else {
  console.log('ℹ️  使用已有模板快照: dist/.index-template.html')
}

const template = fs.existsSync(snapshotPath)
  ? fs.readFileSync(snapshotPath, 'utf-8')
  : currentHtml

const SITE = 'https://myutl.com'
const SITE_NAME = 'MyUtl'
const OG_IMAGE = `${SITE}/banner.png`

// ── 读取 en.yml 获取工具 title / description / steps / FAQ ────────────────────
// 站点面向英文受众(lang=en),预渲染(爬虫可见)的工具页 SEO 内容与 schema 必须为英文。
const enYmlPath = path.join(rootDir, 'locales', 'en.yml')
const enRaw = fs.readFileSync(enYmlPath, 'utf-8')
const en = parseYaml(enRaw)
const toolsI18n = en.tools ?? {}

// sitemap slug（新路径）→ zh.yml 中对应的 key（工具目录名/旧路径）
// 当工具路由路径与 zh.yml key 不一致时需要在此配置映射
const slugToI18nKey = {
  'json-format': 'json-prettify',
  'sql-format': 'sql-prettify',
  'xml-format': 'xml-formatter',
  'yaml-format': 'yaml-prettify',
  'base-converter': 'integer-base-converter',
  'date-converter': 'date-time-converter',
  'qrcode-generator': 'qr-code-generator',
}

// ── 工具分类映射（slug → 分类名）用于 SEO 内链推荐 ──────────────────────────────
const toolCategories = {
  Crypto: ['token-generator','hash-text','bcrypt','uuid-generator','ulid-generator','encryption','bip39-generator','hmac-generator','rsa-key-pair-generator','password-strength-analyser','pdf-signature-checker'],
  Converter: ['date-converter','base-converter','roman-numeral-converter','base64-string-converter','base64-file-converter','color-converter','case-converter','text-to-nato-alphabet','text-to-binary','text-to-unicode','yaml-to-json-converter','yaml-to-toml','json-to-yaml-converter','json-to-toml','list-converter','toml-to-json','toml-to-yaml','xml-to-json','json-to-xml','markdown-to-html','css-unit-converter','unix-timestamp'],
  Web: ['url-encoder','html-entities','url-parser','device-information','basic-auth-generator','og-meta-generator','otp-generator','mime-types','jwt-parser','keycode-info','slugify-string','html-wysiwyg-editor','user-agent-parser','http-status-codes','json-diff','safelink-decoder'],
  'Images and videos': ['qrcode-generator','wifi-qrcode-generator','svg-placeholder-generator','camera-recorder','color-palette-generator'],
  Development: ['git-memo','random-port-generator','crontab-generator','json-format','json-minify','json-to-csv','sql-format','chmod-calculator','docker-run-to-docker-compose-converter','xml-format','yaml-format','email-normalizer','regex-tester','regex-memo'],
  Network: ['ipv4-subnet-calculator','ipv4-address-converter','ipv4-range-expander','mac-address-lookup','mac-address-generator','ipv6-ula-generator'],
  Math: ['math-evaluator','eta-calculator','percentage-calculator','mortgage-calculator','income-tax-calculator','number-formatter'],
  Measurement: ['chronometer','temperature-converter','benchmark-builder','bmi-calculator'],
  Text: ['lorem-ipsum-generator','text-statistics','emoji-picker','string-obfuscator','text-diff','numeronym-generator','ascii-text-drawer','random-decision-picker'],
  Data: ['phone-parser-and-formatter','iban-validator-and-parser'],
}
// 构建 slug → category 的反向映射
const slugCategory = {}
for (const [cat, slugs] of Object.entries(toolCategories)) {
  for (const s of slugs) slugCategory[s] = cat
}
// 分类英文标签(预渲染面向英文受众)
const categoryNames = {
  Crypto: 'Crypto & Security',
  Converter: 'Converter',
  Web: 'Web',
  'Images and videos': 'Image & Video',
  Development: 'Development',
  Network: 'Network',
  Math: 'Math',
  Measurement: 'Measurement',
  Text: 'Text',
  Data: 'Data',
}
// 分类名 → 分类 hub slug（与 src/lib/categories.ts 一致）
const catHubSlug = name => String(name).toLowerCase().replace(/\s+/g, '-')

// ── 从 sitemap.xml 提取所有工具路径 ────────────────────────────────────────────
const sitemapPath = path.join(rootDir, 'public', 'sitemap.xml')
const sitemapXml = fs.readFileSync(sitemapPath, 'utf-8')
const urlRegex = /<loc>https:\/\/myutl\.com\/([^/<]+)\/?<\/loc>/g
const toolSlugs = []
let m
while ((m = urlRegex.exec(sitemapXml)) !== null) {
  const slug = m[1]
  // 排除顶级已知页面（首页由空字符串匹配，blog/about 单独处理）
  if (slug && slug !== 'blog' && slug !== 'about') {
    toolSlugs.push(slug)
  }
}

// ── 已知需要预渲染的静态页面（非工具） ──────────────────────────────────────────
// 注意：'/' 首页会输出到 dist/prerender-home/index.html，
//       由 vercel.json / netlify.toml 路由到此文件（避免覆盖 dist/index.html 模板）
// 首页 SEO 内容：列出热门工具分类和内链
const homeSeoContent = (() => {
  const parts = []
  parts.push(`      <p>MyUtl offers 90+ free online developer tools that run entirely in your browser — no signup, no upload, your data never leaves your device.</p>`)
  // 每个分类取前 5 个工具
  for (const [cat, slugs] of Object.entries(toolCategories)) {
    const catLabel = categoryNames[cat] || cat
    const topSlugs = slugs.slice(0, 5)
    parts.push(`      <section>`)
    parts.push(`        <h2>${catLabel}</h2>`)
    parts.push(`        <ul>`)
    topSlugs.forEach((s) => {
      const sKey = slugToI18nKey[s] ?? s
      const sI18n = toolsI18n[sKey] ?? toolsI18n[s] ?? {}
      const sTitle = sI18n.title || s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      const sDesc = sI18n.description ? ` — ${sI18n.description.slice(0, 50)}` : ''
      parts.push(`          <li><a href="/${s}">${escapeHtml(sTitle)}</a>${escapeHtml(sDesc)}</li>`)
    })
    parts.push(`        </ul>`)
    parts.push(`      </section>`)
  }
  return parts.join('\n')
})()

const staticRoutes = [
  {
    path: '/',
    outPath: 'prerender-home/index.html', // 不覆盖 dist/index.html 模板
    title: `${SITE_NAME} — Free Online Developer Toolbox | 90+ Tools`,
    description: `${SITE_NAME} offers 90+ free online tools — JSON formatter, Base64 encode/decode, encryption, URL encoding, QR code generator, hash, JWT, calculators, and more. Everything runs locally in your browser, no signup required.`,
    h1: `${SITE_NAME} — Free Online Toolbox`,
    keywords: 'online tools, developer tools, json formatter, base64, url encoder, qr code generator, encryption, free online tools',
    seoContent: homeSeoContent,
    jsonld: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE,
      description: 'Free online toolbox with 90+ developer and everyday utilities, all running locally in your browser.',
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${SITE}/?search={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
  },
  {
    path: '/blog',
    title: 'Developer Tools Guides — MyUtl Blog',
    description: `In-depth guides to 100+ developer tools — encryption, encoding, regex, networking, and data conversion, explained with practical examples.`,
    h1: 'Developer Tools Guides — MyUtl Blog',
    keywords: 'developer tools guides, programming tutorials, online tools blog',
    jsonld: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: `${SITE_NAME} Blog`,
      url: `${SITE}/blog`,
      publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE },
    },
  },
]

// ── 辅助函数 ────────────────────────────────────────────────────────────────────
function escapeAttr(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function buildHtml({ path: routePath, title, description, h1, keywords = '', jsonld, seoContent = '', ogType, articleMeta }) {
  // 首页直接用完整 title（已含品牌），其余拼接品牌后缀
  const fullTitle = routePath === '/' ? title : `${title} | ${SITE_NAME}`
  const canonicalUrl = routePath === '/' ? SITE : `${SITE}${routePath}`
  const escapedTitle = escapeAttr(fullTitle)
  const escapedDesc = escapeAttr(description)

  // 用 replaceTag 替换单行 meta content 属性
  function replaceMeta(src, attr, attrVal, newContent) {
    // 匹配 <meta attr="attrVal" content="..."> 或 <meta content="..." attr="attrVal">
    // 使用两步替换：先找整行 meta，再替换 content 值
    const re = new RegExp(`(<meta\\s[^>]*${attr}="${attrVal}"[^>]*\\scontent=")[^"]*(")`,'s')
    const re2 = new RegExp(`(<meta\\s[^>]*content=")[^"]*("[^>]*\\s${attr}="${attrVal}")`,'s')
    const s = src.replace(re, `$1${newContent}$2`)
    return s !== src ? s : src.replace(re2, `$1${newContent}$2`)
  }

  let html = template
    // 替换 <title>
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(fullTitle)}</title>`)

  // 替换或注入 canonical（模板可能没有 canonical 标签）
  const canonicalTag = `<link rel="canonical" href="${canonicalUrl}" />`
  if (/<link rel="canonical"[^>]*>/i.test(html)) {
    html = html.replace(/<link rel="canonical"[^>]*>/g, canonicalTag)
  } else {
    // 模板中无 canonical，注入到 </head> 之前
    html = html.replace('</head>', `  ${canonicalTag}\n  </head>`)
  }

  // 替换各类 meta content（in-place，不追加）
  html = replaceMeta(html, 'name', 'description', escapedDesc)
  html = replaceMeta(html, 'itemprop', 'description', escapedDesc)
  html = replaceMeta(html, 'itemprop', 'name', escapedTitle)
  html = replaceMeta(html, 'property', 'og:title', escapedTitle)
  html = replaceMeta(html, 'property', 'og:description', escapedDesc)
  html = replaceMeta(html, 'property', 'og:url', canonicalUrl)
  html = replaceMeta(html, 'name', 'twitter:title', escapedTitle)
  html = replaceMeta(html, 'name', 'twitter:description', escapedDesc)
  if (keywords) {
    html = replaceMeta(html, 'name', 'keywords', escapeAttr(keywords))
  }
  // 覆盖 og:type（博客文章用 article，工具页用 website）
  if (ogType) {
    html = replaceMeta(html, 'property', 'og:type', ogType)
  }
  // 注入博客文章专属 meta 标签（article:published_time / article:section）
  if (ogType === 'article' && articleMeta) {
    const extraMeta = []
    if (articleMeta.publishedTime) {
      extraMeta.push(`<meta property="article:published_time" content="${escapeAttr(articleMeta.publishedTime)}" />`)
    }
    if (articleMeta.section) {
      extraMeta.push(`<meta property="article:section" content="${escapeAttr(articleMeta.section)}" />`)
    }
    if (extraMeta.length) {
      html = html.replace('</head>', `    ${extraMeta.join('\n    ')}\n  </head>`)
    }
  }

  // 替换 hreflang（英文单语站,指向当前页 canonical）
  html = html
    .replace(/<link rel="alternate" hreflang="en"[^>]*>/g, `<link rel="alternate" hreflang="en" href="${canonicalUrl}" />`)
    .replace(/<link rel="alternate" hreflang="zh(?:-CN)?"[^>]*>/g, '')
    .replace(/<link rel="alternate" hreflang="x-default"[^>]*>/g, `<link rel="alternate" hreflang="x-default" href="${canonicalUrl}" />`)

  // 替换原有 JSON-LD（如果没匹配到，就注入到 </head> 前）
  const jsonLdTag = `<!-- JSON-LD: prerendered -->\n    <script type="application/ld+json">\n    ${JSON.stringify(jsonld, null, 2)}\n    </script>`
  const htmlBeforeJsonLd = html
  html = html.replace(
    /<!-- JSON-LD[^>]*-->[\s\S]*?<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    jsonLdTag,
  )
  if (html === htmlBeforeJsonLd) {
    // 没有匹配到原有 JSON-LD，直接注入到 </head> 前
    html = html.replace('</head>', `  ${jsonLdTag}\n  </head>`)
  }

  // 将 SEO 内容注入 <div id="app"> 内部
  // Vue 挂载时会替换 #app 的全部内容，因此爬虫首次看到的 SEO 内容
  // 与用户最终看到的交互界面自然过渡，不会触发 Cloaking 惩罚
  //
  // 关键原则：
  // 1. 不使用 aria-hidden、display:none、left:-9999px 等隐藏手段
  // 2. SEO 块是 #app 的初始内容，Vue 挂载后自动替换为完整交互界面
  // 3. 对无 JS 的爬虫，SEO 块就是最终可见内容（真实、可读、非隐藏）
  const seoBlock = seoContent
    ? `<div id="app"><div class="prerender-seo">\n      <h1>${escapeHtml(h1)}</h1>\n${seoContent}\n    </div></div>`
    : `<div id="app"></div>`

  html = html.replace('<div id="app"></div>', seoBlock)

  return html
}

// ── 读取博客文章数据（通过 tsx 导出为临时 JSON） ─────────────────────────────────
const articlesJsonPath = path.join(rootDir, 'dist', '.articles-cache.json')
try {
  // 用 esbuild 把 articles.data.ts 编译为临时 CJS，再 require 读取数据
  const tmpJs = path.join(rootDir, 'dist', '.articles-tmp.cjs')
  execSync(
    `./node_modules/.bin/esbuild src/pages/articles/articles.data.ts --bundle --platform=node --format=cjs --outfile=${tmpJs}`,
    { cwd: rootDir, stdio: 'pipe' },
  )
  const { createRequire } = await import('module')
  const req = createRequire(import.meta.url)
  const { articles } = req(tmpJs)
  fs.writeFileSync(articlesJsonPath, JSON.stringify(articles), 'utf-8')
  fs.unlinkSync(tmpJs)
  console.log(`📝 已加载 ${articles.length} 篇博客文章`)
}
catch (e) {
  console.warn('⚠️  无法加载博客文章数据，跳过博客预渲染：', e.message)
}

const blogArticles = fs.existsSync(articlesJsonPath)
  ? JSON.parse(fs.readFileSync(articlesJsonPath, 'utf-8'))
  : []

// ── 内链索引：toolPath → 文章列表（用于相关文章 / 工具页反向链接）────────────
const articlesByTool = {}
for (const a of blogArticles) (articlesByTool[a.toolPath] ||= []).push(a)
const articlesByRecency = [...blogArticles].sort((x, y) => (y.publishedAt || '').localeCompare(x.publishedAt || ''))

// 为一篇文章挑选相关文章（确定性）：同 toolPath > 同工具分类 > 最近
function relatedArticles(article, n = 6) {
  const seen = new Set([article.slug])
  const picks = []
  const add = (a) => { if (a && !seen.has(a.slug)) { seen.add(a.slug); picks.push(a) } }
  // 1) 同 toolPath（最强相关信号）—— 仅当本文与该 toolPath 主题相关,
  //    且只聚合同样相关的同伴,避免错配文章把无关文章拉到一起
  if (article.toolPath && isTopicalGuide(article.toolPath, article)) {
    for (const a of (articlesByTool[article.toolPath] || [])) {
      if (picks.length >= n) break
      if (isTopicalGuide(article.toolPath, a)) add(a)
    }
  }
  // 2) 同「工具分类」
  if (picks.length < n) {
    const toolSlug = (article.toolPath || '').replace(/^\//, '')
    const cat = slugCategory[toolSlug]
    if (cat) {
      const catTools = new Set((toolCategories[cat] || []).map(s => `/${s}`))
      for (const a of articlesByRecency) { if (picks.length >= n) break; if (catTools.has(a.toolPath)) add(a) }
    }
  }
  // 3) 最近文章兜底（保证每篇都有相关文章）
  for (const a of articlesByRecency) { if (picks.length >= n) break; add(a) }
  return picks.slice(0, n)
}

// 相关性过滤:源 toolPath 有约 26% 散落错配(通用博客被挂到不相关工具)。
// 只保留「工具名词根真正出现在文章 slug/title/keywords」的指南,宁缺毋滥。
const _RELSTOP = new Set(['the', 'a', 'to', 'and', 'of', 'online', 'tool', 'generator', 'converter', 'guide', 'for', 'with', 'in', 'your', 'how', 'what', 'is', 'vs'])
function _toks(s) {
  return String(s || '').toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2 && !_RELSTOP.has(w))
}
function isTopicalGuide(toolPath, a) {
  const toolToks = _toks(String(toolPath).replace(/^\//, '').replace(/-/g, ' '))
  if (toolToks.length === 0) return true
  const hay = new Set([..._toks(a.slug), ..._toks(a.title), ...((a.keywords || []).flatMap(_toks))])
  return toolToks.some(t => hay.has(t) || [...hay].some(h => h.includes(t) || t.includes(h)))
}

// 一个工具对应的指南文章（工具页反向内链用）—— 已做相关性过滤
function guidesForTool(toolSlug, n = 8) {
  const tp = `/${toolSlug}`
  return (articlesByTool[tp] || []).filter(a => isTopicalGuide(tp, a)).slice(0, n)
}

// 导出「工具路径 → 相关文章」干净映射(来自源 toolPath + 相关性过滤),
// 供运行时工具页 fetch,取代受污染的 DB tool_path 匹配,保证相关性。
{
  const map = {}
  for (const [toolPath, arts] of Object.entries(articlesByTool)) {
    if (!toolPath || toolPath === 'undefined') continue
    const relevant = arts.filter(a => isTopicalGuide(toolPath, a))
    if (relevant.length === 0) continue
    map[toolPath] = relevant.slice(0, 6).map(a => ({ slug: a.slug, title: a.title, description: a.description }))
  }
  fs.writeFileSync(path.join(distDir, 'tool-guides.json'), JSON.stringify(map), 'utf-8')
  console.log(`✅ Generated: dist/tool-guides.json (${Object.keys(map).length} 个工具的相关指南)`)
}

// 导出「文章 slug → 相关工具路径」映射,仅收录 toolPath 与主题相关的文章。
// 文章页据此决定是否显示 "Try the Tool" CTA,避免错配文章指向无关工具。
{
  const m = {}
  for (const a of blogArticles) {
    if (a.toolPath && isTopicalGuide(a.toolPath, a)) m[a.slug] = a.toolPath
  }
  fs.writeFileSync(path.join(distDir, 'article-tools.json'), JSON.stringify(m), 'utf-8')
  console.log(`✅ Generated: dist/article-tools.json (${Object.keys(m).length} 篇文章有相关工具,${blogArticles.length - Object.keys(m).length} 篇无)`)
}

// 工具别名 → 真实工具 slug（与 vercel.json 重定向一致），用于解析文章 toolPath
const TOOL_ALIASES = {
  'json-viewer': 'json-format', 'json-prettify': 'json-format', 'sql-prettify': 'sql-format',
  'yaml-prettify': 'yaml-format', 'xml-formatter': 'xml-format', 'cypher': 'encryption',
  'file-to-base64': 'base64-string-converter', 'base64-converter': 'base64-string-converter',
  'color-picker-converter': 'color-converter', 'hash': 'hash-text', 'text-stats': 'text-statistics',
  'meta-tag-generator': 'og-meta-generator', 'otp-code-generator-and-validator': 'otp-generator',
  'date-time-converter': 'date-converter', 'javascript-obfuscator': 'string-obfuscator',
  'integer-base-converter': 'base-converter', 'image-converter': 'base64-file-converter',
}
// 文章碎片化 category（小写）→ toolCategories 键，用于无 toolPath 的纯博客文章
const ARTICLE_CAT_TO_TOOLCAT = {
  development: 'Development', backend: 'Development', 'software engineering': 'Development',
  devops: 'Development', 'developer tools': 'Development', 'system design': 'Development',
  architecture: 'Development', performance: 'Development', testing: 'Development',
  python: 'Development', 'ai/ml engineering': 'Development', ai: 'Development', mobile: 'Development',
  database: 'Development', databases: 'Development',
  web: 'Web', frontend: 'Web',
  security: 'Crypto', crypto: 'Crypto',
  data: 'Data', converter: 'Converter', text: 'Text',
  network: 'Network', math: 'Math', measurement: 'Measurement', 'images and videos': 'Images and videos',
}
// 解析一篇文章应推荐的工具分类（始终返回一个有效分类，保证 100% 有工具内链）
function resolveToolCategory(article) {
  let ts = (article.toolPath || '').replace(/^\//, '')
  ts = TOOL_ALIASES[ts] || ts
  if (slugCategory[ts]) return { cat: slugCategory[ts], ownTool: ts }
  const mapped = ARTICLE_CAT_TO_TOOLCAT[(article.category || '').toLowerCase()]
  return { cat: mapped || 'Development', ownTool: ts || null }
}


// 博客列表页 SEO 内容：注入所有博客文章链接（按发布时间降序）
{
  const sorted = [...blogArticles].sort((a, b) =>
    new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0),
  )
  const parts = []
  parts.push(`      <p>The MyUtl blog publishes in-depth guides to developer tools, covering hashing and encryption, encoding formats, regular expressions, networking, and more.</p>`)
  if (sorted.length) {
    parts.push(`      <ul>`)
    sorted.forEach((a) => {
      const slug = a.slug || a.path?.replace(/^\//, '') || ''
      const title = escapeHtml(a.title || slug)
      const desc = a.description ? ` — ${escapeHtml(a.description.slice(0, 60))}` : ''
      parts.push(`        <li><a href="/blog/${slug}">${title}</a>${desc}</li>`)
    })
    parts.push(`      </ul>`)
  }
  const blogRoute = staticRoutes.find((r) => r.path === '/blog')
  if (blogRoute) blogRoute.seoContent = parts.join('\n')
}

// ── 生成静态页面 ─────────────────────────────────────────────────────────────────
let count = 0

// 1. 静态路由（首页、博客）
for (const route of staticRoutes) {
  let outPath
  if (route.outPath) {
    // 自定义输出路径（避免覆盖 dist/index.html 模板）
    const fullOut = path.join(distDir, route.outPath)
    fs.mkdirSync(path.dirname(fullOut), { recursive: true })
    outPath = fullOut
  } else {
    const outDir = path.join(distDir, route.path.slice(1))
    fs.mkdirSync(outDir, { recursive: true })
    outPath = path.join(outDir, 'index.html')
  }
  fs.writeFileSync(outPath, buildHtml(route), 'utf-8')
  const displayPath = route.outPath ? `dist/${route.outPath}` : `dist${route.path}/index.html`
  console.log(`✅ Static: ${displayPath}`)
  count++
}

// ── 辅助：从 i18n 数据构建工具页 SEO 正文 HTML ─────────────────────────────────
function buildToolSeoContent(i18n, slug) {
  const parts = []

  // 使用说明段落
  if (i18n.description) {
    parts.push(`      <p>${escapeHtml(i18n.description)}</p>`)
  }

  // 操作步骤
  const steps = []
  for (let n = 1; n <= 8; n++) {
    if (i18n[`step${n}`]) steps.push(i18n[`step${n}`])
    else break
  }
  if (steps.length > 0) {
    parts.push(`      <section>`)
    parts.push(`        <h2>How to Use</h2>`)
    parts.push(`        <ol>`)
    steps.forEach(s => parts.push(`          <li>${escapeHtml(s)}</li>`))
    parts.push(`        </ol>`)
    parts.push(`      </section>`)
  }

  // FAQ 部分
  const faqs = []
  for (let n = 1; n <= 6; n++) {
    const q = i18n[`faq${n}q`]
    const a = i18n[`faq${n}a`]
    if (q && a) faqs.push({ q, a })
    else break
  }
  if (faqs.length > 0) {
    parts.push(`      <section>`)
    parts.push(`        <h2>Frequently Asked Questions</h2>`)
    faqs.forEach(({ q, a }) => {
      parts.push(`        <div>`)
      parts.push(`          <h3>${escapeHtml(q)}</h3>`)
      parts.push(`          <p>${escapeHtml(a)}</p>`)
      parts.push(`        </div>`)
    })
    parts.push(`      </section>`)
  }

  // 同类工具推荐内链
  if (slug) {
    const cat = slugCategory[slug]
    if (cat) {
      const siblings = (toolCategories[cat] || []).filter(s => s !== slug).slice(0, 6)
      if (siblings.length > 0) {
        const catLabel = categoryNames[cat] || cat
        parts.push(`      <nav aria-label="Related tools">`)
        parts.push(`        <h2>Related ${catLabel} Tools</h2>`)
        parts.push(`        <ul>`)
        siblings.forEach((s) => {
          const sKey = slugToI18nKey[s] ?? s
          const sI18n = toolsI18n[sKey] ?? toolsI18n[s] ?? {}
          const sTitle = sI18n.title || s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
          parts.push(`          <li><a href="/${s}">${escapeHtml(sTitle)}</a></li>`)
        })
        parts.push(`        </ul>`)
        parts.push(`      </nav>`)
      }
    }
  }

  return parts.join('\n')
}

// 2. 工具路由（从 sitemap 中读取）
for (const slug of toolSlugs) {
  // 先尝试直接匹配，再通过映射表查找对应 i18n key
  const i18nKey = slugToI18nKey[slug] ?? slug
  const i18n = toolsI18n[i18nKey] ?? toolsI18n[slug] ?? {}
  const toolTitle = i18n.title || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const toolDesc
    = i18n.description
    || `${toolTitle} — a free online tool that runs in your browser, no install, no signup.`

  let seoContent = buildToolSeoContent(i18n, slug)

  // 工具页 → 相关指南文章 反向内链（按 toolPath 匹配的全部文章）
  const toolGuides = guidesForTool(slug)
  if (toolGuides.length > 0) {
    const guideParts = ['      <nav aria-label="Related guides">', '        <h2>Related Guides &amp; Tutorials</h2>', '        <ul>']
    toolGuides.forEach((a) => {
      guideParts.push(`          <li><a href="/blog/${a.slug}">${escapeHtml(a.title)}</a></li>`)
    })
    guideParts.push('        </ul>', '      </nav>')
    seoContent += '\n' + guideParts.join('\n')
  }

  // 收集 FAQ 数据用于 FAQPage schema
  const faqItems = []
  for (let n = 1; n <= 6; n++) {
    const q = i18n[`faq${n}q`]
    const a = i18n[`faq${n}a`]
    if (q && a) faqItems.push({ q, a })
    else break
  }
  // 同时添加通用 FAQ（安全性、免费、移动端）
  const commonFaq = toolsI18n.common ?? {}
  if (commonFaq.faqSafe && commonFaq.faqSafeA) {
    faqItems.push({ q: commonFaq.faqSafe, a: commonFaq.faqSafeA })
  }

  const webAppSchema = {
    '@type': 'WebApplication',
    name: toolTitle,
    description: toolDesc,
    url: `${SITE}/${slug}`,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    provider: { '@type': 'Organization', name: SITE_NAME, url: SITE },
  }

  // 收集操作步骤用于 HowTo schema
  const howToSteps = []
  for (let n = 1; n <= 8; n++) {
    if (i18n[`step${n}`]) howToSteps.push(i18n[`step${n}`])
    else break
  }

  // 构建 JSON-LD @graph：WebApplication + Breadcrumb + (HowTo) + (FAQPage)
  const graph = [webAppSchema]

  // BreadcrumbList: Home > [Category] > Tool
  const cat = slugCategory[slug]
  const crumbs = [{ name: 'Home', url: `${SITE}/` }]
  if (cat) crumbs.push({ name: categoryNames[cat] || cat, url: `${SITE}/c/${catHubSlug(cat)}` })
  crumbs.push({ name: toolTitle, url: `${SITE}/${slug}` })
  graph.push({
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.url })),
  })

  // HowTo
  if (howToSteps.length > 0) {
    graph.push({
      '@type': 'HowTo',
      name: `How to use ${toolTitle}`,
      step: howToSteps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, text: s })),
    })
  }

  // FAQPage
  if (faqItems.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faqItems.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    })
  }

  const jsonld = { '@context': 'https://schema.org', '@graph': graph }

  const route = {
    path: `/${slug}`,
    title: toolTitle,
    description: toolDesc,
    h1: toolTitle,
    keywords: [toolTitle, slug, 'online tool', 'free', 'browser', SITE_NAME].filter(Boolean).join(','),
    seoContent,
    jsonld,
  }

  const outDir = path.join(distDir, 'tools', slug)
  fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, 'index.html')
  fs.writeFileSync(outPath, buildHtml(route), 'utf-8')
  console.log(`✅ Tool: dist/tools/${slug}/index.html`)
  count++
}

// ── 辅助：从 Markdown 内容构建博客文章 SEO 正文 HTML ──────────────────────────
function buildArticleSeoContent(article, related = []) {
  const { content, description, toolPath } = article
  const raw = content || ''
  const parts = []

  if (description) {
    parts.push(`      <p>${escapeHtml(description)}</p>`)
  }

  // 渲染完整 Markdown 正文为 HTML —— GEO 优化:
  // 让不执行 JS 的 AI 答案引擎/爬虫也能直接获取文章全文(而非仅摘要)
  if (raw.trim()) {
    parts.push(`      <article class="prose">`)
    parts.push(marked.parse(raw))
    parts.push(`      </article>`)
  }

  // 相关文章内链(按 toolPath 聚类，填补文章↔文章互链空白)
  if (related.length > 0) {
    parts.push(`      <nav aria-label="Related guides">`)
    parts.push(`        <h2>Related Guides</h2>`)
    parts.push(`        <ul>`)
    related.forEach((a) => {
      parts.push(`          <li><a href="/blog/${a.slug}">${escapeHtml(a.title)}</a></li>`)
    })
    parts.push(`        </ul>`)
    parts.push(`      </nav>`)
  }

  // 同类工具推荐内链(解析工具分类，含别名解析 + 无 toolPath 时按文章分类归一化，保证 100% 覆盖)
  const { cat, ownTool } = resolveToolCategory(article)
  if (cat) {
    const catTools = (toolCategories[cat] || []).filter(s => s !== ownTool).slice(0, 6)
    if (catTools.length > 0) {
      const catLabel = categoryNames[cat] || cat
      parts.push(`      <nav aria-label="Related tools">`)
      parts.push(`        <h2>Related ${catLabel} Tools</h2>`)
      parts.push(`        <ul>`)
      catTools.forEach((s) => {
        const sKey = slugToI18nKey[s] ?? s
        const sI18n = toolsI18n[sKey] ?? toolsI18n[s] ?? {}
        const sTitle = sI18n.title || s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        parts.push(`          <li><a href="/${s}">${escapeHtml(sTitle)}</a></li>`)
      })
      parts.push(`        </ul>`)
      parts.push(`      </nav>`)
    }
  }

  return parts.join('\n')
}

// 3. 博客文章路由（从 articles.data.ts 读取）
for (const article of blogArticles) {
  const { slug, toolPath, title, description, keywords = [], category = 'Development', publishedAt, content } = article

  // 从 markdown 内容提取纯文本摘要（取前 300 字符，去掉 markdown 语法）
  const plainText = (content || '')
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/`[^`]+`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim()
    .slice(0, 300)

  const articleSeoContent = buildArticleSeoContent(article, relatedArticles(article))

  const articleRoute = {
    path: `/blog/${slug}`,
    title,
    description: description || plainText,
    h1: title,
    keywords: Array.isArray(keywords) ? keywords.join(', ') : keywords,
    ogType: 'article',
    articleMeta: {
      publishedTime: publishedAt ? `${publishedAt}T00:00:00+08:00` : undefined,
      section: category,
    },
    seoContent: articleSeoContent,
    jsonld: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Article',
          headline: title,
          description: description || plainText,
          url: `${SITE}/blog/${slug}`,
          datePublished: publishedAt ? `${publishedAt}T00:00:00+08:00` : undefined,
          dateModified: publishedAt ? `${publishedAt}T00:00:00+08:00` : undefined,
          image: OG_IMAGE,
          author: { '@type': 'Organization', name: SITE_NAME, url: SITE },
          publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: SITE,
            logo: { '@type': 'ImageObject', url: `${SITE}/android-chrome-192x192.png` },
          },
          articleSection: category,
          keywords: Array.isArray(keywords) ? keywords.join(', ') : keywords,
          mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE}/blog/${slug}` },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog` },
            { '@type': 'ListItem', position: 3, name: title, item: `${SITE}/blog/${slug}` },
          ],
        },
      ],
    },
  }

  const outDir = path.join(distDir, 'blog', slug)
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'index.html'), buildHtml(articleRoute), 'utf-8')
  count++
}
console.log(`✅ Blog: ${blogArticles.length} 篇文章页预渲染完成`)

// 3.5 分类 hub 页（/c/<slug>）—— 与 src/lib/categories.ts 保持一致
const CATEGORY_HUBS = [
  { slug: 'crypto', name: 'Crypto', label: 'Crypto & Security Tools', desc: 'Free online cryptography and security tools — hashing, encryption, token and key generation, password strength, and more. Everything runs in your browser.' },
  { slug: 'converter', name: 'Converter', label: 'Converter Tools', desc: 'Free online converters for dates, numbers, colors, text encodings, and data formats like JSON, YAML, TOML, and XML. Fast, private, no upload required.' },
  { slug: 'web', name: 'Web', label: 'Web Developer Tools', desc: 'Free online tools for web developers — URL encoding, HTML entities, JWT, basic auth, HTTP status codes, user-agent parsing, and more.' },
  { slug: 'images-and-videos', name: 'Images and videos', label: 'Image & Video Tools', desc: 'Free online image and video tools — QR code and SVG placeholder generators, color palettes, and an in-browser camera recorder.' },
  { slug: 'development', name: 'Development', label: 'Developer Utilities', desc: 'Free online developer utilities — JSON/SQL/XML/YAML formatting, regex testing, crontab, chmod, Docker, and Git references. Runs entirely in your browser.' },
  { slug: 'network', name: 'Network', label: 'Network Tools', desc: 'Free online network tools — IPv4 subnet and range calculators, MAC address lookup and generation, and IPv6 ULA generation.' },
  { slug: 'math', name: 'Math', label: 'Math & Calculator Tools', desc: 'Free online math and finance calculators — expression evaluator, percentage, mortgage, income tax, ETA, and number formatting.' },
  { slug: 'measurement', name: 'Measurement', label: 'Measurement Tools', desc: 'Free online measurement tools — chronometer, temperature converter, BMI calculator, and a code benchmark builder.' },
  { slug: 'text', name: 'Text', label: 'Text Tools', desc: 'Free online text tools — lorem ipsum, text statistics, diffing, emoji picker, string obfuscation, ASCII art, and more.' },
  { slug: 'data', name: 'Data', label: 'Data Tools', desc: 'Free online data tools — phone number parsing and formatting, and IBAN validation and parsing.' },
]
const categoryHubSlugs = []
for (const hub of CATEGORY_HUBS) {
  const toolSlugs = toolCategories[hub.name] || []
  if (toolSlugs.length === 0) continue
  const parts = []
  parts.push(`      <p>${escapeHtml(hub.desc)}</p>`)
  // 工具列表
  parts.push(`      <h2>${escapeHtml(hub.label)}</h2>`)
  parts.push(`      <ul>`)
  for (const s of toolSlugs) {
    const sKey = slugToI18nKey[s] ?? s
    const sI18n = toolsI18n[sKey] ?? toolsI18n[s] ?? {}
    const sTitle = sI18n.title || s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    const sDesc = sI18n.description ? ` — ${escapeHtml(String(sI18n.description).slice(0, 80))}` : ''
    parts.push(`        <li><a href="/${s}">${escapeHtml(sTitle)}</a>${sDesc}</li>`)
  }
  parts.push(`      </ul>`)
  // 相关指南(聚合该分类工具的指南,去重)
  const seenG = new Set()
  const guideLines = []
  for (const s of toolSlugs) {
    for (const g of guidesForTool(s, 4)) {
      if (seenG.has(g.slug)) continue
      seenG.add(g.slug)
      guideLines.push(`        <li><a href="/blog/${g.slug}">${escapeHtml(g.title)}</a></li>`)
    }
  }
  if (guideLines.length) {
    parts.push(`      <h2>${escapeHtml(hub.label)} Guides</h2>`)
    parts.push(`      <ul>`)
    parts.push(...guideLines.slice(0, 12))
    parts.push(`      </ul>`)
  }
  // 其它分类内链
  parts.push(`      <nav aria-label="Other categories"><h2>Browse other categories</h2><ul>`)
  for (const c of CATEGORY_HUBS) {
    if (c.slug === hub.slug) continue
    parts.push(`        <li><a href="/c/${c.slug}">${escapeHtml(c.label)}</a></li>`)
  }
  parts.push(`      </ul></nav>`)

  const route = {
    path: `/c/${hub.slug}`,
    title: `${hub.label} — Free Online`,
    description: hub.desc,
    h1: hub.label,
    keywords: [hub.label, `${hub.name} tools`, 'online tools', 'free', SITE_NAME].join(','),
    seoContent: parts.join('\n'),
    jsonld: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          name: hub.label,
          description: hub.desc,
          url: `${SITE}/c/${hub.slug}`,
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
            { '@type': 'ListItem', position: 2, name: hub.label, item: `${SITE}/c/${hub.slug}` },
          ],
        },
      ],
    },
  }
  const outDir = path.join(distDir, 'c', hub.slug)
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'index.html'), buildHtml(route), 'utf-8')
  categoryHubSlugs.push(hub.slug)
}
console.log(`✅ Category: ${categoryHubSlugs.length} 个分类 hub 页预渲染完成`)

// 4. 生成 404.html（Vercel/Netlify 兜底，返回 404 状态码）
let html404 = template
  .replace(/<title>[^<]*<\/title>/, `<title>Page Not Found — ${SITE_NAME}</title>`)
  .replace(/<link rel="canonical"[^>]*>/g, '') // 移除 canonical，404 不应有 canonical
// 替换 hreflang：英文单语站,x-default 指向首页
html404 = html404
  .replace(/<link rel="alternate" hreflang="en"[^>]*>/g, `<link rel="alternate" hreflang="en" href="${SITE}/" />`)
  .replace(/<link rel="alternate" hreflang="zh(?:-CN)?"[^>]*>/g, '')
  .replace(/<link rel="alternate" hreflang="x-default"[^>]*>/g, `<link rel="alternate" hreflang="x-default" href="${SITE}/" />`)
// 注入 noindex
html404 = html404.replace('</head>',
  `    <meta name="description" content="The page you are looking for does not exist. Return to the ${SITE_NAME} home page to keep using the free online tools." />\n    <meta name="robots" content="noindex, follow" />\n  </head>`)
const path404 = path.join(distDir, '404.html')
fs.writeFileSync(path404, html404, 'utf-8')
console.log(`✅ Generated: dist/404.html`)
count++

// 5. 动态生成 dist/sitemap.xml（包含博客文章的真实 lastmod）
const TOOL_LASTMOD = new Date().toISOString().slice(0, 10)
// 博客内容修订日:2026-06-10 修复了预渲染(空壳 → 完整 HTML),所有博客页实质变更,
// 用它兜底 lastmod 以提示 Google 重新抓取、消除"重复/备用页/未编入索引"标记。
const BLOG_CONTENT_REV = '2026-06-10'
const toolUrlLines = []
for (const [cat, slugs] of Object.entries(toolCategories)) {
  toolUrlLines.push(`  <!-- ${cat} -->`)
  for (const s of slugs) {
    // 高优先级工具
    const highPri = ['token-generator','hash-text','bcrypt','uuid-generator','ulid-generator','date-converter','base64-string-converter','color-converter','json-format','url-encoder','og-meta-generator','qrcode-generator','regex-tester','ipv4-subnet-calculator','math-evaluator','mortgage-calculator','bmi-calculator','lorem-ipsum-generator','percentage-calculator','password-strength-analyser','html-entities','http-status-codes','encryption','jwt-parser','unix-timestamp','text-diff','emoji-picker','base-converter']
    const priority = highPri.includes(s) ? '0.9' : '0.7'
    toolUrlLines.push(`  <url><loc>${SITE}/${s}</loc><lastmod>${TOOL_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>${priority}</priority></url>`)
  }
  toolUrlLines.push('')
}

const blogUrlLines = []
// 建立 slug → publishedAt 映射
const articlePubMap = {}
for (const a of blogArticles) {
  articlePubMap[a.slug] = a.publishedAt || TOOL_LASTMOD
}
// 读取 public/sitemap.xml 中已有的博客 URL（去重）
const existingSitemapContent = fs.readFileSync(sitemapPath, 'utf-8')
const seenBlogSlugs = new Set()
const allBlogSlugsInOrder = []
// 从 articles.data 中按顺序取
for (const a of blogArticles) {
  if (!seenBlogSlugs.has(a.slug)) {
    seenBlogSlugs.add(a.slug)
    allBlogSlugsInOrder.push(a.slug)
  }
}
// 从 public/sitemap.xml 中补充缺少的博客 slug（保留旧 lastmod）
const extraBlogSlugsFromStatic = [...existingSitemapContent.matchAll(/myutl\.com\/blog\/([^<]+)</g)]
  .map(m => m[1])
  .filter(s => !seenBlogSlugs.has(s))
for (const s of extraBlogSlugsFromStatic) {
  seenBlogSlugs.add(s)
  allBlogSlugsInOrder.push(s)
}
for (const s of allBlogSlugsInOrder) {
  const pub = articlePubMap[s] || TOOL_LASTMOD
  // 取「发布日」与「内容修订日」中较晚者(ISO 日期可直接字符串比较)
  const lastmod = pub > BLOG_CONTENT_REV ? pub : BLOG_CONTENT_REV
  blogUrlLines.push(`  <url><loc>${SITE}/blog/${s}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`)
}

const newSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE}/</loc>
    <lastmod>${TOOL_LASTMOD}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE}/blog</loc>
    <lastmod>${TOOL_LASTMOD}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Category Hubs -->
${categoryHubSlugs.map(s => `  <url><loc>${SITE}/c/${s}</loc><lastmod>${TOOL_LASTMOD}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`).join('\n')}

${toolUrlLines.join('\n')}
  <!-- Blog Articles -->
${blogUrlLines.join('\n')}
</urlset>`

fs.writeFileSync(path.join(distDir, 'sitemap.xml'), newSitemapXml, 'utf-8')
console.log(`✅ Generated: dist/sitemap.xml (${allBlogSlugsInOrder.length} 篇博客 + ${toolSlugs.length} 个工具 + ${categoryHubSlugs.length} 个分类)`)

console.log(`\n🎉 预渲染完成：生成了 ${count} 个静态 HTML 文件`)
console.log(`   - ${staticRoutes.length} 个静态页面（首页、博客列表）`)
console.log(`   - ${toolSlugs.length} 个工具页面`)
console.log(`   - ${blogArticles.length} 个博客文章页面`)
console.log(`   - 1 个 404 页面`)
