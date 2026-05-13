<script setup lang="ts">
import { useStyleStore } from '@/stores/style.store';

const styleStore = useStyleStore();
const { isMenuCollapsed, isSmallScreen } = toRefs(styleStore);
const siderPosition = computed(() => (isSmallScreen.value ? 'absolute' : 'static'));
</script>

<template>
  <n-layout has-sider class="root-layout">
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="0"
      :width="260"
      :collapsed="isMenuCollapsed"
      :show-trigger="false"
      :native-scrollbar="false"
      :position="siderPosition"
      class="sider"
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
  // 让侧边栏内部可以 flex column
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

  // sider-menu 撑满剩余空间
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

  // page-content 撑满剩余
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
  background-color: #00000080;
  cursor: pointer;
  z-index: 200;
}
</style>
