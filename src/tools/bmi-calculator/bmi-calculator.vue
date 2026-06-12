<script setup lang="ts">
const { t } = useI18n();

const unit = ref<'metric' | 'imperial'>('metric');
const height = ref<number>(170); // cm or inches
const weight = ref<number>(65); // kg or lbs

// 将身高体重统一转为公制
const heightCm = computed(() => unit.value === 'metric' ? height.value : height.value * 2.54);
const weightKg = computed(() => unit.value === 'metric' ? weight.value : weight.value * 0.453592);

// 身高/体重的合理边界（公制和英制各自的 min/max）
const heightMin = computed(() => unit.value === 'metric' ? 50 : 20);
const heightMax = computed(() => unit.value === 'metric' ? 300 : 118);
const weightMin = computed(() => unit.value === 'metric' ? 10 : 22);
const weightMax = computed(() => unit.value === 'metric' ? 500 : 1100);

const bmi = computed(() => {
  if (!heightCm.value || !weightKg.value || heightCm.value <= 0) {
    return null;
  }
  const heightM = heightCm.value / 100;
  return weightKg.value / (heightM * heightM);
});

interface BmiCategory {
  key: string
  min: number
  max: number
  color: string
  darkColor: string // 深色模式下降低饱和度的颜色
  textColor: string
}

const categories: BmiCategory[] = [
  { key: 'underweight', min: 0, max: 18.5, color: '#60a5fa', darkColor: '#4a8fd1', textColor: '#1d4ed8' },
  { key: 'normal', min: 18.5, max: 24, color: '#34d399', darkColor: '#2aaa78', textColor: '#065f46' },
  { key: 'overweight', min: 24, max: 28, color: '#fbbf24', darkColor: '#c9991a', textColor: '#92400e' },
  { key: 'obese1', min: 28, max: 32, color: '#f97316', darkColor: '#cc5c0e', textColor: '#7c2d12' },
  { key: 'obese2', min: 32, max: 999, color: '#f87171', darkColor: '#cc4c4c', textColor: '#7f1d1d' },
];

