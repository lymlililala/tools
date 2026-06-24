<script setup lang="ts">
import { useCopy } from '@/composable/copy';
import { base64ToText, isValidBase64, textToBase64 } from '@/utils/base64';
import { withDefaultOnError } from '@/utils/defaults';

const { t } = useI18n();

const encodeUrlSafe = useStorage('base64-string-converter--encode-url-safe', false);

// ── 编码端 ────────────────────────────────────────────────────────────────
const textInput = ref('');
const base64Output = computed(() =>
  textInput.value ? textToBase64(textInput.value, { makeUrlSafe: encodeUrlSafe.value }) : '',
);
const { copy: copyBase64, isJustCopied: b64Copied } = useCopy({
  source: base64Output,
  text: 'Base64 string copied to the clipboard',
  createToast: false,
});

// ── 解码端 ────────────────────────────────────────────────────────────────
const base64Input = ref('');

const decodeError = computed(() => {
  const val = base64Input.value.trim();
  if (!val) {
    return '';
  }
  // 解码端自动兼容标准与 URL 安全两种字符集（js-base64 解码本身即可解析两者）
  if (!isValidBase64(val, { makeUrlSafe: true })) {
    return 'Invalid Base64 string. Please check for illegal characters or incorrect padding.';
  }
  return '';
});

const textOutput = computed(() => {
  const val = base64Input.value.trim();
  if (!val || decodeError.value) {
    return '';
  }
  return withDefaultOnError(() => base64ToText(val, { makeUrlSafe: true }), '');
});

const { copy: copyText, isJustCopied: textCopied } = useCopy({
  source: textOutput,
  text: 'Decoded string copied to the clipboard',
  createToast: false,
});
</script>

<template>
  <div class="tool-wide b64-layout">
    <!-- ① 左侧：编码 ─────────────────────────────────────────────────── -->
    <c-card class="b64-card" :title="t('tools.base64-string-converter.titleStringToBase64')">
      <!-- 顶部控制区（固定高度，与右侧对齐） -->
      <div class="b64-head">
        <!-- URL Safe 开关 -->
        <n-form-item :label="t('tools.base64-string-converter.encodeUrlSafe')" label-placement="left" :show-feedback="false" class="switch-row">
          <n-switch v-model:value="encodeUrlSafe" />
        </n-form-item>
        <p class="switch-hint">{{ t('tools.base64-string-converter.encodeUrlSafeTip') }}</p>
      </div>

      <!-- 输入框 -->
      <div class="area-wrap">
        <div class="area-label">
          {{ t('tools.base64-string-converter.stringToEncode') }}
          <button
            v-if="textInput"
            class="area-clear-btn"
            :title="t('tools.base64-string-converter.clearInput')"
            @click="textInput = ''"
          >
            <icon-mdi-close-circle class="clear-icon" />
          </button>
        </div>
        <textarea
          v-model="textInput"
          class="b64-textarea input-area"
          :placeholder="t('tools.base64-string-converter.stringPlaceholder')"
          spellcheck="false"
          autocomplete="off"
        />
      </div>

      <!-- 输出框（只读） -->
      <div class="area-wrap mt-12px">
        <div class="area-label">
          {{ t('tools.base64-string-converter.base64Output') }}
          <c-tooltip :tooltip="b64Copied ? t('tools.base64-string-converter.copied') : t('tools.base64-string-converter.copyBase64')" position="right">
            <button
              class="area-copy-btn"
              :class="{ copied: b64Copied }"
              :disabled="!base64Output"
              @click="copyBase64()"
            >
              <transition name="icon-sw" mode="out-in">
                <icon-mdi-check v-if="b64Copied" key="check" class="copy-icon success" />
                <icon-mdi-content-copy v-else key="copy" class="copy-icon" />
              </transition>
            </button>
          </c-tooltip>
        </div>
        <div class="output-area-wrap">
          <textarea
            class="b64-textarea output-area"
            :value="base64Output"
            :placeholder="t('tools.base64-string-converter.base64OutputPlaceholder')"
            readonly
            spellcheck="false"
          />
        </div>
      </div>
    </c-card>

    <!-- ② 右侧：解码 ─────────────────────────────────────────────────── -->
    <c-card class="b64-card" :title="t('tools.base64-string-converter.titleBase64ToString')">
      <!-- 顶部控制区（固定高度，与左侧对齐） -->
      <div class="b64-head">
        <!-- 解码自动兼容标准与 URL 安全字符集，无需手动切换 -->
        <p class="decode-note">
          <icon-mdi-information-outline class="decode-note-icon" />
          {{ t('tools.base64-string-converter.decodeAutoNote') }}
        </p>
      </div>

      <!-- 输入框 -->
      <div class="area-wrap">
        <div class="area-label">
          {{ t('tools.base64-string-converter.base64ToDecode') }}
          <button
            v-if="base64Input"
            class="area-clear-btn"
            :title="t('tools.base64-string-converter.clearInput')"
            @click="base64Input = ''"
          >
            <icon-mdi-close-circle class="clear-icon" />
          </button>
        </div>
        <textarea
          v-model="base64Input"
          class="b64-textarea input-area"
          :class="{ 'input-error': decodeError }"
          :placeholder="t('tools.base64-string-converter.base64InputPlaceholder')"
          spellcheck="false"
          autocomplete="off"
        />
        <!-- 解码错误提示 -->
        <transition name="fade">
          <div v-if="decodeError" class="error-hint">
            <icon-mdi-alert-circle-outline class="error-icon" />
            {{ decodeError }}
          </div>
        </transition>
      </div>

      <!-- 输出框（只读） -->
      <div class="area-wrap mt-12px">
        <div class="area-label">
          {{ t('tools.base64-string-converter.decodedString') }}
          <c-tooltip :tooltip="textCopied ? t('tools.base64-string-converter.copied') : t('tools.base64-string-converter.copyDecoded')" position="right">
            <button
              class="area-copy-btn"
              :class="{ copied: textCopied }"
              :disabled="!textOutput"
              @click="copyText()"
            >
              <transition name="icon-sw" mode="out-in">
                <icon-mdi-check v-if="textCopied" key="check" class="copy-icon success" />
                <icon-mdi-content-copy v-else key="copy" class="copy-icon" />
              </transition>
            </button>
          </c-tooltip>
        </div>
        <div class="output-area-wrap">
          <textarea
            class="b64-textarea output-area"
            :value="textOutput"
            :placeholder="t('tools.base64-string-converter.decodedPlaceholder')"
            readonly
            spellcheck="false"
          />
        </div>
      </div>
    </c-card>
  </div>
