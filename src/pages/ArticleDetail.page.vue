<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router';
import { useHead } from '@vueuse/head';
import { getArticleDetailCached, prefetchArticleDetail, pickLang, hasZh } from '../lib/articles';
import { splitLocale } from '../lib/locales';
import type { DbArticle } from '../lib/articles';

const route = useRoute();
const { t } = useI18n();
const slug = computed(() => route.params.slug as string);

// 语言以 URL 前缀为准（与 App.vue 的全局 locale 管理一致）。
// 注意：不在此设置 locale.value —— App.vue 已统一按 URL 设语言；
// 组件再设会和 App.vue 抢，且导航到裸 /zh 时把全站打回英文（旧 bug）。
const isZh = computed(() => splitLocale(route.path).locale.code === 'zh');
const blogPrefix = computed(() => (isZh.value ? '/zh' : ''));

// ─── State ────────────────────────────────────────────────────────────────────
const article = ref<DbArticle | null>(null);
const relatedArticles = ref<DbArticle[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// 按当前语言挑选展示字段（缺译回落英文）
const view = computed(() => (article.value ? pickLang(article.value, isZh.value) : null));

// 仅当文章 toolPath 与主题相关时才显示 "Try the Tool" CTA。
// 白名单来自构建时生成的 /article-tools.json（DB 里约 26% 的 toolPath 是历史错配）。
const toolPathMap = ref<Record<string, string>>({});
fetch('/article-tools.json')
  .then(r => (r.ok ? r.json() : {}))
  .then((m) => { toolPathMap.value = m; })
  .catch(() => {});
const effectiveToolPath = computed(() => toolPathMap.value[slug.value] || '');

// ─── Fetch article from Supabase ──────────────────────────────────────────────
async function fetchArticle(s: string) {
  loading.value = true;
  error.value = null;
  article.value = null;
  relatedArticles.value = [];

  try {
    const { article: data, related } = await getArticleDetailCached(s);
    article.value = data;
    relatedArticles.value = related;
  }
  catch (e: any) {
    error.value = e?.status === 404
      ? t('blog.notFound')
      : (e?.message ?? '加载失败，请稍后重试');
  }
  finally {
    loading.value = false;
  }
}

// Re-fetch when slug changes
watch(slug, fetchArticle, { immediate: true });

// ─── SEO ──────────────────────────────────────────────────────────────────────
const canonicalUrl = computed(() => `https://myutl.com${blogPrefix.value}/blog/${slug.value}`);

watchEffect(() => {
  if (!article.value || !view.value) {
    return;
  }
  // 仅当该文有中文版时才发 zh hreflang，避免指向空壳；x-default 指英文。
  const enUrl = `https://myutl.com/blog/${slug.value}`;
  const zhUrl = `https://myutl.com/zh/blog/${slug.value}`;
  const alt: Array<Record<string, string>> = [
    { rel: 'alternate', hreflang: 'en', href: enUrl },
  ];
  if (hasZh(article.value)) {
    alt.push({ rel: 'alternate', hreflang: 'zh-Hans', href: zhUrl });
  }
  alt.push({ rel: 'alternate', hreflang: 'x-default', href: enUrl });

  useHead({
    title: `${view.value.title} | MyUtl Blog`,
    meta: [
      { name: 'description', content: view.value.description },
      { name: 'keywords', content: view.value.keywords.join(', ') },
      { property: 'og:title', content: view.value.title },
      { property: 'og:description', content: view.value.description },
      { property: 'og:url', content: canonicalUrl.value },
      { property: 'og:type', content: 'article' },
      { property: 'og:locale', content: isZh.value ? 'zh_CN' : 'en_US' },
      { property: 'article:published_time', content: article.value.published_at },
      { property: 'article:section', content: article.value.category },
    ],
    link: [{ rel: 'canonical', href: canonicalUrl.value }, ...alt],
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          'headline': view.value.title,
          'description': view.value.description,
          'datePublished': article.value.published_at,
          'inLanguage': isZh.value ? 'zh-CN' : 'en',
          'url': canonicalUrl.value,
          'publisher': { '@type': 'Organization', 'name': 'MyUtl', 'url': 'https://myutl.com' },
          'keywords': view.value.keywords.join(', '),
        }),
      },
    ],
  });
});
</script>

