<script setup lang="ts">
import type { Ref } from 'vue';
import { useCopy } from '@/composable/copy';
import {
  getExtensionFromMimeType,
  getMimeTypeFromBase64,
  previewImageFromBase64,
  useDownloadFileFromBase64Refs,
} from '@/composable/downloadBase64';
import { useValidation } from '@/composable/validation';
import { isValidBase64 } from '@/utils/base64';

// ─── 文件大小限制 ──────────────────────────────────────────────────────────
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// ════════════════════════════════════════════════════════════════════════════
// ① Base64 → 文件（左卡）
// ════════════════════════════════════════════════════════════════════════════
const fileName = ref('file');
const fileExtension = ref('');
const base64Input = ref('');
const extensionAutoDetected = ref(false); // 是否由 Data URI 自动填充

const { download } = useDownloadFileFromBase64Refs({
  source: base64Input,
  filename: fileName,
  extension: fileExtension,
});

const base64InputValidation = useValidation({
  source: base64Input,
  rules: [
    {
      message: 'Invalid Base64 string',
      validator: value => !value.trim() || isValidBase64(value.trim()),
    },
  ],
});

// 智能识别 Data URI，自动填充扩展名
watch(base64Input, (newValue) => {
  if (!newValue.trim()) {
    extensionAutoDetected.value = false;
    return;
  }
  const { mimeType } = getMimeTypeFromBase64({ base64String: newValue });
  if (mimeType) {
    const ext = getExtensionFromMimeType(mimeType);
    if (ext) {
      fileExtension.value = ext;
      extensionAutoDetected.value = true;
      return;
    }
  }
  extensionAutoDetected.value = false;
});

// 图片预览状态
const previewSrc = ref<string | null>(null);
const previewError = ref('');

function previewImage() {
  if (!base64InputValidation.isValid || !base64Input.value) return;
  previewError.value = '';
  try {
    const { mimeType } = getMimeTypeFromBase64({ base64String: base64Input.value });
    if (mimeType && !mimeType.startsWith('image/')) {
      previewError.value = `This file type (${mimeType}) does not support image preview.`;
      previewSrc.value = null;
      return;
    }
    const img = previewImageFromBase64(base64Input.value);
    previewSrc.value = img.src;
  }
  catch {
    previewError.value = 'Unable to preview this file as an image.';
    previewSrc.value = null;
  }
}

function downloadFile() {
  if (!base64InputValidation.isValid || !base64Input.value) return;
  try {
    download();
  }
  catch {
    //
  }
}

// ════════════════════════════════════════════════════════════════════════════
// ② 文件 → Base64（右卡）
// ════════════════════════════════════════════════════════════════════════════
const uploadedFile = ref<File | null>(null);
const fullBase64 = ref(''); // 完整 Base64（内存中，不渲染到 DOM）
const isConverting = ref(false);
const sizeError = ref('');
const includeDataUri = ref(true); // 是否带 Data URI 头部

// 截断预览（防止超大字符串直接插入 DOM 卡死）
const PREVIEW_LIMIT = 800;
const base64Preview = computed(() => {
  if (!fullBase64.value) return '';
  if (fullBase64.value.length <= PREVIEW_LIMIT) return fullBase64.value;
  return `${fullBase64.value.slice(0, PREVIEW_LIMIT)}\n\n… [${(fullBase64.value.length / 1024).toFixed(0)} KB total, truncated for display. Click "Copy" to get full content.]`;
});

// 根据格式切换实际复制内容
const copySource = computed(() => {
  if (!fullBase64.value) return '';
  if (includeDataUri.value) return fullBase64.value;
  // 去掉 data:...;base64, 头部
  const raw = fullBase64.value.replace(/^data:[^;]+;base64,/, '');
  return raw;
});

const { copy: copyBase64, isJustCopied: base64Copied } = useCopy({
  source: copySource,
  text: 'Base64 copied to clipboard',
  createToast: false,
});

