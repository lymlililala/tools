<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { useThemeVars } from 'naive-ui';
import { RouterLink, useRoute } from 'vue-router';
import MenuIconItem from './MenuIconItem.vue';
import type { Tool, ToolCategory } from '@/tools/tools.types';

const props = withDefaults(defineProps<{ toolsByCategory?: ToolCategory[] }>(), { toolsByCategory: () => [] });
const { toolsByCategory } = toRefs(props);
const route = useRoute();

const makeLabel = (tool: Tool) => () => h(RouterLink, { to: tool.path }, { default: () => tool.name });
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

// 判断某分类是否包含当前路由
function categoryContainsCurrentRoute(components: Tool[]) {
  return components.some(t => t.path === route.path);
}

// 某分类是否展开：优先用户手动设置，其次当前路由所在分类自动展开
function isCategoryExpanded(name: string, components: Tool[]) {
  if (name in collapsedCategories.value) {
    return !collapsedCategories.value[name];
  }
  // 默认：当前路由所在分类展开，其余折叠
  return categoryContainsCurrentRoute(components);
}

function toggleCategoryCollapse({ name }: { name: string }) {
  const cur = isCategoryExpanded(name, []);
  collapsedCategories.value[name] = cur; // true = collapsed
}

// 搜索
const search = ref('');

const menuOptions = computed(() =>
  toolsByCategory.value
    .map(({ name, components }) => {
      const filteredTools = search.value.trim()
        ? components.filter(t =>
          t.name.toLowerCase().includes(search.value.toLowerCase())
          || t.keywords.some(k => k.toLowerCase().includes(search.value.toLowerCase())),
        )
        : components;
      return {
        name,
        components,
        filteredTools,
        isExpanded: search.value.trim() ? filteredTools.length > 0 : isCategoryExpanded(name, components),
        tools: filteredTools.map(tool => ({
          label: makeLabel(tool),
          icon: makeIcon(tool),
          key: tool.path,
        })),
      };
    })
    .filter(c => c.filteredTools.length > 0),
);

// 展开全部 / 折叠全部
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
      placeholder="搜索工具..."
    >
      <template #prefix>
        <icon-mdi-magnify style="opacity:0.5" />
      </template>
    </n-input>

    <!-- 展开/折叠全部 -->
    <div v-if="!search" class="expand-actions">
      <span class="action-btn" @click="expandAll">全部展开</span>
      <span class="sep">·</span>
      <span class="action-btn" @click="collapseAll">全部折叠</span>
    </div>
  </div>

  <!-- 分类列表 -->
  <div v-for="{ name, components, tools, isExpanded } of menuOptions" :key="name" class="category-block">
    <div
      class="category-header"
      :class="{ active: categoryContainsCurrentRoute(components) }"
      @click="toggleCategoryCollapse({ name })"
    >
      <span class="chevron" :class="{ expanded: isExpanded }">
        <icon-mdi-chevron-right />
      </span>
      <span class="cat-name">{{ name }}</span>
      <span class="cat-count">{{ components.length }}</span>
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
    没有找到 "{{ search }}"
  </div>
</template>

<style scoped lang="less">
.menu-search {
  padding: 10px 12px 6px;

  .expand-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 6px;
    padding: 0 2px;
    font-size: 11px;

    .action-btn {
      opacity: 0.45;
      cursor: pointer;
      transition: opacity 0.15s;

      &:hover {
        opacity: 0.9;
      }
    }

    .sep {
      opacity: 0.3;
    }
  }
}

.category-block {
  margin-bottom: 2px;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 8px 5px 4px;
  margin: 0 6px;
  border-radius: 6px;
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
  }
}

.chevron {
  display: flex;
  align-items: center;
  font-size: 16px;
  opacity: 0.45;
  transition: transform 0.2s ease;
  transform: rotate(0deg);

  &.expanded {
    transform: rotate(90deg);
  }
}

.cat-name {
  flex: 1;
  font-size: 12px;
  opacity: 0.6;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.cat-count {
  font-size: 11px;
  opacity: 0.3;
  min-width: 16px;
  text-align: right;
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
    opacity: 0.1;
    transition: opacity ease 0.2s;
    position: relative;
    cursor: pointer;
    flex-shrink: 0;

    &::before {
      width: 2px;
      height: 100%;
      content: ' ';
      background-color: v-bind('themeVars.textColor3');
      border-radius: 2px;
      position: absolute;
      top: 0;
      left: 12px;
    }

    &:hover {
      opacity: 0.5;
    }
  }
}

.no-results {
  text-align: center;
  padding: 24px 12px;
  opacity: 0.4;
  font-size: 13px;
}
</style>
