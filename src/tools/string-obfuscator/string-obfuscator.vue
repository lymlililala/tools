<script setup lang="ts">
import { Check, Copy } from '@vicons/tabler';
import { useObfuscateString } from './string-obfuscator.model';
import { useCopy } from '@/composable/copy';

const { t } = useI18n();

const str = ref('Lorem ipsum dolor sit amet');
const keepFirst = ref(4);
const keepLast = ref(4);
const keepSpace = ref(true);

const obfuscatedString = useObfuscateString(str, { keepFirst, keepLast, keepSpace });

// 防呆：keepFirst + keepLast >= 字符串长度时禁用对应的 + 按钮
const strLen = computed(() => str.value.length);
const totalKept = computed(() => (keepFirst.value ?? 0) + (keepLast.value ?? 0));
const isOverLimit = computed(() => str.value.length > 0 && totalKept.value >= strLen.value);

// 复制反馈
const copied = ref(false);
const { copy } = useCopy({ source: obfuscatedString, text: computed(() => t('tools.string-obfuscator.copiedMsg')) });

async function handleCopy() {
  await copy();
  copied.value = true;
  setTimeout(() => (copied.value = false), 1800);
}

// 步进器：保证 >= 0，且 keepFirst + keepLast 不超过字符串长度（软限制，允许但不崩溃）
function stepKeepFirst(delta: number) {
  const next = Math.max(0, (keepFirst.value ?? 0) + delta);
  // 增加时：若加上后超过字符串长度则不继续增加
  if (delta > 0 && str.value.length > 0 && next + (keepLast.value ?? 0) >= strLen.value) {
    return;
  }
  keepFirst.value = next;
}
function stepKeepLast(delta: number) {
  const next = Math.max(0, (keepLast.value ?? 0) + delta);
  if (delta > 0 && str.value.length > 0 && (keepFirst.value ?? 0) + next >= strLen.value) {
    return;
  }
  keepLast.value = next;
}

function onKeepFirstBlur() {
  if (!Number.isFinite(keepFirst.value) || keepFirst.value < 0) {
    keepFirst.value = 0;
  }
}
function onKeepLastBlur() {
  if (!Number.isFinite(keepLast.value) || keepLast.value < 0) {
    keepLast.value = 0;
  }
}
</script>

<template>
  <div class="tool-wide so-wrapper">
    <!-- 输入区 -->
    <div class="section-label">
      {{ t('tools.string-obfuscator.inputLabel') }}
    </div>
    <c-input-text
      v-model:value="str"
      raw-text
      :placeholder="t('tools.string-obfuscator.inputPlaceholder')"
      clearable
      multiline
      class="so-input"
    />

    <!-- 控制区 -->
    <div class="controls-row">
      <!-- 保留前几位 -->
      <div class="control-group">
        <div class="control-label">
          {{ t('tools.string-obfuscator.keepFirst') }}
        </div>
        <div class="stepper">
          <button
            class="stepper-btn"
            :disabled="keepFirst <= 0"
            :aria-label="t('tools.string-obfuscator.decrease')"
            @click="stepKeepFirst(-1)"
          >
            −
          </button>
          <input
            v-model.number="keepFirst"
            class="stepper-input"
            type="number"
            min="0"
            @blur="onKeepFirstBlur"
          >
          <button
            class="stepper-btn"
            :disabled="isOverLimit"
            :aria-label="t('tools.string-obfuscator.increase')"
            @click="stepKeepFirst(1)"
          >
            +
          </button>
        </div>
      </div>

      <!-- 保留后几位 -->
      <div class="control-group">
        <div class="control-label">
          {{ t('tools.string-obfuscator.keepLast') }}
        </div>
        <div class="stepper">
          <button
            class="stepper-btn"
            :disabled="keepLast <= 0"
            :aria-label="t('tools.string-obfuscator.decrease')"
            @click="stepKeepLast(-1)"
          >
            −
          </button>
          <input
            v-model.number="keepLast"
            class="stepper-input"
            type="number"
            min="0"
            @blur="onKeepLastBlur"
          >
          <button
            class="stepper-btn"
            :disabled="isOverLimit"
            :aria-label="t('tools.string-obfuscator.increase')"
            @click="stepKeepLast(1)"
          >
            +
          </button>
        </div>
      </div>

      <!-- 保留空格 -->
      <div class="control-group control-group--switch">
        <div class="control-label">
          {{ t('tools.string-obfuscator.keepSpaces') }}
        </div>
        <n-switch v-model:value="keepSpace" />
      </div>
    </div>

    <!-- 超限警告 -->
    <div v-if="isOverLimit" class="over-limit-tip">
      ⚠️ {{ t('tools.string-obfuscator.overLimit', { kept: totalKept, total: strLen }) }}
    </div>

    <!-- 输出区：始终显示，空时给占位提示 -->
    <div class="output-card" :class="{ 'output-card--empty': !obfuscatedString }">
      <div class="output-text" :class="{ 'output-placeholder': !obfuscatedString }">
        {{ obfuscatedString || t('tools.string-obfuscator.outputPlaceholder') }}
      </div>
      <button
        v-if="obfuscatedString"
        class="copy-btn"
        :class="{ copied }"
        :title="copied ? t('tools.string-obfuscator.copied') : t('tools.string-obfuscator.copyResult')"
        @click="handleCopy"
      >
        <n-icon v-if="!copied" :component="Copy" size="16" />
        <n-icon v-else :component="Check" size="16" class="check-icon" />
      </button>
    </div>
  </div>
