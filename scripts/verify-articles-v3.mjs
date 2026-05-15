import { readFileSync } from 'fs'

const content = readFileSync('src/pages/articles/articles.data.ts', 'utf8')
const lines = content.split('\n')

const slugs = [
  { slug: 'url-encoding-explained', cta: 'URL Encoder/Decoder' },
  { slug: 'http-status-codes-complete-guide', cta: 'HTTP Status Codes Reference' },
  { slug: 'crontab-generator-guide', cta: 'Crontab Generator' },
  { slug: 'regex-tester-guide', cta: 'Regex Tester' },
  { slug: 'jwt-parser-web-guide', cta: 'JWT Parser' },
  { slug: 'url-parser-guide', cta: 'URL Parser' },
  { slug: 'meta-tag-generator-guide', cta: 'Meta Tag Generator' },
  { slug: 'device-information-guide', cta: 'Device Information Tool' },
  { slug: 'mime-types-guide', cta: 'MIME Types Reference' },
  { slug: 'user-agent-parser-guide', cta: 'User Agent Parser' },
  { slug: 'keycode-info-guide', cta: 'Keycode Info Tool' },
  { slug: 'slugify-string-guide', cta: 'Slugify String Tool' },
  { slug: 'html-entities-guide', cta: 'HTML Entities Tool' },
  { slug: 'basic-auth-generator-guide', cta: 'Basic Auth Generator' },
  { slug: 'safelink-decoder-guide', cta: 'Safelink Decoder' },
  { slug: 'html-wysiwyg-editor-guide', cta: 'HTML WYSIWYG Editor' },
]

let allOk = true
for (const { slug, cta } of slugs) {
  // Find the slug line number
  const slugLineIdx = lines.findIndex(l => l.includes(`slug: '${slug}'`))
  if (slugLineIdx === -1) {
    console.log(`❌ ${slug}: NOT FOUND`)
    allOk = false
    continue
  }

  // Find next slug line to bound our search
  const nextSlugLineIdx = lines.findIndex((l, i) => i > slugLineIdx && l.includes(`slug: '`))
  const endLineIdx = nextSlugLineIdx > 0 ? nextSlugLineIdx : lines.length

  // Get the article text
  const articleLines = lines.slice(slugLineIdx, endLineIdx)
  const articleText = articleLines.join('\n')
  
  // Check for CTA
  const hasCTA = articleText.includes(`→ Try the [${cta}]`)
  
  // Count words (rough estimate)
  const contentStart = articleText.indexOf('content: `')
  if (contentStart === -1) {
    console.log(`❌ ${slug}: no content field`)
    allOk = false
    continue
  }
  
  // Count words from content start to end
  const contentText = articleText.substring(contentStart)
  const words = contentText.split(/\s+/).filter(w => w.length > 0).length

  if (!hasCTA) {
    console.log(`❌ ${slug}: ~${words} words — MISSING CTA "${cta}"`)
    allOk = false
  } else if (words < 600) {
    console.log(`⚠️  ${slug}: ~${words} words — CTA OK but SHORT`)
    allOk = false
  } else {
    console.log(`✅ ${slug}: ~${words} words — CTA OK`)
  }
}

console.log(allOk ? '\n✅ All articles look good!' : '\n⚠️  Some articles need attention.')
