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

// ── 读取 zh.yml 获取工具 title / description ──────────────────────────────────
const zhYmlPath = path.join(rootDir, 'locales', 'zh.yml')
const zhRaw = fs.readFileSync(zhYmlPath, 'utf-8')
const zh = parseYaml(zhRaw)
const toolsI18n = zh.tools ?? {}

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
const staticRoutes = [
  {
    path: '/',
    outPath: 'prerender-home/index.html', // 不覆盖 dist/index.html 模板
    title: `${SITE_NAME} - 免费在线工具箱 | 90+ 开发者在线工具`,
    description: `${SITE_NAME} 提供 90+ 免费在线工具，包括 JSON 格式化、Base64 编解码、加密解密、URL 编码、二维码生成、计算器等开发者与日常实用工具，全部在浏览器本地运行，安全无需注册。`,
    h1: `${SITE_NAME} — 免费在线工具箱`,
    keywords: '在线工具,开发者工具,JSON格式化,Base64,URL编码,二维码生成,加密解密,免费工具',
    jsonld: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE,
      description: '免费在线工具箱，提供90+实用工具',
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${SITE}/?search={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
  },
  {
    path: '/blog',
    title: '博客 - 开发者工具使用指南',
    description: `${SITE_NAME} 工具使用指南：深度讲解加密、编码、正则、网络、格式转换等 100+ 开发者工具的原理与实践。`,
    h1: 'Developer Tools Guides — MyUtl Blog',
    keywords: '开发者工具指南,编程教程,在线工具博客',
    jsonld: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: `${SITE_NAME} 博客`,
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

function buildHtml({ path: routePath, title, description, h1, keywords = '', jsonld }) {
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
    // 替换默认 canonical
    .replace(/<link rel="canonical"[^>]*>/g, `<link rel="canonical" href="${canonicalUrl}" />`)

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

  // 替换 hreflang（统一更新所有 zh/zh-CN/en hreflang 指向当前页 canonical）
  html = html
    .replace(/<link rel="alternate" hreflang="zh(?:-CN)?"[^>]*>/g, `<link rel="alternate" hreflang="zh-CN" href="${canonicalUrl}" />`)
    .replace(/<link rel="alternate" hreflang="en"[^>]*>/g, '')
    .replace(/<link rel="alternate" hreflang="x-default"[^>]*>/g, `<link rel="alternate" hreflang="x-default" href="${canonicalUrl}" />`)

  // 替换原有 JSON-LD
  html = html.replace(
    /<!-- JSON-LD[^>]*-->[\s\S]*?<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<!-- JSON-LD: prerendered -->\n    <script type="application/ld+json">\n    ${JSON.stringify(jsonld, null, 2)}\n    </script>`,
  )

  // 在 <div id="app"> 后注入隐藏 H1（爬虫可见，用户不可见）
  html = html.replace(
    '<div id="app"></div>',
    `<div id="app"></div>\n    <h1 style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0">${escapeHtml(h1)}</h1>`,
  )

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

// 2. 工具路由（从 sitemap 中读取）
for (const slug of toolSlugs) {
  const i18n = toolsI18n[slug] ?? {}
  const toolTitle = i18n.title || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const toolDesc
    = i18n.description
    || `${toolTitle} — 免费在线工具，在浏览器中运行，无需安装，安全无需注册。`

  const route = {
    path: `/${slug}`,
    title: `${toolTitle} - 在线工具`,
    description: toolDesc,
    h1: toolTitle,
    keywords: `${slug},在线工具,免费,${SITE_NAME}`,
    jsonld: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: toolTitle,
      description: toolDesc,
      url: `${SITE}/${slug}`,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      provider: { '@type': 'Organization', name: SITE_NAME, url: SITE },
    },
  }

  const outDir = path.join(distDir, 'tools', slug)
  fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, 'index.html')
  fs.writeFileSync(outPath, buildHtml(route), 'utf-8')
  console.log(`✅ Tool: dist/tools/${slug}/index.html`)
  count++
}

// 3. 博客文章路由（从 articles.data.ts 读取）
for (const article of blogArticles) {
  const { slug, title, description, keywords = [], category = 'Development', publishedAt, content } = article

  // 从 markdown 内容提取纯文本摘要（取前 300 字符，去掉 markdown 语法）
  const plainText = (content || '')
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/`[^`]+`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim()
    .slice(0, 300)

  const articleRoute = {
    path: `/blog/${slug}`,
    title,
    description: description || plainText,
    h1: title,
    keywords: Array.isArray(keywords) ? keywords.join(', ') : keywords,
    jsonld: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description: description || plainText,
      url: `${SITE}/blog/${slug}`,
      datePublished: publishedAt,
      dateModified: publishedAt,
      author: { '@type': 'Organization', name: SITE_NAME, url: SITE },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE,
        logo: { '@type': 'ImageObject', url: `${SITE}/favicon.png` },
      },
      articleSection: category,
      keywords: Array.isArray(keywords) ? keywords.join(', ') : keywords,
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE}/blog/${slug}` },
    },
  }

  const outDir = path.join(distDir, 'blog', slug)
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'index.html'), buildHtml(articleRoute), 'utf-8')
  count++
}
console.log(`✅ Blog: ${blogArticles.length} 篇文章页预渲染完成`)

// 4. 生成 404.html（Vercel/Netlify 兜底，返回 404 状态码）
let html404 = template
  .replace(/<title>[^<]*<\/title>/, `<title>页面未找到 — ${SITE_NAME}</title>`)
  .replace(/<link rel="canonical"[^>]*>/g, '') // 移除 canonical，404 不应有 canonical
// 替换 hreflang：移除 en，修正 zh → zh-CN，x-default 指向首页
html404 = html404
  .replace(/<link rel="alternate" hreflang="zh"[^>]*>/g, `<link rel="alternate" hreflang="zh-CN" href="${SITE}/" />`)
  .replace(/<link rel="alternate" hreflang="en"[^>]*>/g, '')
  .replace(/<link rel="alternate" hreflang="x-default"[^>]*>/g, `<link rel="alternate" hreflang="x-default" href="${SITE}/" />`)
// 注入 noindex
html404 = html404.replace('</head>',
  `    <meta name="description" content="您访问的页面不存在，请返回 ${SITE_NAME} 主页继续使用免费在线工具。" />\n    <meta name="robots" content="noindex, follow" />\n  </head>`)
const path404 = path.join(distDir, '404.html')
fs.writeFileSync(path404, html404, 'utf-8')
console.log(`✅ Generated: dist/404.html`)
count++

console.log(`\n🎉 预渲染完成：生成了 ${count} 个静态 HTML 文件`)
console.log(`   - ${staticRoutes.length} 个静态页面（首页、博客列表）`)
console.log(`   - ${toolSlugs.length} 个工具页面`)
console.log(`   - ${blogArticles.length} 个博客文章页面`)
console.log(`   - 1 个 404 页面`)
