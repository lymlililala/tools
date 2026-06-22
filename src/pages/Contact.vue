<script setup lang="ts">
import { useHead } from '@vueuse/head';
import { computed } from 'vue';
import { useLocaleRoute } from '@/composables/useLocaleRoute';

const { t } = useI18n();
const { canonical, ogLocale, alternates } = useLocaleRoute();

useHead(computed(() => ({
  title: t('contact.metaTitle'),
  meta: [
    { name: 'description', content: t('contact.metaDesc') },
    { property: 'og:title', content: t('contact.metaTitle') },
    { property: 'og:description', content: t('contact.metaDesc') },
    { property: 'og:locale', content: ogLocale.value },
  ],
  link: [
    { rel: 'canonical', href: canonical.value },
    ...alternates(),
  ],
})));
</script>

<template>
  <c-markdown :markdown="$t('contact.content')" mx-auto mt-50px max-w-680px />
</template>
