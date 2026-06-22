<script setup lang="ts">
// eslint-disable-next-line no-restricted-imports
import { useClipboard, useWindowScroll } from '@vueuse/core';
import { codesByCategories } from './http-status-codes.constants';
import { useFuzzySearch } from '@/composable/fuzzySearch';
import { useStyleStore } from '@/stores/style.store';

const { t } = useI18n();
const styleStore = useStyleStore();
const { copy } = useClipboard();

// ── 搜索 ──────────────────────────────────────────────────────────────────
const search = ref('');
const searchInputRef = ref<HTMLInputElement>();

const { searchResult } = useFuzzySearch({
  search,
  data: codesByCategories.flatMap(({ codes, category }) => codes.map(code => ({ ...code, category }))),
  options: {
    keys: [{ name: 'code', weight: 3 }, { name: 'name', weight: 2 }, 'description', 'category'],
  },
});

const codesByCategoryFiltered = computed(() => {
  if (!search.value) {
    return codesByCategories;
  }
  return [{ category: t('tools.http-status-codes.searchResults'), codes: searchResult.value }];
});

const isSearching = computed(() => search.value.trim().length > 0);
const noResults = computed(() => isSearching.value && searchResult.value.length === 0);

// ── 回到顶部 ──────────────────────────────────────────────────────────────
const { y: scrollY } = useWindowScroll();
const showBackToTop = computed(() => scrollY.value > 400);

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── 锚点跳转 ──────────────────────────────────────────────────────────────
function scrollToCategory(categoryId: string) {
  const el = document.getElementById(categoryId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// 将 "1xx informational response" → "1xx"
function categoryShort(cat: string) {
  return cat.split(' ')[0];
}

function categoryId(cat: string) {
  return `cat-${cat.replace(/\s+/g, '-').toLowerCase()}`;
}

// ── 状态码颜色分类 ────────────────────────────────────────────────────────
interface ColorScheme { badge: string; badgeBg: string; cardBorder: string; cardBorderHover: string; cardBg: string };

function getColorScheme(code: number): ColorScheme {
  if (code < 200) {
    // 1xx - 蓝色：信息性
    return { badge: '#2563eb', badgeBg: 'rgba(37,99,235,0.1)', cardBorder: 'rgba(37,99,235,0.12)', cardBorderHover: 'rgba(37,99,235,0.35)', cardBg: 'rgba(37,99,235,0.02)' };
  }
  if (code < 300) {
    // 2xx - 绿色：成功
    return { badge: '#16a34a', badgeBg: 'rgba(22,163,74,0.1)', cardBorder: 'rgba(22,163,74,0.12)', cardBorderHover: 'rgba(22,163,74,0.4)', cardBg: 'rgba(22,163,74,0.02)' };
  }
  if (code < 400) {
    // 3xx - 黄色：重定向
    return { badge: '#d97706', badgeBg: 'rgba(217,119,6,0.1)', cardBorder: 'rgba(217,119,6,0.12)', cardBorderHover: 'rgba(217,119,6,0.4)', cardBg: 'rgba(217,119,6,0.02)' };
  }
  if (code < 500) {
    // 4xx - 橙红：客户端错误
    return { badge: '#dc2626', badgeBg: 'rgba(220,38,38,0.1)', cardBorder: 'rgba(220,38,38,0.12)', cardBorderHover: 'rgba(220,38,38,0.35)', cardBg: 'rgba(220,38,38,0.02)' };
  }
  // 5xx - 紫红：服务端错误
  return { badge: '#9333ea', badgeBg: 'rgba(147,51,234,0.1)', cardBorder: 'rgba(147,51,234,0.12)', cardBorderHover: 'rgba(147,51,234,0.35)', cardBg: 'rgba(147,51,234,0.02)' };
}

// 分类标题颜色
function getCategoryColor(cat: string): string {
  const n = Number.parseInt(cat);
  if (n === 1) {
    return '#2563eb';
  }
  if (n === 2) {
    return '#16a34a';
  }
  if (n === 3) {
    return '#d97706';
  }
  if (n === 4) {
    return '#dc2626';
  }
  return '#9333ea';
}

// ── 复制状态码信息 ────────────────────────────────────────────────────────
const copiedCode = ref<number | null>(null);
async function copyCode(code: number, name: string) {
  await copy(`${code} ${name}`);
  copiedCode.value = code;
  setTimeout(() => {
    copiedCode.value = null;
  }, 1400);
}
</script>

<template>
  <div class="tool-wide http-wrap" :class="{ dark: styleStore.isDarkTheme }">
    <!-- ── sticky 搜索栏 ─────────────────────────────────────────────── -->
    <div class="search-bar" :class="{ 'is-sticky': scrollY > 80 }">
      <div class="search-inner">
        <icon-mdi-magnify class="search-icon" />
        <input
          ref="searchInputRef"
          v-model="search"
          class="search-input"
          :placeholder="t('tools.http-status-codes.searchPlaceholder')"
          spellcheck="false"
          autofocus
        >
        <button v-if="search" class="search-clear" @click="search = ''">
          <icon-mdi-close class="sc-icon" />
        </button>
      </div>
    </div>

    <!-- ── 快速锚点导航（搜索时隐藏）──────────────────────────────────── -->
    <div v-if="!isSearching" class="toc-nav">
      <button
        v-for="{ category } in codesByCategories"
        :key="category"
        class="toc-btn"
        :style="{ color: getCategoryColor(categoryShort(category)) }"
        @click="scrollToCategory(categoryId(category))"
      >
        {{ categoryShort(category) }}
      </button>
    </div>

    <!-- ── 无结果提示 ────────────────────────────────────────────────── -->
    <div v-if="noResults" class="empty-state">
      <icon-mdi-magnify-close class="es-icon" />
      <span>{{ t('tools.http-status-codes.noResults', { query: search }) }}</span>
    </div>

    <!-- ── 状态码列表 ────────────────────────────────────────────────── -->
    <div
      v-for="{ codes, category } of codesByCategoryFiltered"
      :id="categoryId(category)"
      :key="category"
      class="category-section"
      :class="{ 'category-section--grid': codes.length > 2 }"
    >
      <!-- 分类标题 -->
      <div
        class="category-heading"
        :style="isSearching ? {} : { color: getCategoryColor(categoryShort(category)) }"
      >
        <span
          v-if="!isSearching"
          class="cat-badge"
          :style="{
            background: `${getCategoryColor(categoryShort(category))}18`,
            color: getCategoryColor(categoryShort(category)),
          }"
        >
          {{ categoryShort(category) }}
        </span>
        {{ category }}
      </div>

      <!-- 状态码卡片（双列网格） -->
      <div class="cards-grid">
        <div
          v-for="{ code, description, name, type } of codes"
          :key="code"
          class="status-card"
          :style="{
            'borderColor': getColorScheme(code).cardBorder,
            '--hover-border': getColorScheme(code).cardBorderHover,
            'background': getColorScheme(code).cardBg,
          }"
          @click="copyCode(code, name)"
        >
          <div class="card-left">
            <!-- 状态码数字徽章 -->
            <span
              class="code-badge"
              :style="{
                color: getColorScheme(code).badge,
                background: getColorScheme(code).badgeBg,
              }"
            >{{ code }}</span>

            <div class="card-info">
              <div class="card-name">
                {{ name }}
              </div>
              <div class="card-desc">
                {{ description }}{{ type !== 'HTTP' ? ` · For ${type}.` : '' }}
              </div>
            </div>
          </div>

          <!-- 复制反馈 -->
          <div class="card-copy">
            <icon-mdi-check v-if="copiedCode === code" class="copy-icon success" />
            <icon-mdi-content-copy v-else class="copy-icon" />
          </div>
        </div>
      </div><!-- /cards-grid -->
    </div>

    <!-- ── 回到顶部悬浮按钮 ───────────────────────────────────────────── -->
    <transition name="fade-up">
      <button v-if="showBackToTop" class="back-to-top" :title="t('tools.http-status-codes.backToTop')" @click="scrollToTop">
        <icon-mdi-chevron-up class="btt-icon" />
      </button>
    </transition>
  </div>
