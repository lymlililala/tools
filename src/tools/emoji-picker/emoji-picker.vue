<script setup lang="ts">
import emojiUnicodeData from 'unicode-emoji-json';
import emojiKeywords from 'emojilib';
import _ from 'lodash';
import type { EmojiInfo } from './emoji.types';
import { useFuzzySearch } from '@/composable/fuzzySearch';
import useDebouncedRef from '@/composable/debouncedref';

const escapeUnicode = ({ emoji }: { emoji: string }) => emoji.split('').map(unit => `\\u${unit.charCodeAt(0).toString(16).padStart(4, '0')}`).join('');
const getEmojiCodePoints = ({ emoji }: { emoji: string }) => emoji.codePointAt(0) ? `0x${emoji.codePointAt(0)?.toString(16)}` : undefined;

const emojis = _.map(emojiUnicodeData, (emojiInfo, emoji) => ({
  ...emojiInfo,
  emoji,
  title: _.capitalize(emojiInfo.name),
  keywords: emojiKeywords[emoji as keyof typeof emojiKeywords],
  codePoints: getEmojiCodePoints({ emoji }),
  unicode: escapeUnicode({ emoji }),
}));

const emojisGroups: { emojiInfos: EmojiInfo[]; group: string }[] = _
  .chain(emojis)
  .groupBy('group')
  .map((emojiInfos, group) => ({ group, emojiInfos }))
  .value();

// 防抖搜索（已有 500ms）
const searchQuery = useDebouncedRef('', 300);

const { searchResult } = useFuzzySearch({
  search: searchQuery,
  data: emojis,
  options: {
    keys: ['group', { name: 'name', weight: 3 }, 'keywords', 'unicode', 'codePoints', 'emoji'],
    threshold: 0.3,
    useExtendedSearch: true,
    isCaseSensitive: false,
  },
});

// 当前激活的分组（用于锚点导航高亮）
const activeGroup = ref(emojisGroups[0]?.group ?? '');

function scrollToGroup(group: string) {
  activeGroup.value = group;
  const el = document.getElementById(`emoji-group-${group.replace(/\s+/g, '-')}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// 搜索框 ref，用于 Cmd+K 聚焦
const searchInputRef = ref<HTMLInputElement | null>(null);

function focusSearch() {
  searchInputRef.value?.focus();
}

// 监听 Cmd/Ctrl + K
onMounted(() => {
  window.addEventListener('keydown', handleGlobalKey);
});
onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKey);
});
function handleGlobalKey(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    focusSearch();
  }
}

const isSearching = computed(() => searchQuery.trim().length > 0);
</script>

<template>
  <div class="ep-root">
    <!-- 分类导航锦带 -->
    <div v-if="!isSearching" class="category-nav">
      <button
        v-for="{ group, emojiInfos } in emojisGroups"
        :key="group"
        class="category-btn"
        :class="{ active: activeGroup === group }"
        :title="group"
        @click="scrollToGroup(group)"
      >
        <!-- 每组第一个 Emoji 作为图标 -->
        <span class="category-emoji">{{ emojiInfos[0]?.emoji }}</span>
      </button>
    </div>

    <!-- 搜索框 -->
    <div class="search-row">
      <div class="search-box-wrap">
        <icon-mdi-search class="search-icon" />
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          class="search-input"
          type="text"
          placeholder="搜索 Emoji（如 'smile'）… 或按 ⌘K"
          autocomplete="off"
          spellcheck="false"
        />
        <button
          v-if="searchQuery"
          class="search-clear"
          title="清空搜索"
          @click="searchQuery = ''"
        >
          ×
        </button>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div v-if="isSearching">
      <div v-if="searchResult.length === 0" class="empty-state">
        <div class="empty-icon">🔍</div>
        <div class="empty-title">未找到相关 Emoji</div>
        <div class="empty-hint">试试换个关键词，或直接输入 Unicode 编码</div>
      </div>

      <div v-else>
        <div class="group-title">
          搜索结果 <span class="group-count">{{ searchResult.length }}</span>
        </div>
        <emoji-grid :emoji-infos="searchResult" />
      </div>
    </div>

    <!-- 分组列表 -->
    <div v-else>
      <div
        v-for="{ group, emojiInfos } in emojisGroups"
        :id="`emoji-group-${group.replace(/\s+/g, '-')}`"
        :key="group"
        class="group-section"
      >
        <div class="group-title">
          {{ group }}
          <span class="group-count">{{ emojiInfos.length }}</span>
        </div>
        <emoji-grid :emoji-infos="emojiInfos" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.ep-root {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* ── 分类导航锦带 ── */
.category-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
  padding: 0 0 16px;
}

.category-btn {
  width: 38px;
  height: 38px;
  border: 1.5px solid transparent;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, border-color 0.15s, transform 0.1s;
  padding: 0;
}

.category-btn:hover {
  background: rgba(0, 0, 0, 0.06);
  transform: scale(1.1);
}

.category-btn.active {
  border-color: var(--primary-color, #18a058);
  background: rgba(24, 160, 88, 0.08);
}

.category-emoji {
  font-size: 20px;
  line-height: 1;
}

/* ── 搜索框 ── */
.search-row {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.search-box-wrap {
  position: relative;
  width: 100%;
  max-width: 560px;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #999;
  font-size: 16px;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 10px 36px 10px 38px;
  border: 1.5px solid var(--n-border-color, #e0e0e0);
  border-radius: 24px;
  font-size: 14px;
  background: var(--n-input-color, #fff);
  color: var(--n-text-color, #333);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.search-input::placeholder {
  color: #aaa;
}

.search-input:focus {
  border-color: var(--primary-color, #18a058);
  box-shadow: 0 0 0 3px rgba(24, 160, 88, 0.12);
}

.search-clear {
  position: absolute;
  right: 12px;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: #bbb;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.15s, color 0.15s;
  padding: 0;
  line-height: 1;
}

.search-clear:hover {
  background: rgba(0, 0, 0, 0.08);
  color: #666;
}

/* ── 分组标题 ── */
.group-section {
  margin-bottom: 24px;
  scroll-margin-top: 60px;
}

.group-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--n-text-color, #222);
  margin: 8px 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.group-count {
  font-size: 12px;
  font-weight: 500;
  color: #999;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  padding: 1px 7px;
}

/* ── 空状态 ── */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.empty-icon {
  font-size: 48px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--n-text-color, #333);
}

.empty-hint {
  font-size: 13px;
  color: #999;
}
</style>
