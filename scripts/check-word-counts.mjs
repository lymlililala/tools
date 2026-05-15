import { readFileSync } from 'fs';

const content = readFileSync('src/pages/articles/articles.data.ts', 'utf-8');

// Extract all articles with their slugs and content
const articlePattern = /slug:\s*'([^']+)'[\s\S]*?content:\s*`([\s\S]*?)`(?:\s*,?\s*\})/g;

const articles = [];
let match;
while ((match = articlePattern.exec(content)) !== null) {
  const slug = match[1];
  const articleContent = match[2];
  const wordCount = articleContent.split(/\s+/).filter(w => w.length > 0).length;
  articles.push({ slug, wordCount });
}

console.log(`Total articles found: ${articles.length}`);
console.log('');

const under500 = articles.filter(a => a.wordCount < 500);
const under300 = articles.filter(a => a.wordCount < 300);
const over800 = articles.filter(a => a.wordCount >= 800);

console.log(`Articles >= 800 words: ${over800.length}`);
console.log(`Articles 500-799 words: ${articles.filter(a => a.wordCount >= 500 && a.wordCount < 800).length}`);
console.log(`Articles < 500 words: ${under500.length}`);
console.log(`Articles < 300 words: ${under300.length}`);
console.log('');
console.log('=== Articles under 500 words (sorted by word count) ===');
under500.sort((a, b) => a.wordCount - b.wordCount).forEach(a => {
  console.log(`  ${a.wordCount.toString().padStart(4)} words: ${a.slug}`);
});
