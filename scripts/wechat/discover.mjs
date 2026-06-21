// 可选）关键词发现更多「开发者/效率工具」公众号候选 —— 用 cimidata searchAccounts
// 扫主题关键词，汇总去重成候选表，供人工挑选后补进 accounts.mjs 的种子名单。
// 用法：node scripts/wechat/discover.mjs
//       node scripts/wechat/discover.mjs --keywords "命令行,正则,效率神器"
//
// 产物：data/discovered-accounts.json（不自动入 accounts.json，需人工筛）。

import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { CimiClient } from './cimidata/client.mjs'
import { DATA_DIR } from './lib/env.mjs'

function arg(name, def) {
  const i = process.argv.indexOf(name)
  return i === -1 ? def : process.argv[i + 1]
}

// 默认关键词 —— 对准本站 it-tools 的工具品类：转换/编解码/格式化/生成器/
// 命令行/正则/效率软件/开源项目，以及 AI 工具。这些垂类号往往「更新勤、质量高」。
const DEFAULT_KEYWORDS = [
  // 工具 / 软件推荐
  '效率工具', '开发工具', '在线工具', '工具推荐', '软件推荐', '神器', '效率软件',
  // 开源 / GitHub
  '开源项目', 'GitHub', '开源', '开源软件',
  // 开发者综合
  '程序员', '编程', '开发者', '后端', '前端', '全栈', '运维', 'DevOps',
  // 具体技术品类（贴合本站工具）
  '正则表达式', '命令行', 'Linux', 'JSON', '加密解密', '终端',
  // AI 工具
  'AI工具', '人工智能', '大模型', 'AIGC', 'ChatGPT',
  // 生产力 / 数字生活
  '生产力', '数字生活', '极客', '自动化',
]
const kwArg = arg('--keywords', null)
const KEYWORDS = kwArg ? kwArg.split(',').map(s => s.trim()).filter(Boolean) : DEFAULT_KEYWORDS

mkdirSync(DATA_DIR, { recursive: true })
const OUT = join(DATA_DIR, 'discovered-accounts.json')

const cimi = new CimiClient({ minIntervalMs: 2500 })
const sleep = ms => new Promise(r => setTimeout(r, ms))

const byWxid = new Map()

console.log(`扫 ${KEYWORDS.length} 个开发者/工具关键词发现公众号候选…\n`)

for (const kw of KEYWORDS) {
  let accounts = []
  for (let i = 0; i < 3; i++) {
    try {
      accounts = await cimi.searchAccounts(kw)
      if (accounts.length) break
    } catch (e) {
      if (e.code !== 1002) { console.log(`  ✗ ${kw}: ${e.message}`); break }
    }
    await sleep(6000)
  }
  let added = 0
  for (const a of accounts) {
    if (!a.wxid) continue
    const prev = byWxid.get(a.wxid)
    if (prev) {
      prev.keywords.add(kw)
    } else {
      byWxid.set(a.wxid, {
        nickname: a.nickname,
        wxid: a.wxid,
        biz: a.biz,
        description: a.description,
        keywords: new Set([kw])
      })
      added++
    }
  }
  console.log(`  ${kw}: ${accounts.length} 条，新增 ${added} 个`)
}

// 命中关键词数越多越可能是核心工具/开发者号，按此排序供人工挑选
const result = [...byWxid.values()]
  .map(a => ({ ...a, keywords: [...a.keywords] }))
  .sort((a, b) => b.keywords.length - a.keywords.length)

writeFileSync(OUT, JSON.stringify(result, null, 2))
console.log(`\n发现 ${result.length} 个去重候选 → ${OUT}，余额 ${cimi.balance}`)
console.log('⚠️  人工筛选（看 nickname/description/命中关键词数），把高质量号补进 accounts.mjs 的 ACCOUNT_NAMES。')
