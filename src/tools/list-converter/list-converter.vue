<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { convert } from './list-converter.models';
import type { ConvertOptions } from './list-converter.types';
import { useCopy } from '@/composable/copy';

// ── 排序选项 ─────────────────────────────────────────────────────────────
const sortOrderOptions = [
  { label: 'Sort ascending', value: 'asc' },
  { label: 'Sort descending', value: 'desc' },
];

// ── 持久化配置 ────────────────────────────────────────────────────────────
const conversionConfig = useStorage<ConvertOptions>('list-converter:conversionConfig', {
  lowerCase: false,
  trimItems: true,
  removeDuplicates: true,
  keepLineBreaks: false,
  itemPrefix: '',
  itemSuffix: '',
  listPrefix: '',
  listSuffix: '',
  reverseList: false,
  sortList: null,
  separator: ', ',
});

// ── 输入/输出 ─────────────────────────────────────────────────────────────
const inputData = ref('');
const debouncedInput = refDebounced(inputData, 80);

const outputData = computed(() =>
  debouncedInput.value.trim() ? convert(debouncedInput.value, conversionConfig.value) : '',
);

// ── 统计 ─────────────────────────────────────────────────────────────────
const inputLineCount = computed(() =>
  inputData.value ? inputData.value.split('\n').filter(l => l.trim()).length : 0,
);
const outputLineCount = computed(() =>
  outputData.value ? outputData.value.split('\n').filter(l => l.trim()).length : 0,
);

// ── 操作 ─────────────────────────────────────────────────────────────────
function clearInput() {
  inputData.value = '';
}

const { copy, isJustCopied } = useCopy({ source: outputData, createToast: false });
</script>

<template>
  <div class="tool-wide lc-wrap">
    <!-- 控制面板 -->
    <c-card mb-3>
      <div class="control-grid">
        <!-- 开关列 -->
        <div class="switches-col">
          <div class="switch-row">
            <span class="switch-label">Trim list items</span>
            <n-switch v-model:value="conversionConfig.trimItems" size="small" />
          </div>
          <div class="switch-row">
            <span class="switch-label">Remove duplicates</span>
            <n-switch v-model:value="conversionConfig.removeDuplicates" size="small" data-test-id="removeDuplicates" />
          </div>
          <div class="switch-row">
            <span class="switch-label">Convert to lowercase</span>
            <n-switch v-model:value="conversionConfig.lowerCase" size="small" />
          </div>
          <div class="switch-row">
            <span class="switch-label">Keep line breaks</span>
            <n-switch v-model:value="conversionConfig.keepLineBreaks" size="small" />
          </div>
        </div>

        <!-- 分隔线 -->
        <div class="col-divider" />

        <!-- 选项列 -->
        <div class="options-col">
          <!-- Sort list -->
          <div class="option-row">
            <span class="option-label">Sort list</span>
            <c-select
              v-model:value="conversionConfig.sortList"
              :options="sortOrderOptions"
              :disabled="conversionConfig.reverseList"
              placeholder="No sorting"
              data-test-id="sortList"
              class="option-input"
            />
          </div>

          <!-- Separator -->
          <div class="option-row">
            <span class="option-label">Separator</span>
            <c-input-text
              v-model:value="conversionConfig.separator"
              placeholder=", "
              class="option-input"
            />
          </div>

          <!-- Wrap item -->
          <div class="option-row">
            <span class="option-label">Wrap item</span>
            <div class="dual-input">
              <c-input-text
                v-model:value="conversionConfig.itemPrefix"
                placeholder="Prefix"
                test-id="itemPrefix"
              />
              <c-input-text
                v-model:value="conversionConfig.itemSuffix"
                placeholder="Suffix"
                test-id="itemSuffix"
              />
            </div>
          </div>

          <!-- Wrap list -->
          <div class="option-row">
            <span class="option-label">Wrap list</span>
            <div class="dual-input">
              <c-input-text
                v-model:value="conversionConfig.listPrefix"
                placeholder="Prefix"
                test-id="listPrefix"
              />
              <c-input-text
                v-model:value="conversionConfig.listSuffix"
                placeholder="Suffix"
                test-id="listSuffix"
              />
            </div>
          </div>
        </div>
      </div>
    </c-card>

    <!-- 输入/输出双列 -->
    <div class="io-grid">
      <!-- 左：输入 -->
      <div class="io-pane">
        <div class="io-header">
          <span class="io-title">Input data</span>
          <div class="io-actions">
            <span v-if="inputLineCount" class="stat-badge">{{ inputLineCount }} items</span>
            <c-button
              v-if="inputData"
              variant="text"
              size="small"
              class="act-btn"
              title="Clear"
              @click="clearInput"
            >
              <icon-mdi-close />
            </c-button>
          </div>
        </div>
        <textarea
          v-model="inputData"
          class="io-textarea"
          placeholder="Paste your input data here..."
          spellcheck="false"
          data-test-id="input"
        />
      </div>

      <!-- 右：输出 -->
      <div class="io-pane">
        <div class="io-header">
          <span class="io-title">Transformed data</span>
          <div class="io-actions">
            <span v-if="outputLineCount" class="stat-badge">{{ outputLineCount }} items</span>
            <c-button
              v-if="outputData"
              variant="text"
              size="small"
              class="act-btn"
              :class="{ copied: isJustCopied }"
              title="Copy"
              @click="copy()"
            >
              <transition name="icon-fade" mode="out-in">
                <icon-mdi-check v-if="isJustCopied" key="check" class="icon-check" />
                <icon-mdi-content-copy v-else key="copy" />
              </transition>
            </c-button>
          </div>
        </div>
        <textarea
          class="io-textarea readonly"
          :value="outputData"
          placeholder="Transformed data will appear here…"
          readonly
          spellcheck="false"
          data-test-id="output"
        />
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.lc-wrap {
  display: flex;
  flex-direction: column;
}

