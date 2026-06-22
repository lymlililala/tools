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

type TFn = (key: string) => string;
type TeFn = (key: string) => boolean;

// 工具定义里的 name/description 是「模块加载时」用 translate() 取的，锁死成英文
// （加载时 locale=en），切语言不会变。卡片/菜单等展示处改用下面这两个解析器，
// 按当前 locale 响应式取 i18n（映射 key → slug key → 锁死英文兜底，与预渲染同链）。
export function toolTitleOf(tool: { path: string; name: string }, t: TFn, te: TeFn): string {
  const slug = tool.path.replace(/^\//, '');
  const k = toolI18nKey(slug);
  if (te(`tools.${k}.title`)) {
    return t(`tools.${k}.title`);
  }
  if (te(`tools.${slug}.title`)) {
    return t(`tools.${slug}.title`);
  }
  return tool.name;
}

export function toolDescOf(tool: { path: string; description: string }, t: TFn, te: TeFn): string {
  const slug = tool.path.replace(/^\//, '');
  const k = toolI18nKey(slug);
  if (te(`tools.${k}.description`)) {
    return t(`tools.${k}.description`);
  }
  if (te(`tools.${slug}.description`)) {
    return t(`tools.${slug}.description`);
  }
  return tool.description;
}

