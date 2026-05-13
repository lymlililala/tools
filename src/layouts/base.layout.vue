<script lang="ts" setup>
import { NIcon, useThemeVars } from 'naive-ui';
import { RouterLink } from 'vue-router';
import { Home2, Menu2 } from '@vicons/tabler';

import { storeToRefs } from 'pinia';
import MenuLayout from '../components/MenuLayout.vue';
import { useStyleStore } from '@/stores/style.store';
import { config } from '@/config';
import type { ToolCategory } from '@/tools/tools.types';
import { useToolStore } from '@/tools/tools.store';
import CollapsibleToolMenu from '@/components/CollapsibleToolMenu.vue';

const themeVars = useThemeVars();
const styleStore = useStyleStore();
const version = config.app.version;

const { t } = useI18n();

const toolStore = useToolStore();
const { favoriteTools, toolsByCategory } = storeToRefs(toolStore);

const tools = computed<ToolCategory[]>(() => [
  ...(favoriteTools.value.length > 0 ? [{ name: t('tools.categories.favorite-tools'), components: favoriteTools.value }] : []),
  ...toolsByCategory.value,
]);
</script>

<template>
  <MenuLayout class="menu-layout" :class="{ isSmallScreen: styleStore.isSmallScreen }">
    <template #sider>
      <!-- 紧凑 Logo 区 -->
      <RouterLink to="/" class="logo-bar" @click="styleStore.isSmallScreen && (styleStore.isMenuCollapsed = true)">
        <div class="logo-icon">
          <icon-mdi-tools style="font-size:18px" />
        </div>
        <div class="logo-text">
          <span class="logo-name">MyUtl</span>
          <span class="logo-tagline">在线工具箱</span>
        </div>
      </RouterLink>

      <!-- 工具菜单（含搜索框） -->
      <div class="sider-menu">
        <CollapsibleToolMenu :tools-by-category="tools" />
      </div>

      <!-- 底部版权 -->
      <div class="sider-footer">
        <span>© {{ new Date().getFullYear() }} MyUtl</span>
        <span v-if="version" style="opacity:0.3"> · v{{ version }}</span>
      </div>
    </template>

    <template #content>
      <!-- 顶部 Navbar -->
      <div class="topbar">
        <div class="topbar-left">
          <c-button
            circle
            variant="text"
            :aria-label="$t('home.toggleMenu')"
            @click="styleStore.isMenuCollapsed = !styleStore.isMenuCollapsed"
          >
            <NIcon size="22" :component="Menu2" />
          </c-button>

          <c-tooltip :tooltip="$t('home.home')" position="bottom">
            <c-button to="/" circle variant="text" :aria-label="$t('home.home')">
              <NIcon size="22" :component="Home2" />
            </c-button>
          </c-tooltip>

          <command-palette />
        </div>

      </div>

      <!-- 页面内容 -->
      <div class="page-content">
        <slot />
      </div>
    </template>
  </MenuLayout>
</template>

<style lang="less" scoped>
// ─── Logo Bar ───────────────────────────────────────────────
.logo-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px 12px;
  text-decoration: none;
  border-bottom: 1px solid v-bind('themeVars.dividerColor');
  transition: background 0.15s;

  &:hover {
    background: v-bind('themeVars.buttonColor2Hover');
  }
}

.logo-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: linear-gradient(135deg, #18a058 0%, #6366f1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.logo-name {
  font-size: 16px;
  font-weight: 700;
  color: v-bind('themeVars.textColor1');
  letter-spacing: -0.3px;
}

.logo-tagline {
  font-size: 11px;
  opacity: 0.45;
  margin-top: 1px;
}

// ─── Sider Menu ──────────────────────────────────────────────
.sider-menu {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 8px;
}

// ─── Sider Footer ────────────────────────────────────────────
.sider-footer {
  padding: 10px 14px;
  font-size: 11px;
  opacity: 0.4;
  border-top: 1px solid v-bind('themeVars.dividerColor');
  text-align: center;
  flex-shrink: 0;
}

// ─── Topbar ──────────────────────────────────────────────────
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px 6px 4px;
  border-bottom: 1px solid v-bind('themeVars.dividerColor');
  position: sticky;
  top: 0;
  z-index: 100;
  background: v-bind('themeVars.baseColor');
  flex-shrink: 0;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 2px;
}

// ─── Page Content ────────────────────────────────────────────
.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px 26px;
}
</style>
