// 合成前判重 —— 防止生成与站内已有文章重复的选题（全自动直发的护栏之一）。
//   ① 归一化 slug/标题精确查（零成本）。
//   ② DeepSeek 近似判重：把候选选题与库内标题列表比对，问是否「实质重复」。
// 数据源 tools_articles（站内文章表）。无 Supabase（本地无 key）时降级为不判重，永不阻断流程。

import { hasSupabase, getSupabase } from './supabase.mjs'
import { slugify } from './slug.mjs'

/** 取库内已发布文章的 {slug,title,tool_path}[]。无库返回 null。 */
export async function loadExistingPosts() {
  if (!hasSupabase()) return null
  const sb = getSupabase()
  const out = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb
      .from('tools_articles').select('slug,title,tool_path').range(from, from + 999)
    if (error) throw new Error(`tools_articles 读取失败: ${error.message}`)
    out.push(...data)
    if (data.length < 1000) break
  }
  return out
}

function normTitle(t) {
  return (t || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

/**
 * 判断候选选题是否与库内已有文章重复。
 * @param {object} cluster   { working_title, topic, tool_path }
 * @param {Array}  existing  loadExistingPosts() 结果（{slug,title,tool_path}[]）
 * @param {object} ds        DeepSeek 实例（用于近似判重；可空，则仅精确查）
 * @returns {Promise<{dup:boolean, reason?:string, match?:string}>}
 */
export async function isDuplicate(cluster, existing, ds) {
  if (!existing || !existing.length) return { dup: false }
  const candSlug = slugify(cluster.working_title || cluster.topic || '')
  const candNorm = normTitle(cluster.working_title || cluster.topic || '')

  // ① 精确/包含查
  for (const p of existing) {
    if (p.slug === candSlug) return { dup: true, reason: 'slug-exact', match: p.slug }
    const pn = normTitle(p.title)
    if (pn && candNorm && pn === candNorm) return { dup: true, reason: 'title-exact', match: p.title }
  }

  // ② DeepSeek 近似判重（仅与同工具页 + 标题相近的候选比，省 token）
  if (!ds) return { dup: false }
  const candWords = new Set(candNorm.split(' ').filter(w => w.length > 3))
  const shortlist = existing
    .filter(p => !cluster.tool_path || p.tool_path === cluster.tool_path) // 优先同工具页比对
    .map(p => ({ p, overlap: normTitle(p.title).split(' ').filter(w => candWords.has(w)).length }))
    .filter(x => x.overlap >= 2)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, 30)
    .map(x => x.p.title)
  if (!shortlist.length) return { dup: false }

  const sys = `You are a content de-duplication checker for a developer-tools website. `
    + `Decide if a PROPOSED new article would substantially duplicate any EXISTING article `
    + `(same tool/topic + same angle). A different angle or a different sub-topic is NOT a duplicate. `
    + `Return ONLY JSON: {"duplicate":boolean,"match":"the existing title or empty","why":"short"}`
  const user = `PROPOSED title: ${cluster.working_title}\nPROPOSED topic: ${cluster.topic}\nTool: ${cluster.tool_path || ''}\n\n`
    + `EXISTING titles:\n${shortlist.map((t, i) => `${i + 1}. ${t}`).join('\n')}`
  try {
    const r = await ds.chatJSON([{ role: 'system', content: sys }, { role: 'user', content: user }], { maxTokens: 200 })
    if (r && r.duplicate) return { dup: true, reason: `llm:${r.why || 'similar'}`, match: r.match || '' }
  } catch {
    // 判重调用失败不阻断合成（宁可生成、由质量闸门兜底）
  }
  return { dup: false }
}
