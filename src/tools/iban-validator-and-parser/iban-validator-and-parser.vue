<script setup lang="ts">
import { extractIBAN, friendlyFormatIBAN, isQRIBAN, validateIBAN, ValidationErrorsIBAN } from 'ibantools';

const { t } = useI18n();

const rawIban = ref('');

// 标准化 IBAN（去除空格和连字符，转大写）
const normalizedIban = computed(() => rawIban.value.toUpperCase().replace(/[\s-]/g, ''));

// 解析状态
type ParseState = 'empty' | 'valid' | 'invalid';

const parseState = computed<ParseState>(() => {
  if (!normalizedIban.value) return 'empty';
  const { valid } = validateIBAN(normalizedIban.value);
  return valid ? 'valid' : 'invalid';
});

// 错误码 → 本地化消息映射（响应式）
const errorCodeMap = computed((): Record<number, string> => ({
  [ValidationErrorsIBAN.NoIBANProvided]: t('tools.iban-validator-and-parser.errNoIBAN'),
  [ValidationErrorsIBAN.NoIBANCountry]: t('tools.iban-validator-and-parser.errNoCountry'),
  [ValidationErrorsIBAN.WrongBBANLength]: t('tools.iban-validator-and-parser.errWrongBBANLen'),
  [ValidationErrorsIBAN.WrongBBANFormat]: t('tools.iban-validator-and-parser.errWrongBBANFmt'),
  [ValidationErrorsIBAN.ChecksumNotNumber]: t('tools.iban-validator-and-parser.errChecksumNaN'),
  [ValidationErrorsIBAN.WrongIBANChecksum]: t('tools.iban-validator-and-parser.errWrongChecksum'),
  [ValidationErrorsIBAN.WrongAccountBankBranchChecksum]: t('tools.iban-validator-and-parser.errWrongBranchChecksum'),
  [ValidationErrorsIBAN.QRIBANNotAllowed]: t('tools.iban-validator-and-parser.errQRNotAllowed'),
}));

// 计算解析详情（仅在有输入时）
interface IbanRow {
  label: string
  value: string | boolean | string[] | undefined | null
  type?: 'valid' | 'invalid' | 'info' | 'mono'
  showCopy?: boolean
}

const ibanRows = computed<IbanRow[]>(() => {
  const iban = normalizedIban.value;
  if (!iban) return [];

  const { valid, errorCodes } = validateIBAN(iban);
  const { countryCode, bban } = extractIBAN(iban);
  const errors = errorCodes.map(c => errorCodeMap.value[c]).filter(Boolean);

  return [
    {
      label: t('tools.iban-validator-and-parser.labelIsValid'),
      value: valid ? t('tools.iban-validator-and-parser.yes') : t('tools.iban-validator-and-parser.no'),
      type: valid ? 'valid' : 'invalid',
      showCopy: false,
    },
    ...(errors.length > 0
      ? [{
          label: t('tools.iban-validator-and-parser.labelErrors'),
          value: errors.join('；'),
          type: 'invalid' as const,
          showCopy: false,
        }]
      : []),
    {
      label: t('tools.iban-validator-and-parser.labelIsQR'),
      value: isQRIBAN(iban) ? t('tools.iban-validator-and-parser.yes') : t('tools.iban-validator-and-parser.no'),
      type: 'info',
      showCopy: false,
    },
    {
      label: t('tools.iban-validator-and-parser.labelCountryCode'),
      value: countryCode,
      type: 'mono',
      showCopy: true,
    },
    {
      label: t('tools.iban-validator-and-parser.labelBBAN'),
      value: bban,
      type: 'mono',
      showCopy: true,
    },
    {
      label: t('tools.iban-validator-and-parser.labelFriendly'),
      value: friendlyFormatIBAN(iban),
      type: 'mono',
      showCopy: true,
    },
  ];
});

// 示例 IBAN
const ibanExamples = [
  'FR7630006000011234567890189',
  'DE89370400440532013000',
  'GB29NWBK60161331926819',
];

function applyExample(iban: string) {
  rawIban.value = iban;
}

function clearInput() {
  rawIban.value = '';
}

// 复制功能
const { copy } = useCopy();
</script>

