<script setup lang="ts">
import { computed, ref } from 'vue';
import PieChart from '@/components/PieChart.vue';

const { t } = useI18n();

// ─── 输入参数 ──────────────────────────────────────────────────────────────────
const grossSalaryStr = ref('15000');
const grossSalary = computed(() => {
  const n = Number(grossSalaryStr.value.replace(/,/g, ''));
  return Number.isNaN(n) || n < 0 ? 0 : n;
});

const city = ref('beijing');

// 专项附加扣除
const childrenEduStr = ref('0');
const continuingEduStr = ref('0');
const housingLoanInterestStr = ref('0');
const housingRentStr = ref('0');
const elderlySupportStr = ref('0');
const childCareStr = ref('0');

function toNum(s: string) {
  const n = Number(s.replace(/,/g, ''));
  return Number.isNaN(n) || n < 0 ? 0 : n;
}

const childrenEdu = computed(() => toNum(childrenEduStr.value));
const continuingEdu = computed(() => toNum(continuingEduStr.value));
const housingLoanInterest = computed(() => toNum(housingLoanInterestStr.value));
const housingRent = computed(() => toNum(housingRentStr.value));
const elderlySupport = computed(() => toNum(elderlySupportStr.value));
const childCare = computed(() => toNum(childCareStr.value));

// 社保明细折叠状态
const showSocialDetail = ref(false);
// 税率表折叠状态
const showBrackets = ref(false);

// ─── 重置 ──────────────────────────────────────────────────────────────────────
function resetAll() {
  grossSalaryStr.value = '0';
  childrenEduStr.value = '0';
  continuingEduStr.value = '0';
  housingLoanInterestStr.value = '0';
  housingRentStr.value = '0';
  elderlySupportStr.value = '0';
  childCareStr.value = '0';
}

// ─── 城市社保配置 ──────────────────────────────────────────────────────────────
interface CityConfig {
  label: string
  pension: number
  medical: number
  unemployment: number
  housingFund: number
  medicalExtra: number
}

const CITIES: Record<string, CityConfig> = {
  beijing: { label: '北京', pension: 0.08, medical: 0.02, unemployment: 0.002, housingFund: 0.12, medicalExtra: 3 },
  shanghai: { label: '上海', pension: 0.08, medical: 0.02, unemployment: 0.005, housingFund: 0.07, medicalExtra: 2 },
  guangzhou: { label: '广州', pension: 0.08, medical: 0.02, unemployment: 0.002, housingFund: 0.05, medicalExtra: 3 },
  shenzhen: { label: '深圳', pension: 0.08, medical: 0.02, unemployment: 0.003, housingFund: 0.05, medicalExtra: 3 },
  hangzhou: { label: '杭州', pension: 0.08, medical: 0.02, unemployment: 0.005, housingFund: 0.12, medicalExtra: 3 },
  chengdu: { label: '成都', pension: 0.08, medical: 0.02, unemployment: 0.005, housingFund: 0.05, medicalExtra: 3 },
  other: { label: '其他城市', pension: 0.08, medical: 0.02, unemployment: 0.005, housingFund: 0.05, medicalExtra: 3 },
};

const cityOptions = Object.entries(CITIES).map(([value, cfg]) => ({ label: cfg.label, value }));
const cityCfg = computed(() => CITIES[city.value] ?? CITIES.other);

// ─── 五险一金 ──────────────────────────────────────────────────────────────────
const socialInsurance = computed(() => {
  const s = grossSalary.value;
  const pension = s * cityCfg.value.pension;
  const medical = s * cityCfg.value.medical + cityCfg.value.medicalExtra;
  const unemployment = s * cityCfg.value.unemployment;
  const housingFund = s * cityCfg.value.housingFund;
  const total = pension + medical + unemployment + housingFund;
  return { pension, medical, unemployment, housingFund, total };
});

// ─── 专项附加扣除 ──────────────────────────────────────────────────────────────
const specialDeduction = computed(() =>
  childrenEdu.value + continuingEdu.value + housingLoanInterest.value
  + housingRent.value + elderlySupport.value + childCare.value,
);

// ─── 应纳税所得额 ──────────────────────────────────────────────────────────────
const BASIC_DEDUCTION = 5000;
const taxableIncome = computed(() =>
  Math.max(0, grossSalary.value - socialInsurance.value.total - BASIC_DEDUCTION - specialDeduction.value),
);

