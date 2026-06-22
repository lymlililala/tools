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

// 某逻辑路径的 hreflang 全簇：en 根 + zh-Hans(/zh) + x-default→en 根。
// en 页与 zh 页都用它，保证 hreflang 双向对称（否则 Google 会忽略整组标注）。
// basePath 形如 '/json-format'，首页传 '/'。
function fullAltCluster(basePath) {
  const clean = basePath === '/' ? '' : basePath
  const enHref = `${SITE}${clean}` || `${SITE}/`
  return [
    { hreflang: 'en', href: enHref },
    { hreflang: 'zh-Hans', href: `${SITE}/zh${clean}` },
    { hreflang: 'x-default', href: enHref },
  ]
}

// ── 读取 en.yml 获取工具 title / description / steps / FAQ ────────────────────
// 站点面向英文受众(lang=en),预渲染(爬虫可见)的工具页 SEO 内容与 schema 必须为英文。
const enYmlPath = path.join(rootDir, 'locales', 'en.yml')
const enRaw = fs.readFileSync(enYmlPath, 'utf-8')
const en = parseYaml(enRaw)
const toolsI18n = en.tools ?? {}

// ── 多语言：读取 zh.yml，供 /zh 前缀页预渲染中文 SEO 内容 ─────────────────────
// ⚠️ 必须与 src/lib/locales.ts 的 LOCALES 保持同步（脚本不能 import TS，此处内联等价副本）。
//    加一种语言 = 这里加一行 + src/lib/locales.ts 加一行 + vercel.json 加一组规则。
const LOCALES = [
  { code: 'en', prefix: '', htmlLang: 'en', ogLocale: 'en_US', hreflang: 'en' },
  { code: 'zh', prefix: '/zh', htmlLang: 'zh-CN', ogLocale: 'zh_CN', hreflang: 'zh-Hans' },
]
const ZH = LOCALES.find(l => l.code === 'zh')
let zhYml = {}
try {
  zhYml = parseYaml(fs.readFileSync(path.join(rootDir, 'locales', 'zh.yml'), 'utf-8')) ?? {}
}
catch (e) {
  console.warn('⚠️  读取 zh.yml 失败，跳过中文工具/页面预渲染：', e.message)
}
const toolsI18nZh = zhYml.tools ?? {}
// 各 locale 的工具 i18n 数据（取中文，缺则英文兜底由调用方处理）
const ymlByLocale = { en, zh: zhYml }

