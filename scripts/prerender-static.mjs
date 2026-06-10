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
// 分类中文名
const categoryNames = {
  Crypto: '加密安全',
  Converter: '格式转换',
  Web: 'Web 工具',
  'Images and videos': '图片视频',
  Development: '开发工具',
  Network: '网络工具',
  Math: '数学计算',
  Measurement: '测量工具',
  Text: '文本处理',
  Data: '数据工具',
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
// 首页 SEO 内容：列出热门工具分类和内链
const homeSeoContent = (() => {
  const parts = []
  parts.push(`      <p>MyUtl 提供 90+ 免费在线工具，全部在浏览器本地运行，无需注册，数据不上传服务器，安全可靠。</p>`)
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
    title: `${SITE_NAME} - 免费在线工具箱 | 90+ 开发者在线工具`,
    description: `${SITE_NAME} 提供 90+ 免费在线工具，包括 JSON 格式化、Base64 编解码、加密解密、URL 编码、二维码生成、计算器等开发者与日常实用工具，全部在浏览器本地运行，安全无需注册。`,
    h1: `${SITE_NAME} — 免费在线工具箱`,
    keywords: '在线工具,开发者工具,JSON格式化,Base64,URL编码,二维码生成,加密解密,免费工具',
    seoContent: homeSeoContent,
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

// 博客列表页 SEO 内容：注入所有博客文章链接（按发布时间降序）
{
  const sorted = [...blogArticles].sort((a, b) =>
    new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0),
  )
  const parts = []
  parts.push(`      <p>MyUtl 博客提供开发者工具深度使用指南，涵盖加密算法、编码格式、正则表达式、网络协议等主题。</p>`)
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

  // 同类工具推荐内链
  if (slug) {
    const cat = slugCategory[slug]
    if (cat) {
      const siblings = (toolCategories[cat] || []).filter(s => s !== slug).slice(0, 6)
      if (siblings.length > 0) {
        const catLabel = categoryNames[cat] || cat
        parts.push(`      <nav aria-label="相关工具">`)
        parts.push(`        <h2>${catLabel}相关工具</h2>`)
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
    || `${toolTitle} — 免费在线工具，在浏览器中运行，无需安装，安全无需注册。`

  const seoContent = buildToolSeoContent(i18n, slug)

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
    title: toolTitle,
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
function buildArticleSeoContent(content, description, category) {
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

  // 同类工具推荐内链（根据文章分类）
  if (category) {
    const catTools = (toolCategories[category] || []).slice(0, 6)
    if (catTools.length > 0) {
      const catLabel = categoryNames[category] || category
      parts.push(`      <nav aria-label="相关工具">`)
      parts.push(`        <h2>推荐${catLabel}在线工具</h2>`)
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

  const articleSeoContent = buildArticleSeoContent(content, description, category)

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

${toolUrlLines.join('\n')}
  <!-- Blog Articles -->
${blogUrlLines.join('\n')}
</urlset>`

fs.writeFileSync(path.join(distDir, 'sitemap.xml'), newSitemapXml, 'utf-8')
console.log(`✅ Generated: dist/sitemap.xml (${allBlogSlugsInOrder.length} 篇博客 + ${toolSlugs.length} 个工具)`)

console.log(`\n🎉 预渲染完成：生成了 ${count} 个静态 HTML 文件`)
console.log(`   - ${staticRoutes.length} 个静态页面（首页、博客列表）`)
console.log(`   - ${toolSlugs.length} 个工具页面`)
console.log(`   - ${blogArticles.length} 个博客文章页面`)
console.log(`   - 1 个 404 页面`)
