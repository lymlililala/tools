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

  // Find the end of the content (next backtick at start of line followed by comma)
  const contentBodyStart = contentStart + 10  // length of 'content: `'
  const contentEnd = content.indexOf('`,', contentBodyStart)

  const articleContent = content.substring(contentBodyStart, contentEnd)
  const words = articleContent.split(/\s+/).filter(w => w.length > 0).length

  if (words < 500) {
    console.log(`⚠️  ${slug}: ~${words} words (TOO SHORT)`)
    allOk = false
  } else {
    console.log(`✅ ${slug}: ~${words} words`)
  }
}

console.log(allOk ? '\nAll articles OK!' : '\nSome articles need attention.')
