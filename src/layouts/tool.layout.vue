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
  title: `${toolTitle.value} - MyUtl 在线工具箱`,
  meta: [
    {
      name: 'description',
      content: toolDescription.value,
    },
    {
      name: 'keywords',
      content: [
        ...((route.meta.keywords ?? []) as string[]),
        '在线工具', '免费', 'myutl',
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

  // 通用 FAQ
  if (base.length === 0) {
    return [
      {
        q: t('tools.common.faqSafe', '该工具安全吗？会上传我的数据吗？'),
        a: t('tools.common.faqSafeA', '完全安全。所有处理均在您的浏览器本地完成，不会上传任何数据到服务器。'),
      },
      {
        q: t('tools.common.faqFree', '该工具免费吗？'),
        a: t('tools.common.faqFreeA', '完全免费，无需注册，无需登录，永久免费使用。'),
      },
      {
        q: t('tools.common.faqMobile', '支持手机使用吗？'),
        a: t('tools.common.faqMobileA', '支持。MyUtl 已针对移动端优化，可在手机和平板上正常使用。'),
      },
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
    <div class="tool-layout">
      <div class="tool-header">
        <div flex flex-nowrap items-center justify-between>
          <n-h1>
            {{ toolTitle }}
          </n-h1>

          <div>
            <FavoriteButton :tool="{ name: route.meta.name, path: route.path } as Tool" />
          </div>
        </div>

        <div class="separator" />

        <div class="description">
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
          如何使用{{ toolTitle }}
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
          常见问题
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
// ── 工具内容区 ────────────────────────────────────────────────────────────
// 默认：居中，子元素最宽 600px（适合表单类工具）
// 全宽模式（子元素带 .tool-wide 时）：撑满可用宽度
.tool-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  // 默认子元素宽度：最宽 600px（窄工具）
  ::v-deep(& > *:not(.tool-wide)) {
    width: 100%;
    max-width: 600px;
    box-sizing: border-box;
  }

  // 全宽子元素：撑满可用宽度（双面板编辑器等）
  ::v-deep(& > .tool-wide) {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
}

// ── 工具标题区 ────────────────────────────────────────────────────────────
.tool-layout {
  width: 100%;
  box-sizing: border-box;

  .tool-header {
    max-width: 760px;
    padding: 36px 0 28px;
    width: 100%;

    .n-h1 {
      opacity: 0.9;
      font-size: 38px;
      font-weight: 400;
      margin: 0;
      line-height: 1;
    }

    .separator {
      width: 200px;
      height: 2px;
      background: rgb(161, 161, 161);
      opacity: 0.2;
      margin: 10px 0;
    }

    .description {
      margin: 0;
      opacity: 0.7;
    }
  }
}

.seo-section {
  max-width: 860px;
  width: 100%;
  margin: 48px auto 0;
  padding: 0 4px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.seo-block {
  border-top: 1px solid var(--n-border-color, #e8e8e8);
  padding-top: 24px;
}

.seo-heading {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px;
  opacity: 0.85;
}

.how-to-list {
  padding-left: 20px;
  margin: 0;

  li {
    margin-bottom: 10px;
    font-size: 14px;
    line-height: 1.7;
    opacity: 0.8;
  }
}

.faq-list {
  font-size: 14px;
}
</style>
