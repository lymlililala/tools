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

  // tool 类必须锚定真实工具页；blog 类（开发者主题博客）不要求，tool_path 留空
  if (draft.kind !== 'blog' && !draft.toolPath) reasons.push('NO-TOOL-PATH')

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

/**
 * 中文版「软闸门」—— 与英文闸门相互独立、宽松得多。
 * 不过线只表示「中文不入库、前端回落英文」，绝不阻塞英文发布。
 * @param {object} draft  { title_zh, description_zh, content_zh }
 * @param {object} [opts] { minChars=1200 }  中文按字符计（中文更密，1200 汉字 ≈ 英文 4500 char 篇幅）
 * @returns {{ pass:boolean, reasons:string[], len:number, headings:number, cjk:number }}
 */
export function checkQualityZh(draft, opts = {}) {
  const minChars = opts.minChars ?? 1200
  const content = draft.content_zh || ''
  const reasons = []

  if (!content) { return { pass: false, reasons: ['NO-ZH-CONTENT'], len: 0, headings: 0, cjk: 0 } }
  if (content.length < minChars) reasons.push(`THIN:${content.length}<${minChars}`)

  if (!draft.title_zh || draft.title_zh.length < 4) reasons.push('TITLE-ZH:too-short')

  const desc = draft.description_zh || ''
  if (desc.length < 10) reasons.push('DESC-ZH:too-short')
  if (desc.length > 90) reasons.push(`DESC-ZH:too-long:${desc.length}`)

  // 结构应与英文对应：至少 3 个二级/三级标题
  const headings = (content.match(/^#{2,3}\s+\S/gm) || []).length
  if (headings < 3) reasons.push(`HEADINGS:${headings}<3`)

  // 反向校验：剥离代码块/行内代码/链接后，散文里中文占比应远高于拉丁；
  // 真没翻译（直接抄英文）时中文才会接近 0。代码/英文术语密集的正文不会误杀。
  const prose = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/!?\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
  const cjk = (prose.match(/[一-龥]/g) || []).length
  const latin = (prose.match(/[a-zA-Z]/g) || []).length
  // 样本量门槛：剥离代码后散文过短（<300 中英字符）时占比不可靠，跳过此项，避免误杀代码密集文。
  if (cjk + latin >= 300 && cjk < (cjk + latin) * 0.30) reasons.push(`LOW-CJK:${cjk}/${cjk + latin}疑似未译`)

  return { pass: reasons.length === 0, reasons, len: content.length, headings, cjk }
}
