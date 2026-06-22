import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';
import { layouts } from './layouts/index';
import HomePage from './pages/Home.page.vue';
import NotFound from './pages/404.page.vue';
import CategoryPage from './pages/Category.page.vue';
import { tools } from './tools';
import { config } from './config';
import { routes as demoRoutes } from './ui/demo/demo.routes';
import { PREFIXED_CODES, consumeLocaleSwitch, splitLocale } from './lib/locales';

// 博客两个页面懒加载：把 marked/dompurify 等移出主包，减小首屏 JS。
// 列表页 hover 时会一并预取详情 chunk（见 Articles.page.vue），故点击不额外等 JS。
const ArticlesPage = () => import('./pages/Articles.page.vue');
const ArticleDetailPage = () => import('./pages/ArticleDetail.page.vue');

const toolsRoutes = tools.map(({ path, name, component, ...config }) => ({
  path,
  name,
  component,
  meta: { isTool: true, layout: layouts.toolLayout, name, ...config },
}));
const toolsRedirectRoutes = tools
  .filter(({ redirectFrom }) => redirectFrom && redirectFrom.length > 0)
  .flatMap(
    ({ path, redirectFrom }) => redirectFrom?.map(redirectSource => ({ path: redirectSource, redirect: path })) ?? [],
  );

// ── 无语言前缀的「逻辑路由表」(en 根路径直接用，其它语言以此为模板挂前缀) ──
const innerRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('./pages/About.vue'),
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import('./pages/Contact.vue'),
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: () => import('./pages/Privacy.vue'),
  },
  {
    path: '/terms',
    name: 'terms',
    component: () => import('./pages/Terms.vue'),
  },
  {
    path: '/blog',
    name: 'blog',
    component: ArticlesPage,
    meta: { layout: layouts.base },
  },
  {
    path: '/blog/:slug',
    name: 'blog-detail',
    component: ArticleDetailPage,
    meta: { layout: layouts.base },
  },
  {
    path: '/c/:slug',
    name: 'category',
    component: CategoryPage,
    meta: { layout: layouts.base },
  },
  ...toolsRoutes,
  ...toolsRedirectRoutes,
  ...(config.app.env === 'development' ? demoRoutes : []),
];

// 把逻辑路由表转成「语言前缀父路由」的子路由：
//   path 去前导 '/'（子路由相对父路由）；name 加 '__loc' 后缀防止与无前缀版重名。
//   redirect 目标补上语言前缀，保证 /zh 下的旧 slug 重定向仍留在中文。
function asLocaleChildren(routes: RouteRecordRaw[]): RouteRecordRaw[] {
  return routes.map((r) => {
    const child: RouteRecordRaw = {
      ...r,
      path: r.path.replace(/^\//, ''),
    } as RouteRecordRaw;
    if (r.name) {
      child.name = `${String(r.name)}__loc`;
    }
    // 子路由的 redirect 目标加上当前语言前缀（函数形式拿到 to.params.localePrefix）
    if ((r as any).redirect) {
      const target = (r as any).redirect as string;
      child.redirect = (to: any) => `/${to.params.localePrefix}${target}`;
    }
    return child;
  });
}

// 语言前缀父路由（无 component，纯作 URL 前缀分组；子路由在根 <router-view> 渲染）。
// PREFIXED_CODES = ['zh'] → 正则 '/:localePrefix(zh)'，精确匹配，避免吞掉工具 slug。
const prefixPattern = PREFIXED_CODES.join('|');
const localeParentRoute: RouteRecordRaw = {
  path: `/:localePrefix(${prefixPattern})`,
  children: asLocaleChildren(innerRoutes),
};

const router = createRouter({
  history: createWebHistory(config.app.baseUrl),
  routes: [
    ...innerRoutes,
    localeParentRoute,
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
  ],
});

// ── 语言「粘性」守卫 ─────────────────────────────────────────────────────────
// 现有 16+13 处 <router-link> 都指向无前缀路径（如 /about）。当用户已在 /zh 下，
// 点这些内部链接应自动留在中文（补 /zh 前缀），免去逐个改链接。
// 语言切换器主动切到根语言（en）时会先调 markLocaleSwitch()（在 lib/locales）放行
// 一次，避免被这里弹回。标志放在 lib/locales 而非本模块，以免组件反向 import 成环。
router.beforeEach((to, from) => {
  if (consumeLocaleSwitch()) {
    return true;
  }
  const fromLoc = splitLocale(from.path).locale;
  const toLoc = splitLocale(to.path).locale;
  // 从「带前缀语言」页出发，目标却落到了无前缀（根语言）路径 → 视为内部链接点击，补回前缀。
  if (fromLoc.prefix && !toLoc.prefix) {
    return `${fromLoc.prefix}${to.path === '/' ? '' : to.path}${to.hash || ''}`;
  }
  return true;
});

export default router;