// ── 预渲染 SEO 区块的硬编码 UI 文案（按语言）──────────────────────────────────
const SEO_UI = {
  en: {
    howTo: 'How to Use',
    faq: 'Frequently Asked Questions',
    relatedTools: c => `Related ${c} Tools`,
    relatedGuides: 'Related Guides &amp; Tutorials',
    relatedGuidesShort: 'Related Guides',
    browseOther: 'Browse other categories',
  },
  zh: {
    howTo: '使用方法',
    faq: '常见问题',
    relatedTools: c => `相关${c}工具`,
    relatedGuides: '相关指南与教程',
    relatedGuidesShort: '相关指南',
    browseOther: '浏览其它分类',
  },
}
// 分类显示名（中文）
const categoryNamesZh = {
  Crypto: '加密与安全',
  Converter: '转换器',
  Web: 'Web',
  'Images and videos': '图片与视频',
  Development: '开发',
  Network: '网络',
  Math: '数学',
  Measurement: '测量',
  Text: '文本',
  Data: '数据',
}
// 按语言取分类显示名
function catLabelOf(cat, lang) {
  return lang === 'zh' ? (categoryNamesZh[cat] || categoryNames[cat] || cat) : (categoryNames[cat] || cat)
}

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
// 顶级非工具页面（首页由空字符串匹配，blog 单独处理，以下信息页也需排除）
const nonToolTopLevel = new Set(['blog', 'about', 'contact', 'privacy', 'terms'])
const toolSlugs = []
let m
while ((m = urlRegex.exec(sitemapXml)) !== null) {
  const slug = m[1]
  if (slug && !nonToolTopLevel.has(slug)) {
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
  {
    path: '/about',
    title: `About ${SITE_NAME} — Free Privacy-First Online Toolbox`,
    description: `Learn about ${SITE_NAME}, a free collection of 90+ online developer tools that run entirely in your browser. No sign-up, no uploads — your data never leaves your device.`,
    h1: `About ${SITE_NAME}`,
    keywords: 'about myutl, free online tools, privacy first tools, browser tools, open source tools',
    seoContent: [
      `      <p><strong>${SITE_NAME}</strong> is a free online toolbox that brings together 90+ handy utilities for developers and everyday tasks — JSON formatting, Base64 encoding, encryption, URL tools, QR code generation, hashing, and much more. Every tool runs entirely in your browser, with no sign-up and no uploads.</p>`,
      `      <h2>Privacy first</h2>`,
      `      <p>All processing happens locally on your device, so you can work with sensitive content without it ever touching a server. See our <a href="/privacy">Privacy Policy</a> for details.</p>`,
      `      <h2>Open source</h2>`,
      `      <p>${SITE_NAME} is built on the open-source <a href="https://github.com/CorentinTh/it-tools" rel="nofollow">it-tools</a> project, created by Corentin Thomasset and licensed under GPL-3.0. We are grateful to the original author and the open-source community.</p>`,
      `      <h2>Get in touch</h2>`,
      `      <p>Found a bug or need a new tool? Visit our <a href="/contact">Contact page</a> or email <a href="mailto:contact@myutl.com">contact@myutl.com</a>.</p>`,
    ].join('\n'),
    jsonld: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: `About ${SITE_NAME}`,
      url: `${SITE}/about`,
      publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE, email: 'contact@myutl.com' },
    },
  },
  {
    path: '/contact',
    title: `Contact ${SITE_NAME} — Support, Feedback & Requests`,
    description: `Get in touch with the ${SITE_NAME} team. Report a bug, request a new tool, or ask a question — email contact@myutl.com and we will reply within 1–2 business days.`,
    h1: `Contact ${SITE_NAME}`,
    keywords: 'contact myutl, myutl support, report bug, request tool, feedback',
    seoContent: [
      `      <p>We'd love to hear from you. Whether you've found a bug, want to request a new tool, have a partnership idea, or just want to say hello — get in touch.</p>`,
      `      <p><strong>Email:</strong> <a href="mailto:contact@myutl.com">contact@myutl.com</a></p>`,
      `      <p>We typically reply within 1–2 business days.</p>`,
      `      <h2>How we can help</h2>`,
      `      <ul>`,
      `        <li><strong>Bug reports</strong> — tell us the tool name, what you expected, and what happened.</li>`,
      `        <li><strong>Feature requests</strong> — describe the tool you need and how you'd use it.</li>`,
      `        <li><strong>Feedback</strong> — ideas to make ${SITE_NAME} faster, clearer, or more useful.</li>`,
      `        <li><strong>Business &amp; partnerships</strong> — reach out at the same address.</li>`,
      `      </ul>`,
    ].join('\n'),
    jsonld: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: `Contact ${SITE_NAME}`,
      url: `${SITE}/contact`,
      mainEntity: { '@type': 'Organization', name: SITE_NAME, url: SITE, email: 'contact@myutl.com' },
    },
  },
  {
    path: '/privacy',
    title: `Privacy Policy — ${SITE_NAME}`,
    description: `How ${SITE_NAME} handles your data: our tools run locally in your browser, and we disclose the cookies and third-party advertising (Google) we use.`,
    h1: 'Privacy Policy',
    keywords: 'myutl privacy policy, privacy, data protection, cookies, advertising',
    seoContent: [
      `      <p><em>Last updated: June 14, 2026</em></p>`,
      `      <p>${SITE_NAME} respects your privacy. This policy explains how our tools work and what information may be collected when you visit our site.</p>`,
      `      <h2>Local-first tools</h2>`,
      `      <p>All of our tools run entirely in your browser. The text, files, and data you enter into a tool are processed on your own device and are never transmitted to or stored on our servers.</p>`,
      `      <h2>Cookies and similar technologies</h2>`,
      `      <p>This website uses cookies and similar technologies. Preferences such as your theme and favorite tools are kept in your browser's local storage, while advertising cookies are set by the third parties described below.</p>`,
      `      <h2>Advertising</h2>`,
      `      <p>We use third-party advertising companies, including Google, to serve ads. Google and its partners may use cookies (including the DoubleClick / DART cookie) to serve ads based on your prior visits to this and other websites. You can opt out of personalized advertising via <a href="https://www.google.com/settings/ads" rel="nofollow">Google Ads Settings</a> or <a href="https://www.aboutads.info/choices" rel="nofollow">www.aboutads.info/choices</a>.</p>`,
      `      <h2>Contact</h2>`,
      `      <p>Questions? Email <a href="mailto:contact@myutl.com">contact@myutl.com</a>.</p>`,
    ].join('\n'),
    jsonld: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: `Privacy Policy — ${SITE_NAME}`,
      url: `${SITE}/privacy`,
      publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE },
    },
  },
  {
    path: '/terms',
    title: `Terms of Service — ${SITE_NAME}`,
    description: `The terms governing your use of ${SITE_NAME}, a free online toolbox. By using the service you agree to these terms.`,
    h1: 'Terms of Service',
    keywords: 'myutl terms of service, terms, conditions of use',
    seoContent: [
      `      <p><em>Last updated: June 14, 2026</em></p>`,
      `      <p>By accessing or using ${SITE_NAME} (the "Service"), you agree to these Terms of Service. If you do not agree, please do not use the Service.</p>`,
      `      <h2>Use of the Service</h2>`,
      `      <p>${SITE_NAME} provides a collection of free online utilities for personal and commercial use, offered at no cost.</p>`,
      `      <h2>No warranty</h2>`,
      `      <p>The Service is provided "as is" and "as available", without warranties of any kind. Always verify critical results independently.</p>`,
      `      <h2>Limitation of liability</h2>`,
      `      <p>To the fullest extent permitted by law, ${SITE_NAME} and its contributors shall not be liable for any damages arising from your use of, or inability to use, the Service.</p>`,
      `      <h2>Contact</h2>`,
      `      <p>Questions about these terms? Email <a href="mailto:contact@myutl.com">contact@myutl.com</a>.</p>`,
    ].join('\n'),
    jsonld: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: `Terms of Service — ${SITE_NAME}`,
      url: `${SITE}/terms`,
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

function buildHtml({ path: routePath, title, description, h1, keywords = '', jsonld, seoContent = '', ogType, articleMeta, alternates, htmlLang, ogLocale }) {
  // 首页用完整 title；其余拼接品牌后缀，但标题已含品牌则不重复拼接（修双 MyUtl bug）。
  const fullTitle = (routePath === '/' || String(title).includes(SITE_NAME)) ? title : `${title} | ${SITE_NAME}`
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

  // hreflang：博客双语页传 alternates（en/zh-Hans/x-default 互指）；其它页保持英文单语自指。
  html = html
    .replace(/<link rel="alternate" hreflang="en"[^>]*>/g, '')
    .replace(/<link rel="alternate" hreflang="zh(?:-Hans|-CN)?"[^>]*>/g, '')
    .replace(/<link rel="alternate" hreflang="x-default"[^>]*>/g, '')
  const alts = (alternates && alternates.length)
    ? alternates
    : [{ hreflang: 'en', href: canonicalUrl }, { hreflang: 'x-default', href: canonicalUrl }]
  const altTags = alts.map(a => `<link rel="alternate" hreflang="${a.hreflang}" href="${a.href}" />`).join('\n    ')
  html = html.replace(canonicalTag, `${canonicalTag}\n    ${altTags}`)

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

  // 非默认语言：替换 <html lang> 并注入 og:locale（英文页不传这两个参数 → 产物零变化）。
  if (htmlLang) {
    html = html.replace(/<html lang="[^"]*">/, `<html lang="${htmlLang}">`)
  }
  if (ogLocale) {
    html = html.replace('</head>', `    <meta property="og:locale" content="${ogLocale}" />\n  </head>`)
  }

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

// ── 合并 Supabase tools_articles 中「仅存在于库、尚未进 articles.data.ts」的文章 ──
//    （自动发布管线只 upsert 进库 → 这里并入，使其同样获得预渲染页 + sitemap 收录）。
//    尽力而为：无 SUPABASE_SECRET_KEY（本地构建）则跳过，保持原行为不变。
const SUPA_URL = process.env.SUPABASE_URL || 'https://tixgzezefjjsyuzgdhcd.supabase.co'
const SUPA_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY
if (SUPA_KEY) {
  try {
    const bySlug = new Map(blogArticles.map(a => [a.slug, a]))
    const { createClient } = await import('@supabase/supabase-js')
    const supa = createClient(SUPA_URL, SUPA_KEY, { auth: { persistSession: false } })
    const { data, error } = await supa
      .from('tools_articles')
      .select('slug, tool_path, title, description, keywords, category, published_at, content, title_zh, description_zh, content_zh, keywords_zh')
      .order('published_at', { ascending: false })
    if (error) throw new Error(error.message)
    let added = 0; let zhMerged = 0
    for (const r of data || []) {
      if (!r.slug) continue
      const zh = {
        titleZh: r.title_zh ?? null,
        descriptionZh: r.description_zh ?? null,
        contentZh: r.content_zh ?? null,
        keywordsZh: Array.isArray(r.keywords_zh) ? r.keywords_zh : [],
      }
      const existing = bySlug.get(r.slug)
      if (existing) {
        // 已在 data.ts（英文）→ 仅补中文字段（中文以 DB 为唯一来源）
        if (r.content_zh) { Object.assign(existing, zh); zhMerged++ }
        continue
      }
      if (!r.content) continue
      const merged = {
        slug: r.slug,
        toolPath: r.tool_path ?? null,
        title: r.title || r.slug,
        description: r.description || '',
        keywords: Array.isArray(r.keywords) ? r.keywords : [],
        category: r.category || 'Blog',
        publishedAt: r.published_at || '',
        content: r.content,
        ...zh,
      }
      bySlug.set(r.slug, merged)
      blogArticles.push(merged)
      added++
    }
    console.log(`🗄️  合并库内新增博客 ${added} 篇（DB-only），补中文 ${zhMerged} 篇，博客总数 ${blogArticles.length}`)
  }
  catch (e) {
    console.warn('⚠️  合并 Supabase 文章失败（跳过，不影响构建）：', e.message)
  }
}

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
  if (blogRoute) {
    blogRoute.seoContent = parts.join('\n')
    // 有任一中文文章时，英文列表页发 zh hreflang 互指 /zh/blog
    if (blogArticles.some(a => a.contentZh && String(a.contentZh).trim())) {
      blogRoute.alternates = [
        { hreflang: 'en', href: `${SITE}/blog` },
        { hreflang: 'zh-Hans', href: `${SITE}/zh/blog` },
        { hreflang: 'x-default', href: `${SITE}/blog` },
      ]
    }
  }
}

// ── 生成静态页面 ─────────────────────────────────────────────────────────────────
let count = 0

// 英文静态页补 zh-Hans 回链（hreflang 双向对称）。blog 有自己的条件逻辑，跳过。
for (const r of staticRoutes) {
  if (r.path === '/blog') continue
  r.alternates = fullAltCluster(r.path)
}

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

// 1.5 中文博客列表页 /zh/blog（仅当存在中文文章时）
{
  const zhArticles = blogArticles.filter(a => a.contentZh && String(a.contentZh).trim())
  if (zhArticles.length) {
    const sorted = [...zhArticles].sort((a, b) =>
      new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0),
    )
    const parts = []
    parts.push(`      <p>MyUtl 博客发布开发者工具的深度指南，涵盖哈希与加密、编码格式、正则表达式、网络等主题。</p>`)
    parts.push(`      <ul>`)
    sorted.forEach((a) => {
      const slug = a.slug
      const title = escapeHtml(a.titleZh || a.title || slug)
      const desc = a.descriptionZh ? ` — ${escapeHtml(a.descriptionZh.slice(0, 40))}` : ''
      parts.push(`        <li><a href="/zh/blog/${slug}">${title}</a>${desc}</li>`)
    })
    parts.push(`      </ul>`)
    const zhBlogRoute = {
      path: '/zh/blog',
      title: '开发者工具指南 — MyUtl 博客',
      description: '100+ 开发者工具的深度指南——加密、编码、正则、网络与数据转换，结合实例讲解。',
      h1: '开发者工具指南 — MyUtl 博客',
      keywords: '开发者工具指南, 编程教程, 在线工具博客',
      seoContent: parts.join('\n'),
      alternates: [
        { hreflang: 'en', href: `${SITE}/blog` },
        { hreflang: 'zh-Hans', href: `${SITE}/zh/blog` },
        { hreflang: 'x-default', href: `${SITE}/blog` },
      ],
      jsonld: {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: `${SITE_NAME} 博客`,
        inLanguage: 'zh-CN',
        url: `${SITE}/zh/blog`,
        publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE },
      },
    }
    const outDir = path.join(distDir, 'zh', 'blog')
    fs.mkdirSync(outDir, { recursive: true })
    fs.writeFileSync(path.join(outDir, 'index.html'), buildHtml(zhBlogRoute), 'utf-8')
    console.log(`✅ Static: dist/zh/blog/index.html`)
    count++
  }
}

