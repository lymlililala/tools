<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router';
import { useHead } from '@vueuse/head';
import ToolCard from '../components/ToolCard.vue';
import { toolsWithCategory } from '@/tools';
import { CATEGORY_META, findCategoryBySlug } from '@/lib/categories';
import { useLocaleRoute } from '@/composables/useLocaleRoute';

const route = useRoute();
const slug = computed(() => route.params.slug as string);
const category = computed(() => findCategoryBySlug(slug.value));
const { canonical, ogLocale, alternates } = useLocaleRoute();

const tools = computed(() =>
  category.value ? toolsWithCategory.filter(t => t.category === category.value!.name) : [],
);

// 该分类下工具对应的相关指南(来自构建时生成的 /tool-guides.json,相关性已过滤)
interface Guide { slug: string; title: string; description: string }
const guides = ref<Guide[]>([]);
let _guideMap: Record<string, Guide[]> | null = null;
async function loadGuides() {
  if (!category.value) {
    guides.value = [];
    return;
  }
  try {
    if (!_guideMap) {
      const res = await fetch('/tool-guides.json');
      _guideMap = res.ok ? await res.json() : {};
    }
    const seen = new Set<string>();
    const out: Guide[] = [];
    for (const t of tools.value) {
      for (const g of (_guideMap![t.path] ?? [])) {
        if (!seen.has(g.slug)) {
          seen.add(g.slug);
          out.push(g);
        }
      }
    }
    guides.value = out.slice(0, 12);
  }
  catch { guides.value = []; }
}
onMounted(loadGuides);
watch(slug, loadGuides);

const otherCategories = computed(() => CATEGORY_META.filter(c => c.slug !== slug.value));

const canonicalUrl = canonical;
watchEffect(() => {
  if (!category.value) {
    return;
  }
  useHead({
    title: `${category.value.label} — Free Online | MyUtl`,
    meta: [
      { name: 'description', content: category.value.description },
      { property: 'og:title', content: `${category.value.label} — MyUtl` },
      { property: 'og:description', content: category.value.description },
      { property: 'og:url', content: canonicalUrl.value },
      { property: 'og:locale', content: ogLocale.value },
    ],
    link: [{ rel: 'canonical', href: canonicalUrl.value }, ...alternates()],
  });
});
</script>

<template>
  <div class="category-page">
    <template v-if="category">
      <header class="cat-header">
        <h1 class="cat-title">
          {{ category.label }}
        </h1>
        <p class="cat-desc">
          {{ category.description }}
        </p>
      </header>

      <div class="tools-grid">
        <ToolCard v-for="tool in tools" :key="tool.name" :tool="tool" />
      </div>

      <section v-if="guides.length" class="cat-guides">
        <h2 class="cat-h2">
          {{ category.label }} Guides
        </h2>
        <div class="guides-grid">
          <RouterLink
            v-for="g in guides"
            :key="g.slug"
            :to="`/blog/${g.slug}`"
            class="guide-card"
          >
            <div class="guide-title">
              {{ g.title }}
            </div>
            <div class="guide-desc">
              {{ g.description }}
            </div>
          </RouterLink>
        </div>
      </section>

      <nav class="other-cats" aria-label="Browse other categories">
        <h2 class="cat-h2">
          Browse other categories
        </h2>
        <div class="other-cats-list">
          <RouterLink
            v-for="c in otherCategories"
            :key="c.slug"
            :to="`/c/${c.slug}`"
            class="other-cat-link"
          >
            {{ c.label }}
          </RouterLink>
        </div>
      </nav>
    </template>

    <div v-else class="not-found">
      <h1>Category not found</h1>
      <RouterLink to="/" class="back-home">
        ← Back to all tools
      </RouterLink>
    </div>
  </div>
</template>

<style scoped lang="less">
.category-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 0 48px;
}

.cat-header {
  margin-bottom: 24px;
}

.cat-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px;
  opacity: 0.9;
}

.cat-desc {
  font-size: 14px;
  opacity: 0.6;
  line-height: 1.6;
  margin: 0;
  max-width: 720px;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
}

.cat-guides,
.other-cats {
  margin-top: 48px;
  padding-top: 28px;
  border-top: 1px solid rgba(128, 128, 128, 0.15);
}

.cat-h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 18px;
}

.guides-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
}

.guide-card {
  display: block;
  padding: 16px;
  border-radius: 10px;
  border: 1px solid rgba(128, 128, 128, 0.15);
  text-decoration: none;
  color: inherit;
  transition: border-color 0.15s;

  &:hover {
    border-color: rgba(99, 102, 241, 0.4);
  }
}

.guide-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
  line-height: 1.4;
}

.guide-desc {
  font-size: 12px;
  opacity: 0.6;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.other-cats-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.other-cat-link {
  display: inline-block;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid rgba(128, 128, 128, 0.18);
  text-decoration: none;
  color: inherit;
  font-size: 13px;
  transition: border-color 0.15s;

  &:hover {
    border-color: rgba(99, 102, 241, 0.4);
  }
}

.not-found {
  text-align: center;
  padding: 60px 0;
}

.back-home {
  color: #6366f1;
  text-decoration: none;
}
</style>
