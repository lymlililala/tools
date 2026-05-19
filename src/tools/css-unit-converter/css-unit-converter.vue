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

// 格式化数值：去除多余小数零，最多 6 位有效数字
function fmt(n: number): string {
  if (Number.isNaN(n) || !Number.isFinite(n)) return '—';
  const s = parseFloat(n.toPrecision(6));
  // 用 parseFloat 消掉拖尾零，再 toString
  return s.toString();
}

// 主输入框显示值：去除小数拖尾零，blur 后格式化
const displayValue = computed({
  get() {
    if (inputValue.value === null || inputValue.value === undefined) return null;
    return inputValue.value;
  },
  set(v: number | null) {
    inputValue.value = v ?? 0;
  },
});

const pxValue = computed(() => toPx(inputValue.value ?? 0, inputUnit.value));

const results = computed(() => {
  const px = pxValue.value;
  return [
    { unit: 'rem', value: fmt(fromPx(px, 'rem')), rawValue: fromPx(px, 'rem'), desc: `Root font size: ${baseFontSize.value}px` },
    { unit: 'em', value: fmt(fromPx(px, 'em')), rawValue: fromPx(px, 'em'), desc: `Parent font size: ${parentFontSize.value}px` },
    { unit: 'vw', value: fmt(fromPx(px, 'vw')), rawValue: fromPx(px, 'vw'), desc: `Viewport width: ${viewportWidth.value}px` },
    { unit: 'vh', value: fmt(fromPx(px, 'vh')), rawValue: fromPx(px, 'vh'), desc: `Viewport height: ${viewportHeight.value}px` },
    { unit: 'pt', value: fmt(fromPx(px, 'pt')), rawValue: fromPx(px, 'pt'), desc: 'Point (1pt = 1.333px)' },
    { unit: '%', value: fmt(fromPx(px, 'percent')), rawValue: fromPx(px, 'percent'), desc: `Relative to parent: ${parentFontSize.value}px` },
    { unit: 'px', value: fmt(fromPx(px, 'px')), rawValue: fromPx(px, 'px'), desc: 'Pixel' },
  ].filter(r => !(r.unit === (inputUnit.value === 'percent' ? '%' : inputUnit.value)));
});

// 点击结果直接设置为该单位
function setInput(unit: string, rawValue: number) {
  const unitKey = unit === '%' ? 'percent' : unit as any;
  inputUnit.value = unitKey;
  inputValue.value = rawValue;
}

// 复制某结果到剪贴板
const copiedUnit = ref<string | null>(null);
async function copyResult(unit: string, value: string) {
  if (value === '—') return;
  const text = `${value}${unit}`;
  await navigator.clipboard.writeText(text);
  copiedUnit.value = unit;
  setTimeout(() => (copiedUnit.value = null), 1600);
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
          <n-input-number
            v-model:value="displayValue"
            :min="-9999999"
            :max="9999999"
            :precision="undefined"
            :show-button="true"
            style="width:100%"
          />
        </n-form-item>
        <n-form-item :label="t('tools.css-unit-converter.unit')" style="min-width:100px">
          <n-select v-model:value="inputUnit" :options="unitOptions" style="width:100px" />
        </n-form-item>
      </div>
    </c-card>

    <!-- 基准设置：2×2 网格 -->
    <c-card mb-4>
      <template #title>
        {{ t('tools.css-unit-converter.baseSettings') }}
      </template>
      <div class="base-grid">
        <n-form-item :label="t('tools.css-unit-converter.rootFontSize')">
          <n-input-number v-model:value="baseFontSize" :min="1" :max="100" style="width:100%">
            <template #suffix>
              px
            </template>
          </n-input-number>
        </n-form-item>
        <n-form-item :label="t('tools.css-unit-converter.parentFontSize')">
          <n-input-number v-model:value="parentFontSize" :min="1" :max="100" style="width:100%">
            <template #suffix>
              px
            </template>
          </n-input-number>
        </n-form-item>
        <n-form-item :label="t('tools.css-unit-converter.viewportWidth')">
          <n-input-number v-model:value="viewportWidth" :min="1" style="width:100%">
            <template #suffix>
              px
            </template>
          </n-input-number>
        </n-form-item>
        <n-form-item :label="t('tools.css-unit-converter.viewportHeight')">
          <n-input-number v-model:value="viewportHeight" :min="1" style="width:100%">
            <template #suffix>
              px
            </template>
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
          :class="{ 'is-copied': copiedUnit === r.unit }"
          @click="setInput(r.unit, r.rawValue)"
        >
          <div class="result-unit">{{ r.unit }}</div>
          <div class="result-value">{{ r.value }}</div>
          <div class="result-desc">{{ r.desc }}</div>

          <!-- 悬停时显示复制按钮 -->
          <button
            class="copy-btn"
            :title="`Copy ${r.value}${r.unit}`"
            @click.stop="copyResult(r.unit, r.value)"
          >
            <icon-mdi-check v-if="copiedUnit === r.unit" class="copy-icon success" />
            <icon-mdi-content-copy v-else class="copy-icon" />
          </button>
        </div>
      </div>
      <div mt-3 style="font-size:12px; opacity:0.5">
        {{ t('tools.css-unit-converter.clickHint') }}
      </div>
    </c-card>
  </div>
</template>

<style scoped lang="less">
// ── 基准设置 2×2 网格 ─────────────────────────────────────────────────────
.base-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 16px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

// ── 结果网格 ──────────────────────────────────────────────────────────────
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.result-item {
  position: relative;
  padding: 14px;
  border-radius: 8px;
  border: 1px solid var(--n-border-color);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;

  &:hover {
    border-color: #6366f1;
    background: rgba(99, 102, 241, 0.06);

    .copy-btn {
      opacity: 1;
    }
  }

  &.is-copied {
    border-color: #22c55e;
    background: rgba(34, 197, 94, 0.06);
  }
}

.result-unit {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.55;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.result-value {
  font-size: 20px;
  font-weight: 700;
  font-family: 'SF Mono', 'Fira Code', monospace;
  margin-bottom: 4px;
  font-variant-numeric: tabular-nums;
  word-break: break-all;
}

// 加深对比度（原 opacity:0.45 → 0.62）
.result-desc {
  font-size: 11px;
  opacity: 0.62;
  line-height: 1.4;
}

// ── 悬停复制按钮 ──────────────────────────────────────────────────────────
.copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s, background 0.15s;
  color: inherit;

  &:hover {
    background: rgba(99, 102, 241, 0.12);
    color: #6366f1;
  }
}

.copy-icon {
  font-size: 13px;
  opacity: 0.6;

  &.success {
    color: #22c55e;
    opacity: 1;
  }
}
</style>
