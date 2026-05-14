<script setup lang="ts">
import { useClipboard } from '@vueuse/core';
import { useStyleStore } from '@/stores/style.store';

const props = withDefaults(defineProps<{
  /** 要复制/下载的文本内容 */
  value?: string
  /** 是否显示清除按钮（emits clear 事件）*/
  clearable?: boolean
  /** 是否显示下载按钮 */
  downloadable?: boolean
  /** 下载的文件名（含扩展名）*/
  downloadFilename?: string
  /** 紧凑模式（只有图标，无文字标签）*/
  compact?: boolean
}>(), {
  value: '',
  clearable: false,
  downloadable: false,
  downloadFilename: 'output.txt',
  compact: true,
});

const emit = defineEmits<{
  (e: 'clear'): void
}>();

const styleStore = useStyleStore();
const { copy, copied } = useClipboard({ source: computed(() => props.value) });

function download() {
  const blob = new Blob([props.value], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = props.downloadFilename;
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <div class="output-actions" :class="{ dark: styleStore.isDarkTheme, compact }">
    <!-- Copy -->
    <c-tooltip :tooltip="copied ? 'Copied!' : 'Copy to clipboard'" position="bottom">
      <button
        class="action-btn"
        :class="{ 'action-btn--success': copied }"
        @click="copy()"
      >
        <transition name="icon-switch" mode="out-in">
          <icon-mdi-check v-if="copied" key="check" class="btn-icon success" />
          <icon-mdi-content-copy v-else key="copy" class="btn-icon" />
        </transition>
        <span v-if="!compact" class="btn-label">{{ copied ? 'Copied' : 'Copy' }}</span>
      </button>
    </c-tooltip>

    <!-- Clear -->
    <c-tooltip v-if="clearable" tooltip="Clear" position="bottom">
      <button class="action-btn" @click="emit('clear')">
        <icon-mdi-close-circle-outline class="btn-icon" />
        <span v-if="!compact" class="btn-label">Clear</span>
      </button>
    </c-tooltip>

    <!-- Download -->
    <c-tooltip v-if="downloadable && value" tooltip="Download" position="bottom">
      <button class="action-btn" @click="download">
        <icon-mdi-download class="btn-icon" />
        <span v-if="!compact" class="btn-label">Download</span>
      </button>
    </c-tooltip>
  </div>
</template>

<style scoped lang="less">
.output-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 7px;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  color: inherit;
  opacity: 0.45;
  transition: opacity 0.15s, background 0.15s;
  font-size: 13px;

  &:hover {
    opacity: 1;
    background: rgba(99, 102, 241, 0.08);
  }

  &--success {
    opacity: 1 !important;
  }

  .dark & {
    &:hover {
      background: rgba(129, 140, 248, 0.1);
    }
  }
}

.btn-icon {
  font-size: 14px;
  flex-shrink: 0;

  &.success {
    color: #22c55e;
  }
}

.btn-label {
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

// icon 切换动画
.icon-switch-enter-active,
.icon-switch-leave-active {
  transition: all 0.15s ease;
}

.icon-switch-enter-from {
  opacity: 0;
  transform: scale(0.6);
}

.icon-switch-leave-to {
  opacity: 0;
  transform: scale(0.6);
}
</style>
