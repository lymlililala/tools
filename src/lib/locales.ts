// ─────────────────────────────────────────────────────────────────────────────
// 多语言（locale）唯一真相源（SSOT）
//
// 站点采用「英文走根路径、其它语言走 /<code> 前缀」的 URL 策略：
//   en → /            （现有英文 URL 零改动，避免 301 迁移损失）
//   zh → /zh/...      （独立 URL，便于 Google 单独索引中文）
//
// 加一种新语言 = 在 LOCALES 数组加一行 + 同步 scripts/prerender-static.mjs 顶部
// 内联的等价 LOCALES + vercel.json 加一组 /<code> 规则。架构与逻辑不动。
//
// ⚠️ scripts/prerender-static.mjs 无法 import 本 TS 文件，已在脚本顶部内联一份
//    等价副本，改这里务必同步那边（脚本里有醒目注释标注）。
// ─────────────────────────────────────────────────────────────────────────────

export interface LocaleDef {
  /** vue-i18n 的 locale code，与 locales/<code>.yml 文件名一致 */
  code: string;
  /** URL 前缀；根语言为 ''，其它语言为 '/<code>' */
  prefix: string;
  /** <html lang> 属性值 */
  htmlLang: string;
  /** og:locale 值 */
  ogLocale: string;
  /** hreflang 属性值 */
  hreflang: string;
  /** 语言切换器里显示的名称 */
  label: string;
}

export const LOCALES: LocaleDef[] = [
  { code: 'en', prefix: '', htmlLang: 'en', ogLocale: 'en_US', hreflang: 'en', label: 'English' },
  { code: 'zh', prefix: '/zh', htmlLang: 'zh-CN', ogLocale: 'zh_CN', hreflang: 'zh-Hans', label: '中文' },
];

/** 默认语言（根路径无前缀时使用） */
export const DEFAULT_LOCALE = LOCALES[0];

/** 所有 locale code 列表，如 ['en','zh'] */
export const LOCALE_CODES = LOCALES.map(l => l.code);

/** 带前缀的非根语言 code 列表，如 ['zh']（用于路由正则） */
export const PREFIXED_CODES = LOCALES.filter(l => l.prefix).map(l => l.code);

/** 按 code 取 LocaleDef，找不到回落默认语言 */
export function byCode(code: string): LocaleDef {
  return LOCALES.find(l => l.code === code) ?? DEFAULT_LOCALE;
}

/**
 * 从 pathname 中剥离语言前缀，返回 { locale, basePath }。
 *   '/zh/json-format' → { locale: zh, basePath: '/json-format' }
 *   '/json-format'    → { locale: en, basePath: '/json-format' }
 *   '/zh'             → { locale: zh, basePath: '/' }
 *   '/'               → { locale: en, basePath: '/' }
 * basePath 始终以 '/' 开头，是去掉语言前缀后的「逻辑路径」。
 */
export function splitLocale(pathname: string): { locale: LocaleDef; basePath: string } {
  // 优先匹配带前缀的语言（按前缀长度降序，避免短前缀误吞）
  const prefixed = [...LOCALES].filter(l => l.prefix).sort((a, b) => b.prefix.length - a.prefix.length);
  for (const l of prefixed) {
    if (pathname === l.prefix || pathname.startsWith(`${l.prefix}/`)) {
      const rest = pathname.slice(l.prefix.length);
      return { locale: l, basePath: rest === '' ? '/' : rest };
    }
  }
  return { locale: DEFAULT_LOCALE, basePath: pathname || '/' };
}

/** 给逻辑路径加上指定语言的前缀。localized('/about', zh) → '/zh/about' */
export function localized(basePath: string, code: string): string {
  const l = byCode(code);
  const clean = basePath.startsWith('/') ? basePath : `/${basePath}`;
  // 根路径：en → '/'，zh → '/zh'
  if (clean === '/') {
    return l.prefix || '/';
  }
  return `${l.prefix}${clean}`;
}
