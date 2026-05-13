<script setup lang="ts">
const { t } = useI18n();

// 基准配置
const baseFontSize = ref(16); // px - root font size for rem
const viewportWidth = ref(1440); // px - for vw
const viewportHeight = ref(900); // px - for vh
const parentFontSize = ref(16); // px - for em

// 输入值
const inputValue = ref<number>(16);
const inputUnit = ref<'px' | 'rem' | 'em' | 'vw' | 'vh' | 'pt' | 'percent'>('px');

// 单位选项
const unitOptions = [
  { label: 'px', value: 'px' },
  { label: 'rem', value: 'rem' },
  { label: 'em', value: 'em' },
  { label: 'vw', value: 'vw' },
  { label: 'vh', value: 'vh' },
  { label: 'pt', value: 'pt' },
  { label: '%', value: 'percent' },
];

// 转换为 px（基础单位）
function toPx(value: number, unit: string): number {
  switch (unit) {
    case 'px': return value;
    case 'rem': return value * baseFontSize.value;
    case 'em': return value * parentFontSize.value;
    case 'vw': return (value / 100) * viewportWidth.value;
    case 'vh': return (value / 100) * viewportHeight.value;
    case 'pt': return value * (96 / 72);
    case 'percent': return (value / 100) * parentFontSize.value;
    default: return value;
  }
}

// 从 px 转换到目标单位
function fromPx(px: number, unit: string): number {
  switch (unit) {
    case 'px': return px;
    case 'rem': return px / baseFontSize.value;
    case 'em': return px / parentFontSize.value;
    case 'vw': return (px / viewportWidth.value) * 100;
    case 'vh': return (px / viewportHeight.value) * 100;
    case 'pt': return px * (72 / 96);
    case 'percent': return (px / parentFontSize.value) * 100;
    default: return px;
  }
}

function fmt(n: number): string {
  if (Number.isNaN(n) || !Number.isFinite(n)) return '—';
  // 最多6位有效数字
  const s = parseFloat(n.toPrecision(6));
  return String(s);
}

const pxValue = computed(() => toPx(inputValue.value ?? 0, inputUnit.value));

const results = computed(() => {
  const px = pxValue.value;
  return [
    { unit: 'px', value: fmt(fromPx(px, 'px')), desc: 'Pixel' },
    { unit: 'rem', value: fmt(fromPx(px, 'rem')), desc: `Root font size: ${baseFontSize.value}px` },
    { unit: 'em', value: fmt(fromPx(px, 'em')), desc: `Parent font size: ${parentFontSize.value}px` },
    { unit: 'vw', value: fmt(fromPx(px, 'vw')), desc: `Viewport width: ${viewportWidth.value}px` },
    { unit: 'vh', value: fmt(fromPx(px, 'vh')), desc: `Viewport height: ${viewportHeight.value}px` },
    { unit: 'pt', value: fmt(fromPx(px, 'pt')), desc: 'Point (1pt = 1.333px)' },
    { unit: '%', value: fmt(fromPx(px, 'percent')), desc: `Relative to parent: ${parentFontSize.value}px` },
  ].filter(r => !(r.unit === (inputUnit.value === 'percent' ? '%' : inputUnit.value)));
});

// 点击结果直接设置为该单位
function setInput(unit: string, value: string) {
  const unitKey = unit === '%' ? 'percent' : unit as any;
  inputUnit.value = unitKey;
  inputValue.value = parseFloat(value);
}
</script>

<template>
  <div style="max-width: 720px; margin: 0 auto">
    <!-- 输入区 -->
    <c-card mb-4>
      <template #title>
        {{ t('tools.css-unit-converter.input') }}
      </template>
      <div flex gap-3 items-end flex-wrap>
        <n-form-item :label="t('tools.css-unit-converter.value')" style="flex:1; min-width:120px">
          <n-input-number v-model:value="inputValue" :min="-9999" :max="9999" :precision="6" style="width:100%" />
        </n-form-item>
        <n-form-item :label="t('tools.css-unit-converter.unit')" style="min-width:100px">
          <n-select v-model:value="inputUnit" :options="unitOptions" style="width:100px" />
        </n-form-item>
      </div>
    </c-card>

    <!-- 基准设置 -->
    <c-card mb-4>
      <template #title>
        {{ t('tools.css-unit-converter.baseSettings') }}
      </template>
      <div flex gap-3 flex-wrap>
        <n-form-item :label="t('tools.css-unit-converter.rootFontSize')" style="flex:1; min-width:160px">
          <n-input-number v-model:value="baseFontSize" :min="1" :max="100" style="width:100%">
            <template #suffix>px</template>
          </n-input-number>
        </n-form-item>
        <n-form-item :label="t('tools.css-unit-converter.parentFontSize')" style="flex:1; min-width:160px">
          <n-input-number v-model:value="parentFontSize" :min="1" :max="100" style="width:100%">
            <template #suffix>px</template>
          </n-input-number>
        </n-form-item>
        <n-form-item :label="t('tools.css-unit-converter.viewportWidth')" style="flex:1; min-width:160px">
          <n-input-number v-model:value="viewportWidth" :min="1" style="width:100%">
            <template #suffix>px</template>
          </n-input-number>
        </n-form-item>
        <n-form-item :label="t('tools.css-unit-converter.viewportHeight')" style="flex:1; min-width:160px">
          <n-input-number v-model:value="viewportHeight" :min="1" style="width:100%">
            <template #suffix>px</template>
          </n-input-number>
        </n-form-item>
      </div>
    </c-card>

    <!-- 转换结果 -->
    <c-card>
      <template #title>
        {{ t('tools.css-unit-converter.results') }}
      </template>
      <div class="results-grid">
        <div
          v-for="r in results"
          :key="r.unit"
          class="result-item"
          @click="setInput(r.unit, r.value)"
        >
          <div class="result-unit">{{ r.unit }}</div>
          <div class="result-value">{{ r.value }}</div>
          <div class="result-desc">{{ r.desc }}</div>
        </div>
      </div>
      <div mt-3 style="font-size:12px; opacity:0.5">
        {{ t('tools.css-unit-converter.clickHint') }}
      </div>
    </c-card>
  </div>
</template>

<style scoped lang="less">
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.result-item {
  padding: 14px;
  border-radius: 8px;
  border: 1px solid var(--n-border-color);
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: #6366f1;
    background: rgba(99, 102, 241, 0.06);
  }
}

.result-unit {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.5;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.result-value {
  font-size: 20px;
  font-weight: 700;
  font-family: monospace;
  margin-bottom: 4px;
}

.result-desc {
  font-size: 11px;
  opacity: 0.45;
  line-height: 1.4;
}
</style>
