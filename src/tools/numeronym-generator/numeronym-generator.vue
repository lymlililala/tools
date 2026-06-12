<script setup lang="ts">
import { Check, Copy } from '@vicons/tabler';
import { generateNumeronymPhrase } from './numeronym-generator.service';
import { useCopy } from '@/composable/copy';

const { t } = useI18n();

const word = ref('');

// 使用短语级生成函数，支持多单词（TC-05）
const numeronym = computed(() => generateNumeronymPhrase(word.value));

// 是否有输入内容（用于箭头图标动态着色）
const hasInput = computed(() => word.value.trim().length > 0);

// 复制反馈
const copied = ref(false);
const { copy } = useCopy({ source: numeronym, text: computed(() => t('tools.numeronym-generator.numeronymCopied')) });

async function handleCopy() {
  if (!numeronym.value) {
    return;
  }
  await copy();
  copied.value = true;
  setTimeout(() => (copied.value = false), 1800);
}
</script>

<template>
  <div class="ng-wrapper">
    <!-- 输入框 -->
    <div class="input-section">
      <label class="field-label" for="ng-input">{{ t('tools.numeronym-generator.inputLabel') }}</label>
      <c-input-text
        id="ng-input"
        v-model:value="word"
        :placeholder="t('tools.numeronym-generator.inputPlaceholder')"
        size="large"
        clearable
        test-id="word-input"
        class="ng-input"
      />
    </div>

    <!-- 动态箭头 -->
    <div class="arrow-row">
      <div class="arrow-icon" :class="{ active: hasInput }">
        <icon-mdi-arrow-down />
      </div>
      <span v-if="hasInput" class="arrow-hint">{{ t('tools.numeronym-generator.realtime') }}</span>
    </div>

    <!-- 输出框 -->
    <div class="output-section">
      <label class="field-label">{{ t('tools.numeronym-generator.outputLabel') }}</label>
      <div class="output-card" :class="{ 'has-result': numeronym }">
        <span
          class="output-text"
          :class="{ 'output-placeholder': !numeronym }"
          :title="numeronym || ''"
        >
          {{ numeronym || t('tools.numeronym-generator.placeholder') }}
        </span>

        <c-tooltip :tooltip="copied ? t('tools.numeronym-generator.justCopied') : t('tools.numeronym-generator.copyResult')" placement="top">
          <button
            class="copy-btn"
            :class="{ copied, disabled: !numeronym }"
            :disabled="!numeronym"
            @click="handleCopy"
          >
            <n-icon v-if="!copied" :component="Copy" size="15" />
            <n-icon v-else :component="Check" size="15" class="check-icon" />
          </button>
        </c-tooltip>
      </div>

      <!-- 多单词说明 -->
      <div v-if="word.trim().includes(' ')" class="multi-word-hint">
        <icon-mdi-information-outline class="hint-icon" />
        {{ t('tools.numeronym-generator.multiWordHint') }}
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── 容器：限制最大宽度，居中 ── */
.ng-wrapper {
  max-width: 560px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* ── 字段标签 ── */
.field-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #888;
  margin-bottom: 6px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

/* ── 输入区 ── */
.input-section {
  width: 100%;
}

.ng-input {
  width: 100%;
}

/* ── 动态箭头 ── */
.arrow-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0 4px;
  gap: 2px;
}

.arrow-icon {
  font-size: 28px;
  color: #ccc;
  transition: color 0.3s, transform 0.3s;
  line-height: 1;
}

.arrow-icon.active {
  color: var(--primary-color, #18a058);
  transform: translateY(2px);
}

.arrow-hint {
  font-size: 11px;
  color: var(--primary-color, #18a058);
  opacity: 0.8;
  letter-spacing: 0.05em;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* ── 输出区 ── */
.output-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.output-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 1.5px solid var(--n-border-color, #e0e0e0);
  border-radius: 8px;
  background: var(--n-input-color, #fafafa);
  min-height: 48px;
  transition: border-color 0.25s, background 0.25s;
}

/* 有结果时绿色边框 */
.output-card.has-result {
  border-color: rgba(24, 160, 88, 0.35);
  background: rgba(24, 160, 88, 0.04);
}

.output-card.has-result:hover {
  border-color: rgba(24, 160, 88, 0.55);
}

.output-text {
  flex: 1;
  min-width: 0;
  font-size: 18px;
  font-weight: 700;
  font-family: 'Fira Code', 'Cascadia Code', monospace;
  font-variant-numeric: tabular-nums;
  color: var(--n-text-color, #1a1a1a);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.output-placeholder {
  font-size: 14px;
  font-weight: 400;
  font-family: inherit;
  color: #bbb;
  font-style: italic;
}

/* 复制按钮 */
.copy-btn {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border: 1.5px solid var(--n-border-color, #e0e0e0);
  border-radius: 6px;
  background: var(--n-card-color, #fff);
  color: var(--n-text-color-3, #aaa);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
  padding: 0;
}

.copy-btn:hover:not(.disabled) {
  border-color: var(--primary-color, #18a058);
  color: var(--primary-color, #18a058);
  background: rgba(24, 160, 88, 0.06);
}

.copy-btn.copied {
  border-color: var(--primary-color, #18a058);
  background: rgba(24, 160, 88, 0.1);
}

.copy-btn.disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.check-icon {
  color: var(--primary-color, #18a058);
}

/* ── 多单词提示 ── */
.multi-word-hint {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #888;
}

.hint-icon {
  font-size: 14px;
  color: var(--primary-color, #18a058);
  flex-shrink: 0;
}

/* ── 移动端适配 ── */
@media (max-width: 480px) {
  .ng-wrapper {
    max-width: 100%;
  }
}
</style>
