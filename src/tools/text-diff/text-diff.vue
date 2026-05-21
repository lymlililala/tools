<script setup lang="ts">
import { ArrowsLeftRight, Copy, Eraser } from '@vicons/tabler';
import { useCopy } from '@/composable/copy';

const { t } = useI18n();

const originalText = ref('');
const modifiedText = ref('');

const diffEditorRef = ref<InstanceType<typeof import('@/ui/c-diff-editor/c-diff-editor.vue').default> | null>(null);

// 复制右侧结果
const copied = ref(false);
const { copy } = useCopy({ source: modifiedText, text: computed(() => t('tools.text-diff.copied')) });

async function handleCopy() {
  await copy();
  copied.value = true;
  setTimeout(() => (copied.value = false), 1800);
}

// 清空两侧
function clearAll() {
  originalText.value = '';
  modifiedText.value = '';
}

// 交换左右文本
function swapTexts() {
  const tmp = originalText.value;
  originalText.value = modifiedText.value;
  modifiedText.value = tmp;
}
</script>

<template>
  <div class="td-wrapper tool-wide">
    <!-- 工具栏 -->
    <div class="td-toolbar">
      <div class="toolbar-left">
        <span class="panel-tag panel-tag--original">{{ t('tools.text-diff.originalText') }}</span>
        <span class="panel-tag panel-tag--modified">{{ t('tools.text-diff.modifiedText') }}</span>
      </div>

      <div class="toolbar-right">
        <!-- 交换 -->
        <c-tooltip :tooltip="t('tools.text-diff.swapTooltip')">
          <button class="tool-btn" @click="swapTexts">
            <n-icon :component="ArrowsLeftRight" size="15" />
            <span class="tool-btn-label">{{ t('tools.text-diff.swap') }}</span>
          </button>
        </c-tooltip>

        <!-- 清空 -->
        <c-tooltip :tooltip="t('tools.text-diff.clearTooltip')">
          <button
            class="tool-btn tool-btn--danger"
            :disabled="!originalText && !modifiedText"
            @click="clearAll"
          >
            <n-icon :component="Eraser" size="15" />
            <span class="tool-btn-label">{{ t('tools.text-diff.clear') }}</span>
          </button>
        </c-tooltip>

        <!-- 复制右侧 -->
        <c-tooltip :tooltip="t('tools.text-diff.copyTooltip')">
          <button
            class="tool-btn"
            :class="{ copied }"
            :disabled="!modifiedText"
            @click="handleCopy"
          >
            <n-icon :component="Copy" size="15" />
            <span class="tool-btn-label">{{ copied ? t('tools.text-diff.justCopied') : t('tools.text-diff.copyResult') }}</span>
          </button>
        </c-tooltip>
      </div>
    </div>

    <!-- Diff 编辑器卡片 -->
    <c-card class="td-card" important:pa-0 important:flex-1>
      <c-diff-editor
        ref="diffEditorRef"
        v-model:original="originalText"
        v-model:modified="modifiedText"
        :original-placeholder="t('tools.text-diff.originalPlaceholder')"
        :modified-placeholder="t('tools.text-diff.modifiedPlaceholder')"
        class="td-editor"
      />
    </c-card>
  </div>
</template>

<style scoped>
/* ── 总容器 ── */
.td-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 0;
}

/* ── 工具栏 ── */
.td-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 面板标识标签 */
.panel-tag {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border-radius: 6px;
  padding: 3px 9px;
}

.panel-tag--original {
  color: #b91c1c;
  background: rgba(185, 28, 28, 0.08);
  border: 1px solid rgba(185, 28, 28, 0.2);
}

.panel-tag--modified {
  color: #15803d;
  background: rgba(21, 128, 61, 0.08);
  border: 1px solid rgba(21, 128, 61, 0.2);
}

/* 工具按钮 */
.tool-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border: 1.5px solid var(--n-border-color, #e0e0e0);
  border-radius: 7px;
  background: var(--n-card-color, #fff);
  color: var(--n-text-color-2, #555);
  font-size: 13px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
  white-space: nowrap;
}

.tool-btn:hover:not(:disabled) {
  border-color: var(--primary-color, #18a058);
  color: var(--primary-color, #18a058);
  background: rgba(24, 160, 88, 0.05);
}

.tool-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.tool-btn--danger:hover:not(:disabled) {
  border-color: #dc3545;
  color: #dc3545;
  background: rgba(220, 53, 69, 0.05);
}

.tool-btn.copied {
  border-color: var(--primary-color, #18a058);
  color: var(--primary-color, #18a058);
}

.tool-btn-label {
  /* 在极窄屏下隐藏文字，只保留图标 */
}

/* ── Diff 编辑器卡片 ── */
.td-card {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  /* 明确边框，让面板边界感知清晰（TC-01） */
  border: 1.5px solid var(--n-border-color, #e0e0e0) !important;
  border-radius: 10px !important;
}

.td-editor {
  width: 100%;
  height: 100%;
  min-height: 500px;
}

/* ── 移动端：上下堆叠（TC-07） ── */
@media (max-width: 600px) {
  .tool-btn-label {
    display: none;
  }

  .td-toolbar {
    justify-content: flex-end;
  }

  .toolbar-left {
    display: none;
  }
}
</style>
