<script setup lang="ts">
import PieChart from '@/components/PieChart.vue';

const { t } = useI18n();

// ─── 输入参数 ──────────────────────────────────────────────────────────────────
const totalPrice = ref<number>(1000000); // 总房价（元）
const downPaymentRate = ref<number>(30); // 首付比例 %
const loanYears = ref<number>(30); // 贷款年限
const annualRate = ref<number>(3.95); // 年利率 %
const loanType = ref<'equal-payment' | 'equal-principal'>('equal-payment');

// 组合贷款
const useCombinedLoan = ref(false);
const providentFundAmount = ref<number>(500000); // 公积金金额（元）
const providentFundRate = ref<number>(3.1); // 公积金利率 %

// 还款明细弹窗
const showSchedule = ref(false);

// ─── 衍生计算 ──────────────────────────────────────────────────────────────────
const downPayment = computed(() => totalPrice.value * (downPaymentRate.value / 100));

const commercialLoanAmount = computed(() => {
  const loanAmount = totalPrice.value - downPayment.value;
  if (useCombinedLoan.value) {
    return Math.max(0, loanAmount - providentFundAmount.value);
  }
  return loanAmount;
});

const totalLoanAmount = computed(() => totalPrice.value - downPayment.value);
const monthlyRate = computed(() => annualRate.value / 100 / 12);
const providentMonthlyRate = computed(() => providentFundRate.value / 100 / 12);
const totalMonths = computed(() => loanYears.value * 12);

// 等额还款
function calcEqualPayment(principal: number, mRate: number, months: number) {
  if (principal <= 0 || mRate <= 0 || months <= 0) {
    return { monthly: 0, totalPayment: 0, totalInterest: 0, schedule: [] as { principal: number; interest: number; remaining: number }[] };
  }
  const monthly = (principal * mRate * (1 + mRate) ** months) / ((1 + mRate) ** months - 1);
  const totalPayment = monthly * months;
  const totalInterest = totalPayment - principal;
  const schedule: { principal: number; interest: number; remaining: number }[] = [];
  let remaining = principal;
  for (let i = 0; i < months; i++) {
    const interestPart = remaining * mRate;
    const principalPart = monthly - interestPart;
    remaining = Math.max(0, remaining - principalPart);
    schedule.push({ principal: principalPart, interest: interestPart, remaining });
  }
  return { monthly, totalPayment, totalInterest, schedule };
}

// 等额本金
function calcEqualPrincipal(principal: number, mRate: number, months: number) {
  if (principal <= 0 || mRate <= 0 || months <= 0) {
    return { firstMonthly: 0, lastMonthly: 0, totalPayment: 0, totalInterest: 0, schedule: [] as { principal: number; interest: number; remaining: number }[] };
  }
  const principalPerMonth = principal / months;
  let totalInterest = 0;
  const schedule: { principal: number; interest: number; remaining: number }[] = [];
  let remaining = principal;
  for (let i = 0; i < months; i++) {
    const interest = remaining * mRate;
    totalInterest += interest;
    remaining = Math.max(0, remaining - principalPerMonth);
    schedule.push({ principal: principalPerMonth, interest, remaining });
  }
  const totalPayment = principal + totalInterest;
  return {
    firstMonthly: schedule[0] ? schedule[0].principal + schedule[0].interest : 0,
    lastMonthly: schedule[schedule.length - 1] ? schedule[schedule.length - 1].principal + schedule[schedule.length - 1].interest : 0,
    totalPayment,
    totalInterest,
    schedule,
  };
}

const commercialResult = computed(() => {
  if (loanType.value === 'equal-payment') {
    return calcEqualPayment(commercialLoanAmount.value, monthlyRate.value, totalMonths.value);
  }
  return calcEqualPrincipal(commercialLoanAmount.value, monthlyRate.value, totalMonths.value);
});

const providentResult = computed(() => {
  if (!useCombinedLoan.value) {
    return null;
  }
  const amount = Math.min(providentFundAmount.value, totalLoanAmount.value);
  if (loanType.value === 'equal-payment') {
    return calcEqualPayment(amount, providentMonthlyRate.value, totalMonths.value);
  }
  return calcEqualPrincipal(amount, providentMonthlyRate.value, totalMonths.value);
});

