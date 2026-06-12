<script setup lang="ts">
import verifyPDF from 'pdf-signature-reader';
import type { SignatureInfo } from './pdf-signature-checker.types';
import { formatBytes } from '@/utils/convert';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const signatures = ref<SignatureInfo[]>([]);
const status = ref<'idle' | 'parsed' | 'error' | 'loading' | 'no-signature' | 'type-error' | 'size-error'>('idle');
const file = ref<File | null>(null);
const isOverDrop = ref(false);

// 拖拽悬浮处理（通过在 dropzone 容器上监听事件）
function onDragEnter() {
  isOverDrop.value = true;
}
function onDragLeave() {
  isOverDrop.value = false;
}

async function onFileSelected(uploadedFile: File) {
  isOverDrop.value = false;

  // 文件类型校验
  if (!uploadedFile.name.toLowerCase().endsWith('.pdf') && uploadedFile.type !== 'application/pdf') {
    status.value = 'type-error';
    file.value = null;
    return;
  }

  // 文件大小校验
  if (uploadedFile.size > MAX_FILE_SIZE) {
    status.value = 'size-error';
    file.value = null;
    return;
  }

  file.value = uploadedFile;
  status.value = 'loading';
  signatures.value = [];

  try {
    const fileBuffer = await uploadedFile.arrayBuffer();
    const { signatures: parsedSignatures } = verifyPDF(fileBuffer);

    if (!parsedSignatures || parsedSignatures.length === 0) {
      status.value = 'no-signature';
    }
    else {
      signatures.value = parsedSignatures;
      status.value = 'parsed';
    }
  }
  catch {
    status.value = 'error';
  }
}

// 手动文件输入
const fileInput = ref<HTMLInputElement | null>(null);
function triggerInput() {
  if (status.value === 'loading') {
    return;
  }
  fileInput.value?.click();
}
function handleInput(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (f) {
    onFileSelected(f);
  }
  // 重置 input 以允许选同一文件再次触发
  (e.target as HTMLInputElement).value = '';
}
function handleDrop(e: DragEvent) {
  e.preventDefault();
  isOverDrop.value = false;
  const f = e.dataTransfer?.files?.[0];
  if (f) {
    onFileSelected(f);
  }
}

function reset() {
  status.value = 'idle';
  file.value = null;
  signatures.value = [];
}
</script>