// 文件处理
async function onUpload(file: File) {
  sizeError.value = '';
  fullBase64.value = '';
  uploadedFile.value = null;

  if (file.size > MAX_FILE_SIZE) {
    sizeError.value = `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max size is 10 MB for browser processing.`;
    return;
  }

  uploadedFile.value = file;
  isConverting.value = true;

  try {
    const result = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    fullBase64.value = result;
  }
  catch {
    sizeError.value = 'Failed to read the file. Please try again.';
  }
  finally {
    isConverting.value = false;
  }
}

// 拖拽状态
const isOverDrop = ref(false);
const fileInput2 = ref<HTMLInputElement | null>(null);

function triggerInput() {
  if (isConverting.value) return;
  fileInput2.value?.click();
}

function handleDrop(e: DragEvent) {
  e.preventDefault();
  isOverDrop.value = false;
  const f = e.dataTransfer?.files?.[0];
  if (f) onUpload(f);
}

function handleFileInput(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (f) onUpload(f);
  (e.target as HTMLInputElement).value = '';
}
</script>

<template>
  <div class="b64f-layout">
    <!-- ══════════════════════════════════════════════ -->
    <!-- ① Base64 → 文件（左卡） -->
    <!-- ══════════════════════════════════════════════ -->
    <c-card class="b64f-card" title="Base64 → File">
      <!-- 文件名 + 扩展名 -->
      <div class="filename-row">
        <n-form-item label="File name" :show-feedback="false" label-placement="top" style="flex: 2">
          <n-input v-model:value="fileName" placeholder="e.g. document" />
        </n-form-item>
        <n-form-item label="Extension" :show-feedback="false" label-placement="top" style="flex: 1">
          <n-input
            v-model:value="fileExtension"
            placeholder="e.g. png"
            :disabled="extensionAutoDetected"
            :title="extensionAutoDetected ? 'Auto-detected from Data URI' : ''"
          >
            <template v-if="extensionAutoDetected" #suffix>
              <c-tooltip tooltip="Auto-detected from Data URI header" position="left">
                <icon-mdi-auto-fix class="auto-icon" />
              </c-tooltip>
            </template>
          </n-input>
        </n-form-item>
      </div>

      <!-- Base64 输入框 -->
      <n-form-item
        :validation-status="base64Input && !base64InputValidation.isValid ? 'error' : undefined"
        :feedback="base64Input && !base64InputValidation.isValid ? 'Invalid Base64 string' : undefined"
        :show-label="false"
        style="margin-bottom: 0"
      >
        <n-input
          v-model:value="base64Input"
          type="textarea"
          placeholder="Paste your Base64 or Data URI string here…"
          :autosize="{ minRows: 5, maxRows: 8 }"
          clearable
          :status="base64Input && !base64InputValidation.isValid ? 'error' : undefined"
          style="font-family: 'Fira Code', monospace; font-size: 12px"
        />
      </n-form-item>

      <!-- 扩展名自动检测提示 -->
      <transition name="fade">
        <div v-if="extensionAutoDetected" class="auto-hint">
          <icon-mdi-information-outline class="hint-icon" />
          Extension auto-detected from Data URI header: <strong>.{{ fileExtension }}</strong>
        </div>
      </transition>

      <!-- 操作按钮 -->
      <div class="action-row">
        <c-button
          type="primary"
          :disabled="!base64Input || !base64InputValidation.isValid"
          @click="previewImage()"
        >
          <icon-mdi-image-outline style="margin-right:4px" />
          Preview image
        </c-button>
        <c-button
          type="primary"
          :disabled="!base64Input || !base64InputValidation.isValid"
          @click="downloadFile()"
        >
          <icon-mdi-download style="margin-right:4px" />
          Download file
        </c-button>
      </div>

      <!-- 预览区 -->
      <transition name="fade">
        <div v-if="previewError" class="preview-error">
          <icon-mdi-alert-circle-outline class="error-icon" />
          {{ previewError }}
        </div>
      </transition>

      <div id="previewContainer" class="preview-container" />
    </c-card>

    <!-- ══════════════════════════════════════════════ -->
    <!-- ② 文件 → Base64（右卡） -->
    <!-- ══════════════════════════════════════════════ -->
    <c-card class="b64f-card" title="File → Base64">
      <!-- 自定义 Dropzone -->
      <div
        class="dropzone"
        :class="{ over: isOverDrop, loading: isConverting }"
        @click="triggerInput"
        @drop.prevent="handleDrop"
        @dragover.prevent
        @dragenter="isOverDrop = true"
        @dragleave="isOverDrop = false"
      >
        <input ref="fileInput2" type="file" class="hidden-input" @change="handleFileInput" />

        <template v-if="isConverting">
          <n-spin size="medium" />
          <div class="dz-label">Converting…</div>
          <div class="dz-sublabel">{{ uploadedFile?.name }}</div>
        </template>
        <template v-else-if="uploadedFile && fullBase64">
          <icon-mdi-file-check class="dz-file-icon success-icon" />
          <div class="dz-label">{{ uploadedFile.name }}</div>
          <div class="dz-sublabel">{{ (uploadedFile.size / 1024).toFixed(1) }} KB · Click or drag to replace</div>
        </template>
        <template v-else>
          <icon-mdi-upload class="dz-file-icon" />
          <div class="dz-label">Drag &amp; drop a file here</div>
          <c-button type="primary" style="margin-top: 4px" @click.stop="triggerInput">
            <icon-mdi-folder-open-outline style="margin-right:5px" />
            Browse files
          </c-button>
          <div class="dz-size-hint">Max size: 10 MB</div>
        </template>
      </div>

      <!-- 大文件错误 -->
      <transition name="fade">
        <div v-if="sizeError" class="size-error-hint">
          <icon-mdi-alert-circle-outline class="error-icon" />
          {{ sizeError }}
        </div>
      </transition>

      <!-- 格式切换 -->
      <transition name="fade">
        <div v-if="fullBase64" class="format-row">
          <span class="format-label">Output format:</span>
          <n-radio-group v-model:value="includeDataUri" size="small">
            <n-radio :value="true">Data URI (with header)</n-radio>
            <n-radio :value="false">Raw Base64 only</n-radio>
          </n-radio-group>
        </div>
      </transition>

      <!-- 输出框（截断预览） -->
      <div v-if="fullBase64" class="output-wrap">
        <div class="output-label">
          Base64 output
          <c-tooltip :tooltip="base64Copied ? 'Copied!' : 'Copy full Base64'" position="right">
            <button
              class="copy-btn"
              :class="{ copied: base64Copied }"
              @click="copyBase64()"
            >
              <transition name="icon-sw" mode="out-in">
                <icon-mdi-check v-if="base64Copied" key="check" class="copy-icon success" />
                <icon-mdi-content-copy v-else key="copy" class="copy-icon" />
              </transition>
              {{ base64Copied ? 'Copied!' : 'Copy' }}
            </button>
          </c-tooltip>
        </div>
        <textarea
          class="output-area"
          :value="base64Preview"
          readonly
          spellcheck="false"
        />
        <div v-if="fullBase64.length > PREVIEW_LIMIT" class="truncate-hint">
          <icon-mdi-information-outline class="hint-icon" />
          Preview truncated to {{ PREVIEW_LIMIT }} chars to avoid browser freeze. Full content ({{ (fullBase64.length / 1024).toFixed(0) }} KB) is copied to clipboard.
        </div>
      </div>
    </c-card>
  </div>
