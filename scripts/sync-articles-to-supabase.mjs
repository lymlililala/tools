/**
 * sync-articles-to-supabase.mjs
 * 把 articles.data.ts 中的 500 篇文章全量 upsert 到 Supabase
 *
 * 使用方式：
 *   SUPABASE_SERVICE_KEY=<your-service-role-key> node scripts/sync-articles-to-supabase.mjs
 *
 * service_role key 在 Supabase Dashboard → Project Settings → API → service_role (secret)
 */

import { createClient } from '@supabase/supabase-js'
import { createRequire } from 'module'
import { register } from 'node:module'
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '..')

// ─── Supabase 配置 ─────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://tixgzezefjjsyuzgdhcd.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_SERVICE_KEY) {
  console.error(`
❌ 缺少 SUPABASE_SERVICE_KEY 环境变量

请在 Supabase Dashboard 获取 service_role key：
  https://supabase.com/dashboard/project/tixgzezefjjsyuzgdhcd/settings/api

然后执行：
  SUPABASE_SERVICE_KEY=eyJ... node scripts/sync-articles-to-supabase.mjs
`)
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
})

// ─── 读取文章数据（通过 esbuild 临时编译 TS）──────────────────────────────────
async function loadArticles() {
  console.log('📖 正在读取 articles.data.ts ...')

  // 用 esbuild 把 TS 编译为临时 JS
  const { build } = await import('esbuild')
  const tmpFile = path.join(rootDir, 'dist', '_articles_tmp.mjs')

  await build({
    entryPoints: [path.join(rootDir, 'src/pages/articles/articles.data.ts')],
    bundle: false,
    format: 'esm',
    outfile: tmpFile,
    platform: 'node',
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

// ─── 主流程 ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 开始同步文章到 Supabase...\n')

  // 1. 加载文章
  const articles = await loadArticles()
  console.log(`✅ 读取到 ${articles.length} 篇文章\n`)

  // 2. 查询当前数据库数量
  const { count: beforeCount } = await supabase
    .from('tools_articles')
    .select('*', { count: 'exact', head: true })
  console.log(`📊 同步前数据库中有 ${beforeCount ?? '未知'} 篇文章\n`)

  // 3. upsert
  console.log(`📤 开始上传（每批50条）...`)
  const { success, failed } = await upsertBatch(articles)

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