const firstMonthPayment = computed(() => {
  let commercial = 0;
  let provident = 0;
  if (loanType.value === 'equal-payment') {
    commercial = (commercialResult.value as any).monthly ?? 0;
    provident = providentResult.value ? (providentResult.value as any).monthly ?? 0 : 0;
  }
  else {
    commercial = (commercialResult.value as any).firstMonthly ?? 0;
    provident = providentResult.value ? (providentResult.value as any).firstMonthly ?? 0 : 0;
  }
  return commercial + provident;
});

const lastMonthPayment = computed(() => {
  if (loanType.value !== 'equal-principal') {
    return null;
  }
  const commercial = (commercialResult.value as any).lastMonthly ?? 0;
  const provident = providentResult.value ? (providentResult.value as any).lastMonthly ?? 0 : 0;
  return commercial + provident;
});

const totalPayment = computed(() => {
  const commercial = (commercialResult.value as any).totalPayment ?? 0;
  const provident = providentResult.value ? (providentResult.value as any).totalPayment ?? 0 : 0;
  return commercial + provident;
});

const totalInterest = computed(() => {
  const commercial = (commercialResult.value as any).totalInterest ?? 0;
  const provident = providentResult.value ? (providentResult.value as any).totalInterest ?? 0 : 0;
  return commercial + provident;
});

// ─── 还款明细（合并商业+公积金）────────────────────────────────────────────────
const scheduleRows = computed(() => {
  const commSched = (commercialResult.value as any).schedule ?? [];
  const provSched = providentResult.value ? (providentResult.value as any).schedule ?? [] : [];
  const months = Math.max(commSched.length, provSched.length);
  return Array.from({ length: months }, (_, i) => {
    const c = commSched[i] ?? { principal: 0, interest: 0, remaining: 0 };
    const p = provSched[i] ?? { principal: 0, interest: 0, remaining: 0 };
    return {
      month: i + 1,
      payment: c.principal + c.interest + p.principal + p.interest,
      principal: c.principal + p.principal,
      interest: c.interest + p.interest,
      remaining: c.remaining + p.remaining,
    };
  });
});

// ─── 饼图数据 ──────────────────────────────────────────────────────────────────
const chartSegments = computed(() => [
  { label: '首付款', value: downPayment.value, color: '#6366f1' },
  { label: '贷款本金', value: totalLoanAmount.value, color: '#22c55e' },
  { label: '总利息', value: totalInterest.value, color: '#f87171' },
]);

