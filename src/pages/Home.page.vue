<script setup lang="ts">
import { IconDragDrop, IconHeart } from '@tabler/icons-vue';
import { useHead } from '@vueuse/head';
import { computed } from 'vue';
import Draggable from 'vuedraggable';
import ColoredCard from '../components/ColoredCard.vue';
import ToolCard from '../components/ToolCard.vue';
import { CATEGORY_META } from '@/lib/categories';
import { useToolStore } from '@/tools/tools.store';
import { config } from '@/config';
import { useLocaleRoute } from '@/composables/useLocaleRoute';

const toolStore = useToolStore();
const { t } = useI18n();
const { canonical, ogLocale, alternates } = useLocaleRoute();

useHead(computed(() => ({
  title: t('home.metaTitle'),
  meta: [
    { name: 'description', content: t('home.metaDesc') },
    { property: 'og:title', content: t('home.metaTitle') },
    { property: 'og:description', content: t('home.metaDescShort') },
    { property: 'og:locale', content: ogLocale.value },
  ],
  link: [
    { rel: 'canonical', href: canonical.value },
    ...alternates('/'),
  ],
})));

const favoriteTools = computed(() => toolStore.favoriteTools);

// Update favorite tools order when drag is finished
function onUpdateFavoriteTools() {
  toolStore.updateFavoriteTools(favoriteTools.value); // Update the store with the new order
}
</script>

<template>
  <div class="home-page">
    <!-- SEO H1/H2 -->
    <div class="seo-hero">
      <h1 class="seo-h1">
        {{ $t('home.heroTitle') }}
      </h1>
      <p class="seo-h2">
        {{ $t('home.heroSubtitle') }}
      </p>
    </div>

    <!-- 按分类浏览(链接到分类 hub 页) -->
    <nav class="category-nav" aria-label="Browse tools by category">
      <RouterLink
        v-for="c in CATEGORY_META"
        :key="c.slug"
        :to="`/c/${c.slug}`"
        class="category-chip"
      >
        {{ $t(`home.categoryNav.${c.slug}`) }}
      </RouterLink>
    </nav>

    <div class="tools-grid">
      <ColoredCard v-if="config.showBanner" :title="$t('home.follow.title')" :icon="IconHeart">
        {{ $t('home.follow.p1') }}
        <a
          href="https://github.com/CorentinTh/it-tools"
          rel="noopener"
          target="_blank"
          :aria-label="$t('home.follow.githubRepository')"
        >GitHub</a>
        {{ $t('home.follow.p2') }}
        <a
          href="https://x.com/ittoolsdottech"
          rel="noopener"
          target="_blank"
          :aria-label="$t('home.follow.twitterXAccount')"
        >X</a>.
        {{ $t('home.follow.thankYou') }}
        <n-icon :component="IconHeart" />
      </ColoredCard>
    </div>

    <!-- 收藏工具 -->
    <transition name="height">
      <div v-if="toolStore.favoriteTools.length > 0" class="section">
        <h3 class="section-title">
          {{ $t('home.categories.favoriteTools') }}
          <c-tooltip :tooltip="$t('home.categories.favoritesDndToolTip')">
            <n-icon :component="IconDragDrop" size="16" />
          </c-tooltip>
        </h3>
        <Draggable
          :list="favoriteTools"
          class="tools-grid"
          ghost-class="ghost-favorites-draggable"
          item-key="name"
          @end="onUpdateFavoriteTools"
        >
          <template #item="{ element: tool }">
            <ToolCard :tool="tool" />
          </template>
        </Draggable>
      </div>
    </transition>

    <!-- 最新工具 -->
    <div v-if="toolStore.newTools.length > 0" class="section">
      <h3 class="section-title">
        {{ t('home.categories.newestTools') }}
      </h3>
      <div class="tools-grid">
        <ToolCard v-for="tool in toolStore.newTools" :key="tool.name" :tool="tool" />
      </div>
    </div>

    <!-- 全部工具 -->
    <div class="section">
      <h3 class="section-title">
        {{ $t('home.categories.allTools') }}
      </h3>
      <div class="tools-grid">
        <ToolCard v-for="tool in toolStore.tools" :key="tool.name" :tool="tool" />
      </div>
    </div>

    <!-- 收藏提示 -->
    <div class="bookmark-hint">
      <span>💡 {{ $t('home.bookmarkHint') }}</span>
    </div>
  </div>
</template>

<style scoped lang="less">
// ── 页面容器 ─────────────────────────────────────────────────────────────────
.home-page {
  padding-top: 24px;
}

// ── SEO 标题 ──────────────────────────────────────────────────────────────────
.seo-hero {
  margin-bottom: 20px;
}

// ── 按分类浏览 ────────────────────────────────────────────────────────────────
.category-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 22px;
}

.category-chip {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(128, 128, 128, 0.2);
  font-size: 12.5px;
  text-decoration: none;
  color: inherit;
  opacity: 0.85;
  transition: border-color 0.15s, opacity 0.15s;

  &:hover {
    border-color: rgba(99, 102, 241, 0.5);
    opacity: 1;
  }
}

.seo-h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 6px;
  opacity: 0.88;
  line-height: 1.3;
}

.seo-h2 {
  font-size: 13.5px;
  font-weight: 400;
  margin: 0;
  opacity: 0.5;
  line-height: 1.6;
}

// ── 分区 ─────────────────────────────────────────────────────────────────────
.section {
  margin-top: 28px;
}

.section-title {
  font-size: 11.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  opacity: 0.4;
  margin: 0 0 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

// ── 工具卡片网格 ──────────────────────────────────────────────────────────────
// 使用 auto-fill + minmax，自动响应容器宽度
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
  gap: 10px;

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
}

// ── 拖拽占位 ──────────────────────────────────────────────────────────────────
.ghost-favorites-draggable {
  opacity: 0.4;
  background-color: #ccc;
  border: 2px dashed #666;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  transform: scale(1.1);
  animation: ghost-anim 0.2s ease-out;
}

@keyframes ghost-anim {
  0% { opacity: 0; transform: scale(0.9); }
  100% { opacity: 0.4; transform: scale(1); }
}

// ── 高度过渡 ──────────────────────────────────────────────────────────────────
.height-enter-active,
.height-leave-active {
  transition: all 0.5s ease-in-out;
  overflow: hidden;
  max-height: 500px;
}

.height-enter-from,
.height-leave-to {
  max-height: 42px;
  overflow: hidden;
  opacity: 0;
  margin-bottom: 0;
}

// ── 底部提示 ──────────────────────────────────────────────────────────────────
.bookmark-hint {
  margin-top: 40px;
  padding: 10px 18px;
  border-radius: 8px;
  background: rgba(99, 102, 241, 0.05);
  border: 1px dashed rgba(99, 102, 241, 0.2);
  font-size: 12.5px;
  opacity: 0.65;
  text-align: center;
}
</style>
