<script setup lang="ts">
import { useCopy } from '@/composable/copy';
import { base64ToText, isValidBase64, textToBase64 } from '@/utils/base64';
import { withDefaultOnError } from '@/utils/defaults';

const encodeUrlSafe = useStorage('base64-string-converter--encode-url-safe', false);
const decodeUrlSafe = useStorage('base64-string-converter--decode-url-safe', false);

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
  if (!val) return '';
  if (!isValidBase64(val, { makeUrlSafe: decodeUrlSafe.value })) {
    return 'Invalid Base64 string. Please check for illegal characters or incorrect padding.';
  }
  return '';
});

const textOutput = computed(() => {
  const val = base64Input.value.trim();
  if (!val || decodeError.value) return '';
  return withDefaultOnError(() => base64ToText(val, { makeUrlSafe: decodeUrlSafe.value }), '');
});

const { copy: copyText, isJustCopied: textCopied } = useCopy({
  source: textOutput,
  text: 'Decoded string copied to the clipboard',
  createToast: false,
});
</script>

<template>
  <div class="b64-layout tool-wide">
    <!-- ① 左侧：编码 ─────────────────────────────────────────────────── -->
    <c-card class="b64-card" title="String → Base64">
      <!-- URL Safe 开关 -->
      <n-form-item label="Encode URL safe" label-placement="left" :show-feedback="false" class="switch-row">
        <c-tooltip tooltip="Replaces + with - and / with _ for safe use in URLs" position="right">
          <n-switch v-model:value="encodeUrlSafe" />
        </c-tooltip>
      </n-form-item>

      <!-- 输入框 -->
      <div class="area-wrap">
        <div class="area-label">
          String to encode
          <button
            v-if="textInput"
            class="area-clear-btn"
            title="Clear input"
            @click="textInput = ''"
          >
            <icon-mdi-close-circle class="clear-icon" />
          </button>
        </div>
        <textarea
          v-model="textInput"
          class="b64-textarea input-area"
          placeholder="Put your string here…"
          spellcheck="false"
          autocomplete="off"
        />
      </div>

      <!-- 输出框（只读） -->
      <div class="area-wrap mt-12px">
        <div class="area-label">
          Base64 output
          <c-tooltip :tooltip="b64Copied ? 'Copied!' : 'Copy Base64'" position="right">
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
            placeholder="Base64 output will appear here…"
            readonly
            spellcheck="false"
          />
        </div>
      </div>
    </c-card>

    <!-- ② 右侧：解码 ─────────────────────────────────────────────────── -->
    <c-card class="b64-card" title="Base64 → String">
      <!-- URL Safe 开关 -->
      <n-form-item label="Decode URL safe" label-placement="left" :show-feedback="false" class="switch-row">
        <c-tooltip tooltip="Treats - as + and _ as / when decoding URL-safe Base64" position="right">
          <n-switch v-model:value="decodeUrlSafe" />
        </c-tooltip>
      </n-form-item>

      <!-- 输入框 -->
      <div class="area-wrap">
        <div class="area-label">
          Base64 string to decode
          <button
            v-if="base64Input"
            class="area-clear-btn"
            title="Clear input"
            @click="base64Input = ''"
          >
            <icon-mdi-close-circle class="clear-icon" />
          </button>
        </div>
        <textarea
          v-model="base64Input"
          class="b64-textarea input-area"
          :class="{ 'input-error': decodeError }"
          placeholder="Paste your Base64 string here…"
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
          Decoded string
          <c-tooltip :tooltip="textCopied ? 'Copied!' : 'Copy decoded string'" position="right">
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
            placeholder="Decoded string will appear here…"
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

/* ── URL Safe 开关行 ───────────────────────────────────────────────────── */
.switch-row {
  margin-bottom: 12px;
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
