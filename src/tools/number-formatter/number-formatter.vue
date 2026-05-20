<script setup lang="ts">
import { computed, ref } from 'vue';

const { t } = useI18n();

// ─── 状态 ──────────────────────────────────────────────────────────────────────
const input = ref('1234567.89');
const locale = ref('zh-CN');
const style = ref<'decimal' | 'currency' | 'percent' | 'scientific' | 'engineering' | 'compact'>('decimal');
const currency = ref('CNY');
const decimalPlaces = ref(2);
const useGrouping = ref(true);

// 复制状态
const isCopied = ref(false);

// ─── 选项 ──────────────────────────────────────────────────────────────────────
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

const styleOptions = computed(() => [
  { label: t('tools.number-formatter.styleDecimal'), value: 'decimal' },
  { label: t('tools.number-formatter.styleCurrency'), value: 'currency' },
  { label: t('tools.number-formatter.stylePercent'), value: 'percent' },
  { label: t('tools.number-formatter.styleScientific'), value: 'scientific' },
  { label: t('tools.number-formatter.styleEngineering'), value: 'engineering' },
  { label: t('tools.number-formatter.styleCompact'), value: 'compact' },
]);

const currencyOptions = [
  { label: 'CNY (¥)', value: 'CNY' },
  { label: 'USD ($)', value: 'USD' },
  { label: 'EUR (€)', value: 'EUR' },
  { label: 'GBP (£)', value: 'GBP' },
  { label: 'JPY (¥)', value: 'JPY' },
  { label: 'KRW (₩)', value: 'KRW' },
  { label: 'HKD (HK$)', value: 'HKD' },
];

// ─── 解析输入 ──────────────────────────────────────────────────────────────────
const numValue = computed(() => {
  const v = Number.parseFloat(input.value.replace(/,/g, '').replace(/\s/g, ''));
  return Number.isNaN(v) ? null : v;
});

const isInvalid = computed(() => input.value.trim() !== '' && numValue.value === null);

function clearInput() {
  input.value = '';
}

// ─── 小数位步进 ────────────────────────────────────────────────────────────────
function decDecimals() {
  if (decimalPlaces.value > 0) decimalPlaces.value--;
}
function incDecimals() {
  if (decimalPlaces.value < 20) decimalPlaces.value++;
}

// ─── 格式化 ────────────────────────────────────────────────────────────────────
function formatWith(loc: string, opts: Intl.NumberFormatOptions): string {
  if (numValue.value === null) return '—';
  try {
    return new Intl.NumberFormat(loc, opts).format(numValue.value);
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
  if (style.value === 'currency')
    return formatWith(locale.value, { ...base, style: 'currency', currency: currency.value });
  if (style.value === 'percent')
    return formatWith(locale.value, { style: 'percent', minimumFractionDigits: decimalPlaces.value, maximumFractionDigits: decimalPlaces.value });
  if (style.value === 'scientific')
    return formatWith(locale.value, { notation: 'scientific', minimumFractionDigits: decimalPlaces.value, maximumFractionDigits: decimalPlaces.value });
  if (style.value === 'engineering')
    return formatWith(locale.value, { notation: 'engineering', minimumFractionDigits: decimalPlaces.value, maximumFractionDigits: decimalPlaces.value });
  if (style.value === 'compact')
    return formatWith(locale.value, { notation: 'compact', compactDisplay: 'short' });
  return formatWith(locale.value, base);
});

// ─── 复制结果 ──────────────────────────────────────────────────────────────────
function copyResult() {
  if (mainResult.value === '—') return;
  navigator.clipboard.writeText(mainResult.value).then(() => {
    isCopied.value = true;
    setTimeout(() => { isCopied.value = false; }, 2000);
  });
}

// ─── 多语言对比 ────────────────────────────────────────────────────────────────
const COMPARE_LOCALES = [
  { code: 'zh-CN', name: '中文' },
  { code: 'en-US', name: 'English' },
  { code: 'de-DE', name: 'Deutsch' },
  { code: 'fr-FR', name: 'Français' },
  { code: 'ja-JP', name: '日本語' },
  { code: 'ar-SA', name: 'العربية' },
  { code: 'hi-IN', name: 'हिन्दी' },
  { code: 'ko-KR', name: '한국어' },
];

const comparisons = computed(() => {
  if (numValue.value === null) return [];
  return COMPARE_LOCALES.map(({ code, name }) => {
    const formatted = formatWith(code, {
      style: style.value === 'currency' ? 'currency' : 'decimal',
      currency: style.value === 'currency' ? currency.value : undefined,
      useGrouping: useGrouping.value,
      minimumFractionDigits: style.value === 'compact' ? 0 : decimalPlaces.value,
      maximumFractionDigits: style.value === 'compact' ? 2 : decimalPlaces.value,
    });
    return { code, name, formatted };
  });
});

