<script setup lang="ts">
import type { lib } from 'crypto-js';
import {
  HmacMD5,
  HmacRIPEMD160,
  HmacSHA1,
  HmacSHA224,
  HmacSHA256,
  HmacSHA3,
  HmacSHA384,
  HmacSHA512,
  enc,
} from 'crypto-js';

import { convertHexToBin } from '../hash-text/hash-text.service';
import { useCopy } from '@/composable/copy';

const { t } = useI18n();

const algos = {
  MD5: HmacMD5,
  RIPEMD160: HmacRIPEMD160,
  SHA1: HmacSHA1,
  SHA3: HmacSHA3,
  SHA224: HmacSHA224,
  SHA256: HmacSHA256,
  SHA384: HmacSHA384,
  SHA512: HmacSHA512,
} as const;

type Encoding = keyof typeof enc | 'Bin';

function formatWithEncoding(words: lib.WordArray, encoding: Encoding) {
  if (encoding === 'Bin') {
    return convertHexToBin(words.toString(enc.Hex));
  }
  return words.toString(enc[encoding]);
}

const plainText = ref('');
const secret = ref('');
const hashFunction = ref<keyof typeof algos>('SHA256');
const encoding = ref<Encoding>('Hex');

const hmac = computed(() =>
  formatWithEncoding(algos[hashFunction.value](plainText.value, secret.value), encoding.value),
);

// 复制：带 isJustCopied 图标切换反馈
const { copy, isJustCopied } = useCopy({ source: hmac, text: t('tools.hmac-generator.copiedToast') });
</script>

<template>
  <div class="tool-wide hmac-wrap">
    <!-- ① Plain text：多行 + 清空 -->
    <c-input-text
      v-model:value="plainText"
      multiline
      raw-text
      clearable
      :placeholder="t('tools.hmac-generator.plainTextPlaceholder')"
      rows="3"
      autosize
      autofocus
      :label="t('tools.hmac-generator.plainTextLabel')"
    />

    <!-- ② Secret key：单行 + 清空 -->
    <c-input-text
      v-model:value="secret"
      raw-text
      clearable
      :placeholder="t('tools.hmac-generator.secretPlaceholder')"
      :label="t('tools.hmac-generator.secretLabel')"
    />

    <!-- ③ 两列选择器（移动端自动堆叠） -->
    <div class="selects-row">
      <c-select
        v-model:value="hashFunction"
        :label="t('tools.hmac-generator.hashingFunction')"
        class="select-item"
        :placeholder="t('tools.hmac-generator.hashingFunctionPlaceholder')"
        :options="Object.keys(algos).map((label) => ({ label, value: label }))"
      />
      <c-select
        v-model:value="encoding"
        :label="t('tools.hmac-generator.outputEncoding')"
        class="select-item"
        :placeholder="t('tools.hmac-generator.outputEncodingPlaceholder')"
        :options="[
          { label: t('tools.hmac-generator.encBinary'), value: 'Bin' },
          { label: t('tools.hmac-generator.encHex'), value: 'Hex' },
          { label: t('tools.hmac-generator.encBase64'), value: 'Base64' },
          { label: t('tools.hmac-generator.encBase64url'), value: 'Base64url' },
        ]"
      />
    </div>

    <!-- ④ 输出区：只读灰底 + 内嵌复制按鈕（唯一复制入口） -->
    <div class="result-section">
      <div class="result-label">
        {{ t('tools.hmac-generator.resultLabel') }}
      </div>
      <div class="result-box-row">
        <!-- 只读灰底输出框 -->
        <div class="result-box">
          <pre class="result-pre">{{ hmac }}</pre>
        </div>
        <!-- 内嵌复制按鈕：图标切换 ✓ -->
        <c-tooltip :tooltip="isJustCopied ? t('tools.hmac-generator.copied') : t('tools.hmac-generator.copyHmac')" position="left">
          <button
            class="copy-btn"
            :class="{ copied: isJustCopied }"
            :disabled="!hmac"
            @click="copy()"
          >
            <transition name="icon-switch" mode="out-in">
              <icon-mdi-check v-if="isJustCopied" key="check" class="copy-icon success" />
              <icon-mdi-content-copy v-else key="copy" class="copy-icon" />
            </transition>
          </button>
        </c-tooltip>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.hmac-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

/* ── 选择器两列 → 移动端单列 ──────────────────────────────────── */
.selects-row {
  display: flex;
  gap: 8px;
}

.select-item {
  flex: 1;
  min-width: 0;
}

@media (max-width: 520px) {
  .selects-row {
    flex-direction: column;
  }

  .select-item {
    width: 100%;
  }
}

/* ── 结果区域 ─────────────────────────────────────────────────── */
.result-label {
  font-size: 13px;
  margin-bottom: 6px;
  opacity: 0.75;
  font-weight: 500;
}

.result-box-row {
  display: flex;
  align-items: stretch;
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: 4px;
  overflow: hidden;
  /* 只读灰底 */
  background: rgba(128, 128, 128, 0.05);
  min-height: 40px;
}

.result-box {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.result-pre {
  margin: 0;
  padding: 9px 12px;
  font-family: 'Fira Code', 'Consolas', 'Menlo', monospace;
  font-size: 13px;
  line-height: 1.6;
  /* 超长字符串强制换行，不撑破容器 */
  white-space: pre-wrap;
  word-break: break-all;
  overflow-wrap: break-word;
  /* 超长时内滚动 */
  max-height: 180px;
  overflow-y: auto;
}

/* 内嵌复制按鈕 */
.copy-btn {
  flex: 0 0 38px;
  width: 38px;
  border: none;
  border-left: 1px solid rgba(128, 128, 128, 0.15);
  background: transparent;
  cursor: pointer;
  color: inherit;
  opacity: 0.45;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10px;
  transition: opacity 0.15s, color 0.15s;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.15;
  }

  &.copied {
    opacity: 1;
    color: #22c55e;
  }
}

.copy-icon {
  font-size: 16px;
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
</style>
