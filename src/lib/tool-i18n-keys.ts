// 工具「路由 slug」→「i18n key」映射。
// 这几个工具的路由路径为 SEO 改过名，但 locales/*.yml 里的键沿用了旧名，
// 故运行时按路径取 i18n（标题/描述/FAQ/步骤）需先过这张表，否则取不到、回落英文。
//
// 注：scripts/prerender-static.mjs 的 slugToI18nKey 还多列了 base-converter /
// date-converter，但那两个映射目标在 yml 里并不存在（实际键就是 slug 本身），
// 预渲染靠 `?? toolsI18n[slug]` 兜底，故此处只保留真正存在的映射，不要照搬那两条。
export const TOOL_I18N_KEY: Record<string, string> = {
  'json-format': 'json-prettify',
  'sql-format': 'sql-prettify',
  'xml-format': 'xml-formatter',
  'yaml-format': 'yaml-prettify',
  'qrcode-generator': 'qr-code-generator',
};

/** 把路由 slug 解析为 i18n key（无映射则原样返回）。 */
export function toolI18nKey(slug: string): string {
  return TOOL_I18N_KEY[slug] ?? slug;
}
