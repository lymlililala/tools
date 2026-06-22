<script setup lang="ts">
// eslint-disable-next-line no-restricted-imports
import { refDebounced, useClipboard } from '@vueuse/core';
import { decodeSafeLinksURL } from './safelink-decoder.service';
import { useStyleStore } from '@/stores/style.store';

const styleStore = useStyleStore();
const { t } = useI18n();
const inputSafeLinkUrl = ref('');
const inputDebounced = refDebounced(inputSafeLinkUrl, 300);

/** 解码结果 */
const decodeResult = computed<{ success: true; url: string } | { success: false; error: string } | null>(() => {
  const raw = inputDebounced.value.trim();
  if (!raw) {
    return null;
  }
  try {
    const url = decodeSafeLinksURL(raw);
    if (!url) {
      return { success: false, error: t('tools.safelink-decoder.invalidUrl') };
    }
    return { success: true, url };
  }
  catch (e: any) {
    return { success: false, error: e?.message ?? t('tools.safelink-decoder.invalidUrl') };
  }
});

const outputText = computed(() => {
  if (!decodeResult.value) {
    return '';
  }
  if (decodeResult.value.success) {
    return decodeResult.value.url;
  }
  return '';
});

const hasError = computed(() => decodeResult.value !== null && !decodeResult.value.success);
const errorMessage = computed(() => (decodeResult.value && !decodeResult.value.success ? decodeResult.value.error : ''));
const hasSuccess = computed(() => decodeResult.value !== null && decodeResult.value.success);

/** 清空输入 */
function clearInput() {
  inputSafeLinkUrl.value = '';
}

/** 复制反馈 */
const { copy } = useClipboard({ legacy: true });
const copied = ref(false);
async function copyOutput() {
  if (!outputText.value) {
    return;
  }
  await copy(outputText.value);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}
</script>

