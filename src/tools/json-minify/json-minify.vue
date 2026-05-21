<script setup lang="ts">
import JSON5 from 'json5';
import { refDebounced } from '@vueuse/core';
import { useCopy } from '@/composable/copy';

const { t } = useI18n();

// ── 状态 ──────────────────────────────────────────────────────
const rawJson = useStorage('json-minify:raw-json', '{\n\t"hello": [\n\t\t"world"\n\t]\n}');
const debouncedJson = refDebounced(rawJson, 150);

// ── 转换逻辑 ──────────────────────────────────────────────────
interface Result {
  minified: string
  error: string | null
}

const result = computed((): Result => {
  const raw = debouncedJson.value.trim();
  if (!raw) return { minified: '', error: null };

  try {
    const parsed = JSON5.parse(raw);
    return { minified: JSON.stringify(parsed, null, 0), error: null };
  }
  catch (e: any) {
    return { minified: '', error: e?.message ?? 'Invalid JSON' };
  }
});

const minifiedJson = computed(() => result.value.minified);
const parseError = computed(() => result.value.error);

const hasInput = computed(() => rawJson.value.trim().length > 0);
const isValid = computed(() => hasInput.value && !parseError.value);
const isInvalid = computed(() => hasInput.value && !!parseError.value);

// ── 格式化（反向操作，便于用户校验）────────────────────────────
function formatInput() {
  if (!rawJson.value.trim()) return;
  try {
    const parsed = JSON5.parse(rawJson.value);
    rawJson.value = JSON.stringify(parsed, null, 2);
  }
  catch { /* 格式化失败保持原样 */ }
}

// ── 清空 ──────────────────────────────────────────────────────
function clearInput() {
  rawJson.value = '';
}

// ── 复制压缩结果 ──────────────────────────────────────────────
const { copy: copyMinified, isJustCopied } = useCopy({
  source: minifiedJson,
});

// ── 下载 ──────────────────────────────────────────────────────
function downloadMinified() {
  if (!minifiedJson.value) return;
  const blob = new Blob([minifiedJson.value], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'minified.json';
  a.click();
  URL.revokeObjectURL(url);
}

// ── 压缩率 ────────────────────────────────────────────────────
const compressionRatio = computed(() => {
  if (!minifiedJson.value || !rawJson.value.trim()) return null;
  const orig = new Blob([rawJson.value]).size;
  const mini = new Blob([minifiedJson.value]).size;
  const pct = Math.round((1 - mini / orig) * 100);
  return { orig, mini, pct };
});
</script>

<template>
  <!-- ── 双面板 ─────────────────────────────────────────────── -->
  <div class="json-panes tool-wide">
    <!-- 输入面板 -->
    <div class="pane" :class="{ 'pane--error': isInvalid }">
      <div class="pane-header">
        <span class="pane-title">{{ t('tools.json-minify.rawJson') }}</span>

        <!-- 验证状态徽章 -->
          <span v-if="isValid" class="status-badge status-badge--valid">
          <svg width="7" height="7" viewBox="0 0 7 7"><circle cx="3.5" cy="3.5" r="3.5" fill="currentColor" /></svg>
          {{ t('tools.json-minify.valid') }}
        </span>
        <span v-else-if="isInvalid" class="status-badge status-badge--error">
          <svg width="7" height="7" viewBox="0 0 7 7"><circle cx="3.5" cy="3.5" r="3.5" fill="currentColor" /></svg>
          {{ t('tools.json-minify.invalid') }}
        </span>

        <!-- 操作按钮 -->
        <div class="action-group">
          <c-tooltip :tooltip="t('tools.json-minify.formatInput')" position="bottom">
            <button class="hdr-btn" :disabled="!hasInput" @click="formatInput">
              <icon-mdi-code-braces />
            </button>
          </c-tooltip>
          <c-tooltip v-if="hasInput" :tooltip="t('tools.json-minify.clearInput')" position="bottom">
            <button class="hdr-btn" @click="clearInput">
              <icon-mdi-close-circle-outline />
            </button>
          </c-tooltip>
        </div>
      </div>

      <!-- 输入编辑器 -->
      <c-code-input
        v-model="rawJson"
        language="json"
        :placeholder="t('tools.json-minify.inputPlaceholder')"
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
        <span class="pane-title">{{ t('tools.json-minify.minifiedResult') }}</span>

        <!-- 压缩率徽章 -->
        <span v-if="compressionRatio && compressionRatio.pct > 0" class="compress-badge">
          {{ t('tools.json-minify.saved', { pct: compressionRatio.pct }) }}
        </span>

        <!-- 操作按钮 -->
        <div class="action-group">
          <c-tooltip :tooltip="isJustCopied ? t('tools.json-minify.copied') : t('tools.json-minify.copyResult')" position="bottom">
            <button
              class="hdr-btn"
              :class="{ 'hdr-btn--success': isJustCopied }"
              :disabled="!minifiedJson"
              @click="copyMinified()"
            >
              <icon-mdi-check v-if="isJustCopied" />
              <icon-mdi-content-copy v-else />
            </button>
          </c-tooltip>
          <c-tooltip :tooltip="t('tools.json-minify.download')" position="bottom">
            <button class="hdr-btn" :disabled="!minifiedJson" @click="downloadMinified">
              <icon-mdi-download />
            </button>
          </c-tooltip>
        </div>
      </div>

      <!-- 输出编辑器（只读） -->
      <c-code-input
        :model-value="minifiedJson"
        language="json"
        :placeholder="t('tools.json-minify.outputPlaceholder')"
        class="code-editor"
        readonly
      />

      <!-- 尺寸对比 -->
      <transition name="slide-down">
        <div v-if="compressionRatio" class="size-info">
          <span>{{ t('tools.json-minify.original') }}: <strong>{{ compressionRatio.orig.toLocaleString() }}</strong> {{ t('tools.json-minify.bytes') }}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style="opacity:0.4">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span>{{ t('tools.json-minify.minified') }}: <strong>{{ compressionRatio.mini.toLocaleString() }}</strong> {{ t('tools.json-minify.bytes') }}</span>
        </div>
      </transition>
    </div>
  </div>
</template>

<style lang="less" scoped>
/* ── 双面板布局 ───────────────────────────────────────────────── */
.json-panes {
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

/* ── 压缩率徽章 ───────────────────────────────────────────────── */
.compress-badge {
  font-size: 11px;
  font-weight: 600;
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

/* ── 尺寸对比信息 ─────────────────────────────────────────────── */
.size-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11.5px;
  color: #999;
  padding: 0 2px;

  strong { color: #555; font-weight: 600; }

  .dark & {
    color: #666;
    strong { color: #aaa; }
  }
}

/* ── 动画 ─────────────────────────────────────────────────────── */
.slide-down-enter-active,
.slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from,
.slide-down-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
