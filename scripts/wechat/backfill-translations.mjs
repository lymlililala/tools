// 历史回填：给 tools_articles 里尚无中文（content_zh IS NULL）的文章逐篇补中文。
// 复用 DeepSeek（自带限流+重试）+ 与合成同一套翻译规则（translate-prompt.mjs）。
//
// 幂等：只取 content_zh IS NULL 的行 → 中断后重跑自动接续。
// 用法：
//   node scripts/wechat/backfill-translations.mjs --dry-run        # 只打印待译清单与判定，不写库
//   node scripts/wechat/backfill-translations.mjs --limit 20       # 先试跑 20 篇，抽查质量
//   node scripts/wechat/backfill-translations.mjs --only slug1,slug2
//   node scripts/wechat/backfill-translations.mjs                  # 全量（约数小时，可分多次跑）

import { appendFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { DeepSeek } from './deepseek.mjs'
import { checkQualityZh } from './lib/quality.mjs'
import { hasSupabase, getSupabase } from './lib/supabase.mjs'
import { TRANSLATE_SYS, buildTranslateUser, clampDescZh } from './lib/translate-prompt.mjs'
import { DATA_DIR } from './lib/env.mjs'

function arg(name, def) {
  const i = process.argv.indexOf(name)
  if (i === -1) return def
  const v = process.argv[i + 1]
  return v && !v.startsWith('--') ? v : true
}
const DRY = arg('--dry-run', false) === true
const FORCE = arg('--force', false) === true // 跳过中文软闸门强制入库（人工确认后用，配合 --only）
const LIMIT = arg('--limit', null) ? Number(arg('--limit', null)) : null
const ONLY = arg('--only', null) ? String(arg('--only', null)).split(',').map(s => s.trim()).filter(Boolean) : null

if (!hasSupabase()) { console.error('缺少 SUPABASE_SECRET_KEY（本地写项目根 .env / CI 用 Secrets）'); process.exit(1) }
const sb = getSupabase()
const ds = new DeepSeek()
mkdirSync(DATA_DIR, { recursive: true })
const LOG = join(DATA_DIR, 'backfill-zh.log')
function logLine(s) { try { appendFileSync(LOG, s + '\n') } catch {} }

// 拉取待译文章（content_zh IS NULL），分页 1000 条/批。--only 时只取指定 slug。
async function loadPending() {
  const cols = 'slug,title,description,content,keywords'
  if (ONLY) {
    const { data, error } = await sb.from('tools_articles').select(cols).in('slug', ONLY)
    if (error) throw new Error(`读取失败: ${error.message}`)
    return data
  }
  const out = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb.from('tools_articles').select(cols).is('content_zh', null).range(from, from + 999)
    if (error) throw new Error(`读取失败: ${error.message}`)
    out.push(...data)
    if (data.length < 1000) break
  }
  return out
}

let pending = await loadPending()
if (LIMIT) pending = pending.slice(0, LIMIT)
console.log(`待译 ${pending.length} 篇${ONLY ? '（--only 指定）' : '（content_zh IS NULL）'}${LIMIT ? `，本次限 ${LIMIT}` : ''}${DRY ? '  [DRY-RUN]' : ''}\n`)

let ok = 0, held = 0, fail = 0
for (const a of pending) {
  try {
    const zh = await ds.chatJSON(
      [{ role: 'system', content: TRANSLATE_SYS }, { role: 'user', content: buildTranslateUser(a) }],
      { maxTokens: 16000 },
    )
    const draft = {
      title_zh: (zh.title_zh || '').trim() || null,
      description_zh: zh.description_zh ? clampDescZh(zh.description_zh) : null,
      content_zh: (zh.content_zh || '').trim() || null,
      keywords_zh: Array.isArray(zh.keywords_zh) ? zh.keywords_zh : [],
    }
    const q = checkQualityZh(draft)
    if (!q.pass && !FORCE) {
      held++
      console.log(`🟡 暂留 ${a.slug}  ${q.reasons.join(',')}`)
      logLine(`HELD ${a.slug} ${q.reasons.join(',')}`)
      continue
    }
    if (!q.pass && FORCE) console.log(`   ⚠️ --force 跳过软闸门: ${q.reasons.join(',')}`)
    console.log(`🟢 ${DRY ? '可译' : '入库'} ${a.slug}  zh ${draft.content_zh.length} 字符 / ${q.headings} 标题`)
    if (!DRY) {
      const { error } = await sb.from('tools_articles').update({
        title_zh: draft.title_zh,
        description_zh: draft.description_zh,
        content_zh: draft.content_zh,
        keywords_zh: draft.keywords_zh,
        updated_at: new Date().toISOString(),
      }).eq('slug', a.slug)
      if (error) throw new Error(error.message)
      logLine(`OK ${a.slug}`)
    }
    ok++
  } catch (e) {
    fail++
    console.log(`✗ 失败 ${a.slug}: ${e.message}`)
    logLine(`FAIL ${a.slug} ${e.message}`)
  }
}

console.log(`\n${DRY ? '[DRY-RUN] ' : ''}完成：${DRY ? '可译' : '入库'} ${ok}，暂留 ${held}，失败 ${fail}`)
console.log('DeepSeek 用量:', ds.costEstimate())
if (!DRY) console.log(`日志：${LOG}（暂留/失败的可下次重跑，幂等只取 content_zh IS NULL）`)
