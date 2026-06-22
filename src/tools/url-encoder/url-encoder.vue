<script setup lang="ts">
import { refDebounced } from '@vueuse/core';

const { t } = useI18n();

// ── 双向绑定状态 ──────────────────────────────────────────────────────────
// 标记最近一次是哪个框在编辑，防止循环更新
type ActivePane = 'plain' | 'encoded';
const activePane = ref<ActivePane>('plain');

const plainText = ref('Hello world :)');
const encodedText = ref('Hello%20world%20%3A)');

// 防抖，避免高频大文本卡顿
const debouncedPlain = refDebounced(plainText, 120);
const debouncedEncoded = refDebounced(encodedText, 120);

const encodeError = ref<string | null>(null);
const decodeError = ref<string | null>(null);

// 上方（明文）编辑 → 下方（编码）实时更新
watch(debouncedPlain, (val) => {
  if (activePane.value !== 'plain') {
    return;
  }
  try {
    encodedText.value = encodeURIComponent(val);
    encodeError.value = null;
  }
  catch (e: any) {
    encodeError.value = e?.message ?? 'Encode failed';
  }
});

// 下方（编码）编辑 → 上方（明文）实时更新
watch(debouncedEncoded, (val) => {
  if (activePane.value !== 'encoded') {
    return;
  }
  try {
    plainText.value = decodeURIComponent(val);
    decodeError.value = null;
  }
  catch (e: any) {
    decodeError.value = e?.message ?? 'Invalid percent-encoding sequence';
  }
});

// ── 编辑焦点切换 ──────────────────────────────────────────────────────────
function onPlainInput(v: string) {
  activePane.value = 'plain';
  plainText.value = v;
  encodeError.value = null;
  decodeError.value = null;
}

function onEncodedInput(v: string) {
  activePane.value = 'encoded';
  encodedText.value = v;
  encodeError.value = null;
  decodeError.value = null;
}

// ── 清空 ─────────────────────────────────────────────────────────────────
function clearAll() {
  plainText.value = '';
  encodedText.value = '';
  encodeError.value = null;
  decodeError.value = null;
  activePane.value = 'plain';
}

// ── 复制反馈 ─────────────────────────────────────────────────────────────
const copyPlainSuccess = ref(false);
const copyEncodedSuccess = ref(false);

async function copyPlain() {
  if (!plainText.value) {
    return;
  }
  await navigator.clipboard.writeText(plainText.value);
  copyPlainSuccess.value = true;
  setTimeout(() => (copyPlainSuccess.value = false), 1600);
}

async function copyEncoded() {
  if (!encodedText.value) {
    return;
  }
  await navigator.clipboard.writeText(encodedText.value);
  copyEncodedSuccess.value = true;
  setTimeout(() => (copyEncodedSuccess.value = false), 1600);
}

// ── 字符统计 ─────────────────────────────────────────────────────────────
const plainCharCount = computed(() => [...plainText.value].length);
const encodedCharCount = computed(() => encodedText.value.length);
</script>

