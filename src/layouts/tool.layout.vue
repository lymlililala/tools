<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { useHead } from '@vueuse/head';
import type { HeadObject } from '@vueuse/head';

import BaseLayout from './base.layout.vue';
import FavoriteButton from '@/components/FavoriteButton.vue';
import type { Tool } from '@/tools/tools.types';

const route = useRoute();
const { t, te, locale } = useI18n();

const i18nKey = computed<string>(() => route.path.trim().replace('/', ''));
const toolTitle = computed<string>(() => t(`tools.${i18nKey.value}.title`, String(route.meta.name)));
const toolDescription = computed<string>(() => t(`tools.${i18nKey.value}.description`, String(route.meta.description)));

const canonicalUrl = computed(() => `https://myutl.com${route.path}`);

const head = computed<HeadObject>(() => ({
  title: t('layout.toolPageTitle', { tool: toolTitle.value }),
  meta: [
    {
      name: 'description',
      content: toolDescription.value,
    },
    {
      name: 'keywords',
      content: [
        ...((route.meta.keywords ?? []) as string[]),
        ...t('layout.keywords').split(',').map((k: string) => k.trim()),
        'myutl',
      ].join(','),
    },
    // Open Graph
    { property: 'og:title', content: `${toolTitle.value} - MyUtl` },
    { property: 'og:description', content: toolDescription.value },
    { property: 'og:url', content: canonicalUrl.value },
    { property: 'og:type', content: 'website' },
    // Twitter
    { name: 'twitter:title', content: `${toolTitle.value} - MyUtl` },
    { name: 'twitter:description', content: toolDescription.value },
  ],
  link: [
    { rel: 'canonical', href: canonicalUrl.value },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        'name': toolTitle.value,
        'description': toolDescription.value,
        'url': canonicalUrl.value,
        'applicationCategory': 'UtilitiesApplication',
        'operatingSystem': 'Any',
        'browserRequirements': 'Requires JavaScript',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD',
        },
        'provider': {
          '@type': 'Organization',
          'name': 'MyUtl',
          'url': 'https://myutl.com',
        },
      }),
    },
  ],
}));
useHead(head);

// 判断 i18n key 是否存在（兼容 vue-i18n v9 编译模式）
function hasKey(key: string): boolean {
  return te(key, locale.value);
}

// FAQ 数据（通用 + 工具特定）
const faqs = computed(() => {
  const toolKey = i18nKey.value;
  const base = [1, 2, 3].flatMap((n) => {
    const qKey = `tools.${toolKey}.faq${n}q`;
    const aKey = `tools.${toolKey}.faq${n}a`;
    if (hasKey(qKey) && hasKey(aKey)) {
      return [{ q: t(qKey), a: t(aKey) }];
    }
    return [];
  });

  // 通用 FAQ（key 已在 i18n 中定义，无需 fallback）
  if (base.length === 0) {
    return [
      { q: t('tools.common.faqSafe'), a: t('tools.common.faqSafeA') },
      { q: t('tools.common.faqFree'), a: t('tools.common.faqFreeA') },
      { q: t('tools.common.faqMobile'), a: t('tools.common.faqMobileA') },
    ];
  }
  return base;
});

// 使用步骤（工具特定，有则显示）
const howToSteps = computed(() => {
  const toolKey = i18nKey.value;
  const steps = [];
  for (let i = 1; i <= 5; i++) {
    const key = `tools.${toolKey}.step${i}`;
    if (hasKey(key)) steps.push(t(key));
  }
  return steps;
});
</script>

<template>
  <BaseLayout>
    <!-- 工具标题区 -->
    <div class="tool-header-wrap">
      <div class="tool-header">
        <div class="tool-header-top">
          <h1 class="tool-title">
            {{ toolTitle }}
          </h1>
          <FavoriteButton :tool="{ name: route.meta.name, path: route.path } as Tool" />
        </div>
        <div class="tool-description">
          {{ toolDescription }}
        </div>
      </div>
    </div>

    <!-- 工具主体 -->
    <div class="tool-content">
      <slot />
    </div>

    <!-- SEO 内容区：使用说明 + FAQ -->
    <div class="seo-section">
      <!-- 如何使用 -->
      <div v-if="howToSteps.length > 0" class="seo-block">
        <h2 class="seo-heading">
          {{ $t('layout.seoHowTo', { tool: toolTitle }) }}
        </h2>
        <ol class="how-to-list">
          <li v-for="(step, i) in howToSteps" :key="i">
            {{ step }}
          </li>
        </ol>
      </div>

      <!-- FAQ -->
      <div v-if="faqs.length > 0" class="seo-block">
        <h2 class="seo-heading">
          {{ $t('layout.seoFaq') }}
        </h2>
        <div class="faq-list">
          <n-collapse>
            <n-collapse-item
              v-for="(faq, i) in faqs"
              :key="i"
              :title="faq.q"
              :name="String(i)"
            >
              {{ faq.a }}
            </n-collapse-item>
          </n-collapse>
        </div>
      </div>
    </div>
  </BaseLayout>
</template>

<style lang="less" scoped>
// ── 标题区 ────────────────────────────────────────────────────────────────
.tool-header-wrap {
  width: 100%;
}

.tool-header {
  max-width: 720px;
  padding: 24px 0 20px;

  @media (max-width: 768px) {
    padding: 16px 0 14px;
  }
}

.tool-header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.tool-title {
  font-size: 28px;
  font-weight: 600;
  opacity: 0.88;
  margin: 0;
  line-height: 1.2;
  letter-spacing: -0.3px;

  @media (max-width: 768px) {
    font-size: 22px;
  }
}

.tool-description {
  margin: 6px 0 0;
  font-size: 13.5px;
  opacity: 0.55;
  line-height: 1.6;
}

// ── 工具内容区 ────────────────────────────────────────────────────────────
// 默认：子元素最宽 600px 居中（表单类工具）
// 全宽：子元素带 .tool-wide 时撑满（双面板编辑器等）
.tool-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  // 默认子元素：最宽 600px
  ::v-deep(& > *:not(.tool-wide)) {
    width: 100%;
    max-width: 600px;
    box-sizing: border-box;
  }

  // 全宽子元素
  ::v-deep(& > .tool-wide) {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
}

// ── SEO 区 ───────────────────────────────────────────────────────────────
.seo-section {
  max-width: 800px;
  width: 100%;
  margin: 40px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.seo-block {
  border-top: 1px solid var(--n-border-color, #e8e8e8);
  padding-top: 20px;
}

.seo-heading {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px;
  opacity: 0.8;
}

.how-to-list {
  padding-left: 20px;
  margin: 0;

  li {
    margin-bottom: 8px;
    font-size: 13.5px;
    line-height: 1.7;
    opacity: 0.75;
  }
}

.faq-list {
  font-size: 13.5px;
}
</style>
