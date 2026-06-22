<script setup lang="ts">
import { AES, RC4, Rabbit, TripleDES, enc } from 'crypto-js';
import { computedCatch } from '@/composable/computed/catchedComputed';
import { useCopy } from '@/composable/copy';

const { t } = useI18n();

const algos = { AES, TripleDES, Rabbit, RC4 };
const algoOptions = Object.keys(algos).map(label => ({ label, value: label }));

// ── 加密侧 ──────────────────────────────────────────────────────────────────
const cypherInput = ref('Lorem ipsum dolor sit amet');
const cypherAlgo = ref<keyof typeof algos>('AES');
const cypherSecret = ref('my secret key');
const cypherOutput = computed(() => {
  if (!cypherInput.value || !cypherSecret.value) {
    return '';
  }
  try {
    return algos[cypherAlgo.value].encrypt(cypherInput.value, cypherSecret.value).toString();
  }
  catch {
    return '';
  }
});

const { copy: copyEncrypted, isJustCopied: encCopied } = useCopy({ source: cypherOutput, text: 'Encrypted text copied' });

// ── 解密侧 ──────────────────────────────────────────────────────────────────
const decryptInput = ref('U2FsdGVkX1/EC3+6P5dbbkZ3e1kQ5o2yzuU0NHTjmrKnLBEwreV489Kr0DIB+uBs');
const decryptAlgo = ref<keyof typeof algos>('AES');
const decryptSecret = ref('my secret key');
const [decryptOutput, decryptError] = computedCatch(
  () => algos[decryptAlgo.value].decrypt(decryptInput.value, decryptSecret.value).toString(enc.Utf8),
  { defaultValue: '', defaultErrorMessage: 'Unable to decrypt your text' },
);

// 解密结果为空字符串但无报错 → 说明密钥不对（crypto-js 返回空字符串不抛异常）
const decryptFailed = computed(() =>
  !decryptError.value
  && decryptInput.value.length > 0
  && decryptSecret.value.length > 0
  && decryptOutput.value === '',
);

const { copy: copyDecrypted, isJustCopied: decCopied } = useCopy({ source: decryptOutput, text: 'Decrypted text copied' });

// ── 一键转移：左 → 右 ────────────────────────────────────────────────────────
function transferToDecrypt() {
  decryptInput.value = cypherOutput.value;
  decryptSecret.value = cypherSecret.value;
  decryptAlgo.value = cypherAlgo.value;
}
</script>

<template>
  <div class="tool-wide enc-layout">
    <!-- ① 加密卡片 -->
    <c-card :title="t('tools.encryption.encryptTitle')" class="enc-card">
      <div class="inputs-row">
        <div class="input-flex">
          <c-input-text
            v-model:value="cypherInput"
            :label="t('tools.encryption.yourText')"
            :placeholder="t('tools.encryption.encryptPlaceholder')"
            rows="4"
            multiline
            raw-text
            monospace
            autosize
          />
          <div class="field-hint">
            {{ t('tools.encryption.yourTextHint') }}
          </div>
        </div>
        <div class="settings-col">
          <div>
            <c-input-text v-model:value="cypherSecret" :label="t('tools.encryption.secretKey')" clearable raw-text />
            <div class="field-hint">
              {{ t('tools.encryption.secretKeyHint') }}
            </div>
          </div>
          <c-select
            v-model:value="cypherAlgo"
            :label="t('tools.encryption.algorithm')"
            :options="algoOptions"
          />
        </div>
      </div>

      <!-- 加密输出框：内嵌复制按钮 -->
      <div class="output-wrap" mt-5>
        <div class="output-label">
          {{ t('tools.encryption.encryptedOutput') }}
        </div>
        <div class="output-box-row">
          <div class="output-box">
            <pre class="output-pre">{{ cypherOutput }}</pre>
          </div>
          <c-tooltip :tooltip="encCopied ? t('tools.encryption.copied') : t('tools.encryption.copy')" position="left">
            <button
              class="output-copy-btn"
              :class="{ copied: encCopied }"
              :disabled="!cypherOutput"
              @click="copyEncrypted()"
            >
              <transition name="icon-switch" mode="out-in">
                <icon-mdi-check v-if="encCopied" key="check" class="copy-icon success" />
                <icon-mdi-content-copy v-else key="copy" class="copy-icon" />
              </transition>
            </button>
          </c-tooltip>
        </div>
      </div>
    </c-card>

    <!-- ② 中间转移按钮 -->
    <div class="transfer-col">
      <c-tooltip :tooltip="t('tools.encryption.transferTooltip')" position="top">
        <button class="transfer-btn" :disabled="!cypherOutput" @click="transferToDecrypt">
          <icon-mdi-arrow-right class="transfer-icon" />
        </button>
      </c-tooltip>
    </div>

    <!-- ③ 解密卡片 -->
    <c-card :title="t('tools.encryption.decryptTitle')" class="enc-card">
      <div class="inputs-row">
        <c-input-text
          v-model:value="decryptInput"
          :label="t('tools.encryption.encryptedText')"
          :placeholder="t('tools.encryption.decryptPlaceholder')"
          rows="4"
          multiline
          raw-text
          monospace
          autosize
          class="input-flex"
        />
        <div class="settings-col">
          <c-input-text v-model:value="decryptSecret" :label="t('tools.encryption.secretKey')" clearable raw-text />
          <c-select
            v-model:value="decryptAlgo"
            :label="t('tools.encryption.algorithm')"
            :options="algoOptions"
          />
        </div>
      </div>

      <!-- 解密输出框 / 错误提示 -->
      <div class="output-wrap" mt-5>
        <div class="output-label">
          {{ t('tools.encryption.decryptedOutput') }}
        </div>

        <!-- 有 cryptojs 错误 -->
        <div v-if="decryptError" class="decrypt-error">
          <icon-mdi-alert-circle class="err-icon" />
          {{ t('tools.encryption.decryptionFailed') }}: {{ decryptError }}
        </div>

        <!-- 密钥不匹配（空输出但无异常） -->
        <div v-else-if="decryptFailed" class="decrypt-error">
          <icon-mdi-alert-circle class="err-icon" />
          {{ t('tools.encryption.decryptionFailedMismatch') }}
        </div>

        <!-- 正常输出 + 内嵌复制 -->
        <div v-else class="output-box-row">
          <div class="output-box">
            <pre class="output-pre">{{ decryptOutput }}</pre>
          </div>
          <c-tooltip :tooltip="decCopied ? t('tools.encryption.copied') : t('tools.encryption.copy')" position="left">
            <button
              class="output-copy-btn"
              :class="{ copied: decCopied }"
              :disabled="!decryptOutput"
              @click="copyDecrypted()"
            >
              <transition name="icon-switch" mode="out-in">
                <icon-mdi-check v-if="decCopied" key="check" class="copy-icon success" />
                <icon-mdi-content-copy v-else key="copy" class="copy-icon" />
              </transition>
            </button>
          </c-tooltip>
        </div>
      </div>
    </c-card>
  </div>
