/**
 * Check all DB articles - show those with short content
 */
import { supabase } from './supabase-admin.mjs'

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
