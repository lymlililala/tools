// 1b) 工具线采集：按站内工具关键词在全网搜文章（cimidata searchArticles），
//     写入 tools_wx_sources（与 1-crawl 同一张表、按 sn 去重、跨运行增量）。
//     博客线用 1-crawl（按账号采新闻流）；工具科普线用本脚本（按工具主题采常青料）。
// 用法：
//   node scripts/wechat/1-search.mjs                       # 全部工具关键词，各 1 页
//   node scripts/wechat/1-search.mjs --queries 40 --pages 1
//   node scripts/wechat/1-search.mjs --since 2025-01-01    # 只要该日期后的文章
//   node scripts/wechat/1-search.mjs --no-body             # 只列表不拉正文（试跑）

import { CimiClient } from './cimidata/client.mjs'
import { htmlToText } from './lib/clean-html.mjs'
import { existingSns, upsertSources } from './lib/sources.mjs'
import { loadToolCatalog } from './lib/tools.mjs'

function arg(name, def) {
  const i = process.argv.indexOf(name)
  if (i === -1) return def
  const v = process.argv[i + 1]
  return v && !v.startsWith('--') ? v : true
}
const PAGES = Number(arg('--pages', 1))       // 每个关键词翻几页（每页约 10-20 条，0.05/页）
const QUERIES = Number(arg('--queries', 40))  // 本次最多用几个关键词（控成本）
const NO_BODY = arg('--no-body', false) === true
const TODAY = arg('--today', false) === true
let SINCE = arg('--since', null)
if (TODAY) SINCE = new Date().toISOString().slice(0, 10)

// ── 从工具目录派生「可搜的中文/技术词」查询集 ────────────────────────────────
// 工具 keywords 多为英文/路径 token；技术名词（json/regex/base64/jwt/cron…）在中文科技文里同样可命中。
// 过滤掉过短、过泛、纯符号的词，全局去重，按工具顺序均衡取词，封顶 QUERIES 个。
const STOP = new Set(['tool', 'tools', 'online', 'free', 'text', 'data', 'web', 'app', 'string', 'number', 'code', 'generator', 'converter', 'formatter', '编码', '工具', '在线', '转换'])
function pickTerms(catalog) {
  const seen = new Set()
  const terms = []
  // 每个工具贡献 1-2 个最具辨识度的词（优先长度 3-20、含字母或中文、非停用词）
  for (const t of catalog) {
    let added = 0
    for (const raw of (t.keywords || [])) {
      const kw = String(raw).trim().toLowerCase()
      if (kw.length < 2 || kw.length > 24) continue
      if (STOP.has(kw)) continue
      if (!/[a-z0-9一-龥]/.test(kw)) continue
      if (seen.has(kw)) continue
      seen.add(kw)
      terms.push(kw)
      if (++added >= 2) break
    }
  }
  return terms
}

const catalog = loadToolCatalog()
if (!catalog.length) { console.error('未扫描到站内工具（src/tools/*）'); process.exit(1) }
const allTerms = pickTerms(catalog)
// 均衡抽样：等距取 QUERIES 个，避免只覆盖目录前部
const step = Math.max(1, Math.floor(allTerms.length / QUERIES))
const terms = allTerms.filter((_, i) => i % step === 0).slice(0, QUERIES)

function snOf(url) {
  const m = (url || '').match(/[?&]sn=([0-9a-f]+)/i)
  return m ? m[1] : url
}
// 搜索结果的 title/digest 常含 <em> 高亮标签，去标签 + 反转义
const strip = s => String(s || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim()

const seen = await existingSns()
console.log(`库中已有 ${seen.size} 篇。工具关键词搜文：${terms.length}/${allTerms.length} 个词，各 ${PAGES} 页${SINCE ? `，仅 ${SINCE} 之后` : ''}${NO_BODY ? '，跳过正文' : ''}`)
console.log('关键词:', terms.join(', '), '\n')

const cimi = new CimiClient()
const sinceTs = SINCE ? new Date(SINCE).getTime() : null
const fresh = new Map() // sn -> rec

for (const kw of terms) {
  let got = 0
  try {
    for await (const item of cimi.iterSearchArticles(kw, { maxPages: PAGES })) {
      const sn = snOf(item.content_url)
      if (!sn || seen.has(sn) || fresh.has(sn)) continue
      if (sinceTs && item.published_at && new Date(item.published_at).getTime() < sinceTs) continue
      fresh.set(sn, {
        sn,
        account: item.nickname || item.account || '',
        wxid: item.wxid || '',
        title: strip(item.title || ''),
        digest: strip(item.digest || ''),
        content_url: item.content_url,
        published_at: item.published_at || null,
        body_text: '',
      })
      got++
    }
    console.log(`  「${kw}」: 新增 ${got} 篇`)
  } catch (e) {
    console.log(`  「${kw}」: 搜索出错 ${e.message}`)
  }
}

const recs = [...fresh.values()]
let bodyCount = 0

if (!NO_BODY) {
  console.log(`\n拉取正文 ${recs.length} 篇 …`)
  for (const s of recs) {
    try {
      const html = await cimi.articleBody(s.content_url)
      s.body_text = htmlToText(html)
      bodyCount++
    } catch (e) {
      console.log(`  正文失败 [${s.account}] ${s.title?.slice(0, 20)}: ${e.message}`)
    }
    if (bodyCount % 20 === 0 && bodyCount) {
      await upsertSources(recs.filter(r => r.body_text))
      console.log(`  …${bodyCount}/${recs.length}  余额 ${cimi.balance}`)
    }
  }
}

const toWrite = NO_BODY ? recs : recs.filter(r => r.body_text)
const written = await upsertSources(toWrite)
console.log(`\n写入 tools_wx_sources：${written} 篇（本次新发现 ${recs.length}，拉正文 ${bodyCount}），余额 ${cimi.balance}`)
console.log('下一步：node scripts/wechat/2-cluster.mjs --mode tool')