<template>
  <div class="psc-wrap">
    <!-- ① Dropzone（自定义槽位，替换冗余文案） -->
    <div
      class="dropzone"
      :class="{ over: isOverDrop, loading: status === 'loading', disabled: status === 'loading' }"
      @click="triggerInput"
      @drop.prevent="handleDrop"
      @dragover.prevent
      @dragenter="onDragEnter"
      @dragleave="onDragLeave"
    >
      <input
        ref="fileInput"
        type="file"
        accept=".pdf,application/pdf"
        class="hidden-input"
        @change="handleInput"
      >

      <!-- Loading 中 -->
      <template v-if="status === 'loading'">
        <n-spin size="medium" />
        <div class="dz-title">
          Analysing signatures…
        </div>
        <div class="dz-filename">
          {{ file?.name }}
        </div>
      </template>

      <!-- 空闲/重新上传 -->
      <template v-else>
        <icon-mdi-file-pdf-box class="dz-pdf-icon" />
        <div class="dz-title">
          Drag &amp; drop a PDF here
        </div>
        <c-button type="primary" class="dz-btn" @click.stop="triggerInput">
          <icon-mdi-folder-open-outline style="margin-right:5px" />
          Browse files
        </c-button>
        <!-- 格式/大小提示 -->
        <div class="dz-hint">
          Supported: .pdf &nbsp;·&nbsp; Max size: 50 MB
        </div>
      </template>
    </div>

    <!-- ② 隐私锁标识（始终可见，增强信任感） -->
    <div class="privacy-badge">
      <icon-mdi-lock class="lock-icon" />
      <span>100% local processing — your file is never uploaded to any server</span>
    </div>

    <!-- ③ 错误提示：类型错误 -->
    <transition name="fade">
      <c-alert v-if="status === 'type-error'" type="error" class="alert-msg">
        <icon-mdi-alert-circle-outline style="margin-right:6px" />
        Only PDF files are supported. Please select a <strong>.pdf</strong> file.
      </c-alert>
    </transition>

    <!-- ④ 错误提示：超大文件 -->
    <transition name="fade">
      <c-alert v-if="status === 'size-error'" type="error" class="alert-msg">
        <icon-mdi-alert-circle-outline style="margin-right:6px" />
        File is too large (max 50 MB). Please use a smaller PDF.
      </c-alert>
    </transition>

    <!-- ⑤ 无签名提示 -->
    <transition name="fade">
      <div v-if="status === 'no-signature'" class="state-card no-sig">
        <icon-mdi-file-document-outline class="state-icon" />
        <div class="state-title">
          No digital signatures found
        </div>
        <div class="state-sub">
          <strong>{{ file?.name }}</strong> does not contain any embedded digital signatures.
        </div>
        <c-button class="retry-btn" @click="reset">
          <icon-mdi-refresh style="margin-right:5px" />
          Try another file
        </c-button>
      </div>
    </transition>

    <!-- ⑥ 解析出错提示 -->
    <transition name="fade">
      <div v-if="status === 'error'" class="state-card error-state">
        <icon-mdi-alert-circle class="state-icon error-icon" />
        <div class="state-title">
          Failed to parse PDF
        </div>
        <div class="state-sub">
          The file may be corrupted or in an unsupported format.
        </div>
        <c-button class="retry-btn" @click="reset">
          <icon-mdi-refresh style="margin-right:5px" />
          Try another file
        </c-button>
      </div>
    </transition>

    <!-- ⑦ 签名结果 -->
    <transition name="slide-down">
      <div v-if="status === 'parsed' && signatures.length" class="results-wrap">
        <!-- 文件信息条 -->
        <div class="file-bar">
          <icon-mdi-file-pdf-box class="file-bar-icon" />
          <span class="file-bar-name">{{ file?.name }}</span>
          <span class="file-bar-size">{{ formatBytes(file!.size) }}</span>
          <button class="file-bar-reset" title="Analyse another file" @click="reset">
            <icon-mdi-close />
          </button>
        </div>

        <div v-for="(signature, index) of signatures" :key="index" class="sig-block">
          <!-- 签名状态头部 -->
          <div class="sig-header">
            <span class="sig-title">Signature {{ index + 1 }}</span>
            <div class="sig-badges">
              <!-- verified -->
              <span
                class="badge"
                :class="signature.verified ? 'badge-ok' : 'badge-fail'"
              >
                <icon-mdi-check-circle v-if="signature.verified" />
                <icon-mdi-close-circle v-else />
                {{ signature.verified ? 'Verified' : 'Not Verified' }}
              </span>
              <!-- integrity -->
              <span
                class="badge"
                :class="signature.integrity ? 'badge-ok' : 'badge-fail'"
              >
                <icon-mdi-shield-check v-if="signature.integrity" />
                <icon-mdi-shield-off v-else />
                {{ signature.integrity ? 'Intact' : 'Tampered' }}
              </span>
              <!-- expired -->
              <span
                class="badge"
                :class="signature.expired ? 'badge-warn' : 'badge-ok'"
              >
                <icon-mdi-clock-alert v-if="signature.expired" />
                <icon-mdi-clock-check v-else />
                {{ signature.expired ? 'Cert Expired' : 'Cert Valid' }}
              </span>
            </div>
          </div>

          <!-- 签名元数据（如有） -->
          <div v-if="signature.meta?.signatureMeta" class="sig-meta">
            <template v-if="signature.meta.signatureMeta.name">
              <span class="meta-label">Signed by:</span>
              <span class="meta-value">{{ signature.meta.signatureMeta.name }}</span>
            </template>
            <template v-if="signature.meta.signatureMeta.reason">
              <span class="meta-label">Reason:</span>
              <span class="meta-value">{{ signature.meta.signatureMeta.reason }}</span>
            </template>
            <template v-if="signature.meta.signatureMeta.location">
              <span class="meta-label">Location:</span>
              <span class="meta-value">{{ signature.meta.signatureMeta.location }}</span>
            </template>
          </div>

          <!-- 证书详情 -->
          <pdf-signature-details :signature="signature" />
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="less">
.psc-wrap {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ── Dropzone ────────────────────────────────────────────────────────────── */
.dropzone {
  border: 2px dashed rgba(128, 128, 128, 0.4);
  border-radius: 10px;
  padding: 36px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  text-align: center;

  &:hover:not(.disabled) {
    border-color: var(--primary-color, #6366f1);
    background: rgba(99, 102, 241, 0.04);
  }

  &.over {
    border-color: var(--primary-color, #6366f1);
    border-width: 2px;
    background: rgba(99, 102, 241, 0.08);
  }

  &.loading {
    cursor: default;
    opacity: 0.75;
  }
}

.hidden-input {
  display: none;
}

.dz-pdf-icon {
  font-size: 40px;
  opacity: 0.35;
  color: #ef4444;
}

.dz-title {
  font-size: 15px;
  font-weight: 500;
  opacity: 0.7;
}

.dz-filename {
  font-size: 13px;
  opacity: 0.5;
  font-family: monospace;
}

.dz-btn {
  margin-top: 2px;
}

.dz-hint {
  font-size: 12px;
  opacity: 0.4;
  margin-top: -4px;
}

/* ── 隐私标识 ─────────────────────────────────────────────────────────────── */
.privacy-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  opacity: 0.55;
}

.lock-icon {
  color: #22c55e;
  font-size: 14px;
  opacity: 1;
}

/* ── 警告/提示 ───────────────────────────────────────────────────────────── */
.alert-msg {
  display: flex;
  align-items: center;
}

/* ── 状态卡（无签名/错误） ──────────────────────────────────────────────── */
.state-card {
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: 8px;
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.state-icon {
  font-size: 40px;
  opacity: 0.4;
}

.error-icon {
  color: #ef4444;
  opacity: 0.7;
}

.state-title {
  font-size: 16px;
  font-weight: 600;
}

.state-sub {
  font-size: 13px;
  opacity: 0.6;
  line-height: 1.5;
}

.retry-btn {
  margin-top: 8px;
}

/* ── 结果区域 ─────────────────────────────────────────────────────────────── */
.results-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 文件信息条 */
.file-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: 6px;
  background: rgba(128, 128, 128, 0.04);
  font-size: 13px;
}

.file-bar-icon {
  font-size: 18px;
  color: #ef4444;
  flex-shrink: 0;
}

.file-bar-name {
  font-weight: 600;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-bar-size {
  opacity: 0.5;
  flex-shrink: 0;
}

.file-bar-reset {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: inherit;
  opacity: 0.4;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  flex-shrink: 0;
  transition: opacity 0.15s;

  &:hover {
    opacity: 1;
    background: rgba(128, 128, 128, 0.1);
  }
}

/* 签名块 */
.sig-block {
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: 8px;
  overflow: hidden;
}

.sig-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.15);
  background: rgba(128, 128, 128, 0.04);
}

.sig-title {
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.sig-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.badge-ok {
  background: rgba(34, 197, 94, 0.12);
  color: #16a34a;
}

.badge-fail {
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
}

.badge-warn {
  background: rgba(234, 179, 8, 0.12);
  color: #b45309;
}

/* 签名元数据 */
.sig-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  padding: 8px 14px;
  font-size: 13px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.1);
  background: rgba(128, 128, 128, 0.02);
}

.meta-label {
  opacity: 0.55;
  flex-shrink: 0;
}

.meta-value {
  font-weight: 500;
}

/* ── 动画 ──────────────────────────────────────────────────────────────── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active {
  transition: all 0.25s ease-out;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
