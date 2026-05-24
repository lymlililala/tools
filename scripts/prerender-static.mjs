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

function buildHtml({ path: routePath, title, description, h1, keywords = '', jsonld, seoContent = '' }) {
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

  // 替换 hreflang（统一更新所有 zh/zh-CN/en hreflang 指向当前页 canonical）
  html = html
    .replace(/<link rel="alternate" hreflang="zh(?:-CN)?"[^>]*>/g, `<link rel="alternate" hreflang="zh-CN" href="${canonicalUrl}" />`)
    .replace(/<link rel="alternate" hreflang="en"[^>]*>/g, '')
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

  // 在 <div id="app"> 后注入 SEO 内容块（爬虫可见，Vue 挂载后自动被 SPA 内容覆盖）
  // 使用 aria-hidden 和样式让用户不感知，但 Google 爬虫在 JS 执行前可以读取
  const seoBlock = seoContent
    ? `<div id="app"></div>\n    <div id="seo-content" aria-hidden="true" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0">\n      <h1>${escapeHtml(h1)}</h1>\n${seoContent}\n    </div>`
    : `<div id="app"></div>\n    <h1 style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0">${escapeHtml(h1)}</h1>`

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
function buildToolSeoContent(i18n) {
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
    parts.push(`        <h2>使用方法</h2>`)
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
    parts.push(`        <h2>常见问题</h2>`)
    faqs.forEach(({ q, a }) => {
      parts.push(`        <div>`)
      parts.push(`          <h3>${escapeHtml(q)}</h3>`)
      parts.push(`          <p>${escapeHtml(a)}</p>`)
      parts.push(`        </div>`)
    })
    parts.push(`      </section>`)
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
    || `${toolTitle} — 免费在线工具，在浏览器中运行，无需安装，安全无需注册。`

  const seoContent = buildToolSeoContent(i18n)

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

  // 构建 JSON-LD：有 FAQ 时使用 @graph 复合模式
  const jsonld = faqItems.length > 0
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          webAppSchema,
          {
            '@type': 'FAQPage',
            mainEntity: faqItems.map(({ q, a }) => ({
              '@type': 'Question',
              name: q,
              acceptedAnswer: { '@type': 'Answer', text: a },
            })),
          },
        ],
      }
    : { '@context': 'https://schema.org', ...webAppSchema }

  const route = {
    path: `/${slug}`,
    title: `${toolTitle} - 在线工具`,
    description: toolDesc,
    h1: toolTitle,
    keywords: [toolTitle, slug, '在线工具', '免费', '在线', SITE_NAME].filter(Boolean).join(','),
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
function buildArticleSeoContent(content, description) {
  const raw = content || ''
  const parts = []

  if (description) {
    parts.push(`      <p>${escapeHtml(description)}</p>`)
  }

  // 提取 ## H2 段落及其内容（前 5 个段落）
  const sections = raw.split(/^#{2}\s+/m).slice(1, 6)
  sections.forEach((section) => {
    const lines = section.split('\n')
    const heading = lines[0].trim()
    const bodyLines = lines.slice(1)
      .join(' ')
      .replace(/#{1,6}\s+\S+/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/`[^`]+`/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 300)
    if (heading && bodyLines.length > 20) {
      parts.push(`      <section>`)
      parts.push(`        <h2>${escapeHtml(heading)}</h2>`)
      parts.push(`        <p>${escapeHtml(bodyLines)}</p>`)
      parts.push(`      </section>`)
    }
  })

  return parts.join('\n')
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

  const articleSeoContent = buildArticleSeoContent(content, description)

  const articleRoute = {
    path: `/blog/${slug}`,
    title,
    description: description || plainText,
    h1: title,
    keywords: Array.isArray(keywords) ? keywords.join(', ') : keywords,
    seoContent: articleSeoContent,
    jsonld: {
      '@context': 'https://schema.org',
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
