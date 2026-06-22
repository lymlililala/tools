<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { NIcon, useThemeVars } from 'naive-ui';
import { RouterLink, useRoute } from 'vue-router';
import {
  ArrowsRightLeft,
  Code,
  Database,
  LetterT,
  Lock,
  MathFunction,
  Photo,
  Star,
  Tool as ToolIcon,
  Wifi,
  World,
} from '@vicons/tabler';
import MenuIconItem from './MenuIconItem.vue';
import type { Tool, ToolCategory } from '@/tools/tools.types';
import { toolTitleOf } from '@/lib/tool-i18n-keys';

const props = withDefaults(defineProps<{ toolsByCategory?: ToolCategory[] }>(), { toolsByCategory: () => [] });
const { toolsByCategory } = toRefs(props);
const route = useRoute();
const { t, te, locale } = useI18n();

const makeLabel = (tool: Tool) => () => h(RouterLink, { to: tool.path }, { default: () => toolTitleOf(tool, t, te) });
const makeIcon = (tool: Tool) => () => h(MenuIconItem, { tool });

const collapsedCategories = useStorage<Record<string, boolean>>(
  'menu-tool-option:collapsed-categories',
  {},
  undefined,
  {
    deep: true,
    serializer: {
      read: v => (v ? JSON.parse(v) : null),
      write: v => JSON.stringify(v),
    },
  },
);

// 分类图标映射
const CATEGORY_ICONS: Record<string, any> = {
  'your favorite tools': Star,
  'favorite-tools': Star,
  'crypto': Lock,
  'converter': ArrowsRightLeft,
  'web': World,
  'images & videos': Photo,
  'images and videos': Photo,
  'development': Code,
  'network': Wifi,
  'math': MathFunction,
  'text': LetterT,
  'data': Database,
  'default': ToolIcon,
};

function getCategoryIcon(name: string) {
  const key = name.toLowerCase().trim();
  return CATEGORY_ICONS[key] ?? ToolIcon;
}

function categoryContainsCurrentRoute(components: Tool[]) {
  return components.some(t => t.path === route.path);
}

function isCategoryExpanded(name: string, components: Tool[]) {
  if (name in collapsedCategories.value) {
    return !collapsedCategories.value[name];
  }
  return categoryContainsCurrentRoute(components);
}

function toggleCategoryCollapse({ name }: { name: string }) {
  const cur = isCategoryExpanded(name, []);
  collapsedCategories.value[name] = cur;
}

const search = ref('');

const menuOptions = computed(() => {
  // 读一下 locale，切语言时强制重算菜单标签（label 渲染函数按当前语言取名）。
  void locale.value;
  const q = search.value.trim().toLowerCase();
  return toolsByCategory.value
    .map(({ name, components }) => {
      const filteredTools = q
        ? components.filter(tool =>
          toolTitleOf(tool, t, te).toLowerCase().includes(q)
          || tool.name.toLowerCase().includes(q)
          || tool.keywords.some(k => k.toLowerCase().includes(q)),
        )
        : components;
      return {
        name,
        components,
        filteredTools,
        isExpanded: q ? filteredTools.length > 0 : isCategoryExpanded(name, components),
        tools: filteredTools.map(tool => ({
          label: makeLabel(tool),
          icon: makeIcon(tool),
          key: tool.path,
        })),
      };
    })
    .filter(c => c.filteredTools.length > 0);
});

function expandAll() {
  toolsByCategory.value.forEach(({ name }) => {
    collapsedCategories.value[name] = false;
  });
}
function collapseAll() {
  toolsByCategory.value.forEach(({ name }) => {
    collapsedCategories.value[name] = true;
  });
}

const themeVars = useThemeVars();
</script>

