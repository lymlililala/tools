<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';
import { NGlobalStyle, NMessageProvider, NNotificationProvider, darkTheme } from 'naive-ui';
import { useHead } from '@vueuse/head';
import { darkThemeOverrides, lightThemeOverrides } from './themes';
import { layouts } from './layouts';
import { useStyleStore } from './stores/style.store';

const route = useRoute();
const layout = computed(() => route?.meta?.layout ?? layouts.base);
const styleStore = useStyleStore();

const theme = computed(() => (styleStore.isDarkTheme ? darkTheme : null));
const themeOverrides = computed(() => (styleStore.isDarkTheme ? darkThemeOverrides : lightThemeOverrides));

const { locale } = useI18n();

syncRef(
  locale,
  useStorage('locale', locale),
);

// 让 <html lang> 跟随当前界面语言(默认 en;切换语言时同步),
// 修复 index.html 写死 zh-CN 与英文界面不符的可访问性/SEO 问题。
useHead({
  htmlAttrs: { lang: locale },
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
