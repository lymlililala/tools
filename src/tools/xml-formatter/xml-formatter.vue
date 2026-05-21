<script setup lang="ts">
import { formatXml, isValidXML } from './xml-formatter.service';
import { refDebounced } from '@vueuse/core';
import { useCopy } from '@/composable/copy';

const { t } = useI18n();

// ── 配置 ──────────────────────────────────────────────────────
const indentSize = useStorage('xml-formatter:indent-size', 2);
const collapseContent = useStorage('xml-formatter:collapse-content', true);

// ── 输入 ──────────────────────────────────────────────────────
const xmlInput = useStorage('xml-formatter:input', '<hello><world>foo</world><world>bar</world></hello>');
const debouncedXml = refDebounced(xmlInput, 200);

// ── 格式化 ────────────────────────────────────────────────────
const formattedXml = computed(() => {
  const raw = debouncedXml.value.trim();
  if (!raw) return '';
  return formatXml(raw, {
    indentation: ' '.repeat(indentSize.value),
    collapseContent: collapseContent.value,
    lineSeparator: '\n',
  });
});

// ── 解析错误 ──────────────────────────────────────────────────
const parseError = computed(() => {
  const raw = debouncedXml.value.trim();
  if (!raw) return null;
  if (isValidXML(raw)) return null;
  // 获取具体错误信息
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(raw, 'application/xml');
    const errEl = doc.querySelector('parsererror');
    if (errEl) return errEl.textContent?.split('\n')[0]?.trim() ?? t('tools.xml-formatter.invalidXml');
    return t('tools.xml-formatter.invalidXml');
  }
  catch {
    return t('tools.xml-formatter.invalidXml');
  }
});

const hasInput = computed(() => xmlInput.value.trim().length > 0);
const isInvalid = computed(() => hasInput.value && parseError.value !== null);

// ── 文件上传 ──────────────────────────────────────────────────
const fileInputRef = ref<HTMLInputElement | null>(null);
function triggerUpload() { fileInputRef.value?.click(); }
function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { xmlInput.value = reader.result as string; };
  reader.readAsText(file, 'utf-8');
  (e.target as HTMLInputElement).value = '';
}

// ── 清空 ──────────────────────────────────────────────────────
function clearInput() { xmlInput.value = ''; }

// ── 复制 ──────────────────────────────────────────────────────
const { copy: copyXml, isJustCopied } = useCopy({
  source: formattedXml,
  text: computed(() => t('tools.xml-formatter.xmlCopied')),
});

// ── 下载 ──────────────────────────────────────────────────────
function downloadXml() {
  if (!formattedXml.value) return;
  const blob = new Blob([formattedXml.value], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'formatted.xml';
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <div class="tool-wide">
  <!-- ── 配置工具栏 ────────────────────────────────────────── -->
  <div class="toolbar">
    <div class="toolbar-item">
      <span class="toolbar-label">{{ t('tools.xml-formatter.collapseContent') }}</span>
      <n-switch v-model:value="collapseContent" size="small" />
    </div>
    <div class="toolbar-divider" />
    <div class="toolbar-item">
      <span class="toolbar-label">{{ t('tools.xml-formatter.indentSize') }}</span>
      <div class="indent-ctrl">
        <button class="indent-btn" :disabled="indentSize <= 0" @click="indentSize = Math.max(0, indentSize - 1)">−</button>
        <span class="indent-val">{{ indentSize }}</span>
        <button class="indent-btn" :disabled="indentSize >= 10" @click="indentSize = Math.min(10, indentSize + 1)">+</button>
      </div>
    </div>
  </div>

  <!-- ── 双面板 ─────────────────────────────────────────────── -->
  <div class="xml-panes">
    <!-- 输入面板 -->
    <div class="pane" :class="{ 'pane--error': isInvalid }">
      <div class="pane-header">
        <span class="pane-title">{{ t('tools.xml-formatter.rawXml') }}</span>

        <!-- 状态徽章 -->
        <span v-if="hasInput && !isInvalid" class="status-badge status-badge--valid">
          <svg width="7" height="7" viewBox="0 0 7 7"><circle cx="3.5" cy="3.5" r="3.5" fill="currentColor" /></svg>
          {{ t('tools.xml-formatter.valid') }}
        </span>
        <span v-else-if="isInvalid" class="status-badge status-badge--error">
          <svg width="7" height="7" viewBox="0 0 7 7"><circle cx="3.5" cy="3.5" r="3.5" fill="currentColor" /></svg>
          {{ t('tools.xml-formatter.invalid') }}
        </span>

        <!-- 操作按钮 -->
        <div class="action-group">
          <!-- 上传文件 -->
          <c-tooltip :tooltip="t('tools.xml-formatter.uploadFile')" position="bottom">
            <button class="hdr-btn" @click="triggerUpload">
              <icon-mdi-upload />
            </button>
          </c-tooltip>
          <input
            ref="fileInputRef"
            type="file"
            accept=".xml,text/xml,application/xml"
            style="display:none"
            @change="onFileChange"
          />
          <!-- 清空 -->
          <c-tooltip v-if="hasInput" :tooltip="t('tools.xml-formatter.clearInput')" position="bottom">
            <button class="hdr-btn" @click="clearInput">
              <icon-mdi-close-circle-outline />
            </button>
          </c-tooltip>
        </div>
      </div>

      <c-code-input
        v-model="xmlInput"
        language="xml"
        :placeholder="t('tools.xml-formatter.inputPlaceholder')"
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
        <span class="pane-title">{{ t('tools.xml-formatter.formattedResult') }}</span>
        <div class="action-group">
          <!-- 复制 -->
          <c-tooltip :tooltip="isJustCopied ? t('tools.xml-formatter.copied') : t('tools.xml-formatter.copyXml')" position="bottom">
            <button
              class="hdr-btn"
              :class="{ 'hdr-btn--success': isJustCopied }"
              :disabled="!formattedXml"
              @click="copyXml()"
            >
              <icon-mdi-check v-if="isJustCopied" />
              <icon-mdi-content-copy v-else />
            </button>
          </c-tooltip>
          <!-- 下载 -->
          <c-tooltip :tooltip="t('tools.xml-formatter.downloadFile')" position="bottom">
            <button class="hdr-btn" :disabled="!formattedXml" @click="downloadXml">
              <icon-mdi-download />
            </button>
          </c-tooltip>
        </div>
      </div>

      <c-code-input
        :model-value="formattedXml"
        language="xml"
        :placeholder="t('tools.xml-formatter.outputPlaceholder')"
        class="code-editor"
        readonly
      />
    </div>
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
.xml-panes {
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
    height: calc(100vh - 218px);
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
