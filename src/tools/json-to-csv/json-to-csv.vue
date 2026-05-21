<script setup lang="ts">
import JSON5 from 'json5';
import { refDebounced } from '@vueuse/core';
import { convertArrayToCsv } from './json-to-csv.service';
import { useCopy } from '@/composable/copy';

const { t } = useI18n();

// ── 状态 ──────────────────────────────────────────────────────
const jsonInput = useStorage('json-to-csv:input', '');
const debouncedJson = refDebounced(jsonInput, 200);

// ── 转换逻辑 ──────────────────────────────────────────────────
interface Result {
  csv: string
  error: string | null
}

const result = computed((): Result => {
  const raw = debouncedJson.value.trim();
  if (!raw) return { csv: '', error: null };

  try {
    const parsed = JSON5.parse(raw);
    if (!Array.isArray(parsed)) {
      return { csv: '', error: t('tools.json-to-csv.mustBeArray') };
    }
    return { csv: convertArrayToCsv({ array: parsed }), error: null };
  }
  catch (e: any) {
    return { csv: '', error: e?.message ?? t('tools.json-to-csv.invalidJson') };
  }
});

const csvOutput = computed(() => result.value.csv);
const parseError = computed(() => result.value.error);

const hasInput = computed(() => jsonInput.value.trim().length > 0);
const isValid = computed(() => hasInput.value && !parseError.value);
const isInvalid = computed(() => hasInput.value && !!parseError.value);

// ── 格式化输入 ────────────────────────────────────────────────
function formatInput() {
  if (!jsonInput.value.trim()) return;
  try {
    const parsed = JSON5.parse(jsonInput.value);
    jsonInput.value = JSON.stringify(parsed, null, 2);
  }
  catch { /* 格式化失败保持原样 */ }
}

// ── 清空 ──────────────────────────────────────────────────────
function clearInput() {
  jsonInput.value = '';
}

// ── 复制 CSV ──────────────────────────────────────────────────
const { copy: copyCsv, isJustCopied } = useCopy({
  source: csvOutput,
  text: computed(() => t('tools.json-to-csv.csvCopied')),
});