<template>
  <div class="safelink-wrap" :class="{ dark: styleStore.isDarkTheme }">
    <!-- 输入区域 -->
    <div class="field-group">
      <label class="field-label">{{ t('tools.safelink-decoder.inputLabel') }}</label>
      <div class="input-wrapper" :class="{ 'has-error': hasError, 'has-success': hasSuccess }">
        <textarea
          v-model="inputSafeLinkUrl"
          class="url-textarea"
          :placeholder="t('tools.safelink-decoder.inputPlaceholder')"
          spellcheck="false"
          autofocus
          rows="4"
        />
        <button v-if="inputSafeLinkUrl" class="clear-btn" :title="t('tools.safelink-decoder.clear')" @click="clearInput">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
      </div>
      <!-- 错误提示 -->
      <transition name="err-slide">
        <div v-if="hasError" class="error-banner">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0">
            <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5" />
            <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
          <span>{{ errorMessage }}</span>
        </div>
      </transition>
    </div>

    <!-- 输出区域 -->
    <div class="field-group">
      <label class="field-label">{{ t('tools.safelink-decoder.outputLabel') }}</label>
      <div
        class="output-box"
        :class="{
          'output-success': hasSuccess,
          'output-empty': !decodeResult,
          'output-error': hasError,
        }"
      >
        <!-- 空状态 -->
        <div v-if="!decodeResult" class="output-placeholder">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" opacity="0.35">
            <rect x="4" y="8" width="24" height="3" rx="1.5" fill="currentColor" />
            <rect x="4" y="14" width="18" height="3" rx="1.5" fill="currentColor" />
            <rect x="4" y="20" width="21" height="3" rx="1.5" fill="currentColor" />
          </svg>
          <span>{{ t('tools.safelink-decoder.outputPlaceholder') }}</span>
        </div>
        <!-- 成功内容 -->
        <div v-else-if="hasSuccess" class="output-content">
          <a :href="outputText" target="_blank" rel="noopener noreferrer" class="decoded-link">
            {{ outputText }}
          </a>
        </div>
        <!-- 输出错误（冗余防护） -->
        <div v-else class="output-placeholder output-err-text">
          <!-- hasError banner already shown above, keep output box empty on error -->
        </div>

        <!-- 复制按钮 -->
        <button
          v-if="hasSuccess"
          class="copy-btn"
          :class="{ copied }"
          :title="t('tools.safelink-decoder.copyTitle')"
          @click="copyOutput"
        >
          <svg v-if="!copied" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2" />
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span>{{ copied ? t('tools.safelink-decoder.copied') : t('tools.safelink-decoder.copy') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.safelink-wrap {
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ── Field Group ── */
.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: #444;
  letter-spacing: 0.01em;
  .dark & { color: #ccc; }
}

/* ── Input Wrapper ── */
.input-wrapper {
  position: relative;
  border-radius: 8px;
  border: 1.5px solid #d9d9d9;
  transition: border-color 0.2s;
  background: #fff;

  .dark & {
    background: #1e1e1e;
    border-color: #444;
  }

  &:focus-within {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
  }

  &.has-error {
    border-color: #ef4444;
    &:focus-within { box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12); }
  }

  &.has-success {
    border-color: #22c55e;
    &:focus-within { box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.12); }
  }
}

.url-textarea {
  display: block;
  width: 100%;
  min-height: 96px;
  max-height: 240px;
  padding: 10px 40px 10px 12px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 13.5px;
  font-family: 'Menlo', 'Consolas', 'JetBrains Mono', monospace;
  color: #222;
  resize: vertical;
  line-height: 1.6;
  box-sizing: border-box;

  .dark & { color: #e0e0e0; }

  &::placeholder {
    color: #aaa;
    font-family: inherit;
  }
}

/* ── Clear Button ── */
.clear-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 22px;
  height: 22px;
  border: none;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #888;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: rgba(0, 0, 0, 0.12);
    color: #333;
  }

  .dark & {
    background: rgba(255, 255, 255, 0.08);
    color: #aaa;
    &:hover { background: rgba(255, 255, 255, 0.15); color: #eee; }
  }
}

/* ── Error Banner ── */
.error-banner {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #dc2626;
  padding: 6px 10px;
  background: rgba(239, 68, 68, 0.06);
  border-radius: 6px;
  border: 1px solid rgba(239, 68, 68, 0.2);

  .dark & {
    background: rgba(239, 68, 68, 0.08);
    border-color: rgba(239, 68, 68, 0.3);
    color: #f87171;
  }
}

.err-slide-enter-active,
.err-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.err-slide-enter-from,
.err-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ── Output Box ── */
.output-box {
  position: relative;
  min-height: 80px;
  border-radius: 8px;
  border: 1.5px solid #e5e7eb;
  background: #f9fafb;
  padding: 12px 14px;
  transition: border-color 0.2s, background 0.2s;

  .dark & {
    background: #1a1a1a;
    border-color: #333;
  }

  &.output-success {
    border-color: #22c55e;
    background: rgba(34, 197, 94, 0.04);
    padding-bottom: 48px; /* room for copy button */

    .dark & {
      background: rgba(34, 197, 94, 0.06);
      border-color: #16a34a;
    }
  }
}

.output-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 0;
  color: #bbb;
  font-size: 13px;

  .dark & { color: #555; }
}

.output-content {
  word-break: break-all;
  line-height: 1.65;
}

.decoded-link {
  font-size: 13.5px;
  font-family: 'Menlo', 'Consolas', monospace;
  color: #2563eb;
  text-decoration: none;

  &:hover { text-decoration: underline; }

  .dark & { color: #60a5fa; }
}

/* ── Copy Button ── */
.copy-btn {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  font-size: 12px;
  color: #555;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;

  &:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
    color: #111;
  }

  &.copied {
    border-color: #22c55e;
    background: rgba(34, 197, 94, 0.08);
    color: #16a34a;
  }

  .dark & {
    background: #252525;
    border-color: #444;
    color: #ccc;

    &:hover { background: #2e2e2e; border-color: #666; color: #eee; }
    &.copied { background: rgba(34, 197, 94, 0.1); border-color: #22c55e; color: #4ade80; }
  }
}
</style>
