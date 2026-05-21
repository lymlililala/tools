<script setup lang="ts">
import { IconDragDrop, IconHeart } from '@tabler/icons-vue';
import { useHead } from '@vueuse/head';
import { computed } from 'vue';
import Draggable from 'vuedraggable';
import ColoredCard from '../components/ColoredCard.vue';
import ToolCard from '../components/ToolCard.vue';
import { useToolStore } from '@/tools/tools.store';
import { config } from '@/config';

const toolStore = useToolStore();

useHead({
  title: 'MyUtl - 免费在线工具箱 | 90+ 开发者在线工具',
  meta: [
    { name: 'description', content: 'MyUtl 提供 90+ 免费在线工具，包括 JSON 格式化、Base64 编解码、加密解密、URL 编码、二维码生成、计算器等开发者与日常实用工具，全部在浏览器本地运行，安全无需注册。' },
    { property: 'og:title', content: 'MyUtl - 免费在线工具箱 | 90+ 开发者在线工具' },
    { property: 'og:description', content: 'MyUtl 提供 90+ 免费在线工具，包括 JSON 格式化、Base64 编解码、加密解密等开发者工具。' },
  ],
  link: [
    { rel: 'canonical', href: 'https://myutl.com/' },
  ],
});
const { t } = useI18n();

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
        MyUtl — 免费在线工具箱
      </h1>
      <p class="seo-h2">
        90+ 开发者工具，全部免费、安全、无需注册，直接在浏览器中运行
      </p>
    </div>

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