// ── 控制面板 ──────────────────────────────────────────────────────────────
.control-grid {
  display: grid;
  grid-template-columns: auto 1px 1fr;
  gap: 0 20px;
  align-items: start;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;

    .col-divider {
      display: none;
    }
  }
}

.col-divider {
  background: rgba(128, 128, 128, 0.12);
  align-self: stretch;
}

// ── 开关列 ────────────────────────────────────────────────────────────────
.switches-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-width: 200px;
}

.switch-label {
  font-size: 13px;
  opacity: 0.7;
  white-space: nowrap;
}

// ── 选项列 ────────────────────────────────────────────────────────────────
.options-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-row {
  display: grid;
  grid-template-columns: 90px 1fr;
  align-items: center;
  gap: 10px;
}

.option-label {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.5;
  text-align: right;
  white-space: nowrap;
}

.option-input {
  width: 100%;
}

.dual-input {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

// ── 输入输出网格 ──────────────────────────────────────────────────────────
.io-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: stretch;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

// ── 面板 ──────────────────────────────────────────────────────────────────
.io-pane {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.io-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px;
  min-height: 26px;
}

.io-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  opacity: 0.4;
}

.io-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-badge {
  font-size: 10px;
  font-weight: 600;
  opacity: 0.35;
  background: rgba(128, 128, 128, 0.1);
  padding: 1px 7px;
  border-radius: 10px;
  font-variant-numeric: tabular-nums;
}

.act-btn {
  opacity: 0.4;
  transition: opacity 0.15s, color 0.2s;
  font-size: 15px;

  &:hover {
    opacity: 0.9;
  }

  &.copied {
    color: #22c55e;
    opacity: 1;
  }
}

.icon-check {
  color: #22c55e;
}

// ── 文本域 ────────────────────────────────────────────────────────────────
.io-textarea {
  flex: 1;
  min-height: calc(100vh - 260px);
  width: 100%;
  padding: 12px 14px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 13px;
  line-height: 1.65;
  border-radius: 8px;
  border: 1.5px solid rgba(128, 128, 128, 0.18);
  background: rgba(255, 255, 255, 0.85);
  color: inherit;
  resize: vertical;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;
  word-break: break-all;
  white-space: pre-wrap;

  &:focus {
    border-color: rgba(24, 160, 88, 0.6);
    box-shadow: 0 0 0 3px rgba(24, 160, 88, 0.1);
  }

  &::placeholder {
    color: rgba(128, 128, 128, 0.4);
    font-family: inherit;
  }

  &.readonly {
    background: rgba(128, 128, 128, 0.055);
    border-color: rgba(128, 128, 128, 0.12);
    cursor: default;
    resize: none;

    &:focus {
      border-color: rgba(128, 128, 128, 0.18);
      box-shadow: none;
    }
  }
}

// ── 深色模式 ──────────────────────────────────────────────────────────────
:global(.dark) .io-textarea {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.85);

  &:focus {
    border-color: rgba(24, 160, 88, 0.5);
    box-shadow: 0 0 0 3px rgba(24, 160, 88, 0.1);
  }

  &.readonly {
    background: rgba(255, 255, 255, 0.02);
    border-color: rgba(255, 255, 255, 0.07);
  }
}

// ── 图标动画 ──────────────────────────────────────────────────────────────
.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: all 0.15s ease;
}

.icon-fade-enter-from {
  opacity: 0;
  transform: scale(0.5) rotate(-10deg);
}

.icon-fade-leave-to {
  opacity: 0;
  transform: scale(0.5) rotate(10deg);
}
</style>