// ─── 累进税率 ──────────────────────────────────────────────────────────────────
interface TaxBracket { min: number; max: number; rate: number; quick: number }

const TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 3000, rate: 0.03, quick: 0 },
  { min: 3000, max: 12000, rate: 0.10, quick: 210 },
  { min: 12000, max: 25000, rate: 0.20, quick: 1410 },
  { min: 25000, max: 35000, rate: 0.25, quick: 2660 },
  { min: 35000, max: 55000, rate: 0.30, quick: 4410 },
  { min: 55000, max: 80000, rate: 0.35, quick: 7160 },
  { min: 80000, max: Number.POSITIVE_INFINITY, rate: 0.45, quick: 15160 },
];

const taxResult = computed(() => {
  const income = taxableIncome.value;
  const bracket = TAX_BRACKETS.find(b => income > b.min && income <= b.max)
    ?? (income <= 0 ? TAX_BRACKETS[0] : TAX_BRACKETS[TAX_BRACKETS.length - 1]);
  const tax = Math.max(0, income * bracket.rate - bracket.quick);
  return { tax, rate: bracket.rate, bracket };
});

// ─── 实发工资 & 综合税率 ───────────────────────────────────────────────────────
const netSalary = computed(() => grossSalary.value - socialInsurance.value.total - taxResult.value.tax);
const effectiveTaxRate = computed(() => {
  if (grossSalary.value <= 0) {
    return 0;
  }
  return (taxResult.value.tax + socialInsurance.value.total) / grossSalary.value * 100;
});

// ─── 快捷预设 ──────────────────────────────────────────────────────────────────
const DEDUCTION_PRESETS = computed(() => [
  { label: t('tools.income-tax-calculator.preset1Child'), key: 'childrenEdu', value: 2000 },
  { label: t('tools.income-tax-calculator.presetRent'), key: 'housingRent', value: 1500 },
  { label: t('tools.income-tax-calculator.presetElderly'), key: 'elderlySupport', value: 3000 },
]);

function applyPreset(key: string, value: number) {
  const map: Record<string, (v: string) => void> = {
    childrenEdu: v => (childrenEduStr.value = v),
    housingRent: v => (housingRentStr.value = v),
    elderlySupport: v => (elderlySupportStr.value = v),
  };
  map[key]?.(String(value));
}

