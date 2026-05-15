/**
 * Audit articles: compare articles.data.ts slugs vs Supabase
 * Run: node scripts/audit-articles.mjs
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

// Get all slugs from Supabase
const { data: dbRows } = await supabase.from('tools_articles').select('slug, content')
const dbSlugs = new Set(dbRows.map(r => r.slug))

// Get all slugs from articles.data.ts
const tsSource = readFileSync(path.join(ROOT, 'src/pages/articles/articles.data.ts'), 'utf-8')
const slugPattern = /slug:\s*'([^']+)'/g
const tsSlugs = [...tsSource.matchAll(slugPattern)]
  .map(m => m[1])
  .filter(s => s !== 'string')

console.log(`\n📊 Database: ${dbSlugs.size} articles`)
console.log(`📄 Source:   ${tsSlugs.length} articles`)

// Find which TS slugs are NOT in DB
const missingFromDB = tsSlugs.filter(s => !dbSlugs.has(s))
console.log(`\n❌ In source but NOT in DB (${missingFromDB.length}):`)
missingFromDB.forEach(s => console.log(`  - ${s}`))

// Find which DB slugs have short content (< 500 words)
const shortArticles = dbRows.filter(r => r.content.split(/\s+/).length < 500)
console.log(`\n⚠️  Articles with < 500 words (${shortArticles.length}):`)
shortArticles
  .sort((a, b) => a.content.split(/\s+/).length - b.content.split(/\s+/).length)
  .forEach(r => {
    const words = r.content.split(/\s+/).length
    console.log(`  ${words.toString().padStart(4)} words  ${r.slug}`)
  })

// Summary stats
const wordCounts = dbRows.map(r => r.content.split(/\s+/).length)
const avg = Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length)
const min = Math.min(...wordCounts)
const max = Math.max(...wordCounts)
console.log(`\n📈 Content stats:`)
console.log(`  Average: ${avg} words`)
console.log(`  Min:     ${min} words`)
console.log(`  Max:     ${max} words`)
console.log(`  Over 500 words: ${wordCounts.filter(w => w >= 500).length}/${dbRows.length}`)
