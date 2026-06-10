/**
 * sync-articles-to-supabase.mjs
 * 把 articles.data.ts 中的 500 篇文章全量 upsert 到 Supabase
 *
 * 使用方式：
 *   SUPABASE_SECRET_KEY=<your-secret-key> node scripts/sync-articles-to-supabase.mjs
 *   （或将 SUPABASE_SECRET_KEY 写入根目录 .env，已被 .gitignore 屏蔽）
 *
 * secret key 在 Supabase Dashboard → Project Settings → API Keys → Secret keys
 */

import { supabase } from './supabase-admin.mjs'
import { createRequire } from 'module'
import { register } from 'node:module'
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '..')

// ─── 读取文章数据（通过 esbuild 临时编译 TS）──────────────────────────────────
async function loadArticles() {
  console.log('📖 正在读取 articles.data.ts ...')

  // 用 esbuild 把 TS 编译为临时 ESM（需要 esbuild 为直接依赖：pnpm add -D esbuild）
  const { build } = await import('esbuild')
  const distDir = path.join(rootDir, 'dist')
  fs.mkdirSync(distDir, { recursive: true })
  const tmpFile = path.join(distDir, '_articles_tmp.mjs')

  await build({
    entryPoints: [path.join(rootDir, 'src/pages/articles/articles.data.ts')],
    bundle: false,
    format: 'esm',
    platform: 'node',
    outfile: tmpFile,
    logLevel: 'silent',
  })

  const mod = await import(pathToFileURL(tmpFile).href + '?t=' + Date.now())
  fs.unlinkSync(tmpFile)

  return mod.articles
}

// ─── 批量 upsert ───────────────────────────────────────────────────────────────
async function upsertBatch(articles, batchSize = 50) {
  const total = articles.length
  let success = 0
  let failed = 0

  for (let i = 0; i < total; i += batchSize) {
    const batch = articles.slice(i, i + batchSize)
    const rows = batch.map(a => ({
      slug: a.slug,
      tool_path: a.toolPath,
      title: a.title,
      description: a.description,
      keywords: a.keywords,
      category: a.category,
      published_at: a.publishedAt,
      content: a.content,
    }))

    const { error } = await supabase
      .from('tools_articles')
      .upsert(rows, { onConflict: 'slug' })

    if (error) {
      console.error(`  ❌ 批次 ${i / batchSize + 1} 失败: ${error.message}`)
      failed += batch.length
    }
    else {
      success += batch.length
      const pct = Math.round((success / total) * 100)
      process.stdout.write(`\r  ✅ ${success}/${total} (${pct}%)`)
    }
  }

  console.log('')
  return { success, failed }
}

// 一篇文章是否字段完整(可安全 upsert)。源文件里有 ~280 篇纯博客指南字段残缺
// (缺 toolPath/keywords 等),其完整数据由数据库维护,这类文章应跳过、不可用残缺源覆盖。
const REQUIRED = ['toolPath', 'title', 'description', 'keywords', 'category', 'publishedAt', 'content']
const isComplete = a => REQUIRED.every(k => a[k] != null)

// ─── 主流程 ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 开始同步文章到 Supabase...\n')

  // 1. 加载文章
  let articles = await loadArticles()
  console.log(`✅ 读取到 ${articles.length} 篇文章`)

  // 可选：只同步指定 slug（设置 ONLY_SLUG 环境变量），用于精准补单篇、零覆盖其余
  const onlySlug = process.env.ONLY_SLUG
  if (onlySlug) {
    articles = articles.filter(a => a.slug === onlySlug)
    console.log(`🔎 ONLY_SLUG=${onlySlug} → 仅同步 ${articles.length} 篇`)
    if (articles.length === 0) {
      console.error(`❌ 在 articles.data.ts 中找不到 slug=${onlySlug}`)
      process.exit(1)
    }
  }
  console.log('')

  // 2. 查询当前数据库数量
  const { count: beforeCount } = await supabase
    .from('tools_articles')
    .select('*', { count: 'exact', head: true })
  console.log(`📊 同步前数据库中有 ${beforeCount ?? '未知'} 篇文章\n`)

  // 3. 跳过源数据不完整(由 DB 维护)的纯博客文章,只 upsert 字段完整的
  const complete = articles.filter(isComplete)
  const skipped = articles.length - complete.length
  if (skipped)
    console.log(`⏭️  跳过 ${skipped} 篇源数据不完整(缺 toolPath/keywords 等、由 DB 维护)的文章\n`)

  // 4. upsert
  console.log(`📤 开始上传 ${complete.length} 篇（每批50条）...`)
  const { success, failed } = await upsertBatch(complete)

  // 4. 验证
  const { count: afterCount } = await supabase
    .from('tools_articles')
    .select('*', { count: 'exact', head: true })

  console.log(`
╔══════════════════════════════════════╗
║          同步完成！                  ║
╠══════════════════════════════════════╣
║  上传成功：${String(success).padEnd(26)}║
║  上传失败：${String(failed).padEnd(26)}║
║  数据库总数：${String(afterCount ?? '?').padEnd(24)}║
╚══════════════════════════════════════╝
`)

  if (failed > 0)
    process.exit(1)
}

main().catch((e) => {
  console.error('❌ 同步失败:', e)
  process.exit(1)
})
