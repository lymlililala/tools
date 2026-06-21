// 站内工具目录扫描 —— 从 src/tools/<tool>/index.ts 抽取 { path, keywords, dir, name }。
// 供 2-cluster 把选题锚定到真实工具页（tools_articles.tool_path 非空），
// 也供 3-synthesize 校验/纠正模型给出的 toolPath。零依赖正则解析，足够稳。

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))
// scripts/wechat/lib → 项目根/src/tools
const TOOLS_DIR = join(__dir, '..', '..', '..', 'src', 'tools')

// 从 index.ts 文本里抠出第一个字符串数组字面量（用于 keywords / redirectFrom）
function arrayLiteral(src, key) {
  const m = src.match(new RegExp(`${key}\\s*:\\s*\\[([^\\]]*)\\]`))
  if (!m) return []
  return [...m[1].matchAll(/['"\`]([^'"\`]+)['"\`]/g)].map(x => x[1])
}

function stringField(src, key) {
  const m = src.match(new RegExp(`${key}\\s*:\\s*['"\`]([^'"\`]+)['"\`]`))
  return m ? m[1] : null
}

// 目录名 → 人话名兜底（当 name 走 translate() 不在源码里时）
function humanize(dir) {
  return dir.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

/** 返回工具目录数组：[{ path, keywords, redirectFrom, dir, name }]，按 path 升序。 */
export function loadToolCatalog() {
  if (!existsSync(TOOLS_DIR)) return []
  const out = []
  for (const dir of readdirSync(TOOLS_DIR)) {
    const idx = join(TOOLS_DIR, dir, 'index.ts')
    if (!existsSync(idx)) continue
    let src
    try { src = readFileSync(idx, 'utf8') } catch { continue }
    const path = stringField(src, 'path')
    if (!path) continue
    const keywords = arrayLiteral(src, 'keywords')
    const redirectFrom = arrayLiteral(src, 'redirectFrom')
    // name 多为 translate('tools.x.title')，源码里取不到字面量 → 用目录名兜底
    const rawName = stringField(src, 'name')
    const name = rawName && !rawName.includes('.') ? rawName : humanize(dir)
    out.push({ path, keywords, redirectFrom, dir, name })
  }
  return out.sort((a, b) => a.path.localeCompare(b.path))
}

/** 所有合法 tool_path 的集合（含 redirectFrom 旧路径，便于纠错归一）。 */
export function toolPathSet(catalog = loadToolCatalog()) {
  const set = new Set()
  for (const t of catalog) {
    set.add(t.path)
    for (const r of t.redirectFrom || []) set.add(r)
  }
  return set
}

/** 把模型给的 toolPath 归一到真实存在的 path（命中 redirectFrom 则换成正式 path）。无效返回 null。 */
export function normalizeToolPath(p, catalog = loadToolCatalog()) {
  if (!p) return null
  const path = p.startsWith('/') ? p : `/${p}`
  for (const t of catalog) {
    if (t.path === path) return t.path
    if ((t.redirectFrom || []).includes(path)) return t.path
  }
  return null
}

/** 给模型看的紧凑清单：每行 "path | kw1, kw2, ..."（省 token）。 */
export function catalogForPrompt(catalog = loadToolCatalog()) {
  return catalog.map(t => `${t.path} | ${(t.keywords || []).join(', ')}`).join('\n')
}
