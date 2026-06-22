<script setup lang="ts">
import { useHead } from '@vueuse/head';
import { computed } from 'vue';
import { useLocaleRoute } from '@/composables/useLocaleRoute';

const { t } = useI18n();
const { canonical, ogLocale, alternates } = useLocaleRoute();

useHead(computed(() => ({
  title: t('privacy.metaTitle'),
  meta: [
    { name: 'description', content: t('privacy.metaDesc') },
    { property: 'og:title', content: t('privacy.metaTitle') },
    { property: 'og:description', content: t('privacy.metaDesc') },
    { property: 'og:locale', content: ogLocale.value },
  ],
  link: [
    { rel: 'canonical', href: canonical.value },
    ...alternates(),
  ],
})));
</script>

<template>
  <c-markdown :markdown="$t('privacy.content')" mx-auto mt-50px max-w-680px />
</template>