</template>

<style scoped>
/* ── 统一容器：与说明区对齐 ── */
.so-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── 输入区标签 ── */
.section-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--n-text-color-2, #555);
  margin-bottom: -8px;
}

.so-input {
  width: 100%;
}

/* ── 控制行 ── */
.controls-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  align-items: flex-end;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 110px;
}

.control-group--switch {
  flex: 0 0 auto;
  min-width: 80px;
}

.control-label {
  font-size: 12px;
  font-weight: 500;
  color: #888;
  white-space: nowrap;
}

/* ── 步进器 ── */
.stepper {
  display: flex;
  align-items: center;
  border: 1.5px solid var(--n-border-color, #e0e0e0);
  border-radius: 8px;
  overflow: hidden;
  background: var(--n-card-color, #fff);
  transition: border-color 0.2s;
}

.stepper:focus-within {
  border-color: var(--primary-color, #18a058);
  box-shadow: 0 0 0 3px rgba(24, 160, 88, 0.1);
}

.stepper-btn {
  width: 34px;
  height: 34px;
  border: none;
  background: transparent;
  color: var(--n-text-color-2, #555);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
  padding: 0;
}

.stepper-btn:hover:not(:disabled) {
  background: rgba(24, 160, 88, 0.08);
  color: var(--primary-color, #18a058);
}

.stepper-btn:active:not(:disabled) {
  background: rgba(24, 160, 88, 0.16);
}

.stepper-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.stepper-input {
  flex: 1;
  min-width: 0;
  text-align: center;
  border: none;
  border-left: 1px solid var(--n-border-color, #e8e8e8);
  border-right: 1px solid var(--n-border-color, #e8e8e8);
  outline: none;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: var(--n-text-color, #333);
  background: transparent;
  padding: 6px 4px;
  appearance: textfield;
  -moz-appearance: textfield;
}

.stepper-input::-webkit-outer-spin-button,
.stepper-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* ── 超限警告 ── */
.over-limit-tip {
  font-size: 12px;
  color: #b45309;
  background: rgba(251, 191, 36, 0.12);
  border: 1px solid rgba(251, 191, 36, 0.4);
  border-radius: 7px;
  padding: 7px 12px;
  line-height: 1.5;
}

/* ── 输出卡片 ── */
.output-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  /* 有内容时：浅绿底+绿边，与输入框视觉区分 */
  border: 1.5px solid rgba(24, 160, 88, 0.3);
  border-radius: 10px;
  background: rgba(24, 160, 88, 0.04);
  transition: border-color 0.2s, background 0.2s;
}

.output-card--empty {
  border-color: var(--n-border-color, #e8e8e8);
  background: var(--n-input-color, #fafafa);
}

.output-card:not(.output-card--empty):hover {
  border-color: rgba(24, 160, 88, 0.5);
  background: rgba(24, 160, 88, 0.07);
}

.output-text {
  flex: 1;
  min-width: 0;
  font-family: 'Fira Code', 'Cascadia Code', monospace;
  font-size: 14px;
  color: var(--n-text-color, #222);
  word-break: break-all;
  line-height: 1.6;
  letter-spacing: 0.03em;
}

.output-placeholder {
  color: #bbb;
  font-style: italic;
  font-family: inherit;
  letter-spacing: normal;
}

/* 复制按钮 */
.copy-btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border: 1.5px solid var(--n-border-color, #e0e0e0);
  border-radius: 7px;
  background: var(--n-card-color, #fff);
  color: var(--n-text-color-3, #aaa);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
  padding: 0;
}

.copy-btn:hover {
  border-color: var(--primary-color, #18a058);
  color: var(--primary-color, #18a058);
  background: rgba(24, 160, 88, 0.06);
}

.copy-btn.copied {
  border-color: var(--primary-color, #18a058);
  background: rgba(24, 160, 88, 0.1);
}

.check-icon {
  color: var(--primary-color, #18a058);
}

/* ── 移动端适配 ── */
@media (max-width: 480px) {
  .controls-row {
    gap: 14px;
  }

  .control-group {
    min-width: 90px;
  }
}
</style>
