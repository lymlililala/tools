<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { LOCALES, localized, markLocaleSwitch, splitLocale } from '@/lib/locales';

const { locale } = useI18n();
const route = useRoute();
const router = useRouter();

// 只展示真正支持（有 URL 前缀 / SEO 预渲染）的语言：en + zh。
// 其余 locales/*.yml 是上游 it-tools 遗留、未做前缀与 SEO，不在此暴露。
const localeOptions = LOCALES.map(l => ({ label: l.label, value: l.code }));

// 当前选中的语言以 URL 前缀为准（与地址栏一致）。
const current = computed(() => splitLocale(route.path).locale.code);

function onChange(code: string) {
  if (code === current.value) {
    return;
  }
  const { basePath } = splitLocale(route.path);
  const target = localized(basePath, code);
  // 切到根语言（en，无前缀）时，先放行一次粘性守卫，避免被弹回 /zh。
  if (!splitLocale(target).locale.prefix) {
    markLocaleSwitch();
  }
  // 立即同步界面语言（路由守卫也会同步，这里让按钮反馈更即时）。
  locale.value = code;
  router.push(target);
}
</script>

<template>
  <c-select
    :value="current"
    :options="localeOptions"
    placeholder="Select a language"
    w-100px
    @update:value="onChange"
  />
</template>