// ── 辅助：从 i18n 数据构建工具页 SEO 正文 HTML ─────────────────────────────────
function buildToolSeoContent(i18n, slug, lang = 'en') {
  const ui = SEO_UI[lang] || SEO_UI.en
  const ti = ymlByLocale[lang]?.tools ?? toolsI18n
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
    parts.push(`        <h2>${ui.howTo}</h2>`)
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
    parts.push(`        <h2>${ui.faq}</h2>`)
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
        const catLabel = catLabelOf(cat, lang)
        parts.push(`      <nav aria-label="Related tools">`)
        parts.push(`        <h2>${ui.relatedTools(catLabel)}</h2>`)
        parts.push(`        <ul>`)
        siblings.forEach((s) => {
          const sKey = slugToI18nKey[s] ?? s
          const sI18n = ti[sKey] ?? ti[s] ?? toolsI18n[sKey] ?? toolsI18n[s] ?? {}
          const sTitle = sI18n.title || s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
          parts.push(`          <li><a href="${ZH && lang === 'zh' ? ZH.prefix : ''}/${s}">${escapeHtml(sTitle)}</a></li>`)
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
    alternates: fullAltCluster(`/${slug}`),
  }

  const outDir = path.join(distDir, 'tools', slug)
  fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, 'index.html')
  fs.writeFileSync(outPath, buildHtml(route), 'utf-8')
  console.log(`✅ Tool: dist/tools/${slug}/index.html`)
  count++
}

