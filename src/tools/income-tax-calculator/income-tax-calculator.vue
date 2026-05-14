<script setup lang="ts">
import PieChart from '@/components/PieChart.vue';

const { t } = useI18n();

// ====== 输入参数 ======
const grossSalary = ref<number>(15000); // 税前工资
const city = ref<string>('beijing'); // 城市（影响社保比例）

// 专项附加扣除
const childrenEdu = ref<number>(0); // 子女教育（每月 2000/人）
const continuingEdu = ref<number>(0); // 继续教育（每月400）
const housingLoanInterest = ref<number>(0); // 住房贷款利息（每月1000）
const housingRent = ref<number>(0); // 住房租金（每月 800/1100/1500）
const elderlySupport = ref<number>(0); // 赡养老人（每月最高3000）
const childCare = ref<number>(0); // 3岁以下子女照护（每月2000/人）

// ====== 城市社保比例配置 ======
interface CityConfig {
  label: string
  pension: number // 养老保险
  medical: number // 医疗保险
  unemployment: number // 失业保险
  housingFund: number // 公积金
  medicalExtra: number // 大病医疗额外
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

// ====== 五险一金计算 ======
const socialInsurance = computed(() => {
  const s = grossSalary.value;
  const pension = s * cityCfg.value.pension; // 养老
  const medical = s * cityCfg.value.medical + cityCfg.value.medicalExtra; // 医疗（含大病）
  const unemployment = s * cityCfg.value.unemployment; // 失业
  const housingFund = s * cityCfg.value.housingFund; // 公积金
  const total = pension + medical + unemployment + housingFund;
  return { pension, medical, unemployment, housingFund, total };
});

// ====== 专项附加扣除总额 ======
const specialDeduction = computed(
  () => childrenEdu.value + continuingEdu.value + housingLoanInterest.value + housingRent.value + elderlySupport.value + childCare.value,
);

// ====== 应纳税所得额 ======
const BASIC_DEDUCTION = 5000; // 基本减除费用
const taxableIncome = computed(() =>
  Math.max(0, grossSalary.value - socialInsurance.value.total - BASIC_DEDUCTION - specialDeduction.value),
);

// ====== 累进税率（2018年新规） ======
interface TaxBracket {
  min: number
  max: number
  rate: number
  quick: number
}

const TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 3000, rate: 0.03, quick: 0 },
  { min: 3000, max: 12000, rate: 0.10, quick: 210 },
  { min: 12000, max: 25000, rate: 0.20, quick: 1410 },
  { min: 25000, max: 35000, rate: 0.25, quick: 2660 },
  { min: 35000, max: 55000, rate: 0.30, quick: 4410 },
  { min: 55000, max: 80000, rate: 0.35, quick: 7160 },
  { min: 80000, max: Infinity, rate: 0.45, quick: 15160 },
];

const taxResult = computed(() => {
  const income = taxableIncome.value;
  const bracket = TAX_BRACKETS.find(b => income > b.min && income <= b.max)
    ?? (income <= 0 ? TAX_BRACKETS[0] : TAX_BRACKETS[TAX_BRACKETS.length - 1]);
  const tax = Math.max(0, income * bracket.rate - bracket.quick);
  return { tax, rate: bracket.rate, bracket };
});

// ====== 实发工资 ======
const netSalary = computed(() => grossSalary.value - socialInsurance.value.total - taxResult.value.tax);

// ====== 实际综合税率 ======
const effectiveTaxRate = computed(() => {
  if (grossSalary.value <= 0) return 0;
  return (taxResult.value.tax + socialInsurance.value.total) / grossSalary.value * 100;
});

