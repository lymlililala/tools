<script setup lang="ts">
import { useHead } from '@vueuse/head';
import { useRoute } from 'vue-router';

const route = useRoute();

// noindex prevents search engines from indexing soft 404 pages
// This is the standard SPA approach to handle soft 404 SEO
useHead({
  title: '页面未找到 - MyUtl',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'description', content: '抱歉，该页面不存在。请返回首页使用其他工具。' },
  ],
});
</script>

<template>
  <div mt-20 flex flex-col items-center>
    <span text-90px lh-1 op-50>
      <icon-mdi:kettle-steam-outline />
    </span>

    <h1 m-0 mt-3>
      {{ $t('404.notFound') }}
    </h1>
    <div mt-4 op-60>
      {{ $t('404.sorry') }}
    </div>
    <div mb-8 op-60>
      {{ $t('404.maybe') }}
    </div>

    <c-button to="/">
      {{ $t('404.backHome') }}
    </c-button>
  </div>
</template>
