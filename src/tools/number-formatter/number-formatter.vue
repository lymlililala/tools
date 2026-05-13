<script setup lang="ts">
const { t } = useI18n();

const input = ref('1234567.89');
const locale = ref('zh-CN');
const style = ref<'decimal' | 'currency' | 'percent' | 'scientific' | 'engineering' | 'compact'>('decimal');
const currency = ref('CNY');
const decimalPlaces = ref(2);
const useGrouping = ref(true);

const localeOptions = [
  { label: '中文 (zh-CN)', value: 'zh-CN' },
  { label: 'English (en-US)', value: 'en-US' },
  { label: 'English (en-GB)', value: 'en-GB' },
  { label: 'Deutsch (de-DE)', value: 'de-DE' },
  { label: 'Français (fr-FR)', value: 'fr-FR' },
  { label: 'Español (es-ES)', value: 'es-ES' },
  { label: '日本語 (ja-JP)', value: 'ja-JP' },
  { label: '한국어 (ko-KR)', value: 'ko-KR' },
  { label: 'Arabic (ar-SA)', value: 'ar-SA' },
  { label: 'Hindi (hi-IN)', value: 'hi-IN' },
];

const styleOptions = [
  { label: t('tools.number-formatter.styleDecimal'), value: 'decimal' },
  { label: t('tools.number-formatter.styleCurrency'), value: 'currency' },
  { label: t('tools.number-formatter.stylePercent'), value: 'percent' },
  { label: t('tools.number-formatter.styleScientific'), value: 'scientific' },
  { label: t('tools.number-formatter.styleEngineering'), value: 'engineering' },
  { label: t('tools.number-formatter.styleCompact'), value: 'compact' },
];

const currencyOptions = [
  { label: 'CNY (¥)', value: 'CNY' },
  { label: 'USD ($)', value: 'USD' },
  { label: 'EUR (€)', value: 'EUR' },
  { label: 'GBP (£)', value: 'GBP' },
  { label: 'JPY (¥)', value: 'JPY' },
  { label: 'KRW (₩)', value: 'KRW' },
  { label: 'HKD (HK$)', value: 'HKD' },
];

const numValue = computed(() => {
  const v = parseFloat(input.value.replace(/,/g, ''));
  return Number.isNaN(v) ? null : v;
});

function formatWith(opts: Intl.NumberFormatOptions): string {
  if (numValue.value === null) return '—';
  try {
    return new Intl.NumberFormat(locale.value, opts).format(numValue.value);
  }
  catch {
    return '—';
  }
}

const mainResult = computed(() => {
  if (numValue.value === null) return '—';
  const base: Intl.NumberFormatOptions = {
    useGrouping: useGrouping.value,
    minimumFractionDigits: decimalPlaces.value,
    maximumFractionDigits: decimalPlaces.value,
  };

  if (style.value === 'currency') {
    return formatWith({ ...base, style: 'currency', currency: currency.value });
  }
  if (style.value === 'percent') {
    return formatWith({ style: 'percent', minimumFractionDigits: decimalPlaces.value, maximumFractionDigits: decimalPlaces.value });
  }
  if (style.value === 'scientific') {
    return formatWith({ notation: 'scientific', minimumFractionDigits: decimalPlaces.value, maximumFractionDigits: decimalPlaces.value });
  }
  if (style.value === 'engineering') {
    return formatWith({ notation: 'engineering', minimumFractionDigits: decimalPlaces.value, maximumFractionDigits: decimalPlaces.value });
  }
  if (style.value === 'compact') {
    return formatWith({ notation: 'compact', compactDisplay: 'short' });
  }
  return formatWith(base);
});

// 多语言对比
const compareLocales = ['zh-CN', 'en-US', 'de-DE', 'fr-FR', 'ja-JP', 'ar-SA'];
const comparisons = computed(() => {
  if (numValue.value === null) return [];
  return compareLocales.map((loc) => {
    let formatted = '—';
    try {
      formatted = new Intl.NumberFormat(loc, {
        style: style.value === 'currency' ? 'currency' : 'decimal',
        currency: style.value === 'currency' ? currency.value : undefined,
        useGrouping: useGrouping.value,
        minimumFractionDigits: decimalPlaces.value,
        maximumFractionDigits: decimalPlaces.value,
      }).format(numValue.value);
    }
    catch {}
    return { locale: loc, formatted };
  });
});
</script>

<template>
  <div style="max-width: 720px; margin: 0 auto">
    <!-- 输入和配置 -->
    <c-card mb-4>
      <template #title>
        {{ t('tools.number-formatter.input') }}
      </template>
      <div flex flex-wrap gap-3>
        <n-form-item :label="t('tools.number-formatter.number')" style="flex:2; min-width:180px">
          <n-input v-model:value="input" placeholder="1234567.89" style="font-family:monospace" />
        </n-form-item>
        <n-form-item :label="t('tools.number-formatter.locale')" style="flex:2; min-width:180px">
          <n-select v-model:value="locale" :options="localeOptions" style="width:100%" />
        </n-form-item>
      </div>
      <div flex flex-wrap gap-3>
        <n-form-item :label="t('tools.number-formatter.style')" style="flex:2; min-width:180px">
          <n-select v-model:value="style" :options="styleOptions" style="width:100%" />
        </n-form-item>
        <n-form-item v-if="style === 'currency'" :label="t('tools.number-formatter.currency')" style="flex:1; min-width:120px">
          <n-select v-model:value="currency" :options="currencyOptions" style="width:100%" />
        </n-form-item>
        <n-form-item v-if="style !== 'compact'" :label="t('tools.number-formatter.decimals')" style="min-width:100px">
          <n-input-number v-model:value="decimalPlaces" :min="0" :max="10" style="width:90px" />
        </n-form-item>
        <n-form-item label=" " style="min-width:120px">
          <n-checkbox v-model:checked="useGrouping">
            {{ t('tools.number-formatter.grouping') }}
          </n-checkbox>
        </n-form-item>
      </div>
    </c-card>

    <!-- 主结果 -->
    <c-card mb-4>
      <template #title>
        {{ t('tools.number-formatter.result') }}
      </template>
      <div class="main-result">
        {{ mainResult }}
      </div>
      <c-text-copyable v-if="mainResult !== '—'" :value="mainResult" mt-2 />
    </c-card>

    <!-- 多语言对比 -->
    <c-card>
      <template #title>
        {{ t('tools.number-formatter.comparison') }}
      </template>
      <div class="comparison-table">
        <div v-for="row in comparisons" :key="row.locale" class="comparison-row">
          <span class="comp-locale">{{ row.locale }}</span>
          <c-text-copyable :value="row.formatted" class="comp-value mono" />
        </div>
      </div>
    </c-card>
  </div>
</template>

<style scoped lang="less">
.main-result {
  font-size: 36px;
  font-weight: 700;
  font-family: monospace;
  text-align: center;
  padding: 20px 0 8px;
  color: #6366f1;
  word-break: break-all;
}

.comparison-table {
  border: 1px solid var(--n-border-color);
  border-radius: 8px;
  overflow: hidden;
}

.comparison-row {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid var(--n-border-color);
  gap: 16px;

  &:last-child {
    border-bottom: none;
  }
}

.comp-locale {
  font-size: 12px;
  opacity: 0.55;
  min-width: 80px;
  flex-shrink: 0;
}

.comp-value {
  font-size: 14px;
}

.mono {
  font-family: monospace;
}
</style>