// ── 下载 CSV ──────────────────────────────────────────────────
function downloadCsv() {
  if (!csvOutput.value) return;
  const blob = new Blob([csvOutput.value], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'output.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ── 统计信息 ──────────────────────────────────────────────────
const stats = computed(() => {
  if (!csvOutput.value) return null;
  const lines = csvOutput.value.split('\n');
  const rows = lines.length - 1; // 减去标题行
  const cols = lines[0]?.split(',').length ?? 0;
  return { rows, cols };
});
</script>

<template>
  <!-- ── 双面板 ─────────────────────────────────────────────── -->
  <div class="csv-panes tool-wide">
    <!-- 输入面板 -->
    <div class="pane" :class="{ 'pane--error': isInvalid }">
      <div class="pane-header">
        <span class="pane-title">{{ t('tools.json-to-csv.rawJson') }}</span>

        <!-- 验证状态徽章 -->
        <span v-if="isValid" class="status-badge status-badge--valid">
          <svg width="7" height="7" viewBox="0 0 7 7"><circle cx="3.5" cy="3.5" r="3.5" fill="currentColor" /></svg>
          {{ t('tools.json-to-csv.valid') }}
        </span>
        <span v-else-if="isInvalid" class="status-badge status-badge--error">
          <svg width="7" height="7" viewBox="0 0 7 7"><circle cx="3.5" cy="3.5" r="3.5" fill="currentColor" /></svg>
          {{ t('tools.json-to-csv.invalid') }}
        </span>

        <!-- 操作按钮 -->
        <div class="action-group">
          <c-tooltip :tooltip="t('tools.json-to-csv.formatJson')" position="bottom">
            <button class="hdr-btn" :disabled="!hasInput" @click="formatInput">
              <icon-mdi-code-braces />
            </button>
          </c-tooltip>
          <c-tooltip v-if="hasInput" :tooltip="t('tools.json-to-csv.clearInput')" position="bottom">
            <button class="hdr-btn" @click="clearInput">
              <icon-mdi-close-circle-outline />
            </button>
          </c-tooltip>
        </div>
      </div>

      <!-- 输入编辑器 -->
      <c-code-input
        v-model="jsonInput"
        language="json"
        :placeholder="t('tools.json-to-csv.inputPlaceholder')"
        class="code-editor"
        :class="{ 'editor--error': isInvalid }"
      />

      <!-- 错误详情 -->
      <transition name="slide-down">
        <div v-if="parseError" class="error-panel">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
            <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          <span>{{ parseError }}</span>
        </div>
      </transition>
    </div>

    <!-- 输出面板 -->
    <div class="pane">
      <div class="pane-header">
        <span class="pane-title">{{ t('tools.json-to-csv.csvOutput') }}</span>

        <!-- 统计信息 -->
        <span v-if="stats" class="stats-badge">
          {{ t('tools.json-to-csv.stats', { rows: stats.rows, cols: stats.cols }) }}
        </span>

        <!-- 操作按钮 -->
        <div class="action-group">
          <c-tooltip :tooltip="isJustCopied ? t('tools.json-to-csv.copied') : t('tools.json-to-csv.copyCsv')" position="bottom">
            <button
              class="hdr-btn"
              :class="{ 'hdr-btn--success': isJustCopied }"
              :disabled="!csvOutput"
              @click="copyCsv()"
            >
              <icon-mdi-check v-if="isJustCopied" />
              <icon-mdi-content-copy v-else />
            </button>
          </c-tooltip>
          <c-tooltip :tooltip="t('tools.json-to-csv.downloadCsv')" position="bottom">
            <button class="hdr-btn" :disabled="!csvOutput" @click="downloadCsv">
              <icon-mdi-download />
            </button>
          </c-tooltip>
        </div>
      </div>

      <!-- 输出编辑器（只读） -->
      <c-code-input
        :model-value="csvOutput"
        language="json"
        :placeholder="t('tools.json-to-csv.outputPlaceholder')"
        class="code-editor"
        readonly
      />
    </div>
  </div>
</template>

<style lang="less" scoped>
/* ── 双面板布局 ───────────────────────────────────────────────── */
.csv-panes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.pane {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* ── 面板标题栏 ───────────────────────────────────────────────── */
.pane-header {
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 28px;
}

.pane-title {
  font-size: 12.5px;
  font-weight: 600;
  color: #666;
  flex: 1;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  .dark & { color: #888; }
}

/* ── 状态徽章 ─────────────────────────────────────────────────── */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;

  &--valid {
    background: rgba(34, 197, 94, 0.12);
    color: #16a34a;
    .dark & { background: rgba(34,197,94,0.15); color: #4ade80; }
  }

  &--error {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
    .dark & { background: rgba(239,68,68,0.15); color: #f87171; }
  }
}

/* ── 统计信息徽章 ─────────────────────────────────────────────── */
.stats-badge {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 20px;
  background: rgba(99, 102, 241, 0.1);
  color: #4f46e5;

  .dark & { background: rgba(129,140,248,0.15); color: #a5b4fc; }
}

/* ── 操作按钮 ─────────────────────────────────────────────────── */
.action-group {
  display: flex;
  align-items: center;
  gap: 2px;
}

.hdr-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: inherit;
  opacity: 0.45;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  transition: opacity 0.15s, background 0.15s;

  &:hover:not(:disabled) {
    opacity: 1;
    background: rgba(99, 102, 241, 0.08);
  }

  &:disabled { opacity: 0.2; cursor: not-allowed; }

  &--success {
    opacity: 1 !important;
    color: #22c55e !important;
  }

  .dark &:hover:not(:disabled) {
    background: rgba(129, 140, 248, 0.1);
  }
}

/* ── 编辑器高度自适应 ─────────────────────────────────────────── */
.code-editor {
  :deep(.editor-wrap) {
    min-height: 320px;
    height: calc(100vh - 218px);
    max-height: 760px;
  }

  &.editor--error :deep(.editor-wrap) {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
    background: #fff9f9;

    .dark & {
      background: #1a0a0a;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15) !important;
    }
  }
}

/* ── 错误详情面板 ─────────────────────────────────────────────── */
.error-panel {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.2);
  font-size: 12px;
  color: #dc2626;
  font-family: 'SF Mono', 'Fira Code', monospace;
  word-break: break-all;

  svg { flex-shrink: 0; margin-top: 1px; }

  .dark & {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.25);
    color: #f87171;
  }
}

/* ── 动画 ─────────────────────────────────────────────────────── */
.slide-down-enter-active,
.slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from,
.slide-down-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
