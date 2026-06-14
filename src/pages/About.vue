<script setup lang="ts">
import { useHead } from '@vueuse/head';
import { computed } from 'vue';

const { t } = useI18n();

useHead(computed(() => ({
  title: t('about.metaTitle'),
  meta: [
    { name: 'description', content: t('about.metaDesc') },
    { property: 'og:title', content: t('about.metaTitle') },
    { property: 'og:description', content: t('about.metaDesc') },
  ],
  link: [
    { rel: 'canonical', href: 'https://myutl.com/about' },
  ],
})));
</script>

<template>
  <c-markdown :markdown="$t('about.content')" mx-auto mt-50px max-w-680px />
</template>
