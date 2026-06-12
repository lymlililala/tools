<script setup lang="ts">
import type { Component } from 'vue';

const props = defineProps<{ icon: Component; title: string; action: () => void; isActive?: () => boolean }>();
const { icon, title, action, isActive } = toRefs(props);

const active = computed(() => isActive?.value?.() ?? false);
</script>

<template>
  <c-tooltip :tooltip="title" placement="top">
    <button
      class="menu-btn"
      :class="{ 'is-active': active }"
      :title="title"
      @click="action"
    >
      <n-icon :component="icon" class="menu-icon" />
    </button>
  </c-tooltip>
</template>

<style lang="less" scoped>
.menu-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  // 增大可点击区域 (原先图标过小)
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: inherit;
  opacity: 0.6;
  transition: background 0.12s, opacity 0.12s, color 0.12s;

  &:hover {
    background: rgba(99, 102, 241, 0.1);
    color: #6366f1;
    opacity: 1;
  }

  // 激活状态：明显背景高亮，便于用户确认当前样式
  &.is-active {
    background: rgba(99, 102, 241, 0.15);
    color: #4f46e5;
    opacity: 1;
    font-weight: 700;

    &:hover {
      background: rgba(99, 102, 241, 0.22);
    }
  }
}

.menu-icon {
  font-size: 16px;
}
</style>
