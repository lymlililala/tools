<script setup lang="ts">
import convert from 'xml-js';
import JSON5 from 'json5';
import xmlFormat from 'xml-formatter';
import { refDebounced } from '@vueuse/core';

const { t } = useI18n();

// ── 转换选项 ─────────────────────────────────────────────────────────────
const prettyXml = ref(true);
const compactMode = ref(true); // compact (用 _attributes) vs full

// ── 状态 ─────────────────────────────────────────────────────────────────
const jsonInput = ref('{"a":{"_attributes":{"x":"1.234","y":"It\'s"}}}');
const debouncedJson = refDebounced(jsonInput, 200);

// ── 文件上传 ──────────────────────────────────────────────────────────────
const fileInputRef = ref<HTMLInputElement | null>(null);
function triggerFileUpload() {
  fileInputRef.value?.click();
}
function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    jsonInput.value = reader.result as string;
  };
  reader.readAsText(file, 'utf-8');
  (e.target as HTMLInputElement).value = '';
}

// ── 格式化 JSON ───────────────────────────────────────────────────────────
function formatJson() {
  if (!jsonInput.value.trim()) {
    return;
  }
  try {
    const parsed = JSON5.parse(jsonInput.value);
    jsonInput.value = JSON.stringify(parsed, null, 2);
  }
  catch {
    // 格式化失败时保持原样
  }
}

// ── 清空 ─────────────────────────────────────────────────────────────────
function clearInput() {
  jsonInput.value = '';
}

// ── 转换逻辑 ─────────────────────────────────────────────────────────────
interface ConvertResult {
  xml: string
  error: string | null
}

const result = computed((): ConvertResult => {
  const raw = debouncedJson.value.trim();
  if (!raw) {
    return { xml: '', error: null };
  }

  try {
    const parsed = JSON5.parse(raw);
    const raw_xml = convert.js2xml(parsed, {
      compact: compactMode.value,
      spaces: prettyXml.value ? 2 : 0,
    });

    const xml = prettyXml.value
      ? (() => {
          try {
            return xmlFormat(raw_xml, { indentation: '  ', collapseContent: true, lineSeparator: '\n' });
          }
          catch {
            return raw_xml;
          }
        })()
      : raw_xml;

    return { xml, error: null };
  }
  catch (e: any) {
    return { xml: '', error: e?.message ?? 'Invalid JSON' };
  }
});

const xmlOutput = computed(() => result.value.xml);
const parseError = computed(() => result.value.error);
const hasError = computed(() => parseError.value !== null && jsonInput.value.trim() !== '');

