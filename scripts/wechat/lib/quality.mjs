// 发布前质量闸门 —— 面向**英文开发者工具讲解文**（对齐站内 tools_articles 现有文风）。
// 命中任一硬性问题 → 不过线（标记 draft，不入库或入库待审）。

// 已知劣质模板指纹（AI 套话/营销腔），新内容绝不能命中
const KNOWN_FINGERPRINTS = [
  [/in (this|the following) (comprehensive )?(guide|article),? (we'?ll|you'?ll|i'?ll)/i, 'FP-in-this-guide'],
  [/look no further/i, 'FP-look-no-further'],
  [/(unlock|unleash|elevate|supercharge) your (workflow|productivity|coding|development|experience)/i, 'FP-unlock-your'],
  [/as an ai language model/i, 'FP-ai-disclaimer'],
  [/in today'?s (fast-paced|digital) world/i, 'FP-todays-world'],
  [/中文|公众号|本文|小编|扫码|关注我们/, 'FP-leftover-chinese'], // 残留中文/洗稿痕迹
]

/**
 * 检查一篇合成英文工具文是否达标。
 * @param {object} draft  { title, content, description, toolPath }
 * @param {object} [opts] { minChars=4500, requireImages=false }
 * @returns {{ pass:boolean, reasons:string[], len:number, images:number, headings:number }}
 */
export function checkQuality(draft, opts = {}) {
  const minChars = opts.minChars ?? 4500 // 英文 ~900 词起步（站内现有文多在 1000-1800 词）
  const content = draft.content || ''
  const reasons = []

  if (content.length < minChars) reasons.push(`THIN:${content.length}<${minChars}`)
  for (const [re, name] of KNOWN_FINGERPRINTS) if (re.test(content)) reasons.push(`FINGERPRINT:${name}`)

  if (!draft.title || draft.title.length < 10) reasons.push('TITLE:too-short')

  const desc = draft.description || ''
  if (desc.length < 50) reasons.push('DESC:too-short')
  if (desc.length > 165) reasons.push(`DESC:too-long:${desc.length}`)

  // 必须锚定真实工具页（tools_articles.tool_path 非空）
  if (!draft.toolPath) reasons.push('NO-TOOL-PATH')

  // 结构：至少 3 个二级/三级标题（站内文均为分节讲解）
  const headings = (content.match(/^#{2,3}\s+\S/gm) || []).length
  if (headings < 3) reasons.push(`HEADINGS:${headings}<3`)

  // 英文正文应以拉丁字母为主；残留大量中文 → 翻译不彻底/洗稿
  const cjk = (content.match(/[一-龥]/g) || []).length
  if (cjk > content.length * 0.03) reasons.push(`HIGH-CJK:${cjk}疑似未译彻底`)

  // 配图：默认不强制（站内现有文多为纯文字/表格）；开启时要求 ≥2 张占位
  const imgPlaceholders = (content.match(/!\[[^\]]*\]\(\s*IMG:[^)]*\)/gi) || []).length
  if (opts.requireImages === true && imgPlaceholders < 2) reasons.push(`IMG:${imgPlaceholders}<2`)

  return { pass: reasons.length === 0, reasons, len: content.length, images: imgPlaceholders, headings }
}