function fmt(v: number) {
  return v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// 税率档次标签颜色
function bracketColor(rate: number) {
  if (rate <= 0.03) return '#34d399';
  if (rate <= 0.10) return '#60a5fa';
  if (rate <= 0.20) return '#fbbf24';
  if (rate <= 0.25) return '#f97316';
  if (rate <= 0.30) return '#f87171';
  if (rate <= 0.35) return '#ef4444';
  return '#dc2626';
}

// 饼图：工资构成
const salaryChartSegments = computed(() => [
  { label: t('tools.income-tax-calculator.netSalary'), value: netSalary.value, color: '#22c55e' },
  { label: t('tools.income-tax-calculator.incomeTax'), value: taxResult.value.tax, color: '#f87171' },
  { label: t('tools.income-tax-calculator.socialInsuranceTotal'), value: socialInsurance.value.total, color: '#f59e0b' },
]);

const DEDUCTION_PRESETS = computed(() => [
  { label: t('tools.income-tax-calculator.preset1Child'), key: 'childrenEdu', value: 2000 },
  { label: t('tools.income-tax-calculator.presetRent'), key: 'housingRent', value: 1500 },
  { label: t('tools.income-tax-calculator.presetElderly'), key: 'elderlySupport', value: 3000 },
]);
</script>

<template>
  <div style="max-width: 820px; margin: 0 auto">
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <!-- 输入区 -->
      <div flex flex-col gap-4>
        <c-card>
          <template #title>
            {{ t('tools.income-tax-calculator.income') }}
          </template>
          <n-form label-placement="left" label-width="120">
            <n-form-item :label="t('tools.income-tax-calculator.grossSalary')">
              <n-input-number
                v-model:value="grossSalary"
                :min="0"
                :step="500"
                style="width: 100%"
              >
                <template #suffix>
                  {{ t('tools.income-tax-calculator.yuanPerMonth') }}
                </template>
              </n-input-number>
            </n-form-item>
            <n-form-item :label="t('tools.income-tax-calculator.city')">
              <c-select
                v-model:value="city"
                :options="cityOptions"
                style="width: 100%"
              />
            </n-form-item>
          </n-form>
        </c-card>

        <c-card>
          <template #title>
            {{ t('tools.income-tax-calculator.specialDeductions') }}
            <span style="font-size: 12px; opacity: 0.55; font-weight: 400; margin-left: 8px">
              {{ t('tools.income-tax-calculator.optional') }}
            </span>
          </template>

          <div flex flex-wrap gap-2 mb-3>
            <n-button
              v-for="preset in DEDUCTION_PRESETS"
              :key="preset.key"
              size="tiny"
              @click="(preset.key === 'childrenEdu' ? (childrenEdu = preset.value) : preset.key === 'housingRent' ? (housingRent = preset.value) : (elderlySupport = preset.value))"
            >
              {{ preset.label }}
            </n-button>
          </div>

          <n-form label-placement="left" label-width="130" :show-feedback="false">
            <n-form-item :label="t('tools.income-tax-calculator.childrenEdu')">
              <n-input-number v-model:value="childrenEdu" :min="0" :step="2000" style="width: 100%">
                <template #suffix>
                  {{ t('tools.income-tax-calculator.yuanPerMonth') }}
                </template>
              </n-input-number>
            </n-form-item>
            <n-form-item :label="t('tools.income-tax-calculator.childCare')" mt-2>
              <n-input-number v-model:value="childCare" :min="0" :step="2000" style="width: 100%">
                <template #suffix>
                  {{ t('tools.income-tax-calculator.yuanPerMonth') }}
                </template>
              </n-input-number>
            </n-form-item>
            <n-form-item :label="t('tools.income-tax-calculator.continuingEdu')" mt-2>
              <n-input-number v-model:value="continuingEdu" :min="0" :max="400" :step="400" style="width: 100%">
                <template #suffix>
                  {{ t('tools.income-tax-calculator.yuanPerMonth') }}
                </template>
              </n-input-number>
            </n-form-item>
            <n-form-item :label="t('tools.income-tax-calculator.housingLoan')" mt-2>
              <n-input-number v-model:value="housingLoanInterest" :min="0" :max="1000" :step="1000" style="width: 100%">
                <template #suffix>
                  {{ t('tools.income-tax-calculator.yuanPerMonth') }}
                </template>
              </n-input-number>
            </n-form-item>
            <n-form-item :label="t('tools.income-tax-calculator.housingRent')" mt-2>
              <n-input-number v-model:value="housingRent" :min="0" :max="1500" :step="500" style="width: 100%">
                <template #suffix>
                  {{ t('tools.income-tax-calculator.yuanPerMonth') }}
                </template>
              </n-input-number>
            </n-form-item>
            <n-form-item :label="t('tools.income-tax-calculator.elderlySupport')" mt-2>
              <n-input-number v-model:value="elderlySupport" :min="0" :max="3000" :step="1000" style="width: 100%">
                <template #suffix>
                  {{ t('tools.income-tax-calculator.yuanPerMonth') }}
                </template>
              </n-input-number>
            </n-form-item>
          </n-form>
        </c-card>
      </div>

      <!-- 结果区 -->
      <div flex flex-col gap-4>
        <!-- 核心结果卡 -->
        <c-card>
          <template #title>
            {{ t('tools.income-tax-calculator.result') }}
          </template>

          <div class="result-highlight">
            <div class="res-row">
              <span class="res-label">{{ t('tools.income-tax-calculator.taxableIncome') }}</span>
              <span class="res-val">¥ {{ fmt(taxableIncome) }}</span>
            </div>
            <div class="res-row">
              <span class="res-label">{{ t('tools.income-tax-calculator.taxBracket') }}</span>
              <span class="res-badge" :style="{ background: `${bracketColor(taxResult.rate)}20`, color: bracketColor(taxResult.rate) }">
                {{ (taxResult.rate * 100).toFixed(0) }}%
              </span>
            </div>
            <div class="res-row">
              <span class="res-label">{{ t('tools.income-tax-calculator.incomeTax') }}</span>
              <span class="res-val danger">¥ {{ fmt(taxResult.tax) }}</span>
            </div>
            <div class="res-row">
              <span class="res-label">{{ t('tools.income-tax-calculator.socialInsuranceTotal') }}</span>
              <span class="res-val danger">¥ {{ fmt(socialInsurance.total) }}</span>
            </div>
            <n-divider style="margin: 10px 0" />
            <div class="res-row big">
              <span class="res-label bold">{{ t('tools.income-tax-calculator.netSalary') }}</span>
              <span class="res-val primary bold">¥ {{ fmt(netSalary) }}</span>
            </div>
            <div class="res-row">
              <span class="res-label">{{ t('tools.income-tax-calculator.effectiveRate') }}</span>
              <span class="res-val">{{ effectiveTaxRate.toFixed(1) }}%</span>
            </div>
          </div>
        </c-card>

        <!-- 社保明细 -->
        <c-card>
          <template #title>
            {{ t('tools.income-tax-calculator.socialInsuranceDetail') }}
          </template>
          <div class="detail-table">
            <div class="dt-row">
              <span>{{ t('tools.income-tax-calculator.pension') }}</span>
              <span>{{ (cityCfg.pension * 100).toFixed(1) }}%</span>
              <span>¥ {{ fmt(socialInsurance.pension) }}</span>
            </div>
            <div class="dt-row">
              <span>{{ t('tools.income-tax-calculator.medical') }}</span>
              <span>{{ (cityCfg.medical * 100).toFixed(1) }}%+{{ cityCfg.medicalExtra }}</span>
              <span>¥ {{ fmt(socialInsurance.medical) }}</span>
            </div>
            <div class="dt-row">
              <span>{{ t('tools.income-tax-calculator.unemployment') }}</span>
              <span>{{ (cityCfg.unemployment * 100).toFixed(1) }}%</span>
              <span>¥ {{ fmt(socialInsurance.unemployment) }}</span>
            </div>
            <div class="dt-row">
              <span>{{ t('tools.income-tax-calculator.housingFund') }}</span>
              <span>{{ (cityCfg.housingFund * 100).toFixed(0) }}%</span>
              <span>¥ {{ fmt(socialInsurance.housingFund) }}</span>
            </div>
            <div class="dt-row total">
              <span>{{ t('tools.income-tax-calculator.total') }}</span>
              <span />
              <span>¥ {{ fmt(socialInsurance.total) }}</span>
            </div>
          </div>
        </c-card>

        <!-- 工资构成饼图 -->
        <c-card>
          <template #title>
            工资构成
          </template>
          <PieChart :segments="salaryChartSegments" :size="160" />
        </c-card>

        <!-- 税率表 -->
        <c-card>
          <template #title>
            {{ t('tools.income-tax-calculator.taxBrackets') }}
          </template>
          <div class="bracket-table">
            <div
              v-for="b in TAX_BRACKETS"
              :key="b.rate"
              class="bracket-row"
              :class="{ active: taxResult.bracket === b }"
              :style="taxResult.bracket === b ? { background: `${bracketColor(b.rate)}12`, borderColor: bracketColor(b.rate) } : {}"
            >
              <span class="bracket-range">
                {{ b.max === Infinity ? `> ¥${(b.min).toLocaleString()}` : `¥${b.min.toLocaleString()} – ¥${b.max.toLocaleString()}` }}
              </span>
              <span class="bracket-rate" :style="{ color: bracketColor(b.rate) }">{{ (b.rate * 100).toFixed(0) }}%</span>
            </div>
          </div>
        </c-card>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.result-highlight {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.res-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;

  &.big {
    font-size: 16px;
  }
}

.res-label {
  opacity: 0.7;

  &.bold {
    opacity: 1;
    font-weight: 600;
  }
}

.res-val {
  font-weight: 600;

  &.primary {
    color: #6366f1;
    font-size: 20px;
  }

  &.danger {
    color: #f87171;
  }

  &.bold {
    font-size: 20px;
  }
}

.res-badge {
  padding: 2px 10px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 15px;
}

.detail-table {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dt-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 12px;
  font-size: 13px;
  padding: 5px 6px;
  border-radius: 6px;

  &.total {
    font-weight: 600;
    border-top: 1px solid var(--n-border-color);
    margin-top: 4px;
    padding-top: 8px;
  }

  span:last-child {
    text-align: right;
  }
}

.bracket-table {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bracket-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid transparent;
  font-size: 12px;
  transition: all 0.15s;

  &.active {
    font-weight: 600;
  }
}

.bracket-rate {
  font-weight: 700;
  font-size: 13px;
}

.bracket-range {
  opacity: 0.8;
}
</style>
