<script setup lang="ts">
import { useHead } from '@vueuse/head';
import { RouterLink } from 'vue-router';
import { articles } from './articles/articles.data';

useHead({
  title: 'Blog - Developer Tools Guides | MyUtl',
  meta: [
    { name: 'description', content: 'In-depth guides and tutorials for every developer tool on MyUtl. Learn hashing, encoding, regex, networking, and more.' },
    { name: 'keywords', content: 'developer tools guides, programming tutorials, online tools blog, web development tips' },
    { property: 'og:title', content: 'Blog - Developer Tools Guides | MyUtl' },
    { property: 'og:description', content: 'In-depth guides and tutorials for every developer tool on MyUtl.' },
  ],
});

const categories = computed(() => {
  const cats = [...new Set(articles.map(a => a.category))];
  return cats;
});

const activeCategory = ref('All');

const filteredArticles = computed(() => {
  if (activeCategory.value === 'All') return articles;
  return articles.filter(a => a.category === activeCategory.value);
});

const searchQuery = ref('');

const displayedArticles = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return filteredArticles.value;
  return filteredArticles.value.filter(a =>
    a.title.toLowerCase().includes(q)
    || a.description.toLowerCase().includes(q)
    || a.keywords.some(k => k.toLowerCase().includes(q)),
  );
});
</script>

<template>
  <div class="blog-page">
    <!-- Hero -->
    <div class="blog-hero">
      <h1 class="blog-title">
        Developer Tools Guides
      </h1>
      <p class="blog-subtitle">
        In-depth articles on hashing, encoding, networking, regex, and every tool on MyUtl.
      </p>
      <div class="blog-search-wrap">
        <n-input
          v-model:value="searchQuery"
          placeholder="Search articles..."
          size="large"
          clearable
          class="blog-search"
        >
          <template #prefix>
            <icon-mdi-magnify style="opacity:0.5" />
          </template>
        </n-input>
      </div>
    </div>

    <!-- Category Tabs -->
    <div class="category-tabs">
      <button
        class="cat-tab"
        :class="{ active: activeCategory === 'All' }"
        @click="activeCategory = 'All'"
      >
        All ({{ articles.length }})
      </button>
      <button
        v-for="cat in categories"
        :key="cat"
        class="cat-tab"
        :class="{ active: activeCategory === cat }"
        @click="activeCategory = cat"
      >
        {{ cat }}
      </button>
    </div>

    <!-- Article Grid -->
    <div v-if="displayedArticles.length > 0" class="article-grid">
      <RouterLink
        v-for="article in displayedArticles"
        :key="article.slug"
        :to="`/blog/${article.slug}`"
        class="article-card"
      >
        <div class="article-cat">
          {{ article.category }}
        </div>
        <h2 class="article-title">
          {{ article.title }}
        </h2>
        <p class="article-desc">
          {{ article.description }}
        </p>
        <div class="article-footer">
          <span class="article-date">{{ article.publishedAt }}</span>
          <span class="article-read">Read →</span>
        </div>
      </RouterLink>
    </div>

    <div v-else class="no-results">
      No articles found for "{{ searchQuery }}"
    </div>
  </div>
</template>

<style scoped lang="less">
.blog-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.blog-hero {
  text-align: center;
  padding: 48px 0 32px;
}

.blog-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 12px;
  line-height: 1.2;
}

.blog-subtitle {
  font-size: 16px;
  opacity: 0.65;
  margin: 0 0 28px;
  max-width: 560px;
  margin-left: auto;
  margin-right: auto;
}

.blog-search-wrap {
  max-width: 480px;
  margin: 0 auto;
}

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 0 32px;
}

.cat-tab {
  padding: 6px 16px;
  border-radius: 20px;
  border: 1px solid rgba(128,128,128,0.25);
  background: transparent;
  font-size: 13px;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  transition: all 0.15s;

  &:hover {
    opacity: 1;
    border-color: var(--n-text-color, #333);
  }

  &.active {
    opacity: 1;
    background: var(--n-primary-color, #6366f1);
    border-color: var(--n-primary-color, #6366f1);
    color: #fff;
  }
}

.article-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.article-card {
  display: flex;
  flex-direction: column;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid rgba(128,128,128,0.15);
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;

  &:hover {
    border-color: rgba(99, 102, 241, 0.4);
    box-shadow: 0 4px 20px rgba(99, 102, 241, 0.1);
    transform: translateY(-2px);
  }
}

.article-cat {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6366f1;
  margin-bottom: 10px;
}

.article-title {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  margin: 0 0 10px;
}

.article-desc {
  font-size: 13px;
  opacity: 0.65;
  line-height: 1.6;
  flex: 1;
  margin: 0 0 16px;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  opacity: 0.5;
}

.article-read {
  font-weight: 600;
  opacity: 1;
  color: #6366f1;
}

.no-results {
  text-align: center;
  padding: 60px;
  opacity: 0.5;
  font-size: 15px;
}
</style>