// ── 辅助：从 Markdown 内容构建博客文章 SEO 正文 HTML ──────────────────────────
function buildArticleSeoContent(article, related = [], lang = 'en') {
  const zh = lang === 'zh'
  const content = zh ? (article.contentZh || article.content) : article.content
  const description = zh ? (article.descriptionZh || article.description) : article.description
  const toolPath = article.toolPath
  const blogBase = zh ? '/zh/blog' : '/blog'
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
    parts.push(`        <h2>${zh ? '相关指南' : 'Related Guides'}</h2>`)
    parts.push(`        <ul>`)
    related.forEach((a) => {
      const t = zh ? (a.titleZh || a.title) : a.title
      parts.push(`          <li><a href="${blogBase}/${a.slug}">${escapeHtml(t)}</a></li>`)
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
      parts.push(`        <h2>${zh ? `相关${catLabel}工具` : `Related ${catLabel} Tools`}</h2>`)
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

// 3. 博客文章路由（从 articles.data.ts 读取）。每篇产英文页；有中文版再产 /zh/ 页。
function emitArticlePage(article, lang) {
  const { slug, title, category = 'Development', publishedAt, keywords = [] } = article
  const zh = lang === 'zh'
  const hasZhVer = !!(article.contentZh && String(article.contentZh).trim())
  const dispTitle = zh ? (article.titleZh || title) : title
  const content = zh ? (article.contentZh || article.content) : article.content
  const dbDesc = zh ? (article.descriptionZh || article.description) : article.description

  // 从 markdown 内容提取纯文本摘要（取前 300 字符，去掉 markdown 语法）
  const plainText = (content || '')
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/`[^`]+`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim()
    .slice(0, 300)

  const articleSeoContent = buildArticleSeoContent(article, relatedArticles(article), lang)
  const routePath = zh ? `/zh/blog/${slug}` : `/blog/${slug}`
  const canonical = `${SITE}${routePath}`
  const enUrl = `${SITE}/blog/${slug}`
  const zhUrl = `${SITE}/zh/blog/${slug}`
  // 仅当存在中文版时才互指 zh hreflang，避免指向空壳；x-default 指英文。
  const alternates = hasZhVer
    ? [{ hreflang: 'en', href: enUrl }, { hreflang: 'zh-Hans', href: zhUrl }, { hreflang: 'x-default', href: enUrl }]
    : null
  const kwEn = Array.isArray(keywords) ? keywords.join(', ') : keywords
  const kw = zh && Array.isArray(article.keywordsZh) && article.keywordsZh.length ? article.keywordsZh.join(', ') : kwEn

  const articleRoute = {
    path: routePath,
    title: dispTitle,
    description: dbDesc || plainText,
    h1: dispTitle,
    keywords: kw,
    ogType: 'article',
    alternates,
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
          headline: dispTitle,
          description: dbDesc || plainText,
          inLanguage: zh ? 'zh-CN' : 'en',
          url: canonical,
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
          keywords: kw,
          mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: zh ? '首页' : 'Home', item: `${SITE}/` },
            { '@type': 'ListItem', position: 2, name: zh ? '博客' : 'Blog', item: zh ? `${SITE}/zh/blog` : `${SITE}/blog` },
            { '@type': 'ListItem', position: 3, name: dispTitle, item: canonical },
          ],
        },
      ],
    },
  }

  const outDir = zh ? path.join(distDir, 'zh', 'blog', slug) : path.join(distDir, 'blog', slug)
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'index.html'), buildHtml(articleRoute), 'utf-8')
}

let zhCount = 0
for (const article of blogArticles) {
  emitArticlePage(article, 'en')
  count++
  if (article.contentZh && String(article.contentZh).trim()) {
    emitArticlePage(article, 'zh')
    count++
    zhCount++
  }
}
console.log(`✅ Blog: ${blogArticles.length} 篇英文 + ${zhCount} 篇中文 预渲染完成`)

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
    alternates: fullAltCluster(`/c/${hub.slug}`),
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

// ════════════════════════════════════════════════════════════════════════════
// 中文（/zh）预渲染 pass —— 纯增量，不影响上面任何英文产物。
// 工具/首页/分类/静态页全部生成 dist/zh/... 中文静态 HTML（中文内容来自 zh.yml）。
// 博客 /zh 已在上方按 DB content_zh 生成；此处不重复。
// ════════════════════════════════════════════════════════════════════════════
{
  // 某逻辑路径的 hreflang 全簇：en 根 + zh-Hans(/zh) + x-default→en 根。
  const altCluster = (basePath) => {
    const clean = basePath === '/' ? '' : basePath
    const enHref = `${SITE}${clean}` || `${SITE}/`
    return [
      { hreflang: 'en', href: enHref },
      { hreflang: 'zh-Hans', href: `${SITE}/zh${clean}` },
      { hreflang: 'x-default', href: enHref },
    ]
  }
  // zh 工具标题（带英文兜底）
  const zhToolI18n = (slug) => {
    const key = slugToI18nKey[slug] ?? slug
    return toolsI18nZh[key] ?? toolsI18nZh[slug] ?? toolsI18n[key] ?? toolsI18n[slug] ?? {}
  }
  const zhTitleOf = (slug, i18n) => i18n.title || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  // 写 zh 文件助手
  const writeZh = (relDir, route) => {
    route.htmlLang = ZH.htmlLang
    route.ogLocale = ZH.ogLocale
    const outDir = path.join(distDir, 'zh', relDir)
    fs.mkdirSync(outDir, { recursive: true })
    fs.writeFileSync(path.join(outDir, 'index.html'), buildHtml(route), 'utf-8')
  }
  let zhPageCount = 0

  // A) 中文首页 → dist/zh/prerender-home/index.html
  {
    const parts = []
    parts.push(`      <p>MyUtl 提供 90+ 款免费在线开发者工具，全部在浏览器本地运行——无需注册、无需上传，数据永不离开你的设备。</p>`)
    for (const [cat, slugs] of Object.entries(toolCategories)) {
      parts.push(`      <section>`)
      parts.push(`        <h2>${escapeHtml(catLabelOf(cat, 'zh'))}</h2>`)
      parts.push(`        <ul>`)
      slugs.slice(0, 5).forEach((s) => {
        const i18n = zhToolI18n(s)
        const sTitle = zhTitleOf(s, i18n)
        const sDesc = i18n.description ? ` — ${String(i18n.description).slice(0, 50)}` : ''
        parts.push(`          <li><a href="/zh/${s}">${escapeHtml(sTitle)}</a>${escapeHtml(sDesc)}</li>`)
      })
      parts.push(`        </ul>`)
      parts.push(`      </section>`)
    }
    writeZh('prerender-home', {
      path: '/zh',
      title: zhYml.home?.metaTitle || 'MyUtl — 免费在线工具箱',
      description: zhYml.home?.metaDesc || 'MyUtl 提供 90+ 免费在线开发者工具，全部在浏览器本地运行。',
      h1: zhYml.home?.heroTitle || 'MyUtl — 免费在线工具箱',
      seoContent: parts.join('\n'),
      alternates: altCluster('/'),
      jsonld: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: `${SITE}/zh`,
        inLanguage: 'zh-CN',
        description: 'MyUtl 免费在线工具箱，90+ 款开发者与日常实用工具，全部在浏览器本地运行。',
      },
    })
    console.log('✅ Static(zh): dist/zh/prerender-home/index.html')
    zhPageCount++
  }

  // B) 中文工具页 → dist/zh/tools/<slug>/index.html
  for (const slug of toolSlugs) {
    const i18n = zhToolI18n(slug)
    const toolTitle = zhTitleOf(slug, i18n)
    const toolDesc = i18n.description || `${toolTitle} —— 免费在线工具，在浏览器中运行，无需安装、无需注册。`

    let seoContent = buildToolSeoContent(i18n, slug, 'zh')

    // 工具页 → 相关指南（中文标题优先，链接到 /zh/blog 当文章有中文版，否则 /blog）
    const toolGuides = guidesForTool(slug)
    if (toolGuides.length > 0) {
      const guideParts = ['      <nav aria-label="Related guides">', `        <h2>${SEO_UI.zh.relatedGuides}</h2>`, '        <ul>']
      toolGuides.forEach((a) => {
        const hasZhVer = !!(a.contentZh && String(a.contentZh).trim())
        const base = hasZhVer ? '/zh/blog' : '/blog'
        const t = hasZhVer ? (a.titleZh || a.title) : a.title
        guideParts.push(`          <li><a href="${base}/${a.slug}">${escapeHtml(t)}</a></li>`)
      })
      guideParts.push('        </ul>', '      </nav>')
      seoContent += '\n' + guideParts.join('\n')
    }

    // FAQ / 步骤 schema（中文）
    const faqItems = []
    for (let n = 1; n <= 6; n++) {
      const q = i18n[`faq${n}q`]; const a = i18n[`faq${n}a`]
      if (q && a) faqItems.push({ q, a }); else break
    }
    const commonFaqZh = toolsI18nZh.common ?? {}
    if (commonFaqZh.faqSafe && commonFaqZh.faqSafeA) {
      faqItems.push({ q: commonFaqZh.faqSafe, a: commonFaqZh.faqSafeA })
    }
    const howToSteps = []
    for (let n = 1; n <= 8; n++) {
      if (i18n[`step${n}`]) howToSteps.push(i18n[`step${n}`]); else break
    }

    const graph = [{
      '@type': 'WebApplication',
      name: toolTitle,
      description: toolDesc,
      url: `${SITE}/zh/${slug}`,
      inLanguage: 'zh-CN',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      provider: { '@type': 'Organization', name: SITE_NAME, url: SITE },
    }]
    const cat = slugCategory[slug]
    const crumbs = [{ name: '首页', url: `${SITE}/zh` }]
    if (cat) crumbs.push({ name: catLabelOf(cat, 'zh'), url: `${SITE}/zh/c/${catHubSlug(cat)}` })
    crumbs.push({ name: toolTitle, url: `${SITE}/zh/${slug}` })
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.url })),
    })
    if (howToSteps.length > 0) {
      graph.push({
        '@type': 'HowTo',
        name: `如何使用${toolTitle}`,
        step: howToSteps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, text: s })),
      })
    }
    if (faqItems.length > 0) {
      graph.push({
        '@type': 'FAQPage',
        mainEntity: faqItems.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      })
    }

    writeZh(path.join('tools', slug), {
      path: `/zh/${slug}`,
      title: toolTitle,
      description: toolDesc,
      h1: toolTitle,
      seoContent,
      alternates: altCluster(`/${slug}`),
      jsonld: { '@context': 'https://schema.org', '@graph': graph },
    })
    zhPageCount++
  }
  console.log(`✅ Tool(zh): ${toolSlugs.length} 个中文工具页`)

  // C) 中文分类 hub 页 → dist/zh/c/<slug>/index.html
  const CATEGORY_HUB_ZH = {
    'crypto': { label: '加密与安全工具', desc: '免费在线加密与安全工具——哈希、加密、令牌与密钥生成、密码强度检测等，全部在浏览器中运行。' },
    'converter': { label: '转换器工具', desc: '免费在线转换器——日期、数字、颜色、文本编码，以及 JSON、YAML、TOML、XML 等数据格式互转。快速、私密、无需上传。' },
    'web': { label: 'Web 开发工具', desc: '面向 Web 开发者的免费在线工具——URL 编码、HTML 实体、JWT、Basic Auth、HTTP 状态码、User-Agent 解析等。' },
    'images-and-videos': { label: '图片与视频工具', desc: '免费在线图片与视频工具——二维码与 SVG 占位图生成、调色板，以及浏览器内置摄像头录制。' },
    'development': { label: '开发者实用工具', desc: '免费在线开发者实用工具——JSON/SQL/XML/YAML 格式化、正则测试、crontab、chmod、Docker 与 Git 速查，全部在浏览器中运行。' },
    'network': { label: '网络工具', desc: '免费在线网络工具——IPv4 子网与地址段计算、MAC 地址查询与生成、IPv6 ULA 生成。' },
    'math': { label: '数学与计算器工具', desc: '免费在线数学与金融计算器——表达式求值、百分比、房贷、个税、ETA、数字格式化。' },
    'measurement': { label: '测量工具', desc: '免费在线测量工具——秒表、温度转换、BMI 计算，以及代码基准测试构建器。' },
    'text': { label: '文本工具', desc: '免费在线文本工具——Lorem Ipsum、文本统计、文本对比、表情选择、字符串混淆、ASCII 艺术等。' },
    'data': { label: '数据工具', desc: '免费在线数据工具——电话号码解析与格式化、IBAN 校验与解析。' },
  }
  let zhCatCount = 0
  for (const hub of CATEGORY_HUBS) {
    const slugs = toolCategories[hub.name] || []
    if (slugs.length === 0) continue
    const zhHub = CATEGORY_HUB_ZH[hub.slug] || { label: hub.label, desc: hub.desc }
    const parts = []
    parts.push(`      <p>${escapeHtml(zhHub.desc)}</p>`)
    parts.push(`      <h2>${escapeHtml(zhHub.label)}</h2>`)
    parts.push(`      <ul>`)
    for (const s of slugs) {
      const i18n = zhToolI18n(s)
      const sTitle = zhTitleOf(s, i18n)
      const sDesc = i18n.description ? ` — ${escapeHtml(String(i18n.description).slice(0, 80))}` : ''
      parts.push(`        <li><a href="/zh/${s}">${escapeHtml(sTitle)}</a>${sDesc}</li>`)
    }
    parts.push(`      </ul>`)
    // 相关指南（中文标题优先）
    const seenG = new Set(); const guideLines = []
    for (const s of slugs) {
      for (const g of guidesForTool(s, 4)) {
        if (seenG.has(g.slug)) continue
        seenG.add(g.slug)
        const hasZhVer = !!(g.contentZh && String(g.contentZh).trim())
        const base = hasZhVer ? '/zh/blog' : '/blog'
        const t = hasZhVer ? (g.titleZh || g.title) : g.title
        guideLines.push(`        <li><a href="${base}/${g.slug}">${escapeHtml(t)}</a></li>`)
      }
    }
    if (guideLines.length) {
      parts.push(`      <h2>${escapeHtml(zhHub.label)}指南</h2>`)
      parts.push(`      <ul>`)
      parts.push(...guideLines.slice(0, 12))
      parts.push(`      </ul>`)
    }
    // 其它分类内链
    parts.push(`      <nav aria-label="Other categories"><h2>${SEO_UI.zh.browseOther}</h2><ul>`)
    for (const c of CATEGORY_HUBS) {
      if (c.slug === hub.slug) continue
      const cl = (CATEGORY_HUB_ZH[c.slug] || { label: c.label }).label
      parts.push(`        <li><a href="/zh/c/${c.slug}">${escapeHtml(cl)}</a></li>`)
    }
    parts.push(`      </ul></nav>`)

    writeZh(path.join('c', hub.slug), {
      path: `/zh/c/${hub.slug}`,
      title: `${zhHub.label} — 免费在线`,
      description: zhHub.desc,
      h1: zhHub.label,
      seoContent: parts.join('\n'),
      alternates: altCluster(`/c/${hub.slug}`),
      jsonld: {
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'CollectionPage', name: zhHub.label, description: zhHub.desc, url: `${SITE}/zh/c/${hub.slug}`, inLanguage: 'zh-CN' },
          { '@type': 'BreadcrumbList', itemListElement: [
            { '@type': 'ListItem', position: 1, name: '首页', item: `${SITE}/zh` },
            { '@type': 'ListItem', position: 2, name: zhHub.label, item: `${SITE}/zh/c/${hub.slug}` },
          ] },
        ],
      },
    })
    zhCatCount++
  }
  console.log(`✅ Category(zh): ${zhCatCount} 个中文分类页`)

  // D) 中文静态信息页（about/contact/privacy/terms）→ 正文取 zh.yml 的 markdown
  const splitMdH1 = (md) => {
    const s = String(md || '')
    const m = s.match(/^\s*#\s+(.+?)\s*(?:\n|$)/)
    if (m) return { h1: m[1], body: s.slice(m[0].length) }
    return { h1: '', body: s }
  }
  const ZH_STATIC = [
    { key: 'about', jsonType: 'AboutPage' },
    { key: 'contact', jsonType: 'ContactPage' },
    { key: 'privacy', jsonType: 'WebPage' },
    { key: 'terms', jsonType: 'WebPage' },
  ]
  let zhStaticCount = 0
  for (const { key, jsonType } of ZH_STATIC) {
    const page = zhYml[key]
    if (!page || !page.content) continue
    const { h1, body } = splitMdH1(page.content)
    const seoContent = `      <article class="prose">\n${marked.parse(body)}\n      </article>`
    writeZh(key, {
      path: `/zh/${key}`,
      title: page.metaTitle || h1 || key,
      description: page.metaDesc || '',
      h1: h1 || page.metaTitle || key,
      seoContent,
      alternates: altCluster(`/${key}`),
      jsonld: {
        '@context': 'https://schema.org',
        '@type': jsonType,
        name: page.metaTitle || h1 || key,
        url: `${SITE}/zh/${key}`,
        inLanguage: 'zh-CN',
        publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE },
      },
    })
    zhStaticCount++
  }
  console.log(`✅ Static(zh): ${zhStaticCount} 个中文信息页`)

  // E) 中文 SPA 兜底壳 dist/zh/index.html（lang=zh-CN，供 /zh/* 未预渲染路由客户端渲染）
  {
    let zhShell = template.replace(/<html lang="[^"]*">/, `<html lang="${ZH.htmlLang}">`)
    fs.writeFileSync(path.join(distDir, 'zh', 'index.html'), zhShell, 'utf-8')
    console.log('✅ Shell(zh): dist/zh/index.html')
  }

  // F) 中文 404 → dist/zh/404.html
  {
    let z404 = template
      .replace(/<html lang="[^"]*">/, `<html lang="${ZH.htmlLang}">`)
      .replace(/<title>[^<]*<\/title>/, `<title>页面未找到 — ${SITE_NAME}</title>`)
      .replace(/<link rel="canonical"[^>]*>/g, '')
      .replace(/<link rel="alternate" hreflang="en"[^>]*>/g, `<link rel="alternate" hreflang="en" href="${SITE}/" />`)
      .replace(/<link rel="alternate" hreflang="zh(?:-Hans|-CN)?"[^>]*>/g, '')
      .replace(/<link rel="alternate" hreflang="x-default"[^>]*>/g, `<link rel="alternate" hreflang="x-default" href="${SITE}/" />`)
      .replace('</head>', `    <meta name="description" content="您访问的页面不存在。返回 ${SITE_NAME} 首页继续使用免费在线工具。" />\n    <meta name="robots" content="noindex, follow" />\n  </head>`)
    fs.writeFileSync(path.join(distDir, 'zh', '404.html'), z404, 'utf-8')
    console.log('✅ Generated: dist/zh/404.html')
  }

  count += zhPageCount + zhCatCount + zhStaticCount
  console.log(`🈶 中文预渲染完成：首页 + ${toolSlugs.length} 工具 + ${zhCatCount} 分类 + ${zhStaticCount} 信息页 + SPA壳 + 404`)
}

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
// 有中文版的 slug（来自 DB content_zh 非空）→ 额外加 /zh/blog/ 条目
const zhSlugSet = new Set(
  blogArticles.filter(a => a.contentZh && String(a.contentZh).trim()).map(a => a.slug),
)
let zhUrlCount = 0
for (const s of allBlogSlugsInOrder) {
  const pub = articlePubMap[s] || TOOL_LASTMOD
  // 取「发布日」与「内容修订日」中较晚者(ISO 日期可直接字符串比较)
  const lastmod = pub > BLOG_CONTENT_REV ? pub : BLOG_CONTENT_REV
  blogUrlLines.push(`  <url><loc>${SITE}/blog/${s}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`)
  if (zhSlugSet.has(s)) {
    blogUrlLines.push(`  <url><loc>${SITE}/zh/blog/${s}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`)
    zhUrlCount++
  }
}

// ── 中文 /zh 页面的 sitemap 条目（home/static/category/tool）──────────────────
// 与每页 HTML <head> 里的 hreflang 簇配合，建立 en↔zh 双语关系并保证被抓取。
const zhSeoUrlLines = [
  `  <url><loc>${SITE}/zh</loc><lastmod>${TOOL_LASTMOD}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>`,
  `  <url><loc>${SITE}/zh/about</loc><lastmod>${TOOL_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.4</priority></url>`,
  `  <url><loc>${SITE}/zh/contact</loc><lastmod>${TOOL_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.4</priority></url>`,
  `  <url><loc>${SITE}/zh/privacy</loc><lastmod>${TOOL_LASTMOD}</lastmod><changefreq>yearly</changefreq><priority>0.2</priority></url>`,
  `  <url><loc>${SITE}/zh/terms</loc><lastmod>${TOOL_LASTMOD}</lastmod><changefreq>yearly</changefreq><priority>0.2</priority></url>`,
  ...categoryHubSlugs.map(s => `  <url><loc>${SITE}/zh/c/${s}</loc><lastmod>${TOOL_LASTMOD}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`),
]
for (const [, slugs] of Object.entries(toolCategories)) {
  for (const s of slugs) {
    zhSeoUrlLines.push(`  <url><loc>${SITE}/zh/${s}</loc><lastmod>${TOOL_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`)
  }
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
${zhSlugSet.size ? `  <url>
    <loc>${SITE}/zh/blog</loc>
    <lastmod>${TOOL_LASTMOD}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
` : ''}
  <!-- Static pages -->
  <url><loc>${SITE}/about</loc><lastmod>${TOOL_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>${SITE}/contact</loc><lastmod>${TOOL_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>${SITE}/privacy</loc><lastmod>${TOOL_LASTMOD}</lastmod><changefreq>yearly</changefreq><priority>0.3</priority></url>
  <url><loc>${SITE}/terms</loc><lastmod>${TOOL_LASTMOD}</lastmod><changefreq>yearly</changefreq><priority>0.3</priority></url>

  <!-- Category Hubs -->
${categoryHubSlugs.map(s => `  <url><loc>${SITE}/c/${s}</loc><lastmod>${TOOL_LASTMOD}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`).join('\n')}

${toolUrlLines.join('\n')}
  <!-- Blog Articles -->
${blogUrlLines.join('\n')}

  <!-- Chinese /zh pages -->
${zhSeoUrlLines.join('\n')}
</urlset>`

fs.writeFileSync(path.join(distDir, 'sitemap.xml'), newSitemapXml, 'utf-8')
console.log(`✅ Generated: dist/sitemap.xml (${allBlogSlugsInOrder.length} 篇英文博客 + ${zhUrlCount} 篇中文博客 + ${toolSlugs.length} 个工具 + ${categoryHubSlugs.length} 个分类)`)

console.log(`\n🎉 预渲染完成：生成了 ${count} 个静态 HTML 文件`)
console.log(`   - ${staticRoutes.length} 个静态页面（首页、博客列表）`)
console.log(`   - ${toolSlugs.length} 个工具页面`)
console.log(`   - ${blogArticles.length} 个博客文章页面`)
console.log(`   - 1 个 404 页面`)