<template>
  <div class="tool-wide url-encoder-wrap">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="direction-hint">
        <icon-mdi-arrow-up-down class="dir-icon" />
        <span>{{ t('tools.url-encoder.directionHint') }}</span>
      </div>
      <n-tooltip v-if="plainText || encodedText" trigger="hover" placement="top">
        <template #trigger>
          <button class="icon-btn icon-btn-danger" @click="clearAll">
            <icon-mdi-close class="btn-icon" />
          </button>
        </template>
        {{ t('tools.url-encoder.clearAll') }}
      </n-tooltip>
    </div>

    <!-- 上：明文区 -->
    <div class="pane" :class="{ 'pane-active': activePane === 'plain' }">
      <div class="pane-header">
        <span class="pane-title">{{ t('tools.url-encoder.plainText') }}</span>
        <div class="pane-right">
          <span class="char-count">{{ plainCharCount }} {{ t('tools.url-encoder.chars') }}</span>
          <n-tooltip v-if="plainText" trigger="hover" placement="top">
            <template #trigger>
              <button
                class="icon-btn"
                :class="{ 'icon-btn-success': copyPlainSuccess }"
                @click="copyPlain"
              >
                <icon-mdi-check v-if="copyPlainSuccess" class="btn-icon" />
                <icon-mdi-content-copy v-else class="btn-icon" />
              </button>
            </template>
            {{ copyPlainSuccess ? t('tools.url-encoder.copied') : t('tools.url-encoder.copyPlain') }}
          </n-tooltip>
        </div>
      </div>

      <textarea
        class="io-textarea"
        :class="{ 'is-active': activePane === 'plain' }"
        :value="plainText"
        :placeholder="t('tools.url-encoder.plainPlaceholder')"
        rows="5"
        spellcheck="false"
        @input="onPlainInput(($event.target as HTMLTextAreaElement).value)"
        @focus="activePane = 'plain'"
      />

      <transition name="err-slide">
        <div v-if="encodeError" class="error-inline">
          <icon-mdi-alert-circle-outline class="ei-icon" />
          <span>{{ encodeError }}</span>
        </div>
      </transition>
    </div>

    <!-- 中间箭头 -->
    <div class="pane-divider">
      <div class="arrow-track">
        <div class="arrow-line" />
        <div class="arrow-badge">
          <icon-mdi-arrow-down class="ab-icon encode-arrow" />
          <span class="ab-label">encode</span>
        </div>
        <div class="arrow-line" />
        <div class="arrow-badge reverse">
          <icon-mdi-arrow-up class="ab-icon decode-arrow" />
          <span class="ab-label">decode</span>
        </div>
        <div class="arrow-line" />
      </div>
    </div>

    <!-- 下：编码区 -->
    <div class="pane" :class="{ 'pane-active': activePane === 'encoded' }">
      <div class="pane-header">
        <span class="pane-title">{{ t('tools.url-encoder.urlEncoded') }}</span>
        <div class="pane-right">
          <span class="char-count">{{ encodedCharCount }} {{ t('tools.url-encoder.chars') }}</span>
          <n-tooltip v-if="encodedText" trigger="hover" placement="top">
            <template #trigger>
              <button
                class="icon-btn"
                :class="{ 'icon-btn-success': copyEncodedSuccess }"
                @click="copyEncoded"
              >
                <icon-mdi-check v-if="copyEncodedSuccess" class="btn-icon" />
                <icon-mdi-content-copy v-else class="btn-icon" />
              </button>
            </template>
            {{ copyEncodedSuccess ? t('tools.url-encoder.copied') : t('tools.url-encoder.copyEncoded') }}
          </n-tooltip>
        </div>
      </div>

      <textarea
        class="io-textarea"
        :class="{ 'is-active': activePane === 'encoded', 'has-error': !!decodeError }"
        :value="encodedText"
        :placeholder="t('tools.url-encoder.encodedPlaceholder')"
        rows="5"
        spellcheck="false"
        @input="onEncodedInput(($event.target as HTMLTextAreaElement).value)"
        @focus="activePane = 'encoded'"
      />

      <transition name="err-slide">
        <div v-if="decodeError" class="error-inline">
          <icon-mdi-alert-circle-outline class="ei-icon" />
          <span>{{ decodeError }}</span>
        </div>
      </transition>
    </div>
  </div>
</template>

<style lang="less" scoped>
.url-encoder-wrap {
  display: flex;
  flex-direction: column;
  gap: 0;
  max-width: 720px;
  margin: 0 auto;
}

// ── 工具栏 ────────────────────────────────────────────────────────────────
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.direction-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  opacity: 0.45;
}

.dir-icon {
  font-size: 14px;
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

// ── 面板 ──────────────────────────────────────────────────────────────────
.pane {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pane-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px;
}

.pane-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  opacity: 0.45;
}

.pane-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.char-count {
  font-size: 11px;
  opacity: 0.35;
  font-variant-numeric: tabular-nums;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

// ── 文本域 ────────────────────────────────────────────────────────────────
.io-textarea {
  width: 100%;
  padding: 12px 14px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 13px;
  line-height: 1.65;
  resize: vertical;
  border: 1.5px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: #fafafa;
  color: inherit;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  box-sizing: border-box;

  &::placeholder {
    color: rgba(0, 0, 0, 0.28);
    font-family: inherit;
  }

  &.is-active {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    background: #fff;
  }

  &.has-error {
    border-color: rgba(239, 68, 68, 0.6);
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(99, 102, 241, 0.25);
    border-radius: 3px;
  }

  // 深色模式
  :global(.dark) & {
    background: #0f1117;
    border-color: rgba(255, 255, 255, 0.1);
    color: #e2e8f0;

    &::placeholder {
      color: rgba(255, 255, 255, 0.22);
    }

    &.is-active {
      border-color: #818cf8;
      box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.12);
      background: #0f1117;
    }
  }
}

// ── 中间箭头分隔区 ────────────────────────────────────────────────────────
.pane-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 0;
}

.arrow-track {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.arrow-line {
  width: 1.5px;
  height: 10px;
  background: rgba(99, 102, 241, 0.2);
}

.arrow-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 20px;
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.18);
  margin: 3px 0;

  &.reverse {
    flex-direction: row-reverse;
    background: rgba(16, 185, 129, 0.07);
    border-color: rgba(16, 185, 129, 0.18);

    .ab-label { color: #059669; }
    .ab-icon { color: #059669; }
  }
}

.ab-icon {
  font-size: 12px;
  color: #6366f1;
}

.ab-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #6366f1;
}

.encode-arrow { color: #6366f1; }
.decode-arrow { color: #059669; }

// ── 错误提示 ──────────────────────────────────────────────────────────────
.error-inline {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 6px;
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.2);
  font-size: 12px;
  color: #dc2626;
  font-family: 'SF Mono', 'Fira Code', monospace;
  line-height: 1.5;
}

.ei-icon {
  flex-shrink: 0;
  font-size: 14px;
  color: #ef4444;
  margin-top: 1px;
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
</style>