const currentCategory = computed(() => {
  if (bmi.value === null) {
    return null;
  }
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

// BMI 指针位置（0%~100% 对应 BMI 10~40），夹住防溢出
const pointerPercent = computed(() => {
  if (bmi.value === null) {
    return 0;
  }
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

// 步进器
function stepHeight(delta: number) {
  height.value = Math.min(Math.max((height.value ?? 0) + delta, heightMin.value), heightMax.value);
}
function stepWeight(delta: number) {
  weight.value = Math.min(Math.max((weight.value ?? 0) + delta, weightMin.value), weightMax.value);
}

// 输入框失焦时夹住边界，防止非法值
function clampHeight() {
  if (!height.value || !Number.isFinite(height.value)) {
    height.value = unit.value === 'metric' ? 170 : 67;
    return;
  }
  height.value = Math.min(Math.max(height.value, heightMin.value), heightMax.value);
}
function clampWeight() {
  if (!weight.value || !Number.isFinite(weight.value)) {
    weight.value = unit.value === 'metric' ? 65 : 143;
    return;
  }
  weight.value = Math.min(Math.max(weight.value, weightMin.value), weightMax.value);
}
</script>

<template>
  <div class="bmi-wrapper">
    <!-- 单位切换 -->
    <div class="unit-switch-row">
      <n-radio-group v-model:value="unit" size="medium">
        <n-radio-button
          v-for="opt in unitOptions"
          :key="opt.value"
          :value="opt.value"
          :label="opt.label"
        />
      </n-radio-group>
    </div>

    <!-- 输入卡片 -->
    <c-card class="input-card">
      <!-- 身高 -->
      <div class="field-row">
        <label class="field-label" for="bmi-height">{{ t('tools.bmi-calculator.height') }}</label>
        <div class="field-control">
          <input
            id="bmi-height"
            v-model.number="height"
            class="num-input"
            type="number"
            :min="heightMin"
            :max="heightMax"
            :placeholder="unit === 'metric' ? '170' : '67'"
            @blur="clampHeight"
          >
          <span class="field-unit">{{ unit === 'metric' ? 'cm' : 'in' }}</span>
          <button class="stepper-btn" tabindex="0" :aria-label="t('tools.bmi-calculator.decreaseHeight')" @click="stepHeight(-1)" @keydown.enter.prevent="stepHeight(-1)">
            −
          </button>
          <button class="stepper-btn" tabindex="0" :aria-label="t('tools.bmi-calculator.increaseHeight')" @click="stepHeight(1)" @keydown.enter.prevent="stepHeight(1)">
            +
          </button>
        </div>
      </div>

      <div class="field-divider" />

      <!-- 体重 -->
      <div class="field-row">
        <label class="field-label" for="bmi-weight">{{ t('tools.bmi-calculator.weight') }}</label>
        <div class="field-control">
          <input
            id="bmi-weight"
            v-model.number="weight"
            class="num-input"
            type="number"
            :min="weightMin"
            :max="weightMax"
            :step="0.5"
            :placeholder="unit === 'metric' ? '65' : '143'"
            @blur="clampWeight"
          >
          <span class="field-unit">{{ unit === 'metric' ? 'kg' : 'lbs' }}</span>
          <button class="stepper-btn" tabindex="0" :aria-label="t('tools.bmi-calculator.decreaseWeight')" @click="stepWeight(-0.5)" @keydown.enter.prevent="stepWeight(-0.5)">
            −
          </button>
          <button class="stepper-btn" tabindex="0" :aria-label="t('tools.bmi-calculator.increaseWeight')" @click="stepWeight(0.5)" @keydown.enter.prevent="stepWeight(0.5)">
            +
          </button>
        </div>
      </div>
    </c-card>

    <!-- BMI 结果卡片 -->
    <c-card v-if="bmi !== null" class="result-card">
      <!-- 数值 Hero -->
      <div class="result-hero">
        <div class="result-label">
          {{ t('tools.bmi-calculator.yourBmi') }}
        </div>
        <div class="result-value" :style="{ color: currentCategory?.color }">
          {{ bmi.toFixed(1) }}
        </div>
        <div v-if="currentCategory" class="result-status" :style="{ color: currentCategory.color }">
          {{ t(`tools.bmi-calculator.${currentCategory.key}`) }}
        </div>
      </div>

      <!-- 色条进度条 -->
      <div class="bmi-bar">
        <div class="bmi-bar-segments">
          <div
            v-for="cat in categories"
            :key="cat.key"
            class="bmi-segment"
            :style="{ background: cat.color, flex: cat.key === 'obese2' ? 1.5 : 1 }"
          />
        </div>
        <!-- 指针：严格夹住在 0%~100% 内，不溢出 -->
        <div
          class="bmi-pointer"
          :style="{ left: `${Math.min(Math.max(pointerPercent, 1), 99)}%` }"
        >
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

      <!-- 分类图例：紧凑 Grid 对齐 -->
      <div class="bmi-categories">
        <div
          v-for="cat in categories"
          :key="cat.key"
          class="bmi-cat-item"
          :class="{ active: currentCategory?.key === cat.key }"
          :style="currentCategory?.key === cat.key ? { borderColor: cat.color, background: `${cat.color}18` } : {}"
        >
          <div class="bmi-cat-dot" :style="{ background: cat.color }" />
          <span class="bmi-cat-name">{{ t(`tools.bmi-calculator.${cat.key}`) }}</span>
          <span class="bmi-cat-range">
            {{ cat.max === 999 ? `≥ ${cat.min}` : `${cat.min} – ${cat.max}` }}
          </span>
        </div>
      </div>
    </c-card>

    <!-- 理想体重卡片 -->
    <c-card v-if="heightCm > 0" class="ideal-card">
      <div class="ideal-title">
        {{ t('tools.bmi-calculator.idealWeight') }}
      </div>
      <div class="ideal-body">
        {{ t('tools.bmi-calculator.idealWeightDesc') }}:
        <strong class="ideal-range">{{ formatWeight(idealWeightMin) }} – {{ formatWeight(idealWeightMax) }} {{ unit === 'metric' ? 'kg' : 'lbs' }}</strong>
      </div>
      <div class="ideal-note">
        {{ t('tools.bmi-calculator.chineseStandard') }}
      </div>
    </c-card>
  </div>
</template>

<style scoped lang="less">
/* ── 总容器 ── */
.bmi-wrapper {
  max-width: 560px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── 单位切换 ── */
.unit-switch-row {
  display: flex;
  justify-content: center;
}

/* ── 输入卡片 ── */
.input-card {
  padding: 0;
}

.field-row {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  gap: 12px;
}

.field-label {
  width: 56px;
  font-size: 14px;
  font-weight: 500;
  color: var(--n-text-color, #333);
  flex-shrink: 0;
  cursor: default;
}

.field-control {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 数字输入框 */
.num-input {
  flex: 1;
  border: 1.5px solid var(--n-border-color, #e0e0e0);
  border-radius: 7px;
  padding: 6px 10px;
  font-size: 16px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  background: var(--n-input-color, #fafafa);
  color: var(--n-text-color, #222);
  outline: none;
  min-width: 0;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  /* 隐藏 number 步进箭头 */
  appearance: textfield;
  -moz-appearance: textfield;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &:hover {
    border-color: var(--n-border-color-hover, #aaa);
    background: var(--n-input-color-focus, #fff);
  }

  &:focus {
    border-color: var(--primary-color, #18a058);
    box-shadow: 0 0 0 3px rgba(24, 160, 88, 0.14);
    background: var(--n-input-color-focus, #fff);
  }
}

.field-unit {
  font-size: 13px;
  color: #888;
  min-width: 22px;
  text-align: left;
  flex-shrink: 0;
}

/* 步进器按钮 */
.stepper-btn {
  width: 30px;
  height: 30px;
  border: 1.5px solid var(--n-border-color, #e0e0e0);
  border-radius: 6px;
  background: var(--n-card-color, #fff);
  color: var(--n-text-color-2, #555);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: border-color 0.15s, background 0.15s, color 0.15s;

  &:hover {
    border-color: var(--primary-color, #18a058);
    color: var(--primary-color, #18a058);
    background: rgba(24, 160, 88, 0.06);
  }

  &:focus-visible {
    outline: 2px solid var(--primary-color, #18a058);
    outline-offset: 2px;
  }

  &:active {
    transform: scale(0.93);
  }
}

.field-divider {
  height: 1px;
  background: var(--n-divider-color, #f0f0f0);
  margin: 0 20px;
}

/* ── 结果卡片 ── */
.result-hero {
  text-align: center;
  padding-bottom: 8px;
}

.result-label {
  font-size: 13px;
  color: #777; /* 明确颜色，对比度优于 opacity */
  margin-bottom: 4px;
  letter-spacing: 0.02em;
}

.result-value {
  font-size: 52px;
  font-weight: 800;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.result-status {
  font-size: 18px;
  font-weight: 600;
  margin-top: 8px;
}

/* ── 色条 ── */
.bmi-bar {
  position: relative;
  margin: 16px 0 28px;
}

.bmi-bar-segments {
  display: flex;
  height: 12px;
  border-radius: 6px;
  overflow: hidden;
}

.bmi-segment {
  min-width: 0;
  // 深色模式下降低饱和度，防止刺眼
  @media (prefers-color-scheme: dark) {
    filter: saturate(0.7) brightness(0.85);
  }
}

/* 指针 */
.bmi-pointer {
  position: absolute;
  top: -2px;
  transform: translateX(-50%);
  pointer-events: none;
}

.bmi-pointer-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2.5px solid #fff;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.28);
  transition: left 0.3s ease;
}

.bmi-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #888; /* 明确颜色 */
  margin-top: 6px;
  padding: 0 2px;
}

/* ── 分类图例 ── */
.bmi-categories {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
  margin-top: 10px;
}

.bmi-cat-item {
  display: grid;
  grid-template-columns: 12px 1fr auto;
  align-items: center;
  gap: 7px;
  padding: 7px 10px;
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
  /* 文字不截断 */
}

.bmi-cat-range {
  color: #888; /* 明确颜色，替代 opacity */
  font-size: 11px;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

/* ── 理想体重卡片 ── */
.ideal-card {
  padding: 16px 20px;
}

.ideal-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--n-text-color, #333);
  margin-bottom: 6px;
}

.ideal-body {
  font-size: 14px;
  color: var(--n-text-color-2, #555);
  line-height: 1.8;
}

.ideal-range {
  color: var(--n-text-color, #222);
}

.ideal-note {
  font-size: 12px;
  color: #777; /* 明确颜色，替代 opacity: 0.55 */
  margin-top: 6px;
}

/* ── 响应式 ── */
@media (max-width: 480px) {
  .bmi-categories {
    grid-template-columns: 1fr;
  }

  .field-row {
    padding: 12px 14px;
  }
}

/* ── 深色模式适配 ── */
:root[data-theme='dark'],
.dark {
  .bmi-segment {
    filter: saturate(0.65) brightness(0.8);
  }

  .result-label,
  .bmi-labels,
  .bmi-cat-range,
  .ideal-note {
    color: #aaa;
  }
}
</style>
