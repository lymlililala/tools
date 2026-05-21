<script setup lang="ts">
import convert from 'xml-js';
import xmlFormat from 'xml-formatter';
import { refDebounced } from '@vueuse/core';

// ── 转换选项 ─────────────────────────────────────────────────────────────
const ignoreAttributes = ref(false);
const convertNumbers = ref(false);
const compactMode = ref(true); // compact vs non-compact output

// ── 状态 ─────────────────────────────────────────────────────────────────
const xmlInput = ref('<a x="1.234" y="It\'s"/>');
const debouncedXml = refDebounced(xmlInput, 200);

// ── 文件上传 ──────────────────────────────────────────────────────────────
const fileInputRef = ref<HTMLInputElement | null>(null);
function triggerFileUpload() {
  fileInputRef.value?.click();
}
function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    xmlInput.value = reader.result as string;
  };
  reader.readAsText(file, 'utf-8');
  // reset so same file can be picked again
  (e.target as HTMLInputElement).value = '';
}

// ── 格式化 XML ────────────────────────────────────────────────────────────
function formatXml() {
  if (!xmlInput.value.trim()) return;
  try {
    xmlInput.value = xmlFormat(xmlInput.value.trim(), {
      indentation: '  ',
      collapseContent: true,
      lineSeparator: '\n',
    });
  }
  catch {
    // 格式化失败时保持原样
  }
}

// ── 清空 ─────────────────────────────────────────────────────────────────
function clearInput() {
  xmlInput.value = '';
}

// ── 转换逻辑 ─────────────────────────────────────────────────────────────
interface ConvertResult {
  json: string
  error: string | null
}

const result = computed((): ConvertResult => {
  const raw = debouncedXml.value.trim();
  if (!raw) return { json: '', error: null };

  try {
    const options: convert.Options.XML2JS = {
      compact: compactMode.value,
      spaces: 2,
    };

    if (ignoreAttributes.value) {
      options.ignoreAttributes = true;
    }

    const parsed = convert.xml2js(raw, options);

    // 可选：数值自动转换
    if (convertNumbers.value) {
      convertNumericStrings(parsed);
    }

    return { json: JSON.stringify(parsed, null, 2), error: null };
  }
  catch (e: any) {
    return { json: '', error: e?.message ?? 'Invalid XML' };
  }
});

// 递归将纯数字字符串转为 Number
function convertNumericStrings(obj: any): void {
  if (typeof obj !== 'object' || obj === null) return;
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === 'string' && val.trim() !== '' && !Number.isNaN(Number(val))) {
      obj[key] = Number(val);
    }
    else {
      convertNumericStrings(val);
    }
  }
}

const jsonOutput = computed(() => result.value.json);
const parseError = computed(() => result.value.error);
const hasError = computed(() => parseError.value !== null && xmlInput.value.trim() !== '');

// ── 下载 JSON ─────────────────────────────────────────────────────────────
function downloadJson() {
  if (!jsonOutput.value) return;
  const blob = new Blob([jsonOutput.value], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'output.json';
  a.click();
  URL.revokeObjectURL(url);
}

// ── 复制反馈 ─────────────────────────────────────────────────────────────
const copySuccess = ref(false);
async function copyJson() {
  if (!jsonOutput.value) return;
  await navigator.clipboard.writeText(jsonOutput.value);
  copySuccess.value = true;
  setTimeout(() => (copySuccess.value = false), 1800);
}
</script>

<template>
  <div class="xml-json-wrap tool-wide">
    <!-- 设置栏 -->
    <div class="settings-bar">
      <label class="setting-item">
        <n-switch v-model:value="ignoreAttributes" size="small" />
        <span class="setting-label">Ignore attributes</span>
      </label>
      <label class="setting-item">
        <n-switch v-model:value="convertNumbers" size="small" />
        <span class="setting-label">Auto-convert numbers</span>
      </label>
      <label class="setting-item">
        <n-switch v-model:value="compactMode" size="small" />
        <span class="setting-label">Compact mode</span>
      </label>
    </div>

    <!-- 两栏代码编辑器 -->
    <div class="editor-grid">
      <!-- 左：XML 输入 -->
      <div class="pane" :class="{ 'pane-error': hasError }">
        <div class="pane-header">
          <span class="pane-title">XML Input</span>
          <div class="pane-actions">
            <!-- 上传文件 -->
            <n-tooltip trigger="hover" placement="top">
              <template #trigger>
                <button class="icon-btn" title="Upload .xml file" @click="triggerFileUpload">
                  <icon-mdi-upload class="btn-icon" />
                </button>
              </template>
              Upload .xml file
            </n-tooltip>
            <!-- 格式化 -->
            <n-tooltip v-if="xmlInput" trigger="hover" placement="top">
              <template #trigger>
                <button class="icon-btn" title="Format XML" @click="formatXml">
                  <icon-mdi-code-tags class="btn-icon" />
                </button>
              </template>
              Format XML
            </n-tooltip>
            <!-- 清空 -->
            <n-tooltip v-if="xmlInput" trigger="hover" placement="top">
              <template #trigger>
                <button class="icon-btn icon-btn-danger" title="Clear" @click="clearInput">
                  <icon-mdi-close class="btn-icon" />
                </button>
              </template>
              Clear
            </n-tooltip>
          </div>
        </div>

        <c-code-input
          v-model="xmlInput"
          language="xml"
          placeholder="Paste your XML here…  e.g. <root><name>John</name></root>"
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

      <!-- 右：JSON 输出 -->
      <div class="pane">
        <div class="pane-header">
          <span class="pane-title">JSON Output</span>
          <div class="pane-actions">
            <!-- 复制 -->
            <n-tooltip v-if="jsonOutput" trigger="hover" placement="top">
              <template #trigger>
                <button class="icon-btn" :class="{ 'icon-btn-success': copySuccess }" title="Copy JSON" @click="copyJson">
                  <icon-mdi-check v-if="copySuccess" class="btn-icon" />
                  <icon-mdi-content-copy v-else class="btn-icon" />
                </button>
              </template>
              {{ copySuccess ? 'Copied!' : 'Copy JSON' }}
            </n-tooltip>
            <!-- 下载 -->
            <n-tooltip v-if="jsonOutput" trigger="hover" placement="top">
              <template #trigger>
                <button class="icon-btn" title="Download .json" @click="downloadJson">
                  <icon-mdi-download class="btn-icon" />
                </button>
              </template>
              Download .json
            </n-tooltip>
          </div>
        </div>

        <!-- 正常输出 -->
        <c-code-input
          v-if="!hasError"
          :model-value="jsonOutput"
          language="json"
          placeholder="Converted JSON will appear here…"
          min-height="calc(100vh - 218px)"
          readonly
        />

        <!-- 错误状态面板 -->
        <div v-else class="error-pane" style="min-height:420px">
          <div class="error-icon-wrap">
            <icon-mdi-alert-circle-outline class="error-icon" />
          </div>
          <div class="error-title">
            Parse Error
          </div>
          <pre class="error-message">{{ parseError }}</pre>
          <div class="error-tip">
            Check that your XML is well-formed — every tag must be properly closed.
          </div>
        </div>
      </div>
    </div>

    <!-- 隐藏文件输入 -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".xml,application/xml,text/xml"
      style="display:none"
      @change="onFileChange"
    >
  </div>
</template>

<style lang="less" scoped>
.xml-json-wrap {
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
