import { createRouter, createWebHistory } from 'vue-router';
import { layouts } from './layouts/index';
import HomePage from './pages/Home.page.vue';
import NotFound from './pages/404.page.vue';
import CategoryPage from './pages/Category.page.vue';
import { tools } from './tools';
import { config } from './config';
import { routes as demoRoutes } from './ui/demo/demo.routes';

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

const router = createRouter({
  history: createWebHistory(config.app.baseUrl),
  routes: [
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
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
  ],
});

export default router;
