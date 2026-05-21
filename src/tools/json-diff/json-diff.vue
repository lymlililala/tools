<script setup lang="ts">
import JSON5 from 'json5';
import { refDebounced } from '@vueuse/core';
import DiffsViewer from './diff-viewer/diff-viewer.vue';
import { withDefaultOnError } from '@/utils/defaults';
import { isNotThrowing } from '@/utils/boolean';
import { useStyleStore } from '@/stores/style.store';

const styleStore = useStyleStore();

const rawLeftJson = ref('');
const rawRightJson = ref('');

// 防抖避免频繁解析
const debouncedLeft = refDebounced(rawLeftJson, 300);
const debouncedRight = refDebounced(rawRightJson, 300);

const leftJson = computed(() => withDefaultOnError(() => JSON5.parse(debouncedLeft.value), undefined));
const rightJson = computed(() => withDefaultOnError(() => JSON5.parse(debouncedRight.value), undefined));

// ── 验证 ──────────────────────────────────────────────────────────────────
const leftError = computed(() => {
  if (!rawLeftJson.value.trim()) return '';
  return isNotThrowing(() => JSON5.parse(rawLeftJson.value)) ? '' : 'Invalid JSON format';
});
const rightError = computed(() => {
  if (!rawRightJson.value.trim()) return '';
  return isNotThrowing(() => JSON5.parse(rawRightJson.value)) ? '' : 'Invalid JSON format';
});

// ── 格式化 ────────────────────────────────────────────────────────────────
function formatLeft() {
  try {
    rawLeftJson.value = JSON.stringify(JSON5.parse(rawLeftJson.value), null, 2);
  }
  catch {}
}

function formatRight() {
  try {
    rawRightJson.value = JSON.stringify(JSON5.parse(rawRightJson.value), null, 2);
  }
  catch {}
}

// ── 互换 ──────────────────────────────────────────────────────────────────
function swapJson() {
  const tmp = rawLeftJson.value;
  rawLeftJson.value = rawRightJson.value;
  rawRightJson.value = tmp;
}

// ── 清空 ──────────────────────────────────────────────────────────────────
function clearLeft() { rawLeftJson.value = ''; }
function clearRight() { rawRightJson.value = ''; }
function clearAll() { rawLeftJson.value = ''; rawRightJson.value = ''; }

const hasContent = computed(() => rawLeftJson.value.trim() || rawRightJson.value.trim());
</script>