</template>

<style lang="less" scoped>
.http-wrap {
  position: relative;
}

// ── sticky 搜索栏 ─────────────────────────────────────────────────────────
.search-bar {
  position: sticky;
  top: 0;
  z-index: 20;
  margin-bottom: 20px;
  padding: 8px 0;
  transition: background 0.2s, box-shadow 0.2s;

  &.is-sticky {
    background: rgba(248, 249, 252, 0.92);
    backdrop-filter: blur(10px);
    box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);

    .dark & {
      background: rgba(15, 17, 28, 0.9);
      box-shadow: 0 1px 8px rgba(0, 0, 0, 0.3);
    }
  }
}

.search-inner {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  font-size: 16px;
  opacity: 0.4;
  pointer-events: none;
}

.search-input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 36px 10px 38px;
  font-size: 14px;
  font-family: inherit;
  border: 1.5px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  background: #ffffff;
  color: inherit;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &::placeholder { color: rgba(0, 0, 0, 0.28); }

  .dark & {
    background: #0f1117;
    border-color: rgba(255, 255, 255, 0.1);
    &:focus { border-color: #818cf8; box-shadow: 0 0 0 3px rgba(129,140,248,0.12); }
    &::placeholder { color: rgba(255,255,255,0.22); }
  }
}

.search-clear {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  opacity: 0.35;
  padding: 4px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  &:hover { opacity: 0.7; }
}

