<script setup lang="ts">
import { useStyleStore } from '@/stores/style.store';

const styleStore = useStyleStore();
const { isMenuCollapsed, isSmallScreen, isDarkTheme } = toRefs(styleStore);
const siderPosition = computed(() => (isSmallScreen.value ? 'absolute' : 'static'));
</script>

<template>
  <n-layout has-sider class="root-layout">
    <n-layout-sider
      collapse-mode="width"
      :collapsed-width="0"
      :width="260"
      :collapsed="isMenuCollapsed"
      :show-trigger="false"
      :native-scrollbar="false"
      :position="siderPosition"
      class="sider"
      :class="{ 'is-dark': isDarkTheme }"
    >
      <div class="sider-inner">
        <slot name="sider" />
      </div>
    </n-layout-sider>

    <n-layout class="content-layout" :native-scrollbar="false">
      <div class="content-inner">
        <slot name="content" />
      </div>
      <div v-show="isSmallScreen && !isMenuCollapsed" class="overlay" @click="isMenuCollapsed = true" />
    </n-layout>
  </n-layout>
</template>

<style lang="less" scoped>
.root-layout {
  height: 100vh;
}

.sider {
  border-right: 1px solid rgba(0, 0, 0, 0.06);
  transition: border-color 0.3s;

  &.is-dark {
    border-right: 1px solid rgba(255, 255, 255, 0.06);
    // 磨砂玻璃
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
  }

  ::v-deep(.n-layout-scroll-container) {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0 !important;
  }
}

.sider-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;

  ::v-deep(.sider-menu) {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }
}

.content-layout {
  height: 100vh;

  ::v-deep(.n-layout-scroll-container) {
    padding: 0 !important;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
}

.content-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;

  ::v-deep(.page-content) {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  cursor: pointer;
  z-index: 200;
}
</style>
