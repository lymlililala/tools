<script setup lang="ts">
import { getCountries, getCountryCallingCode, parsePhoneNumber } from 'libphonenumber-js/max';
import lookup from 'country-code-lookup';
import { getDefaultCountryCode } from './phone-parser-and-formatter.models';
import { withDefaultOnError } from '@/utils/defaults';
import { useValidation } from '@/composable/validation';

const { t } = useI18n();

const rawPhone = ref('');
const defaultCountryCode = ref(getDefaultCountryCode());

const validation = useValidation({
  source: rawPhone,
  rules: [
    {
      validator: value => value === '' || /^[0-9 +\-()]+$/.test(value),
      message: t('tools.phone-parser-and-formatter.invalidPhone'),
    },
  ],
});

// 类型本地化映射（响应式，跟随语言切换）
const typeToLabel = computed(() => ({
  MOBILE: t('tools.phone-parser-and-formatter.typeMAMobile'),
  FIXED_LINE: t('tools.phone-parser-and-formatter.typeFixed'),
  FIXED_LINE_OR_MOBILE: t('tools.phone-parser-and-formatter.typeFixedOrMobile'),
  PERSONAL_NUMBER: t('tools.phone-parser-and-formatter.typePersonal'),
  PREMIUM_RATE: t('tools.phone-parser-and-formatter.typePremium'),
  SHARED_COST: t('tools.phone-parser-and-formatter.typeShared'),
  TOLL_FREE: t('tools.phone-parser-and-formatter.typeTollFree'),
  UAN: t('tools.phone-parser-and-formatter.typeUAN'),
  VOICEMAIL: t('tools.phone-parser-and-formatter.typeVoicemail'),
  VOIP: t('tools.phone-parser-and-formatter.typeVoIP'),
  PAGER: t('tools.phone-parser-and-formatter.typePager'),
} as Record<string, string>));

function formatType(type: string | undefined): string | undefined {
  if (!type) return undefined;
  return typeToLabel.value[type];
}

function boolToLabel(val: boolean): string {
  return val ? t('tools.phone-parser-and-formatter.yes') : t('tools.phone-parser-and-formatter.no');
}

// 解析状态：'empty' | 'invalid' | 'parsed'
const parseState = computed<'empty' | 'invalid' | 'parsed'>(() => {
  if (!rawPhone.value.trim()) return 'empty';
  if (!validation.isValid) return 'invalid';
  const parsed = withDefaultOnError(() => parsePhoneNumber(rawPhone.value, defaultCountryCode.value), undefined);
  if (!parsed) return 'invalid';
  return 'parsed';
});

const parsedDetails = computed(() => {
  if (parseState.value !== 'parsed') return undefined;
  const parsed = withDefaultOnError(() => parsePhoneNumber(rawPhone.value, defaultCountryCode.value), undefined);
  if (!parsed) return undefined;

  return [
    {
      label: t('tools.phone-parser-and-formatter.labelCountryCode'),
      value: parsed.country,
    },
    {
      label: t('tools.phone-parser-and-formatter.labelCountryName'),
      value: lookup.byIso(parsed.country ?? '')?.country,
    },
    {
      label: t('tools.phone-parser-and-formatter.labelCallingCode'),
      value: `+${parsed.countryCallingCode}`,
    },
    {
      label: t('tools.phone-parser-and-formatter.labelIsValid'),
      value: boolToLabel(parsed.isValid()),
      highlight: parsed.isValid() ? 'success' : 'error',
    },
    {
      label: t('tools.phone-parser-and-formatter.labelIsPossible'),
      value: boolToLabel(parsed.isPossible()),
    },
    {
      label: t('tools.phone-parser-and-formatter.labelType'),
      value: formatType(parsed.getType()),
    },
    {
      label: t('tools.phone-parser-and-formatter.labelIntl'),
      value: parsed.formatInternational(),
    },
    {
      label: t('tools.phone-parser-and-formatter.labelNational'),
      value: parsed.formatNational(),
    },
    {
      label: t('tools.phone-parser-and-formatter.labelE164'),
      value: parsed.format('E.164'),
    },
    {
      label: t('tools.phone-parser-and-formatter.labelRFC3966'),
      value: parsed.format('RFC3966'),
    },
  ];
});

const countriesOptions = getCountries().map(code => ({
  label: `${lookup.byIso(code)?.country || code} (+${getCountryCallingCode(code)})`,
  value: code,
}));
</script>

