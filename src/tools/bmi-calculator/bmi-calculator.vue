<script setup lang="ts">
const { t } = useI18n();

const unit = ref<'metric' | 'imperial'>('metric');
const height = ref<number>(170); // cm or inches
const weight = ref<number>(65); // kg or lbs

// 将身高体重统一转为公制
const heightCm = computed(() => unit.value === 'metric' ? height.value : height.value * 2.54);
const weightKg = computed(() => unit.value === 'metric' ? weight.value : weight.value * 0.453592);

const bmi = computed(() => {
  if (!heightCm.value || !weightKg.value) return null;
  const heightM = heightCm.value / 100;
  return weightKg.value / (heightM * heightM);
});

interface BmiCategory {
  key: string
  min: number
  max: number
  color: string
  textColor: string
}

const categories: BmiCategory[] = [
  { key: 'underweight', min: 0, max: 18.5, color: '#60a5fa', textColor: '#1d4ed8' },
  { key: 'normal', min: 18.5, max: 24, color: '#34d399', textColor: '#065f46' },
  { key: 'overweight', min: 24, max: 28, color: '#fbbf24', textColor: '#92400e' },
  { key: 'obese1', min: 28, max: 32, color: '#f97316', textColor: '#7c2d12' },
  { key: 'obese2', min: 32, max: 999, color: '#f87171', textColor: '#7f1d1d' },
];

const currentCategory = computed(() => {
  if (bmi.value === null) return null;
  return categories.find(c => bmi.value! >= c.min && bmi.value! < c.max) ?? null;
});

// 理想体重范围（BMI 18.5 ~ 24）
const idealWeightMin = computed(() => {
  const h = heightCm.value / 100;
  const kg = 18.5 * h * h;
  return unit.value === 'metric' ? kg : kg / 0.453592;
});
const idealWeightMax = computed(() => {
  const h = heightCm.value / 100;
  const kg = 24 * h * h;
  return unit.value === 'metric' ? kg : kg / 0.453592;
});

// BMI 指针位置（0%~100% 对应 BMI 10~40）
const pointerPercent = computed(() => {
  if (bmi.value === null) return 0;
  const clamped = Math.min(Math.max(bmi.value, 10), 40);
  return ((clamped - 10) / 30) * 100;
});

const unitOptions = computed(() => [
  { label: t('tools.bmi-calculator.metric'), value: 'metric' },
  { label: t('tools.bmi-calculator.imperial'), value: 'imperial' },
]);

function formatWeight(val: number) {
  return val.toFixed(1);
}
</script>

<template>
  <div style="max-width: 600px; margin: 0 auto">
    <!-- 单位切换 -->
    <div flex justify-center mb-4>
      <n-radio-group v-model:value="unit" size="medium">
        <n-radio-button
          v-for="opt in unitOptions"
          :key="opt.value"
          :value="opt.value"
          :label="opt.label"
        />
      </n-radio-group>
    </div>

    <c-card mb-4>
      <n-form label-placement="left" label-width="100">
        <n-form-item :label="t('tools.bmi-calculator.height')">
          <n-input-number
            v-model:value="height"
            :min="50"
            :max="unit === 'metric' ? 300 : 120"
            :step="1"
            style="width: 100%"
          >
            <template #suffix>
              {{ unit === 'metric' ? 'cm' : 'in' }}
            </template>
          </n-input-number>
        </n-form-item>
        <n-form-item :label="t('tools.bmi-calculator.weight')">
          <n-input-number
            v-model:value="weight"
            :min="10"
            :max="unit === 'metric' ? 500 : 1100"
            :step="0.5"
            style="width: 100%"
          >
            <template #suffix>
              {{ unit === 'metric' ? 'kg' : 'lbs' }}
            </template>
          </n-input-number>
        </n-form-item>
      </n-form>
    </c-card>

    <!-- BMI 结果 -->
    <c-card v-if="bmi !== null" mb-4>
      <div text-center mb-4>
        <div style="font-size: 14px; opacity: 0.6; margin-bottom: 4px">
          {{ t('tools.bmi-calculator.yourBmi') }}
        </div>
        <div
          style="font-size: 48px; font-weight: 800; line-height: 1"
          :style="{ color: currentCategory?.color }"
        >
          {{ bmi.toFixed(1) }}
        </div>
        <div
          v-if="currentCategory"
          style="font-size: 18px; font-weight: 600; margin-top: 8px"
          :style="{ color: currentCategory.color }"
        >
          {{ t(`tools.bmi-calculator.${currentCategory.key}`) }}
        </div>
      </div>

      <!-- 色条进度条 -->
      <div class="bmi-bar" mb-2>
        <div class="bmi-bar-segments">
          <div v-for="cat in categories" :key="cat.key" class="bmi-segment" :style="{ background: cat.color, flex: cat.key === 'obese2' ? 1.5 : 1 }" />
        </div>
        <div
          class="bmi-pointer"
          :style="{ left: `${pointerPercent}%` }"
        >
          <div class="bmi-pointer-line" />
          <div class="bmi-pointer-dot" :style="{ background: currentCategory?.color ?? '#888' }" />
        </div>
        <div class="bmi-labels">
          <span>10</span>
          <span>18.5</span>
          <span>24</span>
          <span>28</span>
          <span>32</span>
          <span>40+</span>
        </div>
      </div>

      <!-- 分类说明 -->
      <div class="bmi-categories">
        <div
          v-for="cat in categories"
          :key="cat.key"
          class="bmi-cat-item"
          :class="{ active: currentCategory?.key === cat.key }"
          :style="currentCategory?.key === cat.key ? { borderColor: cat.color, background: `${cat.color}15` } : {}"
        >
          <div class="bmi-cat-dot" :style="{ background: cat.color }" />
          <span class="bmi-cat-name">{{ t(`tools.bmi-calculator.${cat.key}`) }}</span>
          <span class="bmi-cat-range">
            {{ cat.max === 999 ? `≥ ${cat.min}` : `${cat.min} – ${cat.max}` }}
          </span>
        </div>
      </div>
    </c-card>

    <!-- 理想体重 -->
    <c-card v-if="heightCm > 0">
      <template #title>
        {{ t('tools.bmi-calculator.idealWeight') }}
      </template>
      <div style="font-size: 15px; line-height: 2">
        {{ t('tools.bmi-calculator.idealWeightDesc') }}:
        <strong>{{ formatWeight(idealWeightMin) }} – {{ formatWeight(idealWeightMax) }} {{ unit === 'metric' ? 'kg' : 'lbs' }}</strong>
      </div>
      <div style="font-size: 12px; opacity: 0.55; margin-top: 6px">
        {{ t('tools.bmi-calculator.chineseStandard') }}
      </div>
    </c-card>
  </div>
</template>

<style scoped lang="less">
.bmi-bar {
  position: relative;
  margin: 12px 0 24px;
}

.bmi-bar-segments {
  display: flex;
  height: 14px;
  border-radius: 7px;
  overflow: hidden;
}

.bmi-segment {
  min-width: 0;
}

.bmi-pointer {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.bmi-pointer-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid white;
  margin-top: -1px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.25);
}

.bmi-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  opacity: 0.55;
  margin-top: 4px;
  padding: 0 2px;
}

.bmi-categories {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 12px;
}

.bmi-cat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid transparent;
  font-size: 13px;
  transition: all 0.2s;

  &.active {
    font-weight: 600;
  }
}

.bmi-cat-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.bmi-cat-name {
  flex: 1;
}

.bmi-cat-range {
  opacity: 0.6;
  font-size: 11px;
  white-space: nowrap;
}
</style>
