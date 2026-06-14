<script setup lang="ts">
import { useHead } from '@vueuse/head';
import { computed } from 'vue';

const { t } = useI18n();

useHead(computed(() => ({
  title: t('contact.metaTitle'),
  meta: [
    { name: 'description', content: t('contact.metaDesc') },
    { property: 'og:title', content: t('contact.metaTitle') },
    { property: 'og:description', content: t('contact.metaDesc') },
  ],
  link: [
    { rel: 'canonical', href: 'https://myutl.com/contact' },
  ],
})));
</script>

<template>
  <c-markdown :markdown="$t('contact.content')" mx-auto mt-50px max-w-680px />
</template>
