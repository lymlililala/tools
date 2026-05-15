#!/usr/bin/env node
/**
 * sync-articles-content.mjs
 * Reads the full article content from articles.data.ts and uploads to Supabase.
 *
 * Unlike seed-articles.mjs which has hardcoded content, this script
 * dynamically imports the updated content from the TS source file (compiled).
 *
 * Run: node scripts/sync-articles-content.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// ─── Supabase config ──────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://tixgzezefjjsyuzgdhcd.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpeGd6ZXplZmpqc3l1emdkaGNkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE0OTM3OCwiZXhwIjoyMDkzNzI1Mzc4fQ.CBarLrHnr-tr5ZPaGs2JvW3NJE6O5O1Hw7oTWsHuI-E'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// ─── Parse articles.data.ts to extract content ────────────────────────────────
// We use a regex to extract each article's slug + content
// This avoids needing to compile TypeScript

function extractArticles(tsSource) {
  const articles = []
  
  // Pattern: find each article object and extract slug + content
  // Articles look like: { slug: 'xxx', ..., content: `...` }
  const slugPattern = /slug:\s*'([^']+)'/g
  const slugMatches = [...tsSource.matchAll(slugPattern)]
  
  console.log(`📚 Found ${slugMatches.length} articles in articles.data.ts`)
  
  for (const slugMatch of slugMatches) {
    // Skip the type definition line
    if (slugMatch[1] === 'string') continue
    
    const slug = slugMatch[1]
    const slugPos = slugMatch.index
    
    // Find the content field after this slug
    // Search for: content: `...`
    const afterSlug = tsSource.slice(slugPos)
    
    // Match content field - uses template literal (backtick)
    const contentMatch = afterSlug.match(/content:\s*`([\s\S]*?)`\s*,?\s*\}/)
    if (contentMatch) {
      // Unescape the content (reverse of escapeForTS)
      let content = contentMatch[1]
        .replace(/\\`/g, '`')           // Unescape backticks
        .replace(/\\\${/g, '${')        // Unescape template expressions
        .replace(/\\\\/g, '\\')         // Unescape backslashes
      
      articles.push({ slug, content })
    } else {
      console.warn(`⚠️  Could not extract content for: ${slug}`)
    }
  }
  
  return articles
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Syncing article content to Supabase...\n')
  
  // Read and parse articles.data.ts
  const tsFile = path.join(ROOT, 'src/pages/articles/articles.data.ts')
  const tsSource = readFileSync(tsFile, 'utf-8')
  const extracted = extractArticles(tsSource)
  
  console.log(`✅ Extracted ${extracted.length} articles with content\n`)
  
  if (extracted.length === 0) {
    console.error('❌ No articles extracted. Check the parsing logic.')
    process.exit(1)
  }
  
  // Check table exists
  const { error: checkError } = await supabase.from('tools_articles').select('id').limit(1)
  if (checkError) {
    console.error('❌ tools_articles table not found. Run seed-articles.mjs first.')
    process.exit(1)
  }
  
  // Update content for each article
  let successCount = 0
  let notFoundCount = 0
  let errorCount = 0
  
  // Process in batches to be respectful to Supabase
  const BATCH_SIZE = 10
  
  for (let i = 0; i < extracted.length; i += BATCH_SIZE) {
    const batch = extracted.slice(i, i + BATCH_SIZE)
    
    await Promise.all(batch.map(async ({ slug, content }) => {
      const { error } = await supabase
        .from('tools_articles')
        .update({
          content,
          updated_at: new Date().toISOString()
        })
        .eq('slug', slug)
      
      if (error) {
        console.error(`  ❌ Error updating ${slug}: ${error.message}`)
        errorCount++
      } else {
        console.log(`  ✅ Updated: ${slug}`)
        successCount++
      }
    }))
  }
  
  console.log(`\n🎉 Done!`)
  console.log(`  ✅ Updated: ${successCount}`)
  console.log(`  ❌ Errors:  ${errorCount}`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