<template>
  <!-- 搜索框 -->
  <div class="menu-search">
    <n-input
      v-model:value="search"
      size="small"
      clearable
      :placeholder="$t('menu.searchPlaceholder')"
    >
      <template #prefix>
        <icon-mdi-magnify style="opacity:0.45" />
      </template>
    </n-input>

    <div v-if="!search" class="expand-actions">
      <span class="action-btn" @click="expandAll">{{ $t('menu.expandAll') }}</span>
      <span class="sep">·</span>
      <span class="action-btn" @click="collapseAll">{{ $t('menu.collapseAll') }}</span>
    </div>
  </div>

  <!-- 分类列表 -->
  <div v-for="{ name, components, tools, isExpanded } of menuOptions" :key="name" class="category-block">
    <div
      class="category-header"
      :class="{ active: categoryContainsCurrentRoute(components) }"
      @click="toggleCategoryCollapse({ name })"
    >
      <!-- 分类图标 -->
      <div class="cat-icon">
        <NIcon :component="getCategoryIcon(name)" size="14" />
      </div>
      <span class="cat-name">{{ name }}</span>
      <span class="cat-count">{{ components.length }}</span>
      <span class="chevron" :class="{ expanded: isExpanded }">
        <icon-mdi-chevron-right />
      </span>
    </div>

    <n-collapse-transition :show="isExpanded">
      <div class="menu-wrapper">
        <div class="toggle-bar" @click="toggleCategoryCollapse({ name })" />
        <n-menu
          class="menu"
          :value="route.path"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :options="tools"
          :indent="8"
          :default-expand-all="true"
        />
      </div>
    </n-collapse-transition>
  </div>

  <div v-if="search && menuOptions.length === 0" class="no-results">
    {{ $t('menu.noResults', { query: search }) }}
  </div>
</template>

<style scoped lang="less">
.menu-search {
  padding: 10px 12px 4px;

  .expand-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 5px;
    padding: 0 2px;
    font-size: 11px;

    .action-btn {
      opacity: 0.4;
      cursor: pointer;
      transition: opacity 0.15s;

      &:hover {
        opacity: 0.85;
      }
    }

    .sep {
      opacity: 0.25;
    }
  }
}

.category-block {
  margin-bottom: 1px;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 8px 5px 8px;
  margin: 0 4px;
  border-radius: 7px;
  cursor: pointer;
  transition: background 0.15s;
  user-select: none;

  &:hover {
    background: v-bind('themeVars.buttonColor2Hover');
  }

  &.active {
    .cat-name {
      opacity: 1;
      font-weight: 600;
    }

    .cat-icon {
      opacity: 0.9;
      color: v-bind('themeVars.primaryColor');
    }
  }
}

.cat-icon {
  display: flex;
  align-items: center;
  opacity: 0.4;
  transition: opacity 0.15s, color 0.15s;
  flex-shrink: 0;
}

.cat-name {
  flex: 1;
  font-size: 11.5px;
  opacity: 0.55;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  font-weight: 500;
}

.cat-count {
  font-size: 11px;
  opacity: 0.28;
  min-width: 16px;
  text-align: right;
}

.chevron {
  display: flex;
  align-items: center;
  font-size: 15px;
  opacity: 0.35;
  transition: transform 0.2s ease;
  transform: rotate(0deg);
  flex-shrink: 0;

  &.expanded {
    transform: rotate(90deg);
  }
}

.menu-wrapper {
  display: flex;
  flex-direction: row;

  .menu {
    flex: 1;
    margin-bottom: 2px;

    ::v-deep(.n-menu-item-content::before) {
      left: 0;
      right: 13px;
    }
  }

  .toggle-bar {
    width: 20px;
    opacity: 0.08;
    transition: opacity ease 0.2s;
    position: relative;
    cursor: pointer;
    flex-shrink: 0;

    &::before {
      width: 1.5px;
      height: 100%;
      content: ' ';
      background-color: v-bind('themeVars.textColor3');
      border-radius: 2px;
      position: absolute;
      top: 0;
      left: 12px;
    }

    &:hover {
      opacity: 0.45;
    }
  }
}

.no-results {
  text-align: center;
  padding: 24px 12px;
  opacity: 0.35;
  font-size: 13px;
}
</style>