<template>
  <div class="iban-wrapper">
    <!-- 输入区 -->
    <div class="input-section">
      <div class="input-row">
        <n-input
          v-model:value="rawIban"
          :placeholder="t('tools.iban-validator-and-parser.placeholder')"
          size="large"
          clearable
          class="iban-input"
          :status="parseState === 'invalid' ? 'error' : parseState === 'valid' ? 'success' : undefined"
          @keydown.enter="() => {}"
        >
          <template v-if="rawIban" #suffix>
            <n-button text size="small" class="clear-btn" :title="t('tools.iban-validator-and-parser.clear')" @click="clearInput">
              ✕
            </n-button>
          </template>
        </n-input>
      </div>

      <!-- 输入框下方实时提示 -->
      <transition name="hint-fade">
        <div v-if="parseState === 'invalid'" class="input-hint input-hint--error">
          ⚠ {{ t('tools.iban-validator-and-parser.resultInvalid') }}
        </div>
        <div v-else-if="parseState === 'valid'" class="input-hint input-hint--success">
          ✓ {{ t('tools.iban-validator-and-parser.resultValid') }}
        </div>
      </transition>
    </div>

    <!-- 结果预留区：始终显示，防止 Layout Shift -->
    <div
      class="result-panel"
      :class="{
        'result-panel--valid': parseState === 'valid',
        'result-panel--invalid': parseState === 'invalid',
      }"
    >
      <div class="result-header">
        <span class="result-title">{{ t('tools.iban-validator-and-parser.resultTitle') }}</span>
        <span v-if="parseState === 'valid'" class="result-badge result-badge--valid">✓ {{ t('tools.iban-validator-and-parser.resultValid') }}</span>
        <span v-else-if="parseState === 'invalid'" class="result-badge result-badge--invalid">✕ {{ t('tools.iban-validator-and-parser.resultInvalid') }}</span>
      </div>

      <!-- 空状态 -->
      <div v-if="parseState === 'empty'" class="result-empty">
        <div class="result-empty-icon">🏦</div>
        <div>{{ t('tools.iban-validator-and-parser.resultEmpty') }}</div>
      </div>

      <!-- 解析结果表格 -->
      <table v-else class="result-table">
        <tbody>
          <tr
            v-for="row in ibanRows"
            :key="row.label"
            class="result-row"
            :class="{
              'result-row--valid': row.type === 'valid',
              'result-row--invalid': row.type === 'invalid',
            }"
          >
            <td class="result-label">
              {{ row.label }}
            </td>
            <td class="result-value">
              <span v-if="row.value !== undefined && row.value !== null && row.value !== ''" class="value-wrap" :class="{ 'value-mono': row.type === 'mono' }">
                <span
                  class="value-text"
                  :class="{
                    'value-text--valid': row.type === 'valid',
                    'value-text--invalid': row.type === 'invalid',
                  }"
                >{{ row.value }}</span>
                <n-button
                  v-if="row.showCopy && typeof row.value === 'string'"
                  text
                  size="small"
                  class="copy-btn"
                  @click="copy(row.value as string)"
                >
                  <span class="copy-icon">⎘</span>
                </n-button>
              </span>
              <span v-else class="result-nil">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 示例区 -->
    <c-card class="examples-card">
      <template #title>
        {{ t('tools.iban-validator-and-parser.validExamples') }}
      </template>
      <div class="examples-list">
        <div
          v-for="iban in ibanExamples"
          :key="iban"
          class="example-item"
        >
          <span class="example-iban">{{ friendlyFormatIBAN(iban) }}</span>
          <div class="example-actions">
            <n-button text size="small" class="example-btn" :title="t('tools.iban-validator-and-parser.validate')" @click="applyExample(iban)">
              ↑
            </n-button>
            <n-button text size="small" class="example-btn" @click="copy(iban)">
              <span class="copy-icon">⎘</span>
            </n-button>
          </div>
        </div>
      </div>
    </c-card>
  </div>
</template>

