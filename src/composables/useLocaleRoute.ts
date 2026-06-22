import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { LOCALES, splitLocale } from '@/lib/locales';

const SITE = 'https://myutl.com';

/**
 * 语言感知的路由派生：从当前 URL 剥离语言前缀，给页面 <head> 提供
 * 自指 canonical、hreflang 全簇、og:locale，以及逻辑 basePath。
 *
 * basePath 是去掉 /zh 等前缀后的「逻辑路径」，页面用它取 i18n key、
 * 拼内部链接，避免把语言前缀混进 key 或 canonical。
 */
export function useLocaleRoute() {
  const route = useRoute();
  const parts = computed(() => splitLocale(route.path));
  const locale = computed(() => parts.value.locale);
  const basePath = computed(() => parts.value.basePath);

  // 拼某语言下某逻辑路径的绝对 URL（根路径不留尾斜杠，与预渲染 canonical 一致）。
  function urlFor(prefix: string, base: string) {
    const clean = base === '/' ? '' : base;
    return `${SITE}${prefix}${clean}` || `${SITE}/`;
  }

  // 当前页 canonical：自指、带当前语言前缀。
  const canonical = computed(() => urlFor(locale.value.prefix, basePath.value));

  // og:locale
  const ogLocale = computed(() => locale.value.ogLocale);

  // hreflang 全簇：每语言一条 + x-default → 默认（根）语言。
  // base 默认取当前逻辑路径，调用方也可传入（如博客按是否有中文版裁剪）。
  function alternates(base: string = basePath.value) {
    const links = LOCALES.map(l => ({
      rel: 'alternate',
      hreflang: l.hreflang,
      href: urlFor(l.prefix, base),
    }));
    links.push({ rel: 'alternate', hreflang: 'x-default', href: urlFor('', base) });
    return links;
  }

  // 把逻辑路径前缀化到「当前语言」，用于模板里拼内部链接（保持语言粘性）。
  function localizedPath(base: string) {
    const clean = base.startsWith('/') ? base : `/${base}`;
    if (clean === '/') {
      return locale.value.prefix || '/';
    }
    return `${locale.value.prefix}${clean}`;
  }

  return { locale, basePath, canonical, ogLocale, alternates, localizedPath };
}