// ─── 格式化 ────────────────────────────────────────────────────────────────────
function fmt(v: number) {
  return v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function bracketColor(rate: number) {
  if (rate <= 0.03) {
    return '#16a34a';
  }
  if (rate <= 0.10) {
    return '#2563eb';
  }
  if (rate <= 0.20) {
    return '#d97706';
  }
  if (rate <= 0.25) {
    return '#ea580c';
  }
  if (rate <= 0.30) {
    return '#dc2626';
  }
  if (rate <= 0.35) {
    return '#b91c1c';
  }
  return '#7f1d1d';
}

// ─── 饼图 ──────────────────────────────────────────────────────────────────────
const salaryChartSegments = computed(() => [
  { label: t('tools.income-tax-calculator.netSalary'), value: netSalary.value, color: '#22c55e' },
  { label: t('tools.income-tax-calculator.incomeTax'), value: taxResult.value.tax, color: '#f87171' },
  { label: t('tools.income-tax-calculator.socialInsuranceTotal'), value: socialInsurance.value.total, color: '#f59e0b' },
]);
</script>

<template>
  <div class="itc-root">
    <div class="itc-grid">
      <!-- ═══════════ 左栏：输入 ═══════════════════════════════════════════════ -->
      <div class="col-input">
        <!-- 基本收入 -->
        <div class="itc-card">
          <div class="card-hd">
            <span class="card-title">{{ t('tools.income-tax-calculator.income') }}</span>
            <button class="reset-btn" :title="t('tools.income-tax-calculator.resetTitle')" @click="resetAll">
              <icon-mdi-refresh />
              {{ t('tools.income-tax-calculator.reset') }}
            </button>
          </div>

          <!-- 税前月薪 -->
          <div class="field">
            <label class="fl">{{ t('tools.income-tax-calculator.grossSalary') }}</label>
            <div class="fi-wrap">
              <input
                v-model="grossSalaryStr"
                class="fi"
                type="text"
                inputmode="numeric"
                placeholder="15,000"
                data-test-id="grossSalary"
              >
              <span class="fi-suffix">{{ t('tools.income-tax-calculator.yuanPerMonth') }}</span>
            </div>
          </div>

          <!-- 社保城市 -->
          <div class="field">
            <label class="fl">{{ t('tools.income-tax-calculator.city') }}</label>
            <select v-model="city" class="fi fi-select">
              <option v-for="opt in cityOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- 专项附加扣除 -->
        <div class="itc-card">
          <div class="card-hd">
            <span class="card-title">{{ t('tools.income-tax-calculator.specialDeductions') }}</span>
            <span class="card-opt">{{ t('tools.income-tax-calculator.optional') }}</span>
          </div>

          <!-- 快捷预设 -->
          <div class="preset-row">
            <button
              v-for="preset in DEDUCTION_PRESETS"
              :key="preset.key"
              class="preset-chip"
              @click="applyPreset(preset.key, preset.value)"
            >
              {{ preset.label }}
            </button>
          </div>

          <!-- 子女教育 -->
          <div class="field">
            <label class="fl">{{ t('tools.income-tax-calculator.childrenEdu') }}</label>
            <div class="fi-wrap">
              <input v-model="childrenEduStr" class="fi" type="text" inputmode="numeric" placeholder="0">
              <span class="fi-suffix">{{ t('tools.income-tax-calculator.yuanPerMonth') }}</span>
            </div>
          </div>
          <!-- 3岁以下子女照护 -->
          <div class="field">
            <label class="fl">{{ t('tools.income-tax-calculator.childCare') }}</label>
            <div class="fi-wrap">
              <input v-model="childCareStr" class="fi" type="text" inputmode="numeric" placeholder="0">
              <span class="fi-suffix">{{ t('tools.income-tax-calculator.yuanPerMonth') }}</span>
            </div>
          </div>
          <!-- 继续教育 -->
          <div class="field">
            <label class="fl">{{ t('tools.income-tax-calculator.continuingEdu') }}</label>
            <div class="fi-wrap">
              <input v-model="continuingEduStr" class="fi" type="text" inputmode="numeric" placeholder="0">
              <span class="fi-suffix">{{ t('tools.income-tax-calculator.yuanPerMonth') }}</span>
            </div>
          </div>
          <!-- 住房贷款利息 -->
          <div class="field">
            <label class="fl">{{ t('tools.income-tax-calculator.housingLoan') }}</label>
            <div class="fi-wrap">
              <input v-model="housingLoanInterestStr" class="fi" type="text" inputmode="numeric" placeholder="0">
              <span class="fi-suffix">{{ t('tools.income-tax-calculator.yuanPerMonth') }}</span>
            </div>
          </div>
          <!-- 住房租金 -->
          <div class="field">
            <label class="fl">{{ t('tools.income-tax-calculator.housingRent') }}</label>
            <div class="fi-wrap">
              <input v-model="housingRentStr" class="fi" type="text" inputmode="numeric" placeholder="0">
              <span class="fi-suffix">{{ t('tools.income-tax-calculator.yuanPerMonth') }}</span>
            </div>
          </div>
          <!-- 赡养老人 -->
          <div class="field">
            <label class="fl">{{ t('tools.income-tax-calculator.elderlySupport') }}</label>
            <div class="fi-wrap">
              <input v-model="elderlySupportStr" class="fi" type="text" inputmode="numeric" placeholder="0">
              <span class="fi-suffix">{{ t('tools.income-tax-calculator.yuanPerMonth') }}</span>
            </div>
          </div>

          <!-- 专项合计提示 -->
          <div v-if="specialDeduction > 0" class="deduction-total">
            {{ t('tools.income-tax-calculator.specialDeductionTotal') }}: <strong>¥ {{ fmt(specialDeduction) }}</strong> / {{ t('tools.income-tax-calculator.month') }}
          </div>
        </div>
      </div>

      <!-- ═══════════ 右栏：结果 ═══════════════════════════════════════════════ -->
      <div class="col-result">
        <!-- 核心结果卡 -->
        <div class="itc-card">
          <div class="card-title card-title--sm">
            {{ t('tools.income-tax-calculator.result') }}
          </div>

          <!-- 实发工资（Hero） -->
          <div class="hero-block">
            <div class="hero-label">
              {{ t('tools.income-tax-calculator.netSalary') }}
            </div>
            <div class="hero-val">
              ¥ {{ fmt(netSalary) }}
            </div>
            <div class="hero-sub">
              {{ t('tools.income-tax-calculator.effectiveRate') }}<strong>{{ effectiveTaxRate.toFixed(1) }}%</strong>
            </div>
          </div>

          <!-- 结果明细行 -->
          <div class="res-rows">
            <div class="res-row">
              <span class="res-lbl">{{ t('tools.income-tax-calculator.taxableIncome') }}</span>
              <span class="res-num">¥ {{ fmt(taxableIncome) }}</span>
            </div>
            <div class="res-row">
              <span class="res-lbl">{{ t('tools.income-tax-calculator.taxBracket') }}</span>
              <span
                class="res-badge"
                :style="{ background: `${bracketColor(taxResult.rate)}18`, color: bracketColor(taxResult.rate), border: `1px solid ${bracketColor(taxResult.rate)}40` }"
              >
                {{ (taxResult.rate * 100).toFixed(0) }}%
              </span>
            </div>
            <div class="res-row">
              <span class="res-lbl">{{ t('tools.income-tax-calculator.incomeTax') }}</span>
              <span class="res-num res-num--red">¥ {{ fmt(taxResult.tax) }}</span>
            </div>
            <div class="res-row">
              <span class="res-lbl">{{ t('tools.income-tax-calculator.socialInsuranceTotal') }}</span>
              <span class="res-num res-num--amber">¥ {{ fmt(socialInsurance.total) }}</span>
            </div>
          </div>
        </div>

        <!-- 五险一金明细（折叠） -->
        <div class="itc-card">
          <button class="collapse-hd" @click="showSocialDetail = !showSocialDetail">
            <span class="card-title card-title--sm">{{ t('tools.income-tax-calculator.socialInsuranceDetail') }}</span>
            <icon-mdi-chevron-down class="collapse-chevron" :class="{ 'collapse-chevron--open': showSocialDetail }" />
          </button>
          <transition name="accordion">
            <div v-if="showSocialDetail" class="dt-table">
              <div class="dt-row">
                <span class="dt-name">{{ t('tools.income-tax-calculator.pension') }}</span>
                <span class="dt-rate">{{ (cityCfg.pension * 100).toFixed(1) }}%</span>
                <span class="dt-val">¥ {{ fmt(socialInsurance.pension) }}</span>
              </div>
              <div class="dt-row">
                <span class="dt-name">{{ t('tools.income-tax-calculator.medical') }}</span>
                <span class="dt-rate">{{ (cityCfg.medical * 100).toFixed(1) }}%+{{ cityCfg.medicalExtra }}</span>
                <span class="dt-val">¥ {{ fmt(socialInsurance.medical) }}</span>
              </div>
              <div class="dt-row">
                <span class="dt-name">{{ t('tools.income-tax-calculator.unemployment') }}</span>
                <span class="dt-rate">{{ (cityCfg.unemployment * 100).toFixed(1) }}%</span>
                <span class="dt-val">¥ {{ fmt(socialInsurance.unemployment) }}</span>
              </div>
              <div class="dt-row">
                <span class="dt-name">{{ t('tools.income-tax-calculator.housingFund') }}</span>
                <span class="dt-rate">{{ (cityCfg.housingFund * 100).toFixed(0) }}%</span>
                <span class="dt-val">¥ {{ fmt(socialInsurance.housingFund) }}</span>
              </div>
              <div class="dt-row dt-row--total">
                <span class="dt-name">{{ t('tools.income-tax-calculator.total') }}</span>
                <span />
                <span class="dt-val">¥ {{ fmt(socialInsurance.total) }}</span>
              </div>
            </div>
          </transition>
        </div>

        <!-- 工资构成饼图 -->
        <div class="itc-card">
          <div class="card-title card-title--sm">
            {{ t('tools.income-tax-calculator.salaryComposition') }}
          </div>
          <PieChart :segments="salaryChartSegments" :size="150" />
        </div>

        <!-- 税率表（折叠） -->
        <div class="itc-card">
          <button class="collapse-hd" @click="showBrackets = !showBrackets">
            <span class="card-title card-title--sm">{{ t('tools.income-tax-calculator.taxBrackets') }}</span>
            <span class="collapse-hint">{{ t('tools.income-tax-calculator.currentBracket') }}: {{ (taxResult.rate * 100).toFixed(0) }}%</span>
            <icon-mdi-chevron-down class="collapse-chevron" :class="{ 'collapse-chevron--open': showBrackets }" />
          </button>
          <transition name="accordion">
            <div v-if="showBrackets" class="bracket-table">
              <div
                v-for="b in TAX_BRACKETS"
                :key="b.rate"
                class="bracket-row"
                :class="{ 'bracket-row--active': taxResult.bracket === b }"
                :style="taxResult.bracket === b ? { background: `${bracketColor(b.rate)}10`, borderColor: `${bracketColor(b.rate)}40` } : {}"
              >
                <span class="bracket-range">
                  {{ b.max === Infinity ? `> ¥${b.min.toLocaleString()}` : `¥${b.min.toLocaleString()} – ¥${b.max.toLocaleString()}` }}
                </span>
                <span v-if="taxResult.bracket === b" class="bracket-cur-tag">{{ t('tools.income-tax-calculator.current') }}</span>
                <span class="bracket-rate" :style="{ color: bracketColor(b.rate) }">
                  {{ (b.rate * 100).toFixed(0) }}%
                </span>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
/* ── 根容器 & 双栏 ──────────────────────────────────────────── */
.itc-root {
  max-width: 860px;
  margin: 0 auto;
  padding: 4px 0 32px;
}

.itc-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start;
}

