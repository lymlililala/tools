<script setup lang="ts">
import _ from 'lodash';
import {
  convertCelsiusToKelvin,
  convertDelisleToKelvin,
  convertFahrenheitToKelvin,
  convertKelvinToCelsius,
  convertKelvinToDelisle,
  convertKelvinToFahrenheit,
  convertKelvinToNewton,
  convertKelvinToRankine,
  convertKelvinToReaumur,
  convertKelvinToRomer,
  convertNewtonToKelvin,
  convertRankineToKelvin,
  convertReaumurToKelvin,
  convertRomerToKelvin,
} from './temperature-converter.models';

type TemperatureScale = 'kelvin' | 'celsius' | 'fahrenheit' | 'rankine' | 'delisle' | 'newton' | 'reaumur' | 'romer';

// ─── 单位定义 ──────────────────────────────────────────────────────────────────
const units = reactive<
  Record<TemperatureScale, {
    title: string
    unit: string
    ref: number
    toKelvin: (v: number) => number
    fromKelvin: (v: number) => number
  }>
>({
  kelvin: { title: 'Kelvin', unit: 'K', ref: 0, toKelvin: _.identity, fromKelvin: _.identity },
  celsius: { title: 'Celsius', unit: '°C', ref: -273.15, toKelvin: convertCelsiusToKelvin, fromKelvin: convertKelvinToCelsius },
  fahrenheit: { title: 'Fahrenheit', unit: '°F', ref: -459.67, toKelvin: convertFahrenheitToKelvin, fromKelvin: convertKelvinToFahrenheit },
  rankine: { title: 'Rankine', unit: '°R', ref: 0, toKelvin: convertRankineToKelvin, fromKelvin: convertKelvinToRankine },
  delisle: { title: 'Delisle', unit: '°De', ref: 559.73, toKelvin: convertDelisleToKelvin, fromKelvin: convertKelvinToDelisle },
  newton: { title: 'Newton', unit: '°N', ref: -90.14, toKelvin: convertNewtonToKelvin, fromKelvin: convertKelvinToNewton },
  reaumur: { title: 'Réaumur', unit: '°Ré', ref: -218.52, toKelvin: convertReaumurToKelvin, fromKelvin: convertKelvinToReaumur },
  romer: { title: 'Rømer', unit: '°Rø', ref: -135.91, toKelvin: convertRomerToKelvin, fromKelvin: convertKelvinToRomer },
});

// ─── 绝对零度校验 ──────────────────────────────────────────────────────────────
const ABSOLUTE_ZERO_K = 0;

function kelvinFromKey(key: TemperatureScale): number {
  return units[key].toKelvin(units[key].ref);
}

const belowAbsoluteZero = computed<Record<string, boolean>>(() => {
  const result: Record<string, boolean> = {};
  for (const key of Object.keys(units) as TemperatureScale[]) {
    result[key] = kelvinFromKey(key) < ABSOLUTE_ZERO_K - 1e-9;
  }
  return result;
});

const anyBelowZero = computed(() => Object.values(belowAbsoluteZero.value).some(Boolean));

// ─── 格式化结果（防超长溢出） ──────────────────────────────────────────────────
function formatValue(v: number): string {
  if (!Number.isFinite(v)) return '—';
  // 超过 12 位整数部分时用科学计数法
  const abs = Math.abs(v);
  if (abs >= 1e12 || (abs < 1e-6 && abs > 0)) {
    return v.toExponential(4);
  }
  // 最多保留 6 位小数，去尾零
  return parseFloat(v.toFixed(6)).toString();
}

// ─── 更新联动 ──────────────────────────────────────────────────────────────────
function update(key: TemperatureScale) {
  const kelvins = units[key].toKelvin(units[key].ref) ?? 0;
  _.chain(units)
    .omit(key)
    .forEach(({ fromKelvin }, idx) => {
      const raw = fromKelvin(kelvins) ?? 0;
      (units as any)[idx].ref = Math.round(raw * 1e6) / 1e6;
    })
    .value();
}

// ─── 步进器 ────────────────────────────────────────────────────────────────────
function step(key: TemperatureScale, delta: number) {
  units[key].ref = Math.round((units[key].ref + delta) * 1e6) / 1e6;
  update(key);
}

// 初始化
update('kelvin');
</script>