</template>

<style scoped lang="less">
/* ── 双栏布局 ──────────────────────────────────────────────────────────── */
.b64f-layout {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  width: 100%;
  flex: 0 0 100%;

  @media (max-width: 720px) {
    flex-direction: column;
  }
}

.b64f-card {
  flex: 1 1 0;
  min-width: 0;
}

/* ── 文件名行 ──────────────────────────────────────────────────────────── */
.filename-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.auto-icon {
  font-size: 14px;
  color: #22c55e;
}

.auto-hint {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #22c55e;
  opacity: 0.85;
  margin-top: 5px;
}

/* ── 操作按钮 ──────────────────────────────────────────────────────────── */
.action-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 12px;
  justify-content: center;
}

/* ── 预览区 ────────────────────────────────────────────────────────────── */
.preview-container {
  margin-top: 10px;
  text-align: center;

  :deep(img) {
    max-width: 100%;
    max-height: 300px;
    border-radius: 6px;
    border: 1px solid rgba(128, 128, 128, 0.2);
  }
}

.preview-error {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #f97316;
  margin-top: 8px;
}

.hint-icon {
  font-size: 13px;
  flex-shrink: 0;
}

.error-icon {
  font-size: 14px;
  flex-shrink: 0;
}

/* ── Dropzone ──────────────────────────────────────────────────────────── */
.dropzone {
  border: 2px dashed rgba(128, 128, 128, 0.35);
  border-radius: 8px;
  padding: 28px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  text-align: center;
  transition: border-color 0.2s, background 0.2s;

  &:hover:not(.loading) {
    border-color: var(--primary-color, #6366f1);
    background: rgba(99, 102, 241, 0.04);
  }

  &.over {
    border-color: var(--primary-color, #6366f1);
    background: rgba(99, 102, 241, 0.08);
  }

  &.loading {
    cursor: default;
    opacity: 0.7;
  }
}

.hidden-input {
  display: none;
}

.dz-file-icon {
  font-size: 36px;
  opacity: 0.3;
}

.success-icon {
  color: #22c55e;
  opacity: 0.9;
}

.dz-label {
  font-size: 14px;
  font-weight: 500;
  opacity: 0.7;
}

.dz-sublabel {
  font-size: 12px;
  opacity: 0.4;
  font-family: monospace;
}

.dz-size-hint {
  font-size: 11px;
  opacity: 0.35;
  margin-top: -4px;
}

/* ── 大文件错误 ────────────────────────────────────────────────────────── */
.size-error-hint {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  font-size: 12px;
  color: #ef4444;
  margin-top: 8px;
  line-height: 1.4;
}

/* ── 格式切换 ──────────────────────────────────────────────────────────── */
.format-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.format-label {
  font-size: 13px;
  opacity: 0.55;
  flex-shrink: 0;
}

/* ── 输出区 ────────────────────────────────────────────────────────────── */
.output-wrap {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.output-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.5;
  display: flex;
  align-items: center;
  gap: 6px;
}

.output-area {
  width: 100%;
  min-height: 100px;
  max-height: 220px;
  padding: 10px 12px;
  border-radius: 5px;
  border: 1px solid rgba(128, 128, 128, 0.15);
  background: rgba(128, 128, 128, 0.05);
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 11px;
  line-height: 1.5;
  word-break: break-all;
  white-space: pre-wrap;
  overflow-y: auto;
  resize: none;
  color: inherit;
  cursor: default;
  box-sizing: border-box;

  &:focus {
    outline: none;
  }
}

.truncate-hint {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  font-size: 11px;
  opacity: 0.45;
  line-height: 1.4;
}

/* ── 复制按钮 ──────────────────────────────────────────────────────────── */
.copy-btn {
  margin-left: auto;
  border: none;
  background: transparent;
  cursor: pointer;
  color: inherit;
  opacity: 0.4;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  transition: opacity 0.15s, background 0.15s;

  &:hover {
    opacity: 1;
    background: rgba(128, 128, 128, 0.1);
  }

  &.copied {
    opacity: 1;
    color: #22c55e;
  }
}

.copy-icon {
  font-size: 13px;
}

.copy-icon.success {
  color: #22c55e;
}

/* ── 过渡动画 ──────────────────────────────────────────────────────────── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.icon-sw-enter-active,
.icon-sw-leave-active {
  transition: all 0.15s ease;
}

.icon-sw-enter-from,
.icon-sw-leave-to {
  opacity: 0;
  transform: scale(0.5);
}
</style>
