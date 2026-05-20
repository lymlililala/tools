<script setup lang="ts">
import yaml from 'yaml';
import { refDebounced } from '@vueuse/core';
import { formatYaml } from './yaml-models';
import { withDefaultOnError } from '@/utils/defaults';
import { useCopy } from '@/composable/copy';

const { t } = useI18n();

// ── 配置 ──────────────────────────────────────────────────────
const indentSize = useStorage('yaml-prettify:indent-size', 2);
const sortKeys   = useStorage('yaml-prettify:sort-keys', false);

// ── 输入 ──────────────────────────────────────────────────────
const rawYaml = useStorage('yaml-prettify:raw-yaml', '');
const debouncedYaml = refDebounced(rawYaml, 200);

// ── 格式化输出 ────────────────────────────────────────────────
const cleanYaml = computed(() =>
  withDefaultOnError(() => formatYaml({ rawYaml: debouncedYaml, indentSize, sortKeys }), ''),
);

// ── 解析错误 ──────────────────────────────────────────────────
const parseError = computed(() => {
  const raw = debouncedYaml.value.trim();
  if (!raw) return null;
  try {
    yaml.parse(raw);
    return null;
  }
  catch (e: any) {
    return e?.message ?? t('tools.yaml-viewer.invalidYaml');
  }
});

const hasInput  = computed(() => rawYaml.value.trim().length > 0);
const isInvalid = computed(() => hasInput.value && parseError.value !== null);
const isValid   = computed(() => hasInput.value && parseError.value === null);

// ── 文件上传 ──────────────────────────────────────────────────
const fileInputRef = ref<HTMLInputElement | null>(null);
function triggerUpload() { fileInputRef.value?.click(); }
function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { rawYaml.value = reader.result as string; };
  reader.readAsText(file, 'utf-8');
  (e.target as HTMLInputElement).value = '';
}

// ── 清空 ──────────────────────────────────────────────────────
function clearInput() { rawYaml.value = ''; }

// ── 复制 ──────────────────────────────────────────────────────
const { copy: copyYaml, isJustCopied } = useCopy({
  source: cleanYaml,
  text: computed(() => t('tools.yaml-viewer.yamlCopied')),
});

// ── 下载 ──────────────────────────────────────────────────────
function downloadYaml() {
  if (!cleanYaml.value) return;
  const blob = new Blob([cleanYaml.value], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'formatted.yaml';
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <!-- ── 配置工具栏 ─────────────────────────────────────────── -->
  <div class="toolbar">
    <div class="toolbar-item">
      <span class="toolbar-label">{{ t('tools.yaml-viewer.sortKeys') }}</span>
      <n-switch v-model:value="sortKeys" size="small" />
    </div>
    <div class="toolbar-divider" />
    <div class="toolbar-item">
      <span class="toolbar-label">{{ t('tools.yaml-viewer.indentSize') }}</span>
      <div class="indent-ctrl">
        <button class="indent-btn" :disabled="indentSize <= 1" @click="indentSize = Math.max(1, indentSize - 1)">−</button>
        <span class="indent-val">{{ indentSize }}</span>
        <button class="indent-btn" :disabled="indentSize >= 10" @click="indentSize = Math.min(10, indentSize + 1)">+</button>
      </div>
    </div>
  </div>

  <!-- ── 双面板 ─────────────────────────────────────────────── -->
  <div class="yaml-panes">
    <!-- 输入面板 -->
    <div class="pane" :class="{ 'pane--error': isInvalid }">
      <div class="pane-header">
        <span class="pane-title">{{ t('tools.yaml-viewer.rawYaml') }}</span>

        <!-- 状态徽章 -->
        <span v-if="isValid" class="status-badge status-badge--valid">
          <svg width="7" height="7" viewBox="0 0 7 7"><circle cx="3.5" cy="3.5" r="3.5" fill="currentColor" /></svg>
          {{ t('tools.yaml-viewer.valid') }}
        </span>
        <span v-else-if="isInvalid" class="status-badge status-badge--error">
          <svg width="7" height="7" viewBox="0 0 7 7"><circle cx="3.5" cy="3.5" r="3.5" fill="currentColor" /></svg>
          {{ t('tools.yaml-viewer.invalid') }}
        </span>

        <!-- 操作按钮 -->
        <div class="action-group">
          <c-tooltip :tooltip="t('tools.yaml-viewer.uploadFile')" position="bottom">
            <button class="hdr-btn" @click="triggerUpload">
              <icon-mdi-upload />
            </button>
          </c-tooltip>
          <input
            ref="fileInputRef"
            type="file"
            accept=".yaml,.yml,text/yaml"
            style="display:none"
            @change="onFileChange"
          />
          <c-tooltip v-if="hasInput" :tooltip="t('tools.yaml-viewer.clearInput')" position="bottom">
            <button class="hdr-btn" @click="clearInput">
              <icon-mdi-close-circle-outline />
            </button>
          </c-tooltip>
        </div>
      </div>

      <c-code-input
        v-model="rawYaml"
        language="yaml"
        :placeholder="t('tools.yaml-viewer.inputPlaceholder')"
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
        <span class="pane-title">{{ t('tools.yaml-viewer.formattedResult') }}</span>
        <div class="action-group">
          <c-tooltip :tooltip="isJustCopied ? t('tools.yaml-viewer.copied') : t('tools.yaml-viewer.copyYaml')" position="bottom">
            <button
              class="hdr-btn"
              :class="{ 'hdr-btn--success': isJustCopied }"
              :disabled="!cleanYaml"
              @click="copyYaml()"
            >
              <icon-mdi-check v-if="isJustCopied" />
              <icon-mdi-content-copy v-else />
            </button>
          </c-tooltip>
          <c-tooltip :tooltip="t('tools.yaml-viewer.downloadFile')" position="bottom">
            <button class="hdr-btn" :disabled="!cleanYaml" @click="downloadYaml">
              <icon-mdi-download />
            </button>
          </c-tooltip>
        </div>
      </div>

      <c-code-input
        :model-value="cleanYaml"
        language="yaml"
        :placeholder="t('tools.yaml-viewer.outputPlaceholder')"
        class="code-editor"
        readonly
      />
    </div>
  </div>
</template>

<style lang="less" scoped>
/* ── 配置工具栏 ───────────────────────────────────────────────── */
.toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 14px;
  padding: 8px 14px;
  background: rgba(0,0,0,0.025);
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.06);
  flex-wrap: wrap;

  .dark & {
    background: rgba(255,255,255,0.03);
    border-color: rgba(255,255,255,0.07);
  }
}

