<script setup lang="ts">
import type { lib } from 'crypto-js';
import { MD5, RIPEMD160, SHA1, SHA224, SHA256, SHA3, SHA384, SHA512, enc } from 'crypto-js';

import { convertHexToBin } from './hash-text.service';
import { useQueryParam } from '@/composable/queryParams';

const algos = {
  MD5,
  SHA1,
  SHA256,
  SHA224,
  SHA512,
  SHA384,
  SHA3,
  RIPEMD160,
} as const;

type AlgoNames = keyof typeof algos;
type Encoding = keyof typeof enc | 'Bin';
const algoNames = Object.keys(algos) as AlgoNames[];
const { t } = useI18n();
const encoding = useQueryParam<Encoding>({ defaultValue: 'Hex', name: 'encoding' });
const clearText = ref('');

function formatWithEncoding(words: lib.WordArray, encoding: Encoding) {
  if (encoding === 'Bin') {
    return convertHexToBin(words.toString(enc.Hex));
  }
  return words.toString(enc[encoding]);
}

const hashText = (algo: AlgoNames, value: string) => formatWithEncoding(algos[algo](value), encoding.value);

// ── 每行独立复制状态 ────────────────────────────────────────────────────────────
const copiedAlgo = ref<AlgoNames | null>(null);
let copiedTimer: ReturnType<typeof setTimeout> | null = null;

async function copyHash(algo: AlgoNames) {
  const text = hashText(algo, clearText.value);
  try {
    await navigator.clipboard.writeText(text);
  }
  catch {
    // legacy fallback
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
  copiedAlgo.value = algo;
  if (copiedTimer) {
    clearTimeout(copiedTimer);
  }
  copiedTimer = setTimeout(() => {
    copiedAlgo.value = null;
  }, 1800);
}
</script>

<template>
  <div class="tool-wide hash-tool">
    <c-card>
      <!-- ① 输入框 + 清空按钮 -->
      <div class="input-wrapper-outer">
        <label class="input-label">{{ t('tools.hash-text.inputLabel') }}</label>
        <div class="textarea-wrap">
          <textarea
            v-model="clearText"
            class="hash-textarea"
            :placeholder="t('tools.hash-text.inputPlaceholder')"
            rows="3"
            spellcheck="false"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
          />
          <button v-if="clearText" class="clear-btn" :title="t('tools.hash-text.clear')" @click="clearText = ''">
            <icon-mdi-close />
          </button>
        </div>
      </div>

      <n-divider />

      <!-- ② 编码选择 -->
      <c-select
        v-model:value="encoding"
        mb-4
        :label="t('tools.hash-text.digestEncoding')"
        :options="[
          { label: t('tools.hash-text.encBin'), value: 'Bin' },
          { label: t('tools.hash-text.encHex'), value: 'Hex' },
          { label: t('tools.hash-text.encBase64'), value: 'Base64' },
          { label: t('tools.hash-text.encBase64url'), value: 'Base64url' },
        ]"
      />

      <!-- ③ Hash 结果列表 -->
      <div class="hash-list">
        <div v-for="algo in algoNames" :key="algo" class="hash-row">
          <!-- 算法名称：固定宽度、加粗 -->
          <div class="algo-name">
            {{ algo }}
          </div>

          <!-- Hash 值：等宽字体、超长截断 + Tooltip -->
          <c-tooltip :tooltip="hashText(algo, clearText)" position="bottom" class="hash-value-wrap">
            <div class="hash-value">
              {{ hashText(algo, clearText) }}
            </div>
          </c-tooltip>

          <!-- 复制按钮：固定不移位，带 ✓ 切换 -->
          <button
            class="copy-btn"
            :class="{ copied: copiedAlgo === algo }"
            :title="copiedAlgo === algo ? t('tools.hash-text.copied') : t('tools.hash-text.copy')"
            @click="copyHash(algo)"
          >
            <transition name="icon-switch" mode="out-in">
              <icon-mdi-check v-if="copiedAlgo === algo" key="check" class="copy-icon success" />
              <icon-mdi-content-copy v-else key="copy" class="copy-icon" />
            </transition>
          </button>
        </div>
      </div>
    </c-card>
  </div>