</template>

<style scoped lang="less">
/* ── 双栏布局 ──────────────────────────────────────────────────────────── */
.b64-layout {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  width: 100%;
  flex: 0 0 100%;

  @media (max-width: 680px) {
    flex-direction: column;
  }
}

.b64-card {
  flex: 1 1 0;
  min-width: 0;
}

/* ── 顶部控制区：左右等高，保证下方文本框对齐 ─────────────────────────── */
.b64-head {
  min-height: 78px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

/* ── URL Safe 开关行 ───────────────────────────────────────────────────── */
.switch-row {
  margin-bottom: 4px;
}

/* 开关下方常驻说明 */
.switch-hint {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  opacity: 0.5;
}

/* 解码端：自动兼容说明 */
.decode-note {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  opacity: 0.5;
}

.decode-note-icon {
  font-size: 14px;
  flex-shrink: 0;
  margin-top: 1px;
}

/* ── 标签行 ────────────────────────────────────────────────────────────── */
.area-label {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.55;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.area-wrap {
  display: flex;
  flex-direction: column;
}

.mt-12px {
  margin-top: 12px;
}

/* ── 清空按钮 ──────────────────────────────────────────────────────────── */
.area-clear-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  color: inherit;
  opacity: 0.35;
  padding: 0;
  display: flex;
  align-items: center;
  line-height: 1;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.8;
  }
}

.clear-icon {
  font-size: 14px;
}

/* ── 复制按钮（嵌入标签行） ─────────────────────────────────────────────── */
.area-copy-btn {
  margin-left: auto;
  border: none;
  background: transparent;
  cursor: pointer;
  color: inherit;
  opacity: 0.35;
  padding: 2px 4px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  transition: opacity 0.15s, background 0.15s;

  &:hover:not(:disabled) {
    opacity: 1;
    background: rgba(128, 128, 128, 0.1);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.12;
  }

  &.copied {
    opacity: 1;
  }
}

.copy-icon {
  font-size: 14px;
}

.copy-icon.success {
  color: #22c55e;
}

/* ── 文本框通用样式 ─────────────────────────────────────────────────────── */
.b64-textarea {
  width: 100%;
  padding: 10px 12px;
  border-radius: 5px;
  resize: vertical;
  outline: none;
  font-family: 'Fira Code', 'Consolas', 'Menlo', monospace; /* monospace 防止字符混淆 */
  font-size: 12.5px;
  line-height: 1.6;
  box-sizing: border-box;
  /* 最大高度限制：防止超长内容撑破布局 */
  max-height: 300px;
  min-height: 120px;
  overflow-y: auto;
  /* 防横向滚动：Base64 无换行时 wrap */
  word-break: break-all;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  transition: border-color 0.2s;
}

/* 输入框 */
.input-area {
  border: 1px solid rgba(128, 128, 128, 0.3);
  background: transparent;
  color: inherit;

  &:focus {
    border-color: var(--primary-color, #6366f1);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary-color, #6366f1) 15%, transparent);
  }

  &.input-error {
    border-color: #ef4444 !important;

    &:focus {
      box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.15);
    }
  }
}

/* 输出框（只读） */
.output-area-wrap {
  position: relative;
}

.output-area {
  border: 1px solid rgba(128, 128, 128, 0.15);
  background: rgba(128, 128, 128, 0.05);
  color: inherit;
  cursor: default;
  resize: none; /* 只读框不允许拖动调整 */

  /* 去除 focus 高亮，明确传达"不可输入"的心智模型 */
  &:focus {
    outline: none;
    box-shadow: none;
    border-color: rgba(128, 128, 128, 0.15);
  }
}

/* ── 解码错误提示 ─────────────────────────────────────────────────────── */
.error-hint {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  font-size: 12px;
  color: #ef4444;
  margin-top: 5px;
  line-height: 1.4;
}

.error-icon {
  font-size: 14px;
  flex-shrink: 0;
  margin-top: 1px;
}

/* ── 过渡动画 ──────────────────────────────────────────────────────────── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
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
