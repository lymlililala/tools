<script setup lang="ts">
const { t } = useI18n();

// 贷款类型
const loanType = ref<'equal-payment' | 'equal-principal'>('equal-payment');

// 输入参数
const totalPrice = ref<number>(1000000); // 总房价
const downPaymentRate = ref<number>(30); // 首付比例 %
const loanYears = ref<number>(30); // 贷款年限
const annualRate = ref<number>(3.95); // 年利率 %

// 组合贷款
const useCombinedLoan = ref(false);
const providentFundAmount = ref<number>(500000); // 公积金贷款金额
const providentFundRate = ref<number>(3.1); // 公积金利率 %

// 计算首付金额
const downPayment = computed(() => totalPrice.value * (downPaymentRate.value / 100));

// 商业贷款金额
const commercialLoanAmount = computed(() => {
  const loanAmount = totalPrice.value - downPayment.value;
  if (useCombinedLoan.value) {
    return Math.max(0, loanAmount - providentFundAmount.value);
  }
  return loanAmount;
});

// 总贷款金额
const totalLoanAmount = computed(() => totalPrice.value - downPayment.value);

// 月利率
const monthlyRate = computed(() => annualRate.value / 100 / 12);
const providentMonthlyRate = computed(() => providentFundRate.value / 100 / 12);

// 总还款期数
const totalMonths = computed(() => loanYears.value * 12);

// 等额还款计算（商业贷款部分）
function calcEqualPayment(principal: number, mRate: number, months: number) {
  if (principal <= 0 || mRate <= 0 || months <= 0) return { monthly: 0, totalPayment: 0, totalInterest: 0 };
  const monthly = principal * mRate * Math.pow(1 + mRate, months) / (Math.pow(1 + mRate, months) - 1);
  const totalPayment = monthly * months;
  const totalInterest = totalPayment - principal;
  return { monthly, totalPayment, totalInterest };
}

// 等额本金计算（商业贷款部分）
function calcEqualPrincipal(principal: number, mRate: number, months: number) {
  if (principal <= 0 || mRate <= 0 || months <= 0) return { firstMonthly: 0, lastMonthly: 0, totalPayment: 0, totalInterest: 0, schedule: [] as number[] };
  const principalPerMonth = principal / months;
  let totalInterest = 0;
  const schedule: number[] = [];
  for (let i = 0; i < months; i++) {
    const remaining = principal - principalPerMonth * i;
    const interest = remaining * mRate;
    const monthly = principalPerMonth + interest;
    totalInterest += interest;
    schedule.push(monthly);
  }
  const totalPayment = principal + totalInterest;
  return {
    firstMonthly: schedule[0] ?? 0,
    lastMonthly: schedule[schedule.length - 1] ?? 0,
    totalPayment,
    totalInterest,
    schedule,
  };
}

// 商业贷款计算结果
const commercialResult = computed(() => {
  if (loanType.value === 'equal-payment') {
    return calcEqualPayment(commercialLoanAmount.value, monthlyRate.value, totalMonths.value);
  }
  return calcEqualPrincipal(commercialLoanAmount.value, monthlyRate.value, totalMonths.value);
});

// 公积金贷款计算结果
const providentResult = computed(() => {
  if (!useCombinedLoan.value) return null;
  const amount = Math.min(providentFundAmount.value, totalLoanAmount.value);
  if (loanType.value === 'equal-payment') {
    return calcEqualPayment(amount, providentMonthlyRate.value, totalMonths.value);
  }
  return calcEqualPrincipal(amount, providentMonthlyRate.value, totalMonths.value);
});

// 第一个月还款额（等额还款固定，等额本金取首月）
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

// 最后一个月（仅等额本金有意义）
const lastMonthPayment = computed(() => {
  if (loanType.value !== 'equal-principal') return null;
  const commercial = (commercialResult.value as any).lastMonthly ?? 0;
  const provident = providentResult.value ? (providentResult.value as any).lastMonthly ?? 0 : 0;
  return commercial + provident;
});

