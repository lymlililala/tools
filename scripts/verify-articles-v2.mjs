import { readFileSync } from 'fs'

const content = readFileSync('src/pages/articles/articles.data.ts', 'utf8')

const slugs = [
  'url-encoding-explained',
  'http-status-codes-complete-guide',
  'crontab-generator-guide',
  'regex-tester-guide',
  'jwt-parser-web-guide',
  'url-parser-guide',
  'meta-tag-generator-guide',
  'device-information-guide',
  'mime-types-guide',
  'user-agent-parser-guide',
  'keycode-info-guide',
  'slugify-string-guide',
  'html-entities-guide',
  'basic-auth-generator-guide',
  'safelink-decoder-guide',
  'html-wysiwyg-editor-guide',
]

let allOk = true
for (const slug of slugs) {
  // Find the position of this slug
  const slugPos = content.indexOf(`slug: '${slug}'`)
  if (slugPos === -1) {
    console.log(`❌ ${slug}: NOT FOUND`)
    allOk = false
    continue
  }

  // Find the content field after this slug
  const contentStart = content.indexOf('content: `', slugPos)
  if (contentStart === -1) {
    console.log(`❌ ${slug}: content field not found`)
    allOk = false
    continue
  }

  // Find the next slug position to bound our search
  const nextSlugPos = content.indexOf(`slug: '`, slugPos + 10)
  
  // Find the end of the content (backtick followed by comma/newline within this article's bounds)
  const contentBodyStart = contentStart + 10  // length of 'content: `'
  
  // Search for end pattern `,\n  }` or ``,` which ends the template literal
  // The content ends with backtick-comma: `,`
  let endPos = -1
  let pos = contentBodyStart
  while (pos < (nextSlugPos > 0 ? nextSlugPos : content.length)) {
    // Look for backtick followed by comma (end of template literal)
    if (content[pos] === '`' && content[pos + 1] === ',') {
      endPos = pos
      break
    }
    pos++
  }
  
  if (endPos === -1) {
    console.log(`❌ ${slug}: could not find content end`)
    allOk = false
    continue
  }

  const articleContent = content.substring(contentBodyStart, endPos)
  const words = articleContent.split(/\s+/).filter(w => w.length > 0).length
  const hasCTA = articleContent.includes('→ Try the')

  if (words < 600) {
    console.log(`⚠️  ${slug}: ~${words} words (TOO SHORT) CTA:${hasCTA}`)
    allOk = false
  } else {
    console.log(`✅ ${slug}: ~${words} words CTA:${hasCTA}`)
  }
}

console.log(allOk ? '\nAll articles OK!' : '\nSome articles need attention.')