</template>

<style scoped lang="less">
/* ── 整体布局 ─────────────────────────────────────────────────────── */
.enc-layout {
  display: flex;
  flex-direction: row;
  gap: 0;
  align-items: flex-start;
  width: 100%;
}

.enc-card {
  flex: 1 1 0;
  min-width: 0;
}

/* ── 中间转移按钮 ──────────────────────────────────────────────────── */
.transfer-col {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  /* 与卡片顶部标题对齐（约 52px 的 padding + title 高度） */
  padding-top: 52px;
  flex-shrink: 0;
}

.transfer-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(128, 128, 128, 0.3);
  background: transparent;
  cursor: pointer;
  color: inherit;
  opacity: 0.5;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s, border-color 0.15s, transform 0.15s;

  &:hover:not(:disabled) {
    opacity: 1;
    border-color: #18a058;
    color: #18a058;
    transform: scale(1.1);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.2;
  }
}

.transfer-icon {
  font-size: 16px;
}

/* ── 卡片内输入行 ──────────────────────────────────────────────────── */
.inputs-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.input-flex {
  flex: 1;
  min-width: 0;
}

.settings-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 字段说明小字：解释"文本"与"密钥"的区别 */
.field-hint {
  font-size: 12px;
  line-height: 1.5;
  opacity: 0.55;
  margin-top: 4px;
}

/* ── 输出框区域 ──────────────────────────────────────────────────────── */
.output-label {
  font-size: 13px;
  opacity: 0.7;
  margin-bottom: 6px;
}

.output-box-row {
  display: flex;
  align-items: stretch;
  border: 1px solid rgba(128, 128, 128, 0.25);
  border-radius: 4px;
  overflow: hidden;
  min-height: 44px;
}

.output-box {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.output-pre {
  margin: 0;
  padding: 8px 12px;
  font-family: 'Fira Code', 'Consolas', 'Menlo', monospace;
  font-size: 12.5px;
  line-height: 1.6;
  white-space: pre-wrap;        /* 自动换行，不出现横向滚动 */
  word-break: break-all;        /* 强制打断长字符串 */
  max-height: 200px;
  overflow-y: auto;
}

/* 内嵌复制按钮 */
.output-copy-btn {
  flex: 0 0 36px;
  width: 36px;
  border: none;
  border-left: 1px solid rgba(128, 128, 128, 0.15);
  background: transparent;
  cursor: pointer;
  color: inherit;
  opacity: 0.4;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 9px;
  transition: opacity 0.15s, color 0.15s;

  &:hover:not(:disabled) {
    opacity: 0.85;
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
  font-size: 15px;
}

.copy-icon.success {
  color: #22c55e;
}

/* ── 解密错误提示 ─────────────────────────────────────────────────── */
.decrypt-error {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #f56c6c;
  font-size: 13px;
  padding: 8px 4px;
  border: 1px solid rgba(245, 108, 108, 0.25);
  border-radius: 4px;
  padding: 8px 12px;
  background: rgba(245, 108, 108, 0.05);
}

.err-icon {
  font-size: 16px;
  flex-shrink: 0;
}

/* ── 图标切换动画 ─────────────────────────────────────────────────── */
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

/* ── 移动端：左右 → 上下 ─────────────────────────────────────────── */
@media (max-width: 640px) {
  .enc-layout {
    flex-direction: column;
  }

  .enc-card {
    width: 100%;
  }

  /* 移动端转移按钮变为向下箭头，水平居中 */
  .transfer-col {
    width: 100%;
    padding-top: 0;
    padding: 4px 0;
  }

  .transfer-icon {
    transform: rotate(90deg);
  }

  /* 卡片内输入行在极窄屏幕也堆叠 */
  .inputs-row {
    flex-direction: column;
  }

  .settings-col {
    width: 100%;
  }
}
</style>