// 总还款额
const totalPayment = computed(() => {
  const commercial = (commercialResult.value as any).totalPayment ?? 0;
  const provident = providentResult.value ? (providentResult.value as any).totalPayment ?? 0 : 0;
  return commercial + provident;
});

// 总利息
const totalInterest = computed(() => {
  const commercial = (commercialResult.value as any).totalInterest ?? 0;
  const provident = providentResult.value ? (providentResult.value as any).totalInterest ?? 0 : 0;
  return commercial + provident;
});

// 格式化金额
function formatMoney(val: number) {
  return val.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const loanTypeOptions = computed(() => [
  { label: t('tools.mortgage-calculator.equalPayment'), value: 'equal-payment' },
  { label: t('tools.mortgage-calculator.equalPrincipal'), value: 'equal-principal' },
]);

const loanYearOptions = [5, 10, 15, 20, 25, 30].map(y => ({ label: `${y} ${t('tools.mortgage-calculator.years')}`, value: y }));
</script>

<template>
  <div style="max-width: 780px; margin: 0 auto">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <!-- 左栏：输入参数 -->
      <c-card>
        <template #title>
          {{ t('tools.mortgage-calculator.params') }}
        </template>

        <n-form label-placement="left" label-width="130">
          <n-form-item :label="t('tools.mortgage-calculator.totalPrice')">
            <n-input-number
              v-model:value="totalPrice"
              :min="100000"
              :step="10000"
              style="width: 100%"
            >
              <template #suffix>
                {{ t('tools.mortgage-calculator.yuan') }}
              </template>
            </n-input-number>
          </n-form-item>

          <n-form-item :label="t('tools.mortgage-calculator.downPaymentRate')">
            <n-slider
              v-model:value="downPaymentRate"
              :min="20"
              :max="90"
              :step="1"
              :marks="{ 20: '20%', 30: '30%', 50: '50%', 70: '70%' }"
              style="flex:1"
            />
            <n-input-number
              v-model:value="downPaymentRate"
              :min="20"
              :max="90"
              style="width: 90px; margin-left: 12px; flex-shrink:0"
            >
              <template #suffix>
                %
              </template>
            </n-input-number>
          </n-form-item>

          <n-form-item :label="t('tools.mortgage-calculator.loanYears')">
            <c-select
              v-model:value="loanYears"
              :options="loanYearOptions"
              style="width: 100%"
            />
          </n-form-item>

          <n-form-item :label="t('tools.mortgage-calculator.annualRate')">
            <n-input-number
              v-model:value="annualRate"
              :min="1"
              :max="20"
              :step="0.01"
              :precision="2"
              style="width: 100%"
            >
              <template #suffix>
                %
              </template>
            </n-input-number>
          </n-form-item>

          <n-form-item :label="t('tools.mortgage-calculator.loanType')">
            <c-select
              v-model:value="loanType"
              :options="loanTypeOptions"
              style="width: 100%"
            />
          </n-form-item>

          <n-form-item :label="t('tools.mortgage-calculator.useCombinedLoan')">
            <n-switch v-model:value="useCombinedLoan" />
          </n-form-item>

          <template v-if="useCombinedLoan">
            <n-form-item :label="t('tools.mortgage-calculator.providentFundAmount')">
              <n-input-number
                v-model:value="providentFundAmount"
                :min="0"
                :max="totalLoanAmount"
                :step="10000"
                style="width: 100%"
              >
                <template #suffix>
                  {{ t('tools.mortgage-calculator.yuan') }}
                </template>
              </n-input-number>
            </n-form-item>
            <n-form-item :label="t('tools.mortgage-calculator.providentRate')">
              <n-input-number
                v-model:value="providentFundRate"
                :min="1"
                :max="10"
                :step="0.01"
                :precision="2"
                style="width: 100%"
              >
                <template #suffix>
                  %
                </template>
              </n-input-number>
            </n-form-item>
          </template>
        </n-form>
      </c-card>

      <!-- 右栏：计算结果 -->
      <div flex flex-col gap-4>
        <c-card>
          <template #title>
            {{ t('tools.mortgage-calculator.summary') }}
          </template>

          <div class="stat-grid">
            <div class="stat-item">
              <div class="stat-label">
                {{ t('tools.mortgage-calculator.downPayment') }}
              </div>
              <div class="stat-value primary">
                ¥ {{ formatMoney(downPayment) }}
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-label">
                {{ t('tools.mortgage-calculator.totalLoan') }}
              </div>
              <div class="stat-value">
                ¥ {{ formatMoney(totalLoanAmount) }}
              </div>
            </div>
            <div class="stat-item highlight">
              <div class="stat-label">
                {{ loanType === 'equal-payment' ? t('tools.mortgage-calculator.monthlyPayment') : t('tools.mortgage-calculator.firstMonthPayment') }}
              </div>
              <div class="stat-value primary large">
                ¥ {{ formatMoney(firstMonthPayment) }}
              </div>
            </div>
            <template v-if="loanType === 'equal-principal' && lastMonthPayment !== null">
              <div class="stat-item">
                <div class="stat-label">
                  {{ t('tools.mortgage-calculator.lastMonthPayment') }}
                </div>
                <div class="stat-value">
                  ¥ {{ formatMoney(lastMonthPayment) }}
                </div>
              </div>
            </template>
            <div class="stat-item">
              <div class="stat-label">
                {{ t('tools.mortgage-calculator.totalPayment') }}
              </div>
              <div class="stat-value">
                ¥ {{ formatMoney(totalPayment) }}
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-label">
                {{ t('tools.mortgage-calculator.totalInterest') }}
              </div>
              <div class="stat-value danger">
                ¥ {{ formatMoney(totalInterest) }}
              </div>
            </div>
          </div>
        </c-card>

        <c-card v-if="useCombinedLoan">
          <template #title>
            {{ t('tools.mortgage-calculator.combinedDetail') }}
          </template>
          <div class="detail-row">
            <span>{{ t('tools.mortgage-calculator.providentPart') }}</span>
            <span>¥ {{ formatMoney(Math.min(providentFundAmount, totalLoanAmount)) }}</span>
          </div>
          <div class="detail-row">
            <span>{{ t('tools.mortgage-calculator.commercialPart') }}</span>
            <span>¥ {{ formatMoney(commercialLoanAmount) }}</span>
          </div>
        </c-card>
      </div>
    </div>

    <!-- 还款说明 -->
    <c-card mt-4>
      <template #title>
        {{ t('tools.mortgage-calculator.tips') }}
      </template>
      <ul class="tips-list">
        <li>{{ t('tools.mortgage-calculator.tip1') }}</li>
        <li>{{ t('tools.mortgage-calculator.tip2') }}</li>
        <li>{{ t('tools.mortgage-calculator.tip3') }}</li>
      </ul>
    </c-card>
  </div>
</template>

<style scoped lang="less">
.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stat-item {
  padding: 12px;
  border-radius: 8px;
  background: var(--n-color);
  border: 1px solid var(--n-border-color);

  &.highlight {
    grid-column: span 2;
    background: rgba(99, 102, 241, 0.08);
    border-color: rgba(99, 102, 241, 0.3);
  }
}

.stat-label {
  font-size: 12px;
  opacity: 0.6;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;

  &.primary {
    color: #6366f1;
  }

  &.danger {
    color: #f87171;
  }

  &.large {
    font-size: 22px;
  }
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid var(--n-border-color);
  font-size: 14px;

  &:last-child {
    border-bottom: none;
  }
}

.tips-list {
  padding-left: 20px;
  margin: 0;

  li {
    margin-bottom: 6px;
    font-size: 13px;
    opacity: 0.75;
    line-height: 1.6;
  }
}
</style>