</template>

<style scoped lang="less">
/* ── 输入框区域 ───────────────────────────────────────────────── */
.input-label {
  display: block;
  font-size: 14px;
  margin-bottom: 6px;
  font-weight: 500;
}

.textarea-wrap {
  position: relative;
}

.hash-textarea {
  width: 100%;
  box-sizing: border-box;
  min-height: 80px;
  max-height: 320px;
  resize: vertical;
  overflow-y: auto;
  padding: 8px 36px 8px 12px;
  font-size: 14px;
  font-family: inherit;
  line-height: 1.6;
  border-radius: 4px;
  outline: none;
  background: transparent;
  color: inherit;
  /* 使用 CSS 变量适配深色模式 */
  border: 1px solid rgba(128, 128, 128, 0.35);
  transition: border-color 0.2s;

  &:focus {
    border-color: #5d7cfa;
  }

  &::placeholder {
    opacity: 0.45;
  }
}

.clear-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: inherit;
  opacity: 0.45;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: opacity 0.15s;
  font-size: 16px;

  &:hover {
    opacity: 0.85;
  }
}

/* ── Hash 结果列表 ─────────────────────────────────────────────── */
.hash-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: 6px;
  overflow: hidden;
}

.hash-row {
  display: flex;
  align-items: center;
  gap: 0;
  border-bottom: 1px solid rgba(128, 128, 128, 0.12);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(128, 128, 128, 0.04);
  }
}

/* 算法名称列：固定宽度、加粗、分隔线 */
.algo-name {
  flex: 0 0 110px;
  font-weight: 600;
  font-size: 13px;
  padding: 10px 12px;
  border-right: 1px solid rgba(128, 128, 128, 0.15);
  letter-spacing: 0.02em;
  white-space: nowrap;
}

/* Hash 值列：等宽字体，超长截断 */
.hash-value-wrap {
  flex: 1 1 0;
  min-width: 0;
  /* 让 tooltip 包裹整个区域 */
  display: flex;
  align-items: center;
}

/* c-tooltip 的内层 div（ref=targetRef）默认 min-width:auto，会被长哈希撑破；
   约束它作为 flex item 可收缩，使内部 .hash-value 的 ellipsis 生效、复制按钮不被挤出屏幕 */
.hash-value-wrap > :deep(div:first-child) {
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
}

.hash-value {
  flex: 1;
  padding: 10px 12px;
  font-family: 'Fira Code', 'Consolas', 'Menlo', 'Monaco', monospace;
  font-size: 12.5px;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  /* 确保不撑破布局 */
  min-width: 0;
}

/* 复制按钮：固定宽度，永远可见 */
.copy-btn {
  flex: 0 0 36px;
  width: 36px;
  height: 100%;
  min-height: 38px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: inherit;
  opacity: 0.45;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s, color 0.15s;
  border-left: 1px solid rgba(128, 128, 128, 0.12);

  &:hover {
    opacity: 0.85;
  }

  &.copied {
    opacity: 1;
    color: #22c55e;
  }
}

.copy-icon {
  font-size: 15px;
}

.copy-icon.success {
  color: #22c55e;
}

/* ── 图标切换动画 ─────────────────────────────────────────────── */
.icon-switch-enter-active,
.icon-switch-leave-active {
  transition: all 0.16s ease;
}

.icon-switch-enter-from {
  opacity: 0;
  transform: scale(0.5) rotate(-10deg);
}

.icon-switch-leave-to {
  opacity: 0;
  transform: scale(0.5) rotate(10deg);
}

/* ── 移动端适配 ──────────────────────────────────────────────── */
@media (max-width: 480px) {
  .algo-name {
    flex: 0 0 80px;
    font-size: 12px;
    padding: 8px 8px;
  }

  .hash-value {
    font-size: 11px;
    padding: 8px 8px;
  }

  .copy-btn {
    flex: 0 0 32px;
    width: 32px;
  }
}
</style>
