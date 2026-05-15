/**
 * Check all DB articles - show those with short content
 */
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://tixgzezefjjsyuzgdhcd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpeGd6ZXplZmpqc3l1emdkaGNkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE0OTM3OCwiZXhwIjoyMDkzNzI1Mzc4fQ.CBarLrHnr-tr5ZPaGs2JvW3NJE6O5O1Hw7oTWsHuI-E'
)

const { data, error } = await supabase
  .from('tools_articles')
  .select('slug, content')
  .order('slug')

if (error) {
  console.error('Error:', error)
  process.exit(1)
}

console.log(`Total articles: ${data.length}\n`)

const wordCounts = data.map(r => ({ slug: r.slug, words: r.content.split(/\s+/).filter(w => w).length }))
wordCounts.sort((a, b) => a.words - b.words)

console.log('Sorted by word count (lowest first):')
wordCounts.forEach(({ slug, words }) => {
  const flag = words < 300 ? ' ❌' : words < 500 ? ' ⚠️' : ' ✅'
  console.log(`  ${String(words).padStart(4)} words  ${slug}${flag}`)
})

const short = wordCounts.filter(r => r.words < 300)
console.log(`\n❌ Articles with < 300 words: ${short.length}`)
const medium = wordCounts.filter(r => r.words >= 300 && r.words < 500)
console.log(`⚠️  Articles with 300-499 words: ${medium.length}`)
const good = wordCounts.filter(r => r.words >= 500)
console.log(`✅ Articles with >= 500 words: ${good.length}`)