/* ── 卡片 ──────────────────────────────────────────────────── */
.itc-card {
  background: var(--n-color, #fff);
  border: 1px solid var(--n-border-color, rgba(0,0,0,.08));
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,.06);
  margin-bottom: 16px;

  &:last-child { margin-bottom: 0; }
}

/* ── 卡片头部 ──────────────────────────────────────────────── */
.card-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--n-border-color, rgba(0,0,0,.07));
}

.card-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--n-text-color-1, #1a1a1a);
  letter-spacing: 0.02em;

  &--sm {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--n-text-color-3, #777);
    text-transform: uppercase;
    letter-spacing: 0.07em;
    margin-bottom: 14px;
  }
}

.card-opt {
  font-size: 11px;
  color: var(--n-text-color-3, #aaa);
  font-weight: 400;
}

/* ── 重置按钮 ──────────────────────────────────────────────── */
.reset-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  font-size: 12px;
  color: var(--n-text-color-3, #888);
  background: transparent;
  border: 1px solid var(--n-border-color, rgba(0,0,0,.12));
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background 0.15s;

  &:hover {
    color: #ef4444;
    border-color: #ef4444;
    background: rgba(239,68,68,.06);
  }
}

/* ── 字段 ──────────────────────────────────────────────────── */
.field {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
  margin-bottom: 12px;

  &:last-child { margin-bottom: 0; }
}

.fl {
  font-size: 13px;
  font-weight: 500;
  color: var(--n-text-color-2, #444);
  text-align: left;
  white-space: normal;
  overflow-wrap: anywhere;
  user-select: none;
}

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
}

.fi {
  flex: 1;
  padding: 8px 10px;
  border: none;
  outline: none;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  background: transparent;
  color: var(--n-text-color-1, #1a1a1a);
  min-width: 0;

  &-select {
    width: 100%;
    border: 1.5px solid var(--n-border-color, rgba(0,0,0,.15));
    border-radius: 8px;
    padding: 8px 10px;
    font-size: 14px;
    background: var(--n-color, #fff);
    color: var(--n-text-color-1, #1a1a1a);
    cursor: pointer;
    outline: none;
    appearance: auto;

    &:focus {
      border-color: var(--primary-color, #6366f1);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color, #6366f1) 14%, transparent);
    }
  }
}

.fi-suffix {
  padding: 0 10px;
  font-size: 12px;
  color: var(--n-text-color-3, #999);
  background: var(--n-color-modal, rgba(0,0,0,.03));
  border-left: 1px solid var(--n-border-color, rgba(0,0,0,.1));
  align-self: stretch;
  display: flex;
  align-items: center;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── 预设快捷按钮 ──────────────────────────────────────────── */
.preset-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
}

.preset-chip {
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 500;
  color: var(--primary-color, #6366f1);
  background: color-mix(in srgb, var(--primary-color, #6366f1) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--primary-color, #6366f1) 30%, transparent);
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: color-mix(in srgb, var(--primary-color, #6366f1) 18%, transparent);
  }
}

/* ── 专项扣除合计提示 ──────────────────────────────────────── */
.deduction-total {
  margin-top: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--primary-color, #6366f1) 7%, transparent);
  font-size: 12px;
  color: var(--n-text-color-2, #555);

  strong {
    color: var(--primary-color, #6366f1);
    font-variant-numeric: tabular-nums;
  }
}

/* ── 实发工资 Hero ─────────────────────────────────────────── */
.hero-block {
  background: linear-gradient(135deg, rgba(99,102,241,.08) 0%, rgba(99,102,241,.03) 100%);
  border: 1px solid rgba(99,102,241,.2);
  border-radius: 12px;
  padding: 18px 20px;
  margin-bottom: 16px;
  text-align: center;
}

.hero-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--n-text-color-3, #888);
  margin-bottom: 6px;
}

.hero-val {
  font-size: 32px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: #6366f1;
  line-height: 1.2;
}

.hero-sub {
  margin-top: 6px;
  font-size: 12px;
  color: var(--n-text-color-3, #888);

  strong {
    color: var(--n-text-color-2, #555);
  }
}

/* ── 结果明细行 ────────────────────────────────────────────── */
.res-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.res-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--n-color-modal, rgba(0,0,0,.025));
  border: 1px solid var(--n-border-color, rgba(0,0,0,.05));
  font-size: 13px;
}

.res-lbl {
  color: var(--n-text-color-2, #444);
  font-weight: 500;
}

.res-num {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--n-text-color-1, #1a1a1a);

  &--red { color: #dc2626; }
  &--amber { color: #d97706; }
}

.res-badge {
  padding: 2px 10px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 14px;
}

/* ── 折叠头部 ──────────────────────────────────────────────── */
.collapse-hd {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  margin-bottom: 0;
  text-align: left;
}

.collapse-hint {
  font-size: 11px;
  color: var(--n-text-color-3, #aaa);
  margin-left: auto;
  margin-right: 2px;
}

.collapse-chevron {
  color: var(--n-text-color-3, #aaa);
  font-size: 18px;
  flex-shrink: 0;
  transition: transform 0.25s;
  margin-left: 2px;

  &--open { transform: rotate(180deg); }
}

/* ── 社保明细表 ────────────────────────────────────────────── */
.dt-table {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dt-row {
  display: grid;
  grid-template-columns: 1fr 60px auto;
  gap: 8px;
  align-items: center;
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 13px;
  color: var(--n-text-color-1, #333);
  transition: background 0.1s;

  &:hover { background: rgba(0,0,0,.03); }

  &--total {
    border-top: 1px solid var(--n-border-color, rgba(0,0,0,.08));
    margin-top: 4px;
    padding-top: 10px;
    font-weight: 600;
  }
}

.dt-name { color: var(--n-text-color-2, #444); }
.dt-rate { font-size: 12px; color: var(--n-text-color-3, #888); text-align: center; }
.dt-val { font-variant-numeric: tabular-nums; text-align: right; font-weight: 500; }

/* ── 税率表 ────────────────────────────────────────────────── */
.bracket-table {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bracket-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 8px;
  border: 1px solid transparent;
  font-size: 12px;
  transition: all 0.15s;

  &--active {
    font-weight: 600;
  }
}

.bracket-range {
  flex: 1;
  color: var(--n-text-color-2, #444);
  font-variant-numeric: tabular-nums;
}

.bracket-cur-tag {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 10px;
  background: rgba(99,102,241,.15);
  color: #6366f1;
  font-weight: 600;
}

.bracket-rate {
  font-weight: 700;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  min-width: 32px;
  text-align: right;
}

/* ── Accordion 动画 ────────────────────────────────────────── */
.accordion-enter-active,
.accordion-leave-active {
  transition: max-height 0.28s ease, opacity 0.22s ease;
  overflow: hidden;
  max-height: 600px;
}
.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
}

/* ── 响应式 ────────────────────────────────────────────────── */
@media (max-width: 700px) {
  .itc-grid {
    grid-template-columns: 1fr;
  }

  .col-result { order: 2; }
  .col-input  { order: 1; }

  .hero-val { font-size: 26px; }
}
</style>
