<script setup lang="ts">
import { useCopy } from '@/composable/copy';

const props = withDefaults(defineProps<{ value?: string; displayedValue?: string; showIcon?: boolean }>(), { value: '', displayedValue: undefined, showIcon: true });
const { value, displayedValue, showIcon } = toRefs(props);

const { copy, isJustCopied } = useCopy({ source: value, createToast: false });
</script>

<template>
  <c-tooltip :tooltip="isJustCopied ? '已复制！' : '点击复制'" cursor-pointer @click="copy">
    <span class="copyable-text" :class="{ copied: isJustCopied }">
      {{ displayedValue ?? value }}
      <span v-if="showIcon" class="copy-icon">
        <transition name="icon-switch" mode="out-in">
          <icon-mdi-check v-if="isJustCopied" key="check" class="icon-check" />
          <icon-mdi-content-copy v-else key="copy" class="icon-copy" op-40 />
        </transition>
      </span>
    </span>
  </c-tooltip>
</template>

<style scoped>
.copyable-text {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: color 0.2s ease;
}

.copyable-text.copied {
  color: #22c55e;
}

.copy-icon {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.icon-check {
  color: #22c55e;
}

/* 图标切换动画 */
.icon-switch-enter-active,
.icon-switch-leave-active {
  transition: all 0.18s ease;
}

.icon-switch-enter-from {
  opacity: 0;
  transform: scale(0.5) rotate(-10deg);
}

.icon-switch-leave-to {
  opacity: 0;
  transform: scale(0.5) rotate(10deg);
}
</style>
