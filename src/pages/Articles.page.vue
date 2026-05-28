<script setup lang="ts">
import { useHead } from '@vueuse/head'
import { RouterLink } from 'vue-router'
import { supabase } from '../lib/supabase'
import type { DbArticle } from '../lib/supabase'
import type { Article } from './articles/articles.data'

// 懒加载：文章数据体积大（98k 行），用动态 import 拆分到独立 chunk，不阻塞首屏
let localArticles: Article[] = []
async function loadLocalArticles() {
  if (localArticles.length === 0) {
    const mod = await import('./articles/articles.data')
    localArticles = mod.articles
  }
  return localArticles
}

const { t } = useI18n()

useHead(computed(() => ({
  title: t('blog.metaTitle'),
  meta: [
    { name: 'description', content: t('blog.metaDesc') },
    { name: 'keywords', content: t('blog.metaKeywords') },
    { property: 'og:title', content: t('blog.metaTitle') },
    { property: 'og:description', content: t('blog.metaDescShort') },
    { property: 'og:url', content: 'https://myutl.com/blog' },
  ],
  link: [
    { rel: 'canonical', href: 'https://myutl.com/blog' },
  ],
})))

// ─── State ────────────────────────────────────────────────────────────────────
const articles = ref<DbArticle[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const activeCategory = ref('All')
const searchQuery = ref('')
const currentPage = ref(1)
const PAGE_SIZE = 10

// ─── Convert local article format to DbArticle ───────────────────────────────
function localToDb(a: Article): DbArticle {
  return {
    slug: a.slug,
    tool_path: a.toolPath,
    title: a.title,
    description: a.description,
    keywords: a.keywords,
    category: a.category,
    published_at: a.publishedAt,
    content: a.content,
  }
}

// ─── Local data fallback ─────────────────────────────────────────────────────
async function useLocalArticles() {
  const data = await loadLocalArticles()
  articles.value = data.map(localToDb).sort((a, b) =>
    b.published_at.localeCompare(a.published_at),
  )
}

// ─── Fetch from Supabase, fallback to local data ─────────────────────────────
async function fetchArticles() {
  loading.value = true
  error.value = null

  // Timeout: if Supabase doesn't respond in 5s, fall back to local data
  const timeout = setTimeout(() => {
    if (loading.value) {
      console.warn('Supabase timeout, falling back to local data')
      useLocalArticles().finally(() => { loading.value = false })
    }
  }, 5000)

  try {
    const { data, error: sbError } = await supabase
      .from('tools_articles')
      .select('id, slug, tool_path, title, description, keywords, category, published_at')
      .order('published_at', { ascending: false })

    clearTimeout(timeout)

    if (sbError) {
      console.warn('Supabase unavailable, using local data:', sbError.message)
      await useLocalArticles()
    }
    else {
      articles.value = (data ?? []) as DbArticle[]
      if (articles.value.length === 0)
        await useLocalArticles()
    }
  }
  catch (e: any) {
    clearTimeout(timeout)
    console.warn('Supabase fetch failed, using local data:', e)
    await useLocalArticles()
  }
  finally {
    clearTimeout(timeout)
    loading.value = false
  }
}

onMounted(fetchArticles)

// ─── Computed ─────────────────────────────────────────────────────────────────
const categories = computed(() => {
  const cats = [...new Set(articles.value.map(a => a.category))]
  return cats.sort()
})

const filteredArticles = computed(() => {
  if (activeCategory.value === 'All')
    return articles.value
  return articles.value.filter(a => a.category === activeCategory.value)
})

const searchedArticles = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q)
    return filteredArticles.value
  return filteredArticles.value.filter(a =>
    a.title.toLowerCase().includes(q)
    || a.description.toLowerCase().includes(q)
    || (a.keywords ?? []).some((k: string) => k.toLowerCase().includes(q)),
  )
})

const totalPages = computed(() => Math.ceil(searchedArticles.value.length / PAGE_SIZE))

const displayedArticles = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return searchedArticles.value.slice(start, start + PAGE_SIZE)
})

// Reset to page 1 when filter/search changes
watch([activeCategory, searchQuery], () => {
  currentPage.value = 1
})
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

    <!-- Loading -->
    <div v-if="loading" class="state-placeholder">
      <n-spin size="large" />
      <p>Loading articles...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="state-placeholder error">
      <icon-mdi-alert-circle style="font-size:32px;color:#ef4444" />
      <p>{{ error }}</p>
      <c-button @click="fetchArticles">
        Retry
      </c-button>
    </div>

    <template v-else>
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
            <span class="article-date">{{ article.published_at }}</span>
            <span class="article-read">Read →</span>
          </div>
        </RouterLink>
      </div>

      <div v-else class="no-results">
        No articles found for "{{ searchQuery }}"
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          class="page-btn"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          ← Prev
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          Next →
        </button>
      </div>
    </template>
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

.state-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 80px 24px;
  opacity: 0.6;
  font-size: 15px;

  &.error {
    opacity: 1;
    color: #ef4444;
  }
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

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 40px;
}

.page-btn {
  padding: 8px 20px;
  border-radius: 8px;
  border: 1px solid rgba(128,128,128,0.25);
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  color: inherit;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    border-color: #6366f1;
    color: #6366f1;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
}

.page-info {
  font-size: 14px;
  opacity: 0.6;
  min-width: 60px;
  text-align: center;
}
</style>