.sc-icon { font-size: 14px; }

// ── TOC 快速导航 ──────────────────────────────────────────────────────────
.toc-nav {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.toc-btn {
  padding: 4px 14px;
  border-radius: 20px;
  border: 1.5px solid currentColor;
  background: transparent;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.12s, background 0.12s;

  &:hover {
    opacity: 1;
    background: color-mix(in srgb, currentColor 10%, transparent);
  }
}

// ── 空状态 ────────────────────────────────────────────────────────────────
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 60px 20px;
  opacity: 0.35;
  text-align: center;
}

.es-icon { font-size: 40px; }

// ── 分类区 ────────────────────────────────────────────────────────────────
.category-section {
  margin-bottom: 28px;
  scroll-margin-top: 70px;
}

// 双列网格容器
.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

.category-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 10px;
  // 加深对比度（原来 op-70 过浅）
  color: rgba(0, 0, 0, 0.72);

  .dark & { color: rgba(255, 255, 255, 0.75); }
}

.cat-badge {
  display: inline-flex;
  align-items: center;
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

// ── 状态码卡片 ────────────────────────────────────────────────────────────
.status-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.1s;

  &:hover {
    border-color: var(--hover-border) !important;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);

    .card-copy { opacity: 0.5; }
  }

  &:active { transform: translateY(0); }
}

.card-left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

// 数字徽章
.code-badge {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 13px;
  font-weight: 800;
  padding: 3px 9px;
  border-radius: 7px;
  flex-shrink: 0;
  letter-spacing: 0.03em;
  font-variant-numeric: tabular-nums;
}

.card-info {
  flex: 1;
  min-width: 0;
}

.card-name {
  font-size: 14px;
  font-weight: 700;
  // 提升对比度（原来 text-lg 无颜色保证）
  color: rgba(0, 0, 0, 0.82);
  line-height: 1.3;

  .dark & { color: rgba(255, 255, 255, 0.85); }
}

.card-desc {
  font-size: 12.5px;
  margin-top: 3px;
  // 提升描述文字对比度（原来 op-70 ≈ 0.3 对比度，不达 WCAG）
  color: rgba(0, 0, 0, 0.52);
  line-height: 1.4;

  .dark & { color: rgba(255, 255, 255, 0.45); }
}

// ── 复制图标 ──────────────────────────────────────────────────────────────
.card-copy {
  flex-shrink: 0;
  margin-left: 10px;
  opacity: 0;
  transition: opacity 0.15s;
}

.copy-icon {
  font-size: 14px;
  &.success { color: #16a34a; opacity: 1 !important; }
}

// ── 回到顶部悬浮按钮 ──────────────────────────────────────────────────────
.back-to-top {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1.5px solid rgba(0, 0, 0, 0.12);
  background: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.15s, transform 0.1s;
  z-index: 50;

  &:hover { box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15); transform: translateY(-2px); }
  &:active { transform: translateY(0); }

  .dark & {
    background: #1a1a2e;
    border-color: rgba(255, 255, 255, 0.12);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  }
}

.btt-icon { font-size: 20px; }

// ── 过渡动画 ──────────────────────────────────────────────────────────────
.fade-up-enter-active, .fade-up-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-up-enter-from, .fade-up-leave-to { opacity: 0; transform: translateY(8px); }
</style>