<template>
  <div class="tc-root">
    <!-- ── 绝对零度警告 ── -->
    <transition name="slide-down">
      <div v-if="anyBelowZero" class="abs-zero-warn">
        <icon-mdi-alert-circle-outline class="warn-icon" />
        <span>温度低于绝对零度（0 K / −273.15 °C），物理上不可能存在。</span>
      </div>
    </transition>

    <!-- ── 转换列表 ── -->
    <div class="tc-list">
      <div
        v-for="[key, { title, unit, ref }] in Object.entries(units)"
        :key="key"
        class="tc-row"
        :class="{ 'tc-row--error': belowAbsoluteZero[key] }"
      >
        <!-- 单位名称 -->
        <span class="tc-label">{{ title }}</span>

        <!-- 步进器 + 输入框组合 -->
        <div class="tc-input-group" :class="{ 'tc-input-group--error': belowAbsoluteZero[key] }">
          <button
            class="step-btn step-btn--dec"
            :title="`${title} 减 1`"
            @click="step(key as TemperatureScale, -1)"
          >
            −
          </button>
          <input
            :value="formatValue(ref)"
            class="tc-input"
            type="text"
            inputmode="decimal"
            :aria-label="title"
            @change="(e) => { units[key as TemperatureScale].ref = parseFloat((e.target as HTMLInputElement).value) || 0; update(key as TemperatureScale); }"
          >
          <button
            class="step-btn step-btn--inc"
            :title="`${title} 加 1`"
            @click="step(key as TemperatureScale, 1)"
          >
            +
          </button>
        </div>

        <!-- 单位符号 -->
        <span class="tc-unit" :class="{ 'tc-unit--error': belowAbsoluteZero[key] }">
          {{ unit }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
/* ── 根容器：限制宽度，居中 ─────────────────────────────── */
.tc-root {
  max-width: 560px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ── 绝对零度警告条 ─────────────────────────────────────── */
.abs-zero-warn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(239,68,68,.09);
  border: 1px solid rgba(239,68,68,.3);
  font-size: 13px;
  color: #dc2626;
}

.warn-icon {
  font-size: 17px;
  flex-shrink: 0;
}

/* ── 转换列表容器 ───────────────────────────────────────── */
.tc-list {
  background: var(--n-color, #fff);
  border: 1px solid var(--n-border-color, rgba(0,0,0,.09));
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 14px rgba(0,0,0,.06);
}

/* ── 单行 ───────────────────────────────────────────────── */
.tc-row {
  display: grid;
  grid-template-columns: 96px 1fr 52px;
  align-items: center;
  gap: 0;
  padding: 0 16px;
  border-bottom: 1px solid var(--n-border-color, rgba(0,0,0,.06));
  transition: background 0.12s;
  min-height: 52px;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(99,102,241,.04);
  }

  &--error {
    background: rgba(239,68,68,.04) !important;
  }
}

/* ── 单位名称 ───────────────────────────────────────────── */
.tc-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--n-text-color-2, #444);
  white-space: nowrap;
  user-select: none;
}

/* ── 步进器 + 输入框整体 ────────────────────────────────── */
.tc-input-group {
  display: flex;
  align-items: center;
  border: 1.5px solid var(--n-border-color, rgba(0,0,0,.14));
  border-radius: 9px;
  overflow: hidden;
  transition: border-color 0.15s, box-shadow 0.15s;
  margin: 8px 0;

  &:focus-within {
    border-color: var(--primary-color, #6366f1);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color, #6366f1) 13%, transparent);
  }

  &--error {
    border-color: rgba(239,68,68,.5) !important;
    box-shadow: 0 0 0 2px rgba(239,68,68,.1) !important;
  }
}

/* ── 步进按钮 ───────────────────────────────────────────── */
.step-btn {
  width: 32px;
  height: 36px;
  border: none;
  background: var(--n-color-modal, rgba(0,0,0,.03));
  color: var(--n-text-color-2, #555);
  font-size: 16px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.12s, color 0.12s;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;

  &:hover {
    background: rgba(99,102,241,.1);
    color: var(--primary-color, #6366f1);
  }

  &:active {
    background: rgba(99,102,241,.18);
  }

  &--dec {
    border-right: 1px solid var(--n-border-color, rgba(0,0,0,.1));
  }

  &--inc {
    border-left: 1px solid var(--n-border-color, rgba(0,0,0,.1));
  }
}

/* ── 数字输入框 ─────────────────────────────────────────── */
.tc-input {
  flex: 1;
  height: 36px;
  padding: 0 10px;
  border: none;
  outline: none;
  font-size: 15px;
  font-family: 'Fira Code', 'Consolas', 'SF Mono', monospace;
  font-variant-numeric: tabular-nums;
  text-align: center;
  background: transparent;
  color: var(--n-text-color-1, #111);
  min-width: 0;
  width: 100%;
}

/* ── 单位符号 ───────────────────────────────────────────── */
.tc-unit {
  font-size: 13px;
  font-weight: 600;
  color: var(--n-text-color-3, #888);
  text-align: right;
  white-space: nowrap;
  user-select: none;
  padding-left: 8px;

  &--error {
    color: #dc2626;
  }
}

/* ── 警告过渡动画 ────────────────────────────────────────── */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: max-height 0.25s ease, opacity 0.2s ease;
  overflow: hidden;
  max-height: 80px;
}
.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}

/* ── 响应式：移动端 ─────────────────────────────────────── */
@media (max-width: 480px) {
  .tc-row {
    grid-template-columns: 80px 1fr 44px;
    padding: 0 12px;
  }

  .tc-label {
    font-size: 12px;
  }

  .tc-input {
    font-size: 14px;
  }

  .step-btn {
    width: 28px;
  }
}
</style>