// ── 下载 XML ──────────────────────────────────────────────────────────────
function downloadXml() {
  if (!xmlOutput.value) {
    return;
  }
  const blob = new Blob([xmlOutput.value], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'output.xml';
  a.click();
  URL.revokeObjectURL(url);
}

// ── 复制反馈 ─────────────────────────────────────────────────────────────
const copySuccess = ref(false);
async function copyXml() {
  if (!xmlOutput.value) {
    return;
  }
  await navigator.clipboard.writeText(xmlOutput.value);
  copySuccess.value = true;
  setTimeout(() => (copySuccess.value = false), 1800);
}
</script>

<template>
  <div class="tool-wide json-xml-wrap">
    <!-- 设置栏 -->
    <div class="settings-bar">
      <label class="setting-item">
        <n-switch v-model:value="prettyXml" size="small" />
        <span class="setting-label">{{ t('tools.json-to-xml.prettyPrint') }}</span>
      </label>
      <label class="setting-item">
        <n-switch v-model:value="compactMode" size="small" />
        <span class="setting-label">{{ t('tools.json-to-xml.compactMode') }}</span>
      </label>
    </div>

    <!-- 两栏代码编辑器 -->
    <div class="editor-grid">
      <!-- 左：JSON 输入 -->
      <div class="pane" :class="{ 'pane-error': hasError }">
        <div class="pane-header">
          <span class="pane-title">{{ t('tools.json-to-xml.jsonInput') }}</span>
          <div class="pane-actions">
            <!-- 上传文件 -->
            <n-tooltip trigger="hover" placement="top">
              <template #trigger>
                <button class="icon-btn" :title="t('tools.json-to-xml.uploadJson')" @click="triggerFileUpload">
                  <icon-mdi-upload class="btn-icon" />
                </button>
              </template>
              {{ t('tools.json-to-xml.uploadJson') }}
            </n-tooltip>
            <!-- 格式化 JSON -->
            <n-tooltip v-if="jsonInput" trigger="hover" placement="top">
              <template #trigger>
                <button class="icon-btn" :title="t('tools.json-to-xml.formatJson')" @click="formatJson">
                  <icon-mdi-code-braces class="btn-icon" />
                </button>
              </template>
              {{ t('tools.json-to-xml.formatJson') }}
            </n-tooltip>
            <!-- 清空 -->
            <n-tooltip v-if="jsonInput" trigger="hover" placement="top">
              <template #trigger>
                <button class="icon-btn icon-btn-danger" :title="t('tools.json-to-xml.clear')" @click="clearInput">
                  <icon-mdi-close class="btn-icon" />
                </button>
              </template>
              {{ t('tools.json-to-xml.clear') }}
            </n-tooltip>
          </div>
        </div>

        <c-code-input
          v-model="jsonInput"
          language="json"
          :placeholder="t('tools.json-to-xml.jsonPlaceholder')"
          min-height="calc(100vh - 218px)"
          :class="{ 'input-error-ring': hasError }"
        />

        <!-- 错误提示条 -->
        <transition name="err-slide">
          <div v-if="hasError" class="error-inline">
            <icon-mdi-alert-circle-outline class="ei-icon" />
            <span class="ei-msg">{{ parseError }}</span>
          </div>
        </transition>
      </div>

      <!-- 右：XML 输出 -->
      <div class="pane">
        <div class="pane-header">
          <span class="pane-title">{{ t('tools.json-to-xml.xmlOutput') }}</span>
          <div class="pane-actions">
            <!-- 复制 -->
            <n-tooltip v-if="xmlOutput" trigger="hover" placement="top">
              <template #trigger>
                <button
                  class="icon-btn"
                  :class="{ 'icon-btn-success': copySuccess }"
                  :title="t('tools.json-to-xml.copyXml')"
                  @click="copyXml"
                >
                  <icon-mdi-check v-if="copySuccess" class="btn-icon" />
                  <icon-mdi-content-copy v-else class="btn-icon" />
                </button>
              </template>
              {{ copySuccess ? t('tools.json-to-xml.copied') : t('tools.json-to-xml.copyXml') }}
            </n-tooltip>
            <!-- 下载 -->
            <n-tooltip v-if="xmlOutput" trigger="hover" placement="top">
              <template #trigger>
                <button class="icon-btn" :title="t('tools.json-to-xml.downloadXml')" @click="downloadXml">
                  <icon-mdi-download class="btn-icon" />
                </button>
              </template>
              {{ t('tools.json-to-xml.downloadXml') }}
            </n-tooltip>
          </div>
        </div>

        <!-- 正常输出 -->
        <c-code-input
          v-if="!hasError"
          :model-value="xmlOutput"
          language="xml"
          :placeholder="t('tools.json-to-xml.xmlPlaceholder')"
          min-height="calc(100vh - 218px)"
          readonly
        />

        <!-- 错误状态面板 -->
        <div v-else class="error-pane" style="min-height:420px">
          <div class="error-icon-wrap">
            <icon-mdi-alert-circle-outline class="error-icon" />
          </div>
          <div class="error-title">
            {{ t('tools.json-to-xml.parseError') }}
          </div>
          <pre class="error-message">{{ parseError }}</pre>
          <div class="error-tip">
            {{ t('tools.json-to-xml.errorTip') }}
          </div>
        </div>
      </div>
    </div>

    <!-- 隐藏文件输入 -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".json,application/json"
      style="display:none"
      @change="onFileChange"
    >
  </div>
</template>

<style lang="less" scoped>
.json-xml-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

// ── 设置栏 ────────────────────────────────────────────────────────────────
.settings-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 20px;
  padding: 10px 14px;
  border-radius: 8px;
  background: rgba(99, 102, 241, 0.04);
  border: 1px solid rgba(99, 102, 241, 0.12);
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  user-select: none;
}

.setting-label {
  font-size: 12px;
  font-weight: 500;
  opacity: 0.7;
}

// ── 双栏网格 ──────────────────────────────────────────────────────────────
.editor-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

// ── 面板 ──────────────────────────────────────────────────────────────────
.pane {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.pane-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px;
  min-height: 28px;
}

.pane-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  opacity: 0.4;
}

.pane-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

// ── 图标按钮 ──────────────────────────────────────────────────────────────
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  opacity: 0.45;
  transition: opacity 0.15s, background 0.15s, color 0.15s;
  color: inherit;

  &:hover {
    opacity: 1;
    background: rgba(99, 102, 241, 0.1);
    color: #6366f1;
  }

  &.icon-btn-danger:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }

  &.icon-btn-success {
    opacity: 1;
    color: #22c55e;
  }
}

.btn-icon {
  font-size: 15px;
}

// ── 输入框错误高亮 ────────────────────────────────────────────────────────
.input-error-ring :deep(.editor-wrap) {
  border-color: rgba(239, 68, 68, 0.6) !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
}

// ── 行内错误提示 ──────────────────────────────────────────────────────────
.error-inline {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.ei-icon {
  flex-shrink: 0;
  font-size: 15px;
  color: #ef4444;
  margin-top: 1px;
}

.ei-msg {
  font-size: 12px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: #dc2626;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}

.err-slide-enter-active,
.err-slide-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.err-slide-enter-from,
.err-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

// ── 错误面板（右侧） ──────────────────────────────────────────────────────
.error-pane {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 28px 20px;
  border-radius: 8px;
  border: 1.5px solid rgba(239, 68, 68, 0.25);
  background: rgba(239, 68, 68, 0.04);
}

.error-icon-wrap {
  font-size: 32px;
  color: #ef4444;
  opacity: 0.7;
}

.error-title {
  font-size: 14px;
  font-weight: 700;
  color: #ef4444;
}

.error-message {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 12px;
  color: #dc2626;
  background: rgba(239, 68, 68, 0.07);
  border-radius: 6px;
  padding: 10px 14px;
  margin: 0;
  width: 100%;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.6;
}

.error-tip {
  font-size: 11px;
  opacity: 0.5;
  text-align: center;
  max-width: 340px;
}
</style>
