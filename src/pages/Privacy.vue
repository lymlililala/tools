<script setup lang="ts">
import { useHead } from '@vueuse/head';
import { computed } from 'vue';

const { t } = useI18n();

useHead(computed(() => ({
  title: t('privacy.metaTitle'),
  meta: [
    { name: 'description', content: t('privacy.metaDesc') },
    { property: 'og:title', content: t('privacy.metaTitle') },
    { property: 'og:description', content: t('privacy.metaDesc') },
  ],
  link: [
    { rel: 'canonical', href: 'https://myutl.com/privacy' },
  ],
})));
</script>

<template>
  <c-markdown :markdown="$t('privacy.content')" mx-auto mt-50px max-w-680px />
</template>