<template>
  <div class="phone-tool-wrapper">
    <!-- 表单区，限制最大宽度 -->
    <div class="form-section">
      <c-select
        v-model:value="defaultCountryCode"
        :label="t('tools.phone-parser-and-formatter.defaultCountryCode')"
        :options="countriesOptions"
        searchable
        class="form-field"
      />

      <c-input-text
        v-model:value="rawPhone"
        :placeholder="t('tools.phone-parser-and-formatter.phonePlaceholder')"
        :label="t('tools.phone-parser-and-formatter.phoneNumber')"
        :validation="validation"
        class="form-field"
      />
    </div>

    <!-- 结果预留区：始终渲染，防止 Layout Shift -->
    <transition name="result-fade">
      <div class="result-panel" :class="{ 'result-panel--parsed': parseState === 'parsed' }">
        <div class="result-header">
          <span class="result-title">{{ t('tools.phone-parser-and-formatter.resultTitle') }}</span>
          <!-- 状态指示器 -->
          <span v-if="parseState === 'parsed'" class="result-badge result-badge--success">{{ t('tools.phone-parser-and-formatter.parsedBadge') }}</span>
          <span v-else-if="parseState === 'invalid'" class="result-badge result-badge--error">{{ t('tools.phone-parser-and-formatter.invalidBadge') }}</span>
        </div>

        <!-- 空状态 -->
        <div v-if="parseState === 'empty'" class="result-empty">
          <div class="result-empty-icon">📱</div>
          <div>{{ t('tools.phone-parser-and-formatter.resultEmpty') }}</div>
        </div>

        <!-- 非法状态 -->
        <div v-else-if="parseState === 'invalid'" class="result-invalid">
          <div class="result-invalid-icon">⚠️</div>
          <div>{{ t('tools.phone-parser-and-formatter.resultInvalid') }}</div>
        </div>

        <!-- 解析结果表格 -->
        <table v-else-if="parsedDetails" class="parsed-table">
          <tbody>
            <tr
              v-for="item in parsedDetails"
              :key="item.label"
              class="parsed-row"
            >
              <td class="parsed-label">
                {{ item.label }}
              </td>
              <td class="parsed-value">
                <span
                  v-if="item.value"
                  class="value-cell"
                  :class="{
                    'value-cell--success': item.highlight === 'success',
                    'value-cell--error': item.highlight === 'error',
                  }"
                >
                  <span-copyable :value="item.value" />
                </span>
                <span v-else class="parsed-unknown">
                  {{ t('tools.phone-parser-and-formatter.unknown') }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="less">
/* ---- 外层容器限制最大宽度 ---- */
.phone-tool-wrapper {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ---- 表单区 ---- */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-field {
  /* 确保 c-select / c-input-text 宽度撑满容器 */
  width: 100%;
}

/* ---- 结果面板 ---- */
.result-panel {
  border: 1.5px solid var(--n-border-color, #e5e7eb);
  border-radius: 12px;
  overflow: hidden;
  background: var(--n-card-color, #ffffff);
  transition: border-color 0.2s, box-shadow 0.2s;

  &--parsed {
    border-color: rgba(99, 102, 241, 0.35);
    box-shadow: 0 2px 16px rgba(99, 102, 241, 0.08);
  }
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid var(--n-border-color, #e5e7eb);
  background: var(--n-color, #f9fafb);
}

.result-title {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--n-text-color-3, #9ca3af);
}

.result-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;

  &--success {
    background: rgba(16, 185, 129, 0.12);
    color: #059669;
  }

  &--error {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
  }
}

/* ---- 空状态 / 错误状态 ---- */
.result-empty,
.result-invalid {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 16px;
  font-size: 13px;
  color: var(--n-text-color-3, #9ca3af);
  text-align: center;
}

.result-empty-icon,
.result-invalid-icon {
  font-size: 28px;
  line-height: 1;
}

.result-invalid {
  color: #f59e0b;
}

/* ---- 解析结果表格 ---- */
.parsed-table {
  width: 100%;
  border-collapse: collapse;
}

.parsed-row {
  border-bottom: 1px solid var(--n-border-color, #f3f4f6);
  transition: background 0.12s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(99, 102, 241, 0.035);
  }
}

.parsed-label {
  padding: 9px 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--n-text-color-2, #6b7280);
  white-space: nowrap;
  width: 44%;
  vertical-align: middle;
}

.parsed-value {
  padding: 9px 16px 9px 0;
  font-size: 13px;
  vertical-align: middle;
  word-break: break-all;
}

.value-cell {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace;
  font-size: 13px;

  &--success {
    color: #059669;
    font-weight: 600;
    font-family: inherit;
  }

  &--error {
    color: #dc2626;
    font-weight: 600;
    font-family: inherit;
  }
}

.parsed-unknown {
  color: var(--n-text-color-3, #9ca3af);
  font-style: italic;
  font-size: 13px;
}

/* ---- 结果入场动画 ---- */
.result-fade-enter-active,
.result-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.result-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.result-fade-leave-to {
  opacity: 0;
}

/* ---- 深色模式 ---- */
@media (prefers-color-scheme: dark) {
  .result-panel {
    background: var(--n-card-color, #1a1a2e);
    border-color: rgba(255, 255, 255, 0.08);

    &--parsed {
      border-color: rgba(99, 102, 241, 0.4);
      box-shadow: 0 2px 20px rgba(99, 102, 241, 0.1);
    }
  }

  .result-header {
    background: rgba(255, 255, 255, 0.03);
    border-bottom-color: rgba(255, 255, 255, 0.07);
  }

  .parsed-row {
    border-bottom-color: rgba(255, 255, 255, 0.06);

    &:hover {
      background: rgba(99, 102, 241, 0.06);
    }
  }

  .parsed-label {
    color: rgba(255, 255, 255, 0.5);
  }

  .result-badge--success {
    background: rgba(16, 185, 129, 0.15);
    color: #34d399;
  }

  .result-badge--error {
    background: rgba(239, 68, 68, 0.12);
    color: #f87171;
  }

  .value-cell--success {
    color: #34d399;
  }

  .value-cell--error {
    color: #f87171;
  }
}
</style>