.toolbar-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-label {
  font-size: 12.5px;
  font-weight: 500;
  color: #555;
  white-space: nowrap;
  .dark & { color: #aaa; }
}

.toolbar-divider {
  width: 1px;
  height: 18px;
  background: rgba(0,0,0,0.1);
  .dark & { background: rgba(255,255,255,0.1); }
}

/* ── 缩进控制 ─────────────────────────────────────────────────── */
.indent-ctrl {
  display: flex;
  align-items: center;
  gap: 6px;
}

.indent-btn {
  width: 24px;
  height: 24px;
  border-radius: 5px;
  border: 1.5px solid #d1d5db;
  background: transparent;
  color: #555;
  font-size: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;

  &:hover:not(:disabled) { border-color: #6366f1; color: #6366f1; }
  &:disabled { opacity: 0.3; cursor: not-allowed; }

  .dark & {
    border-color: #3a3a3a; color: #aaa;
    &:hover:not(:disabled) { border-color: #6366f1; color: #a5b4fc; }
  }
}

.indent-val {
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  min-width: 16px;
  text-align: center;
  color: #222;
  .dark & { color: #eee; }
}

/* ── 双面板布局 ───────────────────────────────────────────────── */
.yaml-panes {
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
    background: rgba(34,197,94,0.12);
    color: #16a34a;
    .dark & { background: rgba(34,197,94,0.15); color: #4ade80; }
  }
  &--error {
    background: rgba(239,68,68,0.1);
    color: #dc2626;
    .dark & { background: rgba(239,68,68,0.15); color: #f87171; }
  }
}

/* ── 操作按钮组 ───────────────────────────────────────────────── */
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
    background: rgba(99,102,241,0.08);
  }
  &:disabled { opacity: 0.2; cursor: not-allowed; }
  &--success { opacity: 1 !important; color: #22c55e !important; }

  .dark &:hover:not(:disabled) { background: rgba(129,140,248,0.1); }
}

/* ── 编辑器高度自适应 ─────────────────────────────────────────── */
.code-editor {
  :deep(.editor-wrap) {
    min-height: 320px;
    height: calc(100vh - 320px);
    max-height: 760px;
  }

  &.editor--error :deep(.editor-wrap) {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 3px rgba(239,68,68,0.1) !important;
    background: #fff9f9;

    .dark & {
      background: #1a0a0a;
      box-shadow: 0 0 0 3px rgba(239,68,68,0.15) !important;
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
  background: rgba(239,68,68,0.06);
  border: 1px solid rgba(239,68,68,0.2);
  font-size: 12px;
  color: #dc2626;
  font-family: 'SF Mono', 'Fira Code', monospace;
  word-break: break-all;

  svg { flex-shrink: 0; margin-top: 1px; }

  .dark & {
    background: rgba(239,68,68,0.1);
    border-color: rgba(239,68,68,0.25);
    color: #f87171;
  }
}

/* ── 动画 ─────────────────────────────────────────────────────── */
.slide-down-enter-active,
.slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from,
.slide-down-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