<template>
  <div class="json-diff-wrap tool-wide" :class="{ dark: styleStore.isDarkTheme }">
    <!-- ── 中间操作工具栏 ───────────────────────────────────────────── -->
    <div class="toolbar">
      <div class="toolbar-left">
        <n-tooltip trigger="hover" placement="top">
          <template #trigger>
            <button class="tool-btn" :disabled="!rawLeftJson || !!leftError" @click="formatLeft">
              <icon-mdi-code-json class="tb-icon" />
              Format Left
            </button>
          </template>
          Prettify left JSON
        </n-tooltip>
        <n-tooltip trigger="hover" placement="top">
          <template #trigger>
            <button class="tool-btn" :disabled="!rawLeftJson" @click="clearLeft">
              <icon-mdi-close class="tb-icon" />
              Clear Left
            </button>
          </template>
          Clear left panel
        </n-tooltip>
      </div>

      <div class="toolbar-center">
        <n-tooltip trigger="hover" placement="top">
          <template #trigger>
            <button class="swap-btn" :disabled="!hasContent" @click="swapJson">
              <icon-mdi-swap-horizontal class="swap-icon" />
            </button>
          </template>
          Swap left ↔ right
        </n-tooltip>
        <n-tooltip v-if="hasContent" trigger="hover" placement="top">
          <template #trigger>
            <button class="tool-btn tool-btn--danger" @click="clearAll">
              <icon-mdi-delete-outline class="tb-icon" />
              Clear All
            </button>
          </template>
          Clear both panels
        </n-tooltip>
      </div>

      <div class="toolbar-right">
        <n-tooltip trigger="hover" placement="top">
          <template #trigger>
            <button class="tool-btn" :disabled="!rawRightJson || !!rightError" @click="formatRight">
              <icon-mdi-code-json class="tb-icon" />
              Format Right
            </button>
          </template>
          Prettify right JSON
        </n-tooltip>
        <n-tooltip trigger="hover" placement="top">
          <template #trigger>
            <button class="tool-btn" :disabled="!rawRightJson" @click="clearRight">
              <icon-mdi-close class="tb-icon" />
              Clear Right
            </button>
          </template>
          Clear right panel
        </n-tooltip>
      </div>
    </div>

    <!-- ── 左右编辑器分栏 ──────────────────────────────────────────── -->
    <div class="editors-grid">
      <!-- 左侧 -->
      <div class="editor-pane" :class="{ 'pane-error': !!leftError }">
        <div class="pane-header">
          <span class="pane-label">
            <icon-mdi-numeric-1-circle-outline class="pane-num" />
            First JSON
          </span>
          <span v-if="rawLeftJson && !leftError" class="pane-status valid">
            <icon-mdi-check-circle-outline class="ps-icon" />Valid
          </span>
        </div>
        <c-code-input
          v-model="rawLeftJson"
          language="json"
          placeholder="Paste your first JSON here…&#10;&#10;{&#10;  &quot;name&quot;: &quot;Tom&quot;,&#10;  &quot;age&quot;: 25&#10;}"
          :class="{ 'input-error-ring': !!leftError }"
          min-height="380px"
        />
        <transition name="err-slide">
          <div v-if="leftError" class="error-inline">
            <icon-mdi-alert-circle-outline class="ei-icon" />
            <span>{{ leftError }}</span>
          </div>
        </transition>
      </div>

      <!-- 右侧 -->
      <div class="editor-pane" :class="{ 'pane-error': !!rightError }">
        <div class="pane-header">
          <span class="pane-label">
            <icon-mdi-numeric-2-circle-outline class="pane-num" />
            JSON to Compare
          </span>
          <span v-if="rawRightJson && !rightError" class="pane-status valid">
            <icon-mdi-check-circle-outline class="ps-icon" />Valid
          </span>
        </div>
        <c-code-input
          v-model="rawRightJson"
          language="json"
          placeholder="Paste the JSON to compare here…&#10;&#10;{&#10;  &quot;name&quot;: &quot;Tom&quot;,&#10;  &quot;age&quot;: 26&#10;}"
          :class="{ 'input-error-ring': !!rightError }"
          min-height="380px"
        />
        <transition name="err-slide">
          <div v-if="rightError" class="error-inline">
            <icon-mdi-alert-circle-outline class="ei-icon" />
            <span>{{ rightError }}</span>
          </div>
        </transition>
      </div>
    </div>

    <!-- ── Diff 结果 ────────────────────────────────────────────────── -->
    <DiffsViewer :left-json="leftJson" :right-json="rightJson" />
  </div>
</template>

<style lang="less" scoped>
.json-diff-wrap {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

// ── 工具栏 ─────────────────────────────────────────────────────────────────
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 6px;
  flex: 1;
}

.toolbar-right { justify-content: flex-end; }

.toolbar-center {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}

// 通用工具按钮
.tool-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 7px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: transparent;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  color: inherit;
  transition: background 0.15s, color 0.15s;

  &:hover:not(:disabled) {
    background: rgba(99, 102, 241, 0.08);
    color: #6366f1;
    border-color: rgba(99, 102, 241, 0.25);
  }

  &:disabled { opacity: 0.3; cursor: not-allowed; }

  &--danger:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.08);
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.2);
  }

  .dark & { border-color: rgba(255, 255, 255, 0.1); }
}

.tb-icon { font-size: 14px; }

// 互换按钮
.swap-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1.5px solid rgba(99, 102, 241, 0.3);
  background: rgba(99, 102, 241, 0.06);
  cursor: pointer;
  color: #6366f1;
  transition: background 0.15s, transform 0.2s;

  &:hover:not(:disabled) { background: rgba(99, 102, 241, 0.14); transform: rotate(180deg); }
  &:disabled { opacity: 0.3; cursor: not-allowed; }

  .dark & { border-color: rgba(129, 140, 248, 0.3); background: rgba(99, 102, 241, 0.1); }
}

.swap-icon { font-size: 18px; }

// ── 编辑器分栏 ────────────────────────────────────────────────────────────
.editors-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.editor-pane {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

// 面板标题栏
.pane-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px;
}

.pane-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(0, 0, 0, 0.5);

  .dark & { color: rgba(255, 255, 255, 0.42); }
}

.pane-num { font-size: 14px; }

.pane-status {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 600;

  &.valid { color: #16a34a; }
}

.ps-icon { font-size: 12px; }

// 错误红框 — 通过 c-code-input 的外层包装实现
:deep(.input-error-ring) {
  .cm-editor {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
  }
}

// 错误提示行
.error-inline {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #ef4444;

  .dark & { color: #f87171; }
}

.ei-icon { font-size: 14px; flex-shrink: 0; }

.err-slide-enter-active, .err-slide-leave-active { transition: opacity 0.2s, transform 0.2s; }
.err-slide-enter-from, .err-slide-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
