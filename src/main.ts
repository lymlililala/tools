import { inject } from '@vercel/analytics';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createHead } from '@vueuse/head';

import { registerSW } from 'virtual:pwa-register';
import shadow from 'vue-shadow-dom';
import { plausible } from './plugins/plausible.plugin';

import 'virtual:uno.css';

import { naive } from './plugins/naive.plugin';

import App from './App.vue';
import router from './router';
import { i18nPlugin } from './plugins/i18n.plugin';

registerSW();
inject();

const app = createApp(App);

// ─── 全局错误捕获：Vue 组件内未处理的异常不会导致白屏 ─────────────────
app.config.errorHandler = (err, _instance, info) => {
  console.error('[Vue Error]', info, err);
  // 若 #app 内容为空（挂载失败），显示兜底错误页
  const appEl = document.getElementById('app');
  if (appEl && !appEl.hasChildNodes()) {
    const errEl = document.getElementById('app-error');
    const loadingEl = document.getElementById('app-loading');
    if (loadingEl) {
      loadingEl.style.display = 'none';
    }
    if (errEl) {
      errEl.style.display = 'flex';
    }
  }
};

app.use(createPinia());
app.use(createHead());
app.use(i18nPlugin);
app.use(router);
app.use(naive);
app.use(plausible);
app.use(shadow);

// 挂载成功：隐藏 loading，标记全局标志让超时检测知道已成功
app.mount('#app');
(window as any).__appMounted = true;
if ((window as any).__clearLoadingTimer) {
  (window as any).__clearLoadingTimer();
}
const loadingEl = document.getElementById('app-loading');
if (loadingEl) {
  loadingEl.style.display = 'none';
}
