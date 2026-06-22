<script setup lang="ts">
import { useHead } from '@vueuse/head';
import { computed } from 'vue';
import { useLocaleRoute } from '@/composables/useLocaleRoute';

const { t } = useI18n();
const { canonical, ogLocale, alternates } = useLocaleRoute();

useHead(computed(() => ({
  title: t('terms.metaTitle'),
  meta: [
    { name: 'description', content: t('terms.metaDesc') },
    { property: 'og:title', content: t('terms.metaTitle') },
    { property: 'og:description', content: t('terms.metaDesc') },
    { property: 'og:locale', content: ogLocale.value },
  ],
  link: [
    { rel: 'canonical', href: canonical.value },
    ...alternates(),
  ],
})));
</script>

<template>
  <c-markdown :markdown="$t('terms.content')" mx-auto mt-50px max-w-680px />
</template>