<template>
  <div class="article-page">
    <!-- Loading -->
    <div v-if="loading" class="state-center">
      <n-spin size="large" />
    </div>

    <!-- Error / Not Found -->
    <div v-else-if="error || !article || !view" class="not-found">
      <h2>{{ t('blog.notFound') }}</h2>
      <RouterLink :to="`${blogPrefix}/blog`">
        {{ t('blog.backToBlog') }}
      </RouterLink>
    </div>

    <!-- Article -->
    <template v-else>
      <!-- Breadcrumb -->
      <nav class="breadcrumb">
        <RouterLink to="/">
          {{ t('blog.home') }}
        </RouterLink>
        <span class="sep">›</span>
        <RouterLink :to="`${blogPrefix}/blog`">
          {{ t('blog.blog') }}
        </RouterLink>
        <span class="sep">›</span>
        <span>{{ article.category }}</span>
      </nav>

      <!-- Article Header -->
      <header class="article-header">
        <div class="article-meta">
          <span class="article-cat">{{ article.category }}</span>
          <span class="article-date">{{ article.published_at }}</span>
        </div>
        <h1 class="article-title">
          {{ view.title }}
        </h1>
        <p class="article-description">
          {{ view.description }}
        </p>
        <RouterLink v-if="effectiveToolPath" :to="effectiveToolPath" class="try-tool-btn">
          <icon-mdi-tools style="margin-right:6px" />
          {{ t('blog.tryTool') }}
        </RouterLink>
      </header>

      <!-- Article Content -->
      <article class="article-content">
        <c-markdown :markdown="view.content" />
      </article>

      <!-- Tags -->
      <div class="article-tags">
        <span v-for="kw in view.keywords" :key="kw" class="tag">{{ kw }}</span>
      </div>

      <!-- CTA -->
      <div v-if="effectiveToolPath" class="article-cta">
        <RouterLink :to="effectiveToolPath" class="cta-btn">
          {{ t('blog.openTool', { name: view.title.split(':')[0] }) }}
        </RouterLink>
      </div>

      <!-- Related Articles -->
      <section v-if="relatedArticles.length > 0" class="related-section">
        <h2 class="related-title">
          {{ t('blog.relatedGuides') }}
        </h2>
        <div class="related-grid">
          <RouterLink
            v-for="rel in relatedArticles"
            :key="rel.slug"
            :to="`${blogPrefix}/blog/${rel.slug}`"
            class="related-card"
            @pointerenter="prefetchArticleDetail(rel.slug)"
            @touchstart.passive="prefetchArticleDetail(rel.slug)"
          >
            <div class="related-card-title">
              {{ pickLang(rel, isZh).title }}
            </div>
            <div class="related-card-desc">
              {{ pickLang(rel, isZh).description }}
            </div>
          </RouterLink>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped lang="less">
.article-page {
  max-width: 780px;
  margin: 0 auto;
  padding: 32px 24px 80px;
}

.state-center {
  display: flex;
  justify-content: center;
  padding: 80px;
}

.breadcrumb {
  font-size: 13px;
  opacity: 0.55;
  margin-bottom: 28px;

  a {
    color: inherit;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }

  .sep {
    margin: 0 6px;
  }
}

.article-header {
  margin-bottom: 40px;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.article-cat {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6366f1;
  padding: 3px 10px;
  border: 1px solid #6366f1;
  border-radius: 20px;
}

.article-date {
  font-size: 13px;
  opacity: 0.5;
}

.article-title {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.3;
  margin: 0 0 16px;
}

.article-description {
  font-size: 16px;
  opacity: 0.7;
  line-height: 1.7;
  margin: 0 0 24px;
}

.try-tool-btn {
  display: inline-flex;
  align-items: center;
  padding: 10px 20px;
  border-radius: 8px;
  background: #6366f1;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  transition: background 0.15s;

  &:hover {
    background: #4f46e5;
  }
}

.article-content {
  line-height: 1.8;
  font-size: 15px;

  :deep(h2) {
    font-size: 22px;
    font-weight: 700;
    margin: 36px 0 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(128,128,128,0.15);
  }

  :deep(h3) {
    font-size: 18px;
    font-weight: 600;
    margin: 28px 0 12px;
  }

  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    font-size: 14px;

    th, td {
      padding: 10px 14px;
      text-align: left;
      border: 1px solid rgba(128,128,128,0.2);
    }

    th {
      font-weight: 600;
      background: rgba(99, 102, 241, 0.06);
    }

    tr:hover td {
      background: rgba(128,128,128,0.04);
    }
  }

  :deep(pre) {
    background: rgba(128,128,128,0.08);
    border-radius: 8px;
    padding: 16px;
    overflow-x: auto;
    font-size: 13px;
    line-height: 1.6;
    margin: 16px 0;
  }

  :deep(code) {
    background: rgba(128,128,128,0.1);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
  }

  :deep(blockquote) {
    border-left: 3px solid #6366f1;
    margin: 20px 0;
    padding: 12px 20px;
    background: rgba(99, 102, 241, 0.05);
    border-radius: 0 8px 8px 0;
  }

  :deep(a) {
    color: #6366f1;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }

  :deep(img) {
    display: block;
    max-width: 100%;
    height: auto;
    border-radius: 10px;
    margin: 20px auto;
  }

  :deep(ul), :deep(ol) {
    padding-left: 24px;
    margin: 12px 0;
    li { margin-bottom: 6px; }
  }
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 32px 0;
}

.tag {
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(128,128,128,0.1);
  font-size: 12px;
  opacity: 0.7;
}

.article-cta {
  background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(167,139,250,0.1));
  border: 1px solid rgba(99,102,241,0.2);
  border-radius: 12px;
  padding: 28px;
  text-align: center;
  margin: 40px 0;
}

.cta-btn {
  display: inline-block;
  padding: 12px 28px;
  background: #6366f1;
  color: #fff;
  border-radius: 8px;
  font-weight: 700;
  font-size: 15px;
  text-decoration: none;
  transition: background 0.15s;

  &:hover {
    background: #4f46e5;
  }
}

.related-section {
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid rgba(128,128,128,0.15);
}

.related-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.related-card {
  display: block;
  padding: 18px;
  border-radius: 10px;
  border: 1px solid rgba(128,128,128,0.15);
  text-decoration: none;
  color: inherit;
  transition: border-color 0.15s;

  &:hover {
    border-color: rgba(99,102,241,0.4);
  }
}

.related-card-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
  line-height: 1.4;
}

.related-card-desc {
  font-size: 12px;
  opacity: 0.6;
  line-height: 1.5;
}

.not-found {
  text-align: center;
  padding: 80px;

  h2 { font-size: 24px; margin-bottom: 16px; }
  a { color: #6366f1; }
}
</style>