// 单行复制
const copiedLocale = ref<string | null>(null);
function copyLocale(code: string, val: string) {
  navigator.clipboard.writeText(val).then(() => {
    copiedLocale.value = code;
    setTimeout(() => { if (copiedLocale.value === code) copiedLocale.value = null; }, 2000);
  });
}
</script>

<template>
  <div class="nf-root">
    <!-- ══════════════════ 输入配置卡 ══════════════════════════════════════════ -->
    <div class="nf-card">
      <div class="card-title">
        {{ t('tools.number-formatter.input') }}
      </div>

      <!-- 第一行：数字 + 语言 -->
      <div class="form-row">
        <!-- 数字输入 -->
        <div class="form-field">
          <label class="fl">{{ t('tools.number-formatter.number') }}</label>
          <div class="fi-wrap" :class="{ 'fi-wrap--error': isInvalid }">
            <input
              v-model="input"
              class="fi"
              type="text"
              inputmode="decimal"
              placeholder="1234567.89"
              data-test-id="numberInput"
            >
            <button v-if="input" class="fi-clear" :title="t('tools.number-formatter.clear')" @click="clearInput">
              <icon-mdi-close-circle />
            </button>
          </div>
          <transition name="slide-down">
            <div v-if="isInvalid" class="fi-error">
              <icon-mdi-alert-circle-outline />
              {{ t('tools.number-formatter.invalidNumber') }}
            </div>
          </transition>
        </div>

        <!-- 语言地区 -->
        <div class="form-field">
          <label class="fl">{{ t('tools.number-formatter.locale') }}</label>
          <select v-model="locale" class="fi fi-select">
            <option v-for="opt in localeOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- 第二行：格式样式 + 货币 + 小数位数 + 千位分隔符 -->
      <div class="form-row form-row--3">
        <!-- 格式样式 -->
        <div class="form-field">
          <label class="fl">{{ t('tools.number-formatter.style') }}</label>
          <select v-model="style" class="fi fi-select">
            <option v-for="opt in styleOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <!-- 货币（仅 currency 显示） -->
        <div v-if="style === 'currency'" class="form-field">
          <label class="fl">{{ t('tools.number-formatter.currency') }}</label>
          <select v-model="currency" class="fi fi-select">
            <option v-for="opt in currencyOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <!-- 小数位数（非 compact 显示） -->
        <div v-if="style !== 'compact'" class="form-field form-field--narrow">
          <label class="fl">{{ t('tools.number-formatter.decimals') }}</label>
          <div class="stepper">
            <button class="stepper-btn" :disabled="decimalPlaces <= 0" @click="decDecimals">
              −
            </button>
            <span class="stepper-val">{{ decimalPlaces }}</span>
            <button class="stepper-btn" :disabled="decimalPlaces >= 20" @click="incDecimals">
              +
            </button>
          </div>
        </div>

        <!-- 千位分隔符 Toggle -->
        <div class="form-field form-field--toggle">
          <label class="fl">{{ t('tools.number-formatter.grouping') }}</label>
          <button
            class="toggle-switch"
            :class="{ 'toggle-switch--on': useGrouping }"
            role="switch"
            :aria-checked="useGrouping"
            @click="useGrouping = !useGrouping"
          >
            <span class="toggle-thumb" />
          </button>
        </div>
      </div>
    </div>

    <!-- ══════════════════ 主结果卡 ═══════════════════════════════════════════ -->
    <div class="nf-card nf-card--result">
      <div class="card-title">
        {{ t('tools.number-formatter.result') }}
      </div>

      <div class="result-hero-wrap" @click="copyResult">
        <div class="result-hero" :class="{ 'result-hero--empty': mainResult === '—' }">
          {{ mainResult }}
        </div>
        <!-- 复制按钮：hover/点击时显示 -->
        <button
          class="hero-copy-btn"
          :class="{ 'hero-copy-btn--copied': isCopied }"
          :title="isCopied ? t('tools.number-formatter.justCopied') : t('tools.number-formatter.clickToCopy')"
          @click.stop="copyResult"
        >
          <icon-mdi-check v-if="isCopied" />
          <icon-mdi-content-copy v-else />
          <span>{{ isCopied ? t('tools.number-formatter.justCopied') : t('tools.number-formatter.copy') }}</span>
        </button>
      </div>

      <!-- 格式参数摘要 -->
      <div v-if="mainResult !== '—'" class="result-meta">
        <span class="meta-chip">{{ localeOptions.find(o => o.value === locale)?.label }}</span>
        <span class="meta-chip">{{ styleOptions.find(o => o.value === style)?.label }}</span>
        <span v-if="style !== 'compact'" class="meta-chip">{{ t('tools.number-formatter.decimalPlaces', { count: decimalPlaces }) }}</span>
        <span class="meta-chip" :class="{ 'meta-chip--off': !useGrouping }">
          {{ useGrouping ? t('tools.number-formatter.withGrouping') : t('tools.number-formatter.noGrouping') }}
        </span>
      </div>
    </div>

    <!-- ══════════════════ 多语言对比卡 ════════════════════════════════════════ -->
    <div class="nf-card">
      <div class="card-title">
        {{ t('tools.number-formatter.comparison') }}
      </div>

      <div v-if="comparisons.length === 0" class="comp-empty">
        {{ t('tools.number-formatter.comparisonEmpty') }}
      </div>

      <div v-else class="comp-grid">
        <div
          v-for="row in comparisons"
          :key="row.code"
          class="comp-item"
          :class="{ 'comp-item--active': row.code === locale }"
          @click="copyLocale(row.code, row.formatted)"
        >
          <div class="comp-lang">
            <span class="comp-code">{{ row.code }}</span>
            <span class="comp-name">{{ row.name }}</span>
          </div>
          <div class="comp-val-wrap">
            <span class="comp-val">{{ row.formatted }}</span>
            <span class="comp-copy-icon" :class="{ 'comp-copy-icon--done': copiedLocale === row.code }">
              <icon-mdi-check v-if="copiedLocale === row.code" />
              <icon-mdi-content-copy v-else />
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
/* ── 根容器 ─────────────────────────────────────────────── */
.nf-root {
  max-width: 680px;
  margin: 0 auto;
  padding: 4px 0 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── 卡片 ───────────────────────────────────────────────── */
.nf-card {
  background: var(--n-color, #fff);
  border: 1px solid var(--n-border-color, rgba(0,0,0,.08));
  border-radius: 14px;
  padding: 18px 22px;
  box-shadow: 0 2px 12px rgba(0,0,0,.06);

  &--result {
    padding: 20px 24px;
  }
}

.card-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--n-text-color-3, #888);
  margin-bottom: 14px;
}

/* ── 表单行 ─────────────────────────────────────────────── */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
  margin-bottom: 12px;

  &:last-child { margin-bottom: 0; }

  &--3 {
    grid-template-columns: 2fr 1fr 1fr;
    align-items: end;
  }
}

