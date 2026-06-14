<script setup lang="ts">
import { useHead } from '@vueuse/head';
import { computed } from 'vue';

const { t } = useI18n();

useHead(computed(() => ({
  title: t('terms.metaTitle'),
  meta: [
    { name: 'description', content: t('terms.metaDesc') },
    { property: 'og:title', content: t('terms.metaTitle') },
    { property: 'og:description', content: t('terms.metaDesc') },
  ],
  link: [
    { rel: 'canonical', href: 'https://myutl.com/terms' },
  ],
})));
</script>

<template>
  <c-markdown :markdown="$t('terms.content')" mx-auto mt-50px max-w-680px />
</template>
