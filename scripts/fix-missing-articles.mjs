/**
 * Fix missing articles: upsert articles that are in articles.data.ts but not in DB.
 * These are the 14 slugs that differ between seed-articles.mjs and articles.data.ts.
 * 
 * Run: node scripts/fix-missing-articles.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const supabase = createClient(
  'https://tixgzezefjjsyuzgdhcd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpeGd6ZXplZmpqc3l1emdkaGNkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE0OTM3OCwiZXhwIjoyMDkzNzI1Mzc4fQ.CBarLrHnr-tr5ZPaGs2JvW3NJE6O5O1Hw7oTWsHuI-E'
)

// The 14 missing articles with their correct metadata from seed-articles.mjs
// These slugs exist in articles.data.ts but not in Supabase
const MISSING_META = {
  'uuid-vs-ulid-which-to-use': {
    tool_path: '/uuid-generator',
    title: 'UUID vs ULID: Which Unique ID Should You Use?',
    description: 'Compare UUID and ULID for unique identifier generation. Learn when to use each and how they differ in sortability and database performance.',
    keywords: ['UUID generator', 'ULID generator', 'unique ID', 'UUID vs ULID', 'sortable ID'],
    category: 'Crypto',
    published_at: '2025-06-04',
  },
  'jwt-parser-explained': {
    tool_path: '/jwt-parser',
    title: 'JWT Explained: How to Read and Validate JSON Web Tokens',
    description: 'Decode and inspect any JWT token. Learn about header, payload, signature, expiry, and common security mistakes.',
    keywords: ['JWT parser', 'decode JWT', 'JSON web token', 'JWT security', 'JWT expiry'],
    category: 'Crypto',
    published_at: '2025-06-05',
  },
  'base64-encoding-explained': {
    tool_path: '/base64-string-converter',
    title: 'Base64 Encoding Explained: What It Is and When to Use It',
    description: 'Learn what Base64 encoding is, how it works, and common use cases in web development.',
    keywords: ['base64 encode', 'base64 decode', 'base64 online', 'base64 string converter', 'encoding'],
    category: 'Converter',
    published_at: '2025-06-15',
  },
  'json-to-yaml-complete-guide': {
    tool_path: '/json-to-yaml-converter',
    title: 'JSON to YAML Converter: When and Why to Use YAML',
    description: 'Convert JSON to YAML and understand the differences. Learn when YAML is better than JSON for configuration files.',
    keywords: ['JSON to YAML', 'convert JSON YAML', 'YAML vs JSON', 'YAML formatter', 'JSON converter'],
    category: 'Converter',
    published_at: '2025-06-16',
  },
  'color-converter-hex-rgb-hsl': {
    tool_path: '/color-converter',
    title: 'Color Formats Explained: HEX, RGB, HSL, and How to Convert Between Them',
    description: 'Learn about web color formats: HEX, RGB, RGBA, HSL, HSLA. Convert between them instantly.',
    keywords: ['color converter', 'hex to rgb', 'rgb to hsl', 'color formats', 'CSS colors'],
    category: 'Converter',
    published_at: '2025-06-18',
  },
  'url-encoding-explained': {
    tool_path: '/url-encoder',
    title: 'URL Encoding Explained: Why Special Characters Must Be Escaped',
    description: 'Learn why URLs need encoding, what percent-encoding is, and how to encode/decode URLs correctly.',
    keywords: ['URL encoding', 'percent encoding', 'URL encode decode', 'encodeURIComponent', 'URL special characters'],
    category: 'Web',
    published_at: '2025-06-28',
  },
  'http-status-codes-complete-guide': {
    tool_path: '/http-status-codes',
    title: 'HTTP Status Codes: The Complete Developer Reference',
    description: 'A comprehensive guide to all HTTP status codes: 1xx, 2xx, 3xx, 4xx, 5xx with real-world examples.',
    keywords: ['HTTP status codes', '404 not found', '500 server error', 'HTTP 301 redirect', 'status code reference'],
    category: 'Web',
    published_at: '2025-06-29',
  },
  'json-prettify-and-validate': {
    tool_path: '/json-prettify',
    title: "How to Format and Validate JSON: A Developer's Guide",
    description: 'Learn to format, validate, and debug JSON. Understand common JSON errors and best practices.',
    keywords: ['JSON formatter', 'JSON validator', 'format JSON online', 'JSON pretty print', 'JSON syntax error'],
    category: 'Development',
    published_at: '2025-07-08',
  },
  'docker-compose-from-run-command': {
    tool_path: '/docker-run-to-docker-compose-converter',
    title: 'Convert docker run to docker-compose: A Practical Guide',
    description: 'Convert docker run commands to docker-compose.yml. Understand volumes, ports, environment variables.',
    keywords: ['docker run to compose', 'docker-compose converter', 'docker compose yml', 'docker migration'],
    category: 'Development',
    published_at: '2025-07-10',
  },
  'sql-prettify-guide': {
    tool_path: '/sql-prettify',
    title: 'How to Format SQL Queries for Better Readability',
    description: 'Learn SQL formatting best practices and use our formatter to clean up messy queries.',
    keywords: ['SQL formatter', 'SQL prettify', 'format SQL online', 'SQL beautifier'],
    category: 'Development',
    published_at: '2025-07-11',
  },
  'git-memo-common-commands': {
    tool_path: '/git-memo',
    title: 'Git Command Cheat Sheet: The Most Useful Commands Explained',
    description: 'A comprehensive Git reference covering everyday commands, branching, undo operations, and advanced workflows.',
    keywords: ['git cheat sheet', 'git commands', 'git memo', 'git reference', 'git workflow'],
    category: 'Development',
    published_at: '2025-07-12',
  },
  'mortgage-calculator-guide': {
    tool_path: '/mortgage-calculator',
    title: 'Mortgage Calculator: How Monthly Payments Are Calculated',
    description: 'Understand mortgage calculations, amortization schedules, and how interest rates affect your total payment.',
    keywords: ['mortgage calculator', 'monthly mortgage payment', 'home loan calculator', 'amortization', 'mortgage interest'],
    category: 'Math',
    published_at: '2025-07-27',
  },
  'color-palette-generator-guide': {
    tool_path: '/color-palette-generator',
    title: 'Color Palette Generator: Create Beautiful Color Schemes',
    description: 'Generate harmonious color palettes for your designs. Learn color theory, complementary colors, and accessibility.',
    keywords: ['color palette generator', 'color scheme', 'complementary colors', 'color theory', 'design colors'],
    category: 'Images and videos',
    published_at: '2025-08-12',
  },
  'random-decision-picker-guide': {
    tool_path: '/random-decision-picker',
    title: 'Random Decision Picker: When in Doubt, Let Randomness Decide',
    description: 'Use randomness to make unbiased decisions. Learn about random selection algorithms and fair choice tools.',
    keywords: ['random decision picker', 'random picker', 'random choice', 'decision maker', 'random selector'],
    category: 'Text',
    published_at: '2025-09-01',
  },
}

// Parse content from articles.data.ts
function extractContentForSlug(tsSource, targetSlug) {
  const slugPattern = new RegExp(`slug:\\s*'${targetSlug}'`)
  const slugMatch = slugPattern.exec(tsSource)
  if (!slugMatch) return null
  
  const afterSlug = tsSource.slice(slugMatch.index)
  const contentMatch = afterSlug.match(/content:\s*`([\s\S]*?)`\s*,?\s*\}/)
  if (!contentMatch) return null
  
  return contentMatch[1]
    .replace(/\\`/g, '`')
    .replace(/\\\${/g, '${')
    .replace(/\\\\/g, '\\')
}

// Read articles.data.ts
const tsSource = readFileSync(path.join(ROOT, 'src/pages/articles/articles.data.ts'), 'utf-8')

console.log('🔧 Fixing missing articles...\n')

let success = 0
let errors = 0

for (const [slug, meta] of Object.entries(MISSING_META)) {
  const content = extractContentForSlug(tsSource, slug)
  if (!content) {
    console.warn(`⚠️  Could not extract content for: ${slug}`)
    errors++
    continue
  }
  
  const row = {
    slug,
    tool_path: meta.tool_path,
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    category: meta.category,
    published_at: meta.published_at,
    content,
    updated_at: new Date().toISOString(),
  }
  
  const { error } = await supabase
    .from('tools_articles')
    .upsert(row, { onConflict: 'slug' })
  
  if (error) {
    console.error(`❌ Error upserting ${slug}: ${error.message}`)
    errors++
  } else {
    const words = content.split(/\s+/).length
    console.log(`✅ Upserted: ${slug} (${words} words)`)
    success++
  }
}

console.log(`\n🎉 Done! ${success} upserted, ${errors} errors.`)