/* ── 字段 ───────────────────────────────────────────────── */
.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &--narrow { min-width: 80px; }
  &--toggle { min-width: 100px; }
}

.fl {
  font-size: 12px;
  font-weight: 500;
  color: var(--n-text-color-2, #555);
  user-select: none;
}

/* ── 输入框 ─────────────────────────────────────────────── */
.fi-wrap {
  display: flex;
  align-items: center;
  border: 1.5px solid var(--n-border-color, rgba(0,0,0,.15));
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus-within {
    border-color: var(--primary-color, #6366f1);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color, #6366f1) 14%, transparent);
  }

  &--error {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239,68,68,.12);
  }
}

.fi {
  flex: 1;
  padding: 8px 10px;
  border: none;
  outline: none;
  font-size: 14px;
  font-family: 'Fira Code', 'Consolas', monospace;
  background: transparent;
  color: var(--n-text-color-1, #1a1a1a);
  min-width: 0;

  &-select {
    width: 100%;
    padding: 8px 10px;
    border: 1.5px solid var(--n-border-color, rgba(0,0,0,.15));
    border-radius: 8px;
    font-size: 13px;
    background: var(--n-color, #fff);
    color: var(--n-text-color-1, #1a1a1a);
    outline: none;
    cursor: pointer;
    appearance: auto;
    transition: border-color 0.15s;

    &:focus {
      border-color: var(--primary-color, #6366f1);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color, #6366f1) 14%, transparent);
    }
  }
}

.fi-clear {
  padding: 0 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--n-text-color-3, #bbb);
  font-size: 16px;
  display: flex;
  align-items: center;
  transition: color 0.15s;
  flex-shrink: 0;

  &:hover { color: #ef4444; }
}

.fi-error {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #ef4444;
}

/* ── 自定义步进器 ────────────────────────────────────────── */
.stepper {
  display: flex;
  align-items: center;
  border: 1.5px solid var(--n-border-color, rgba(0,0,0,.15));
  border-radius: 8px;
  overflow: hidden;
  height: 36px;
}

.stepper-btn {
  width: 34px;
  height: 100%;
  border: none;
  background: var(--n-color-modal, rgba(0,0,0,.03));
  color: var(--n-text-color-2, #555);
  font-size: 16px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover:not(:disabled) { background: rgba(0,0,0,.07); }
  &:disabled { opacity: 0.35; cursor: not-allowed; }
  &:first-child { border-right: 1px solid var(--n-border-color, rgba(0,0,0,.1)); }
  &:last-child  { border-left:  1px solid var(--n-border-color, rgba(0,0,0,.1)); }
}

.stepper-val {
  flex: 1;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--n-text-color-1, #1a1a1a);
  user-select: none;
}

/* ── 千位分隔符 Toggle ────────────────────────────────────── */
.toggle-switch {
  width: 42px;
  height: 24px;
  border-radius: 12px;
  border: none;
  background: rgba(0,0,0,.15);
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;

  &--on { background: var(--primary-color, #6366f1); }
}

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,.2);
  transition: transform 0.2s;

  .toggle-switch--on & { transform: translateX(18px); }
}

/* ── 结果 Hero ───────────────────────────────────────────── */
.result-hero-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 18px 12px 14px;
  border-radius: 12px;
  background: rgba(99,102,241,.05);
  border: 1px solid rgba(99,102,241,.15);
  cursor: pointer;
  transition: background 0.15s;
  position: relative;

  &:hover {
    background: rgba(99,102,241,.09);
  }
}

.result-hero {
  font-size: 38px;
  font-weight: 800;
  font-family: 'Fira Code', 'Consolas', monospace;
  color: #6366f1;
  word-break: break-all;
  line-height: 1.25;
  text-align: center;

  &--empty {
    color: var(--n-text-color-3, #ccc);
    font-size: 28px;
  }
}

.hero-copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid rgba(99,102,241,.3);
  border-radius: 8px;
  background: rgba(99,102,241,.1);
  color: #6366f1;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;

  &--copied {
    color: #16a34a;
    background: rgba(22,163,74,.1);
    border-color: rgba(22,163,74,.3);
  }

  &:hover:not(&--copied) {
    background: rgba(99,102,241,.18);
  }
}

/* ── 格式参数摘要 ────────────────────────────────────────── */
.result-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
  justify-content: center;
}

.meta-chip {
  padding: 2px 10px;
  border-radius: 20px;
  background: rgba(0,0,0,.05);
  font-size: 11px;
  color: var(--n-text-color-2, #555);
  font-weight: 500;

  &--off {
    background: rgba(239,68,68,.08);
    color: #dc2626;
  }
}

/* ── 多语言对比 Grid ──────────────────────────────────────── */
.comp-empty {
  text-align: center;
  color: var(--n-text-color-3, #aaa);
  font-size: 13px;
  padding: 16px 0;
}

.comp-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.comp-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 8px;
  border: 1px solid var(--n-border-color, rgba(0,0,0,.07));
  background: var(--n-color-modal, rgba(0,0,0,.02));
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;

  &:hover {
    background: rgba(99,102,241,.07);
    border-color: rgba(99,102,241,.25);
  }

  &--active {
    border-color: rgba(99,102,241,.4);
    background: rgba(99,102,241,.06);
  }
}

.comp-lang {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex-shrink: 0;
}

.comp-code {
  font-size: 11px;
  font-weight: 700;
  color: var(--n-text-color-1, #333);
  font-family: 'Fira Code', monospace;
  letter-spacing: 0.02em;
}

.comp-name {
  font-size: 10px;
  color: var(--n-text-color-3, #999);
}

.comp-val-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.comp-val {
  font-size: 13px;
  font-weight: 600;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-variant-numeric: tabular-nums;
  color: var(--n-text-color-1, #1a1a1a);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comp-copy-icon {
  font-size: 14px;
  color: var(--n-text-color-3, #ccc);
  flex-shrink: 0;
  transition: color 0.15s;

  .comp-item:hover & { color: #6366f1; }
  &--done { color: #16a34a !important; }
}

/* ── 过渡动画 ────────────────────────────────────────────── */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: max-height 0.2s, opacity 0.2s;
  overflow: hidden;
  max-height: 40px;
}
.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}

/* ── 响应式 ─────────────────────────────────────────────── */
@media (max-width: 600px) {
  .form-row,
  .form-row--3 {
    grid-template-columns: 1fr;
  }

  .comp-grid {
    grid-template-columns: 1fr;
  }

  .result-hero {
    font-size: 28px;
  }

  .result-hero-wrap {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
