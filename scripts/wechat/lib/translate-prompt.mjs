// 中文翻译规则 —— 由 3-synthesize.mjs（合成时一并出中文）与 backfill-translations.mjs（历史回填）共用，
// 避免两处 prompt 漂移。核心约束：译散文不译代码；中文 Markdown 结构与英文一一对应。

// 共享的翻译铁律（嵌入合成 SYS 或独立翻译 system 时都用同一段文字）。
export const ZH_TRANSLATE_RULES = `Chinese (Simplified) version rules:
- Faithfully render the English title/description/content/keywords into natural, native 简体中文 for Chinese developers — NOT machine-literal, NOT word-for-word.
- content_zh MUST mirror the English content's structure EXACTLY: same heading levels (## / ###), same number of sections, same fenced code blocks (verbatim, untranslated), same | tables |, same image placeholders/links in the same positions.
- Translate ONLY prose. Keep VERBATIM and untranslated: code, commands, regex, API/function/identifier names, file paths, CLI flags, error strings, URLs, and relative tool links like (/json-format).
- Technical terms: on first mention you MAY give 中文（English） once; afterwards use whichever reads naturally. Keep the English form for terms that are conventionally used untranslated.
- Do NOT add or drop sections, do NOT summarize, do NOT inject marketing fluff or "本文/小编/公众号/扫码关注". Length should be comparable in coverage to the English source.`

// 合成（3-synthesize）SYS prompt 里 JSON schema 追加的中文字段说明。
export const ZH_JSON_FIELDS = `"title_zh":"中文标题，与英文 title 同义，12-30 个汉字","description_zh":"中文 meta 描述，约 60-78 个汉字，一句话，无省略号结尾","content_zh":"完整中文 Markdown 正文，结构/标题层级/代码块/表格/图片占位与英文 content 一一对应（代码、命令、API 名、相对工具链接保持原样不译）","keywords_zh":["6-10 个中文 SEO 关键词"]`

// 回填脚本用的独立翻译 system prompt（输入英文四字段，仅输出中文四字段 JSON）。
export const TRANSLATE_SYS = `You are a senior bilingual technical translator/localizer for an English developer-tools site. You are given an existing ENGLISH article (title, description, content Markdown, keywords). Produce a faithful 简体中文 version.

${ZH_TRANSLATE_RULES}

Return ONLY JSON: {${ZH_JSON_FIELDS}}`

/** 把英文文章字段拼成翻译用的 user message。 */
export function buildTranslateUser({ title, description, content, keywords }) {
  return `English title: ${title || ''}
English description: ${description || ''}
English keywords: ${(keywords || []).join(', ')}

English content (Markdown):

${content || ''}`
}

/** 中文 meta 描述截断：按字符（汉字）截，去掉尾部标点。英文用的 clampDesc 按 158 太长，中文用 ~80。 */
export function clampDescZh(s, max = 80) {
  const desc = (s || '').trim()
  if (desc.length <= max) return desc
  return desc.slice(0, max).replace(/[\s，。、；：,;:.\-–—…]+$/u, '')
}