<style scoped lang="less">
/* ---- 外层容器限制最大宽度 ---- */
.iban-wrapper {
  max-width: 620px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ---- 输入区 ---- */
.input-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.iban-input {
  flex: 1;
  font-size: 15px;
  font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace;
}

.clear-btn {
  opacity: 0.45;
  transition: opacity 0.15s;

  &:hover {
    opacity: 1;
  }
}

/* 输入框下方提示 */
.input-hint {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 2px;
  display: flex;
  align-items: center;
  gap: 5px;

  &--error {
    color: #dc2626;
  }

  &--success {
    color: #059669;
  }
}

.hint-fade-enter-active,
.hint-fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.hint-fade-enter-from,
.hint-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ---- 结果面板 ---- */
.result-panel {
  border: 1.5px solid var(--n-border-color, #e5e7eb);
  border-radius: 12px;
  overflow: hidden;
  background: var(--n-card-color, #ffffff);
  transition: border-color 0.25s, box-shadow 0.25s;

  &--valid {
    border-color: rgba(16, 185, 129, 0.4);
    box-shadow: 0 2px 16px rgba(16, 185, 129, 0.08);
  }

  &--invalid {
    border-color: rgba(239, 68, 68, 0.35);
    box-shadow: 0 2px 16px rgba(239, 68, 68, 0.07);
  }
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: var(--n-color, #f9fafb);
  border-bottom: 1px solid var(--n-border-color, #e5e7eb);
}

.result-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--n-text-color-3, #9ca3af);
}

.result-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 10px;

  &--valid {
    background: rgba(16, 185, 129, 0.12);
    color: #059669;
  }

  &--invalid {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
  }
}

/* 空状态 */
.result-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 36px 16px;
  font-size: 13px;
  color: var(--n-text-color-3, #9ca3af);
  text-align: center;
}

.result-empty-icon {
  font-size: 32px;
  line-height: 1;
}

/* 结果表格 */
.result-table {
  width: 100%;
  border-collapse: collapse;
}

.result-row {
  border-bottom: 1px solid var(--n-border-color, #f3f4f6);
  transition: background 0.12s;

  &:last-child { border-bottom: none; }

  &:hover {
    background: rgba(99, 102, 241, 0.03);
  }

  &--valid {
    background: rgba(16, 185, 129, 0.05);

    &:hover {
      background: rgba(16, 185, 129, 0.08);
    }
  }

  &--invalid {
    background: rgba(239, 68, 68, 0.04);

    &:hover {
      background: rgba(239, 68, 68, 0.07);
    }
  }
}

.result-label {
  padding: 9px 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--n-text-color-2, #6b7280);
  white-space: nowrap;
  width: 42%;
  vertical-align: middle;
}

.result-value {
  padding: 9px 16px 9px 0;
  font-size: 13px;
  vertical-align: middle;
  word-break: break-all;
}

.value-wrap {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.value-mono {
  font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace;
}

.value-text {
  &--valid {
    color: #059669;
    font-weight: 700;
  }

  &--invalid {
    color: #dc2626;
    font-weight: 700;
  }
}

.copy-btn {
  opacity: 0.4;
  transition: opacity 0.15s;
  flex-shrink: 0;

  &:hover {
    opacity: 1;
  }
}

.copy-icon {
  font-size: 14px;
}

.result-nil {
  color: var(--n-text-color-3, #9ca3af);
}

/* ---- 示例区 ---- */
.examples-card {
  /* 继承 c-card 样式 */
}

.examples-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.example-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 7px 12px;
  border-radius: 8px;
  border: 1px solid var(--n-border-color, #e5e7eb);
  background: var(--n-color, #f9fafb);
  transition: background 0.15s, border-color 0.15s;
  cursor: default;

  &:hover {
    background: rgba(99, 102, 241, 0.05);
    border-color: rgba(99, 102, 241, 0.25);
  }
}

.example-iban {
  font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace;
  font-size: 13px;
  letter-spacing: 0.03em;
  color: var(--n-text-color, #1f2937);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.example-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.example-btn {
  opacity: 0.45;
  font-size: 16px;
  transition: opacity 0.15s, transform 0.15s;

  &:hover {
    opacity: 1;
    transform: translateY(-1px);
  }
}

/* ---- 深色模式 ---- */
@media (prefers-color-scheme: dark) {
  .result-panel {
    background: var(--n-card-color, #111827);
    border-color: rgba(255, 255, 255, 0.08);

    &--valid {
      border-color: rgba(16, 185, 129, 0.35);
    }

    &--invalid {
      border-color: rgba(239, 68, 68, 0.3);
    }
  }

  .result-header {
    background: rgba(255, 255, 255, 0.03);
    border-bottom-color: rgba(255, 255, 255, 0.06);
  }

  .result-row {
    border-bottom-color: rgba(255, 255, 255, 0.06);

    &:hover {
      background: rgba(99, 102, 241, 0.06);
    }

    &--valid {
      background: rgba(16, 185, 129, 0.07);
    }

    &--invalid {
      background: rgba(239, 68, 68, 0.06);
    }
  }

  .result-badge--valid {
    background: rgba(16, 185, 129, 0.15);
    color: #34d399;
  }

  .result-badge--invalid {
    background: rgba(239, 68, 68, 0.14);
    color: #f87171;
  }

  .value-text--valid {
    color: #34d399;
  }

  .value-text--invalid {
    color: #f87171;
  }

  .input-hint--success {
    color: #34d399;
  }

  .input-hint--error {
    color: #f87171;
  }

  .example-item {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.08);

    &:hover {
      background: rgba(99, 102, 241, 0.1);
      border-color: rgba(99, 102, 241, 0.35);
    }
  }

  .example-iban {
    color: rgba(255, 255, 255, 0.8);
  }
}
</style>