// ─── 格式化 ────────────────────────────────────────────────────────────────────
function formatMoney(val: number) {
  return val.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatMoneyShort(val: number) {
  if (val >= 1e8) {
    return `${(val / 1e8).toFixed(2)} 亿`;
  }
  if (val >= 1e4) {
    return `${(val / 1e4).toFixed(2)} 万`;
  }
  return val.toFixed(2);
}

// 千分位格式化输入框显示
const totalPriceDisplay = computed({
  get: () => totalPrice.value.toLocaleString('zh-CN'),
  set: (v: string) => {
    const n = Number(v.replace(/,/g, ''));
    if (!Number.isNaN(n) && n >= 0) {
      totalPrice.value = n;
    }
  },
});

// ─── 贷款年限选项 ──────────────────────────────────────────────────────────────
const loanYearOptions = [5, 10, 15, 20, 25, 30];

// 还款方式选项
const loanTypeOptions = computed(() => [
  { label: t('tools.mortgage-calculator.equalPayment'), value: 'equal-payment' },
  { label: t('tools.mortgage-calculator.equalPrincipal'), value: 'equal-principal' },
]);

// 当公积金金额超过总贷款时自动修正
watch(totalLoanAmount, (v) => {
  if (providentFundAmount.value > v) {
    providentFundAmount.value = v;
  }
});
</script>

<template>
  <div class="mc-root">
    <div class="mc-grid">
      <!-- ═══════════════════════════════ 左栏：输入 ═══════════════════════════ -->
      <div class="mc-panel mc-panel--input">
        <div class="panel-title">
          {{ t('tools.mortgage-calculator.params') }}
        </div>

        <!-- 总房价 -->
        <div class="field">
          <label class="field-label">{{ t('tools.mortgage-calculator.totalPrice') }}</label>
          <div class="field-input-wrap">
            <input
              v-model="totalPriceDisplay"
              class="field-input"
              type="text"
              inputmode="numeric"
              placeholder="1,000,000"
            >
            <span class="field-suffix">{{ t('tools.mortgage-calculator.yuan') }}</span>
          </div>
        </div>

        <!-- 首付比例 + Slider -->
        <div class="field">
          <label class="field-label">
            {{ t('tools.mortgage-calculator.downPaymentRate') }}
            <span class="field-value-badge">{{ downPaymentRate }}%</span>
          </label>
          <input
            v-model.number="downPaymentRate"
            class="slider"
            type="range"
            :min="20"
            :max="90"
            step="1"
          >
          <div class="slider-ticks">
            <span>20%</span>
            <span>{{ t('tools.mortgage-calculator.downPaymentLabel') }} {{ formatMoneyShort(downPayment) }}</span>
            <span>90%</span>
          </div>
        </div>

        <!-- 贷款年限 + Slider -->
        <div class="field">
          <label class="field-label">
            {{ t('tools.mortgage-calculator.loanYears') }}
            <span class="field-value-badge">{{ loanYears }} {{ t('tools.mortgage-calculator.year') }}</span>
          </label>
          <input
            v-model.number="loanYears"
            class="slider"
            type="range"
            :min="5"
            :max="30"
            step="5"
          >
          <div class="slider-ticks">
            <span v-for="y in loanYearOptions" :key="y" class="tick-year" :class="{ active: loanYears === y }" @click="loanYears = y">
              {{ y }}
            </span>
          </div>
        </div>

        <!-- 年利率 -->
        <div class="field">
          <label class="field-label">{{ t('tools.mortgage-calculator.annualRate') }}</label>
          <div class="field-input-wrap">
            <input
              v-model.number="annualRate"
              class="field-input"
              type="number"
              min="0.1"
              max="20"
              step="0.01"
              placeholder="3.95"
            >
            <span class="field-suffix">%</span>
          </div>
        </div>

        <!-- 还款方式 -->
        <div class="field">
          <label class="field-label">{{ t('tools.mortgage-calculator.loanType') }}</label>
          <div class="toggle-group">
            <button
              v-for="opt in loanTypeOptions"
              :key="opt.value"
              class="toggle-btn"
              :class="{ 'toggle-btn--on': loanType === opt.value }"
              @click="loanType = opt.value as any"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <!-- 公积金组合贷 -->
        <div class="field field--switch">
          <label class="field-label">{{ t('tools.mortgage-calculator.useCombinedLoan') }}</label>
          <button
            class="switch-btn"
            :class="{ 'switch-btn--on': useCombinedLoan }"
            role="switch"
            :aria-checked="useCombinedLoan"
            @click="useCombinedLoan = !useCombinedLoan"
          >
            <span class="switch-thumb" />
          </button>
        </div>

        <!-- 公积金展开区（Accordion） -->
        <transition name="accordion">
          <div v-if="useCombinedLoan" class="provident-section">
            <div class="field">
              <label class="field-label">{{ t('tools.mortgage-calculator.providentFundAmount') }}</label>
              <div class="field-input-wrap">
                <input
                  v-model.number="providentFundAmount"
                  class="field-input"
                  type="number"
                  min="0"
                  :max="totalLoanAmount"
                  step="10000"
                  placeholder="500000"
                >
                <span class="field-suffix">{{ t('tools.mortgage-calculator.yuan') }}</span>
              </div>
              <div class="field-hint">
                {{ t('tools.mortgage-calculator.maxLoan') }} {{ formatMoneyShort(totalLoanAmount) }}，{{ t('tools.mortgage-calculator.commercialLoan') }} {{ formatMoneyShort(commercialLoanAmount) }}
              </div>
            </div>
            <div class="field">
              <label class="field-label">{{ t('tools.mortgage-calculator.providentRate') }}</label>
              <div class="field-input-wrap">
                <input
                  v-model.number="providentFundRate"
                  class="field-input"
                  type="number"
                  min="0.1"
                  max="10"
                  step="0.01"
                  placeholder="3.1"
                >
                <span class="field-suffix">%</span>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- ═══════════════════════════════ 右栏：结果 ═══════════════════════════ -->
      <div class="mc-panel mc-panel--result">
        <!-- 概览统计 -->
        <div class="panel-title">
          {{ t('tools.mortgage-calculator.summary') }}
        </div>

        <div class="stat-grid">
          <!-- 首付金额 -->
          <div class="stat-card">
            <div class="stat-card__label">
              {{ t('tools.mortgage-calculator.downPayment') }}
            </div>
            <div class="stat-card__value stat-card__value--indigo">
              ¥ {{ formatMoney(downPayment) }}
            </div>
          </div>
          <!-- 贷款总额 -->
          <div class="stat-card">
            <div class="stat-card__label">
              {{ t('tools.mortgage-calculator.totalLoan') }}
            </div>
            <div class="stat-card__value">
              ¥ {{ formatMoney(totalLoanAmount) }}
            </div>
          </div>
          <!-- 月供（全宽，最突出） -->
          <div class="stat-card stat-card--hero">
            <div class="stat-card__label">
              {{ loanType === 'equal-payment' ? t('tools.mortgage-calculator.monthlyPayment') : t('tools.mortgage-calculator.firstMonthPayment') }}
              <span v-if="loanType === 'equal-principal'" class="stat-card__sub">{{ t('tools.mortgage-calculator.monthlyDecreasing') }}</span>
            </div>
            <div class="stat-card__value stat-card__value--hero">
              ¥ {{ formatMoney(firstMonthPayment) }}
            </div>
            <div v-if="loanType === 'equal-principal' && lastMonthPayment !== null" class="stat-card__extra">
              {{ t('tools.mortgage-calculator.lastMonth') }} ¥ {{ formatMoney(lastMonthPayment) }}，{{ t('tools.mortgage-calculator.avgMonthlyDecrease') }} ¥ {{ formatMoney((firstMonthPayment - lastMonthPayment) / (totalMonths - 1)) }}
            </div>
            <!-- 查看还款明细按钮 -->
            <button class="schedule-btn" @click="showSchedule = true">
              <icon-mdi-table-eye />
              {{ t('tools.mortgage-calculator.viewSchedule') }}
            </button>
          </div>
          <!-- 还款总额 -->
          <div class="stat-card">
            <div class="stat-card__label">
              {{ t('tools.mortgage-calculator.totalPayment') }}
            </div>
            <div class="stat-card__value">
              ¥ {{ formatMoney(totalPayment) }}
            </div>
          </div>
          <!-- 总利息 -->
          <div class="stat-card">
            <div class="stat-card__label">
              {{ t('tools.mortgage-calculator.totalInterest') }}
            </div>
            <div class="stat-card__value stat-card__value--red">
              ¥ {{ formatMoney(totalInterest) }}
            </div>
          </div>
        </div>

        <!-- 组合贷明细 -->
        <transition name="accordion">
          <div v-if="useCombinedLoan" class="combined-detail">
            <div class="panel-title panel-title--sm">
              {{ t('tools.mortgage-calculator.combinedDetail') }}
            </div>
            <div class="detail-row">
              <span>{{ t('tools.mortgage-calculator.providentPart') }}</span>
              <span class="detail-val">¥ {{ formatMoney(Math.min(providentFundAmount, totalLoanAmount)) }}</span>
            </div>
            <div class="detail-row">
              <span>{{ t('tools.mortgage-calculator.commercialPart') }}</span>
              <span class="detail-val">¥ {{ formatMoney(commercialLoanAmount) }}</span>
            </div>
          </div>
        </transition>

        <!-- 饼图 -->
        <div class="chart-section">
          <div class="panel-title panel-title--sm">
            {{ t('tools.mortgage-calculator.fundComposition') }}
          </div>
          <PieChart :segments="chartSegments" :size="160" />
        </div>
      </div>
    </div>

    <!-- 温馨提示 -->
    <div class="tips-card">
      <div class="tips-title">
        {{ t('tools.mortgage-calculator.tips') }}
      </div>
      <ul class="tips-list">
        <li>{{ t('tools.mortgage-calculator.tip1') }}</li>
        <li>{{ t('tools.mortgage-calculator.tip2') }}</li>
        <li>{{ t('tools.mortgage-calculator.tip3') }}</li>
      </ul>
    </div>

    <!-- ═══════════════════════ 还款明细弹窗 ═══════════════════════════════════ -->
    <transition name="modal-fade">
      <div v-if="showSchedule" class="modal-overlay" @click.self="showSchedule = false">
        <div class="modal-box">
          <div class="modal-header">
            <span class="modal-title">{{ t('tools.mortgage-calculator.scheduleTitle') }}</span>
            <button class="modal-close" @click="showSchedule = false">
              <icon-mdi-close />
            </button>
          </div>
          <div class="modal-meta">
            {{ t('tools.mortgage-calculator.scheduleMeta', { months: totalMonths, principal: formatMoney(totalLoanAmount), interest: formatMoney(totalInterest) }) }}
          </div>
          <div class="modal-table-wrap">
            <table class="schedule-table">
              <thead>
                <tr>
                  <th>{{ t('tools.mortgage-calculator.thPeriod') }}</th>
                  <th>{{ t('tools.mortgage-calculator.thMonthly') }}</th>
                  <th>{{ t('tools.mortgage-calculator.thPrincipal') }}</th>
                  <th>{{ t('tools.mortgage-calculator.thInterest') }}</th>
                  <th>{{ t('tools.mortgage-calculator.thRemaining') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in scheduleRows" :key="row.month" class="schedule-row">
                  <td class="td-month">
                    {{ t('tools.mortgage-calculator.period', { n: row.month }) }}
                  </td>
                  <td class="td-payment">
                    ¥{{ formatMoney(row.payment) }}
                  </td>
                  <td class="td-principal">
                    {{ formatMoney(row.principal) }}
                  </td>
                  <td class="td-interest">
                    {{ formatMoney(row.interest) }}
                  </td>
                  <td class="td-remaining">
                    {{ formatMoney(row.remaining) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="less">
/* ── 根容器 ──────────────────────────────── */
.mc-root {
  max-width: 860px;
  margin: 0 auto;
  padding: 4px 0 32px;
}

/* ── 双栏 Grid ────────────────────────────── */
.mc-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start;
}

/* ── 通用面板 ─────────────────────────────── */
.mc-panel {
  background: var(--n-color, #fff);
  border: 1px solid var(--n-border-color, rgba(0,0,0,.08));
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 2px 14px rgba(0,0,0,.06);
}

.panel-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--n-text-color-1, #222);
  letter-spacing: 0.03em;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--n-border-color, rgba(0,0,0,.07));

  &--sm {
    font-size: 12px;
    font-weight: 600;
    color: var(--n-text-color-3, #888);
    margin-bottom: 10px;
    padding-bottom: 6px;
    border-bottom: none;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
}

/* ── 字段 ─────────────────────────────────── */
.field {
  margin-bottom: 18px;

  &:last-child { margin-bottom: 0; }

  &--switch {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0;
  }
}

.field-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--n-text-color-2, #555);
  margin-bottom: 8px;
  user-select: none;
}

.field-value-badge {
  margin-left: auto;
  padding: 2px 8px;
  border-radius: 20px;
  background: var(--primary-color, #6366f1);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.field-input-wrap {
  display: flex;
  align-items: center;
  border: 1.5px solid var(--n-border-color, rgba(0,0,0,.15));
  border-radius: 9px;
  overflow: hidden;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus-within {
    border-color: var(--primary-color, #6366f1);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color, #6366f1) 15%, transparent);
  }
}

.field-input {
  flex: 1;
  padding: 9px 12px;
  border: none;
  outline: none;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  background: transparent;
  color: var(--n-text-color-1, #1a1a1a);
  min-width: 0;

  /* 隐藏 number 箭头 */
  -moz-appearance: textfield;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
}

.field-suffix {
  padding: 0 12px;
  font-size: 13px;
  color: var(--n-text-color-3, #888);
  background: var(--n-color-modal, rgba(0,0,0,.03));
  border-left: 1px solid var(--n-border-color, rgba(0,0,0,.1));
  align-self: stretch;
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.field-hint {
  margin-top: 5px;
  font-size: 11px;
  color: var(--n-text-color-3, #999);
}

/* ── 滑动条 ───────────────────────────────── */
.slider {
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(
    to right,
    var(--primary-color, #6366f1) 0%,
    var(--primary-color, #6366f1) calc((v-bind(downPaymentRate) - 20) / 70 * 100%),
    rgba(0,0,0,.12) calc((v-bind(downPaymentRate) - 20) / 70 * 100%),
    rgba(0,0,0,.12) 100%
  );
  border-radius: 4px;
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--primary-color, #6366f1);
    border: 3px solid #fff;
    box-shadow: 0 1px 6px rgba(0,0,0,.25);
    cursor: pointer;
    transition: transform 0.15s;

    &:hover { transform: scale(1.15); }
  }

  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--primary-color, #6366f1);
    border: 3px solid #fff;
    box-shadow: 0 1px 6px rgba(0,0,0,.25);
    cursor: pointer;
  }
}

.slider-ticks {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  font-size: 11px;
  color: var(--n-text-color-3, #aaa);
}

.tick-year {
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  transition: color 0.15s, background 0.15s;

  &:hover { color: var(--primary-color, #6366f1); }
  &.active { color: var(--primary-color, #6366f1); font-weight: 700; }
}

/* ── 还款方式 Toggle ─────────────────────── */
.toggle-group {
  display: flex;
  gap: 0;
  border-radius: 9px;
  overflow: hidden;
  border: 1.5px solid var(--n-border-color, rgba(0,0,0,.12));
}

.toggle-btn {
  flex: 1;
  padding: 8px 8px;
  font-size: 12px;
  font-weight: 500;
  border: none;
  background: transparent;
  color: var(--n-text-color-2, #555);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;

  & + & { border-left: 1px solid var(--n-border-color, rgba(0,0,0,.12)); }

  &--on {
    background: var(--primary-color, #6366f1);
    color: #fff;
  }

  &:not(&--on):hover {
    background: rgba(0,0,0,.04);
  }
}

/* ── 公积金 Switch ───────────────────────── */
.switch-btn {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  border: none;
  background: rgba(0,0,0,.15);
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;

  &--on {
    background: var(--primary-color, #6366f1);
  }
}

.switch-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,.2);
  transition: transform 0.2s;

  .switch-btn--on & { transform: translateX(20px); }
}

/* ── 公积金展开区 ─────────────────────────── */
.provident-section {
  margin-top: 14px;
  padding: 14px;
  background: rgba(99,102,241,.05);
  border: 1px dashed rgba(99,102,241,.3);
  border-radius: 10px;
}

/* ── 统计卡片 Grid ───────────────────────── */
.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.stat-card {
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--n-color-modal, rgba(0,0,0,.025));
  border: 1px solid var(--n-border-color, rgba(0,0,0,.07));

  &--hero {
    grid-column: span 2;
    background: rgba(99,102,241,.07);
    border-color: rgba(99,102,241,.25);
    padding: 16px 18px;
  }
}

.stat-card__label {
  font-size: 11px;
  font-weight: 500;
  color: var(--n-text-color-3, #888);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-card__sub {
  font-size: 10px;
  color: var(--n-text-color-3, #aaa);
  text-transform: none;
  letter-spacing: 0;
}

.stat-card__value {
  font-size: 16px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--n-text-color-1, #1a1a1a);

  &--indigo { color: #6366f1; }
  &--red { color: #ef4444; }

  &--hero {
    font-size: 28px;
    font-weight: 800;
    color: #6366f1;
    line-height: 1.2;
  }
}

.stat-card__extra {
  margin-top: 6px;
  font-size: 12px;
  color: var(--n-text-color-3, #888);
}

/* ── 查看明细按钮 ─────────────────────────── */
.schedule-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 12px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 500;
  color: #6366f1;
  background: rgba(99,102,241,.1);
  border: 1px solid rgba(99,102,241,.3);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;

  &:hover {
    background: rgba(99,102,241,.18);
    transform: translateY(-1px);
  }
  &:active { transform: translateY(0); }
}

/* ── 组合贷明细 ───────────────────────────── */
.combined-detail {
  margin-top: 16px;
  padding: 14px;
  background: rgba(99,102,241,.04);
  border: 1px dashed rgba(99,102,241,.2);
  border-radius: 10px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 13px;
  border-bottom: 1px solid var(--n-border-color, rgba(0,0,0,.07));

  &:last-child { border-bottom: none; }
}

.detail-val {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* ── 饼图区 ───────────────────────────────── */
.chart-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--n-border-color, rgba(0,0,0,.07));
}

/* ── 温馨提示 ─────────────────────────────── */
.tips-card {
  margin-top: 20px;
  background: var(--n-color, #fff);
  border: 1px solid var(--n-border-color, rgba(0,0,0,.08));
  border-radius: 12px;
  padding: 16px 20px;
}

.tips-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--n-text-color-2, #555);
  margin-bottom: 10px;
}

.tips-list {
  padding-left: 18px;
  margin: 0;

  li {
    font-size: 13px;
    color: var(--n-text-color-3, #777);
    line-height: 1.7;
    margin-bottom: 2px;
  }
}

/* ── Accordion 过渡动画 ───────────────────── */
.accordion-enter-active,
.accordion-leave-active {
  transition: max-height 0.3s ease, opacity 0.25s ease, transform 0.25s ease;
  overflow: hidden;
  max-height: 500px;
}

.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-6px);
}

/* ── 弹窗 ────────────────────────────────── */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.45);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-box {
  background: var(--n-color, #fff);
  border-radius: 14px;
  width: 100%;
  max-width: 700px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,.25);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid var(--n-border-color, rgba(0,0,0,.08));
}

.modal-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--n-text-color-1, #1a1a1a);
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: var(--n-text-color-3, #888);
  font-size: 18px;
  transition: background 0.15s;

  &:hover { background: rgba(0,0,0,.07); }
}

.modal-meta {
  padding: 10px 22px;
  font-size: 12px;
  color: var(--n-text-color-3, #888);
  background: rgba(0,0,0,.02);
  border-bottom: 1px solid var(--n-border-color, rgba(0,0,0,.06));
}

.modal-table-wrap {
  overflow-y: auto;
  flex: 1;
}

.schedule-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  thead tr {
    background: var(--n-color-modal, rgba(0,0,0,.03));
    position: sticky;
    top: 0;
    z-index: 1;
  }

  th {
    padding: 10px 16px;
    text-align: right;
    font-size: 11px;
    font-weight: 600;
    color: var(--n-text-color-3, #888);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid var(--n-border-color, rgba(0,0,0,.08));

    &:first-child { text-align: left; }
  }
}

.schedule-row {
  border-bottom: 1px solid var(--n-border-color, rgba(0,0,0,.05));
  transition: background 0.1s;

  &:hover { background: rgba(99,102,241,.05); }
  &:nth-child(even) { background: rgba(0,0,0,.015); }
  &:nth-child(even):hover { background: rgba(99,102,241,.05); }
}

.schedule-table td {
  padding: 9px 16px;
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: var(--n-text-color-1, #333);

  &:first-child { text-align: left; }
}

.td-month { color: var(--n-text-color-3, #888); font-size: 12px; }
.td-payment { font-weight: 700; color: #6366f1; }
.td-interest { color: #ef4444; }
.td-remaining { color: var(--n-text-color-3, #888); }

/* ── 响应式：移动端单栏 ───────────────────── */
@media (max-width: 680px) {
  .mc-grid {
    grid-template-columns: 1fr;
  }

  .mc-panel--result {
    order: 1; /* 结果在下 */
  }

  .mc-panel--input {
    order: 0;
  }

  .stat-card__value--hero {
    font-size: 22px;
  }
}
</style>
