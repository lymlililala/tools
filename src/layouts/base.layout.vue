<script lang="ts" setup>
import { NIcon, useThemeVars } from 'naive-ui';
import { RouterLink } from 'vue-router';
import { Home2, Menu2, Moon, Sun } from '@vicons/tabler';

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
      <!-- Logo Bar -->
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

      <!-- Blog 入口 -->
      <RouterLink to="/blog" class="sider-blog-link" @click="styleStore.isSmallScreen && (styleStore.isMenuCollapsed = true)">
        <icon-mdi-newspaper-variant-outline style="font-size:15px;margin-right:6px;opacity:0.6" />
        Blog & Guides
      </RouterLink>

      <!-- 底部版权 -->
      <div class="sider-footer">
        <span>© {{ new Date().getFullYear() }} MyUtl</span>
        <span v-if="version" style="opacity:0.3"> · v{{ version }}</span>
      </div>
    </template>

    <template #content>
      <!-- 顶部 Navbar -->
      <div class="topbar" :class="{ 'topbar--dark': styleStore.isDarkTheme }">
        <div class="topbar-left">
          <c-button
            circle
            variant="text"
            :aria-label="$t('home.toggleMenu')"
            @click="styleStore.isMenuCollapsed = !styleStore.isMenuCollapsed"
          >
            <NIcon size="20" :component="Menu2" />
          </c-button>

          <c-tooltip :tooltip="$t('home.home')" position="bottom">
            <c-button to="/" circle variant="text" :aria-label="$t('home.home')">
              <NIcon size="20" :component="Home2" />
            </c-button>
          </c-tooltip>

          <command-palette />
        </div>

        <div class="topbar-right">
          <c-tooltip tooltip="Blog & Guides" position="bottom">
            <c-button to="/blog" variant="text" :aria-label="'Blog'" class="topbar-blog-btn">
              <icon-mdi-newspaper-variant-outline style="font-size:17px" />
            </c-button>
          </c-tooltip>

          <!-- 深色/浅色切换 -->
          <c-tooltip :tooltip="styleStore.isDarkTheme ? '切换到浅色模式' : '切换到深色模式'" position="bottom">
            <c-button
              circle
              variant="text"
              :aria-label="styleStore.isDarkTheme ? 'Light mode' : 'Dark mode'"
              @click="styleStore.toggleDark()"
            >
              <NIcon size="18" :component="styleStore.isDarkTheme ? Sun : Moon" />
            </c-button>
          </c-tooltip>

          <locale-selector />
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
  border-radius: 9px;
  background: linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #a78bfa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.35);
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
  opacity: 0.4;
  margin-top: 1px;
}

// ─── Sider Menu ──────────────────────────────────────────────
.sider-menu {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 8px;
}

// ─── Blog link ───────────────────────────────────────────────
.sider-blog-link {
  display: flex;
  align-items: center;
  padding: 9px 16px;
  font-size: 13px;
  font-weight: 500;
  color: v-bind('themeVars.textColor2');
  text-decoration: none;
  opacity: 0.7;
  border-top: 1px solid v-bind('themeVars.dividerColor');
  transition: opacity 0.15s, background 0.15s;

  &:hover {
    opacity: 1;
    background: v-bind('themeVars.buttonColor2Hover');
  }
}

// ─── Sider Footer ────────────────────────────────────────────
.sider-footer {
  padding: 10px 14px;
  font-size: 11px;
  opacity: 0.35;
  border-top: 1px solid v-bind('themeVars.dividerColor');
  text-align: center;
  flex-shrink: 0;
}

// ─── Topbar ──────────────────────────────────────────────────
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px 6px 4px;
  border-bottom: 1px solid v-bind('themeVars.dividerColor');
  position: sticky;
  top: 0;
  z-index: 100;
  background: v-bind('themeVars.baseColor');
  flex-shrink: 0;
  transition: background 0.3s, border-color 0.3s;

  &.topbar--dark {
    background: rgba(15, 17, 23, 0.85);
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    border-bottom-color: rgba(255, 255, 255, 0.06);
  }
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 2px;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

// ─── Page Content ────────────────────────────────────────────
.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px 26px;
}
</style>
