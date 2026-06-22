<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';
import { NGlobalStyle, NMessageProvider, NNotificationProvider, darkTheme } from 'naive-ui';
import { useHead } from '@vueuse/head';
import { darkThemeOverrides, lightThemeOverrides } from './themes';
import { layouts } from './layouts';
import { useStyleStore } from './stores/style.store';
import { LOCALE_CODES, byCode, splitLocale } from './lib/locales';

const route = useRoute();
const layout = computed(() => route?.meta?.layout ?? layouts.base);
const styleStore = useStyleStore();

const theme = computed(() => (styleStore.isDarkTheme ? darkTheme : null));
const themeOverrides = computed(() => (styleStore.isDarkTheme ? darkThemeOverrides : lightThemeOverrides));

const { locale } = useI18n();

// ── 语言初始化与同步 ──────────────────────────────────────────────────────────
// 优先级：URL 前缀 > localStorage > 默认 en。
// 爬虫不带 storage，直接访问 /zh/* 也能按 URL 正确判定中文（SEO 关键）。
const stored = useStorage('locale', '');
const urlLocale = splitLocale(route.path).locale;
if (urlLocale.prefix) {
  // 带前缀的 URL（/zh/...）→ 以 URL 为准
  locale.value = urlLocale.code;
}
else if (stored.value && LOCALE_CODES.includes(stored.value)) {
  // 根路径 → 回退到上次记住的语言
  locale.value = stored.value;
}

// 当前语言写回 localStorage（供下次根路径访问回退）
watch(locale, (l) => {
  stored.value = l;
});

// URL 前缀变化时同步界面语言（点中文链接 / 切换器跳转 / 浏览器前进后退）
watch(
  () => route.path,
  (p) => {
    const l = splitLocale(p).locale;
    if (locale.value !== l.code) {
      locale.value = l.code;
    }
  },
);

// 让 <html lang> 跟随当前语言：en→'en'，zh→'zh-CN'。
// 修复 index.html 写死的 lang 与实际界面语言不符的可访问性/SEO 问题。
useHead({
  htmlAttrs: { lang: computed(() => byCode(locale.value).htmlLang) },
});
</script>

<template>
  <n-config-provider :theme="theme" :theme-overrides="themeOverrides">
    <NGlobalStyle />
    <NMessageProvider placement="bottom">
      <NNotificationProvider placement="bottom-right">
        <component :is="layout">
          <RouterView />
        </component>
      </NNotificationProvider>
    </NMessageProvider>
  </n-config-provider>
</template>

<style>
body {
  min-height: 100%;
  margin: 0;
  padding: 0;
}

html {
  height: 100%;
  margin: 0;
  padding: 0;
}

* {
  box-sizing: border-box;
}

/* ── 移动端可用性优化(≤480px),不影响桌面密集布局 ── */
@media (max-width: 480px) {
  /* #2 输入控件提到 16px,消除 iOS Safari 聚焦自动缩放。
     用 !important 压过组件 scoped 的 font-size:inherit;
     排除 .code-textarea —— 它是透明层叠在 13px 高亮层上,改字号会让光标与高亮错位。 */
  input,
  textarea:not(.code-textarea),
  .n-input__input-el,
  .n-input__textarea-el {
    font-size: 16px !important;
  }

  /* #2 文章阅读正文可读性(仅文章内容,不动工具网格/侧栏/桌面) */
  .article-content,
  .article-content p,
  .article-content li {
    font-size: 16px;
    line-height: 1.75;
  }

  /* #1 内容操作图标按钮给 ≥44px 触控区(min 约束会 clamp 住组件内固定尺寸) */
  .copy-btn,
  .hdr-btn,
  .indent-btn,
  .c-button.circle,
  .btn-copy,
  .btn-refresh {
    min-width: 44px;
    min-height: 44px;
  }
}
</style>
