<script setup lang="ts">
import { useRoute, RouterLink } from 'vue-router';
import { useHead } from '@vueuse/head';
import { articles } from './articles/articles.data';

const route = useRoute();
const slug = computed(() => route.params.slug as string);

const article = computed(() => articles.find(a => a.slug === slug.value));

// Redirect to 404 if not found is handled by router
const relatedArticles = computed(() => {
  if (!article.value) return [];
  return articles
    .filter(a => a.slug !== slug.value && a.category === article.value!.category)
    .slice(0, 3);
});

const canonicalUrl = computed(() => `https://myutl.com/blog/${slug.value}`);

watchEffect(() => {
  if (!article.value) return;
  useHead({
    title: `${article.value.title} | MyUtl Blog`,
    meta: [
      { name: 'description', content: article.value.description },
      { name: 'keywords', content: article.value.keywords.join(', ') },
      { property: 'og:title', content: article.value.title },
      { property: 'og:description', content: article.value.description },
      { property: 'og:url', content: canonicalUrl.value },
      { property: 'og:type', content: 'article' },
      { property: 'article:published_time', content: article.value.publishedAt },
      { property: 'article:section', content: article.value.category },
    ],
    link: [{ rel: 'canonical', href: canonicalUrl.value }],
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          'headline': article.value.title,
          'description': article.value.description,
          'datePublished': article.value.publishedAt,
          'url': canonicalUrl.value,
          'publisher': { '@type': 'Organization', 'name': 'MyUtl', 'url': 'https://myutl.com' },
          'keywords': article.value.keywords.join(', '),
        }),
      },
    ],
  });
});
</script>

<template>
  <div class="article-page">
    <template v-if="article">
      <!-- Breadcrumb -->
      <nav class="breadcrumb">
        <RouterLink to="/">Home</RouterLink>
        <span class="sep">›</span>
        <RouterLink to="/blog">Blog</RouterLink>
        <span class="sep">›</span>
        <span>{{ article.category }}</span>
      </nav>

      <!-- Article Header -->
      <header class="article-header">
        <div class="article-meta">
          <span class="article-cat">{{ article.category }}</span>
          <span class="article-date">{{ article.publishedAt }}</span>
        </div>
        <h1 class="article-title">
          {{ article.title }}
        </h1>
        <p class="article-description">
          {{ article.description }}
        </p>
        <RouterLink :to="article.toolPath" class="try-tool-btn">
          <icon-mdi-tools style="margin-right:6px" />
          Try the Tool →
        </RouterLink>
      </header>

      <!-- Article Content (rendered as markdown via c-markdown) -->
      <article class="article-content">
        <c-markdown :value="article.content" />
      </article>

      <!-- Tags -->
      <div class="article-tags">
        <span v-for="kw in article.keywords" :key="kw" class="tag">{{ kw }}</span>
      </div>

      <!-- CTA -->
      <div class="article-cta">
        <RouterLink :to="article.toolPath" class="cta-btn">
          🚀 Open {{ article.title.split(':')[0] }} Tool
        </RouterLink>
      </div>

      <!-- Related Articles -->
      <section v-if="relatedArticles.length > 0" class="related-section">
        <h2 class="related-title">
          Related Guides
        </h2>
        <div class="related-grid">
          <RouterLink
            v-for="rel in relatedArticles"
            :key="rel.slug"
            :to="`/blog/${rel.slug}`"
            class="related-card"
          >
            <div class="related-card-title">
              {{ rel.title }}
            </div>
            <div class="related-card-desc">
              {{ rel.description }}
            </div>
          </RouterLink>
        </div>
      </section>
    </template>

    <!-- 404 fallback -->
    <div v-else class="not-found">
      <h2>Article not found</h2>
      <RouterLink to="/blog">← Back to Blog</RouterLink>
    </div>
  </div>
</template>

<style scoped lang="less">
.article-page {
  max-width: 780px;
  margin: 0 auto;
  padding: 32px 24px 80px;
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
