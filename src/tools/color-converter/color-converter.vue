<script setup lang="ts">
import type { Colord } from 'colord';
import { colord, extend } from 'colord';
import _ from 'lodash';
import cmykPlugin from 'colord/plugins/cmyk';
import hwbPlugin from 'colord/plugins/hwb';
import namesPlugin from 'colord/plugins/names';
import lchPlugin from 'colord/plugins/lch';
import { buildColorFormat } from './color-converter.models';
import { useStyleStore } from '@/stores/style.store';

extend([cmykPlugin, hwbPlugin, namesPlugin, lchPlugin]);

const styleStore = useStyleStore();

// ── Alpha 通道（0~1） ────────────────────────────────────────────────────
const alpha = ref(1); // 1 = 完全不透明

// 应用 alpha 到 Colord 对象
function applyAlpha(c: Colord): Colord {
  if (alpha.value >= 1) {
    return c;
  }
  const { r, g, b } = c.toRgb();
  return colord({ r, g, b, a: alpha.value });
}

const formats = {
  picker: buildColorFormat({
    label: 'color picker',
    format: (v: Colord) => {
      const hex = v.toHex();
      // 剥除 alpha，color-picker 只展示纯色
      return hex.length === 9 ? hex.slice(0, 7) : hex;
    },
    type: 'color-picker',
  }),
  hex: buildColorFormat({
    label: 'hex',
    format: (v: Colord) => {
      const c = applyAlpha(v);
      const hex = c.toHex();
      // 8位 hex 保留，6位正常
      return hex;
    },
    placeholder: 'e.g. #ff0000',
  }),
  rgb: buildColorFormat({
    label: 'rgb',
    format: (v: Colord) => {
      const c = applyAlpha(v);
      if (alpha.value < 1) {
        const { r, g, b, a } = c.toRgb();
        return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
      }
      return v.toRgbString();
    },
    placeholder: 'e.g. rgb(255, 0, 0)',
  }),
  hsl: buildColorFormat({
    label: 'hsl',
    format: (v: Colord) => {
      const c = applyAlpha(v);
      if (alpha.value < 1) {
        const { h, s, l, a } = c.toHsl();
        return `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${a.toFixed(2)})`;
      }
      return v.toHslString();
    },
    placeholder: 'e.g. hsl(0, 100%, 50%)',
  }),
  hwb: buildColorFormat({
    label: 'hwb',
    format: (v: Colord) => v.toHwbString(),
    placeholder: 'e.g. hwb(0, 0%, 0%)',
  }),
  lch: buildColorFormat({
    label: 'lch',
    format: (v: Colord) => v.toLchString(),
    placeholder: 'e.g. lch(53.24, 104.55, 40.85)',
  }),
  cmyk: buildColorFormat({
    label: 'cmyk',
    format: (v: Colord) => v.toCmykString(),
    placeholder: 'e.g. cmyk(0, 100%, 100%, 0)',
  }),
  name: buildColorFormat({
    label: 'name',
    format: (v: Colord) => v.toName({ closest: true }) ?? 'Unknown',
    placeholder: 'e.g. red',
  }),
};

updateColorValue(colord('#1ea54c'));

function updateColorValue(value: Colord | undefined, omitLabel?: string) {
  if (value === undefined) {
    return;
  }
  if (!value.isValid()) {
    return;
  }
  _.forEach(formats, ({ value: valueRef, format }, key) => {
    if (key !== omitLabel) {
      valueRef.value = format(value);
    }
  });
}

// alpha 变化时重新格式化
watch(alpha, () => {
  const hex = formats.hex.value.value;
  if (!hex) {
    return;
  }
  // 取纯色部分（前6/7位）
  const pureHex = hex.length >= 7 ? hex.slice(0, 7) : hex;
  const c = colord(pureHex);
  if (c.isValid()) {
    updateColorValue(c);
  }
});

// ── WCAG 对比度 ────────────────────────────────────────────────────────────
const currentColord = computed(() => {
  const hex = formats.hex.value.value;
  if (!hex) {
    return null;
  }
  // 取 6 位纯色（WCAG 不计算透明度）
  const pureHex = hex.length >= 7 ? hex.slice(0, 7) : hex;
  const c = colord(pureHex);
  return c.isValid() ? c : null;
});

function relativeLuminance(c: Colord): number {
  const { r, g, b } = c.toRgb();
  const toLinear = (v: number) => {
    const n = v / 255;
    return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(a: Colord, b: Colord): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const light = Math.max(la, lb);
  const dark = Math.min(la, lb);
  return (light + 0.05) / (dark + 0.05);
}

const white = colord('#ffffff');
const black = colord('#000000');

const wcagWhite = computed(() => currentColord.value ? contrastRatio(currentColord.value, white) : 0);
const wcagBlack = computed(() => currentColord.value ? contrastRatio(currentColord.value, black) : 0);

type WcagLevel = 'AAA' | 'AA' | 'AA Large' | 'Fail';
interface WcagRating { level: WcagLevel; color: string; score: number }

function wcagRating(ratio: number): WcagRating {
  if (ratio >= 7) {
    return { level: 'AAA', color: '#22c55e', score: 4 };
  }
  if (ratio >= 4.5) {
    return { level: 'AA', color: '#10b981', score: 3 };
  }
  if (ratio >= 3) {
    return { level: 'AA Large', color: '#f59e0b', score: 2 };
  }
  return { level: 'Fail', color: '#ef4444', score: 1 };
}

const whiteRating = computed(() => wcagRating(wcagWhite.value));
const blackRating = computed(() => wcagRating(wcagBlack.value));

// 颜色亮度（判断文字颜色）
const isDark = computed(() => currentColord.value ? currentColord.value.isDark() : false);

// 预览颜色（带 alpha）
const previewColor = computed(() => {
  const hex = formats.hex.value.value;
  if (!hex) {
    return '#cccccc';
  }
  if (alpha.value >= 1) {
    return hex.length >= 7 ? hex.slice(0, 7) : hex;
  }
  const pure = hex.length >= 7 ? hex.slice(0, 7) : hex;
  const alphaHex = Math.round(alpha.value * 255).toString(16).padStart(2, '0');
  return `${pure}${alphaHex}`;
});

// alpha 百分比显示
const alphaPercent = computed({
  get: () => Math.round(alpha.value * 100),
  set: (v: number) => { alpha.value = Math.max(0, Math.min(1, v / 100)); },
});
</script>

<template>
  <div class="color-converter" :class="{ dark: styleStore.isDarkTheme }">
    <div class="converter-layout">
      <!-- 左：格式转换 -->
      <div class="converter-left">
        <c-card>
          <div class="section-label">
            Color Formats
          </div>

          <!-- Color picker + alpha -->
          <template v-for="({ label, parse, placeholder, validation, type }, key) in formats" :key="key">
            <input-copyable
              v-if="type === 'text'"
              v-model:value="formats[key].value.value"
              :test-id="`input-${key}`"
              :label="`${label}:`"
              label-position="left"
              label-width="80px"
              label-align="right"
              :placeholder="placeholder"
              :validation="validation"
              raw-text
              clearable
              mt-2
              @update:value="(v:string) => updateColorValue(parse(v), key)"
            />

            <n-form-item
              v-else-if="type === 'color-picker'"
              :label="`${label}:`"
              label-width="80"
              label-placement="left"
              :show-feedback="false"
              mt-2
            >
              <n-color-picker
                v-model:value="formats[key].value.value"
                :show-alpha="false"
                placement="bottom-end"
                @update:value="(v:string) => updateColorValue(parse(v), key)"
              />
            </n-form-item>
          </template>

          <!-- Alpha 透明度滑块 -->
          <div class="alpha-row">
            <div class="alpha-label">
              <span>alpha:</span>
              <span class="alpha-value">{{ alphaPercent }}%</span>
            </div>
            <div class="alpha-slider-wrap">
              <!-- 棋盘格背景展示透明效果 -->
              <div class="alpha-track-bg">
                <div
                  class="alpha-track-fill"
                  :style="{
                    background: `linear-gradient(to right, transparent, ${(formats.hex.value.value || '#000').slice(0, 7)})`,
                  }"
                />
              </div>
              <n-slider
                v-model:value="alphaPercent"
                :min="0"
                :max="100"
                :step="1"
                :tooltip="false"
                style="position: relative; z-index: 1"
              />
            </div>
          </div>
        </c-card>
      </div>

      <!-- 右：颜色预览 + WCAG -->
      <div class="converter-right">
        <!-- 颜色大预览 -->
        <c-card mb-3>
          <div class="section-label">
            Preview
          </div>
          <div
            class="color-preview"
            :style="{ background: previewColor }"
          >
            <span class="preview-hex" :style="{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.75)' }">
              {{ (formats.hex.value.value || '#------').toUpperCase() }}
              <span v-if="alpha < 1" class="preview-alpha-tag">{{ alphaPercent }}%</span>
            </span>
            <span class="preview-name" :style="{ color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)' }">
              {{ formats.name.value.value || 'Unknown' }}
            </span>
          </div>
        </c-card>

        <!-- WCAG 对比度 -->
        <c-card v-if="currentColord">
          <div class="section-label">
            WCAG Contrast
            <span class="wcag-hint">Accessibility Score</span>
          </div>

          <!-- vs White -->
          <div class="wcag-row">
            <div class="wcag-swatch-wrap">
              <div class="wcag-swatch" :style="{ background: (formats.hex.value.value || '#ccc').slice(0, 7) }" />
              <div class="wcag-on" style="background: #fff; color: #000;">
                A
              </div>
            </div>
            <div class="wcag-info">
              <div class="wcag-label">
                on White
              </div>
              <div class="wcag-ratio">
                {{ wcagWhite.toFixed(2) }}:1
              </div>
            </div>
            <div class="wcag-badge" :style="{ background: `${whiteRating.color}18`, color: whiteRating.color, borderColor: `${whiteRating.color}40` }">
              {{ whiteRating.level }}
            </div>
          </div>

          <div class="wcag-divider" />

          <!-- vs Black -->
          <div class="wcag-row">
            <div class="wcag-swatch-wrap">
              <div class="wcag-swatch" :style="{ background: (formats.hex.value.value || '#ccc').slice(0, 7) }" />
              <div class="wcag-on" style="background: #000; color: #fff;">
                A
              </div>
            </div>
            <div class="wcag-info">
              <div class="wcag-label">
                on Black
              </div>
              <div class="wcag-ratio">
                {{ wcagBlack.toFixed(2) }}:1
              </div>
            </div>
            <div class="wcag-badge" :style="{ background: `${blackRating.color}18`, color: blackRating.color, borderColor: `${blackRating.color}40` }">
              {{ blackRating.level }}
            </div>
          </div>

          <!-- 重构的分段式进度条 -->
          <div class="contrast-bars">
            <!-- White 进度条 -->
            <div class="contrast-bar-wrap">
              <div class="contrast-bar-label">
                <span>on White</span>
                <span class="bar-ratio" :style="{ color: whiteRating.color }">{{ wcagWhite.toFixed(2) }}:1</span>
              </div>
              <div class="segmented-track">
                <!-- 4段：Fail(0-3) / AA Large(3-4.5) / AA(4.5-7) / AAA(7-21) -->
                <div
                  class="seg seg-fail"
                  :class="{ active: wcagWhite > 0 && wcagWhite < 3 }"
                  title="Fail: < 3"
                />
                <div
                  class="seg seg-aal"
                  :class="{ active: wcagWhite >= 3 && wcagWhite < 4.5 }"
                  title="AA Large: 3-4.5"
                />
                <div
                  class="seg seg-aa"
                  :class="{ active: wcagWhite >= 4.5 && wcagWhite < 7 }"
                  title="AA: 4.5-7"
                />
                <div
                  class="seg seg-aaa"
                  :class="{ active: wcagWhite >= 7 }"
                  title="AAA: ≥ 7"
                />
                <!-- 指针 -->
                <div
                  class="bar-pointer"
                  :style="{ left: `${Math.min(99, (wcagWhite / 21) * 100)}%`, background: whiteRating.color }"
                />
              </div>
            </div>

            <!-- Black 进度条 -->
            <div class="contrast-bar-wrap">
              <div class="contrast-bar-label">
                <span>on Black</span>
                <span class="bar-ratio" :style="{ color: blackRating.color }">{{ wcagBlack.toFixed(2) }}:1</span>
              </div>
              <div class="segmented-track">
                <div
                  class="seg seg-fail"
                  :class="{ active: wcagBlack > 0 && wcagBlack < 3 }"
                  title="Fail: < 3"
                />
                <div
                  class="seg seg-aal"
                  :class="{ active: wcagBlack >= 3 && wcagBlack < 4.5 }"
                  title="AA Large: 3-4.5"
                />
                <div
                  class="seg seg-aa"
                  :class="{ active: wcagBlack >= 4.5 && wcagBlack < 7 }"
                  title="AA: 4.5-7"
                />
                <div
                  class="seg seg-aaa"
                  :class="{ active: wcagBlack >= 7 }"
                  title="AAA: ≥ 7"
                />
                <div
                  class="bar-pointer"
                  :style="{ left: `${Math.min(99, (wcagBlack / 21) * 100)}%`, background: blackRating.color }"
                />
              </div>
            </div>

            <!-- 图例 -->
            <div class="wcag-legend">
              <span class="legend-item"><span class="legend-dot" style="background:#ef4444" />Fail &lt;3</span>
              <span class="legend-item"><span class="legend-dot" style="background:#f59e0b" />AA Large ≥3</span>
              <span class="legend-item"><span class="legend-dot" style="background:#10b981" />AA ≥4.5</span>
              <span class="legend-item"><span class="legend-dot" style="background:#22c55e" />AAA ≥7</span>
            </div>
          </div>
        </c-card>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.color-converter {
  max-width: 900px;
  margin: 0 auto;
}

.converter-layout {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 16px;
  align-items: start;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

.section-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.5;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.wcag-hint {
  font-size: 10px;
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  border-radius: 12px;
  padding: 1px 7px;
  text-transform: none;
  letter-spacing: 0;
  font-weight: 600;
}

/* ── Alpha 滑块 ────────────────────────────────────────────────────────── */
.alpha-row {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(128, 128, 128, 0.12);
}

.alpha-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  opacity: 0.55;
  margin-bottom: 6px;
  padding-left: 1px;
}

.alpha-value {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.alpha-slider-wrap {
  position: relative;
}

.alpha-track-bg {
  position: absolute;
  inset: 0;
  margin: 6px 0;
  border-radius: 3px;
  background-image:
    linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%);
  background-size: 8px 8px;
  background-position: 0 0, 0 4px, 4px -4px, -4px 0;
  overflow: hidden;
}

.alpha-track-fill {
  position: absolute;
  inset: 0;
}

/* ── 颜色预览 ──────────────────────────────────────────────────────────── */
.color-preview {
  height: 100px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: background 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.06);
  /* 棋盘格背景展示透明效果 */
  background-image:
    linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
    linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
    linear-gradient(-45deg, transparent 75%, #e5e7eb 75%);
  background-size: 12px 12px;
  background-position: 0 0, 0 6px, 6px -6px, -6px 0;
}

.preview-hex {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
}

.preview-alpha-tag {
  font-size: 12px;
  font-weight: 500;
  opacity: 0.7;
  background: rgba(255, 255, 255, 0.2);
  padding: 1px 6px;
  border-radius: 8px;
}

.preview-name {
  font-size: 12px;
  font-style: italic;
  text-transform: capitalize;
}

/* ── WCAG ────────────────────────────────────────────────────────────── */
.wcag-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

.wcag-divider {
  height: 1px;
  background: rgba(99, 102, 241, 0.1);
  margin: 2px 0;
}

.wcag-swatch-wrap {
  display: flex;
  flex-shrink: 0;
}

.wcag-swatch {
  width: 28px;
  height: 28px;
  border-radius: 6px 0 0 6px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-right: none;
}

.wcag-on {
  width: 28px;
  height: 28px;
  border-radius: 0 6px 6px 0;
  border: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 900;
}

.wcag-info {
  flex: 1;
}

.wcag-label {
  font-size: 11px;
  opacity: 0.5;
  margin-bottom: 1px;
}

.wcag-ratio {
  font-size: 14px;
  font-weight: 700;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-variant-numeric: tabular-nums;
}

.wcag-badge {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  border: 1px solid;
  flex-shrink: 0;
  letter-spacing: 0.03em;
}

/* ── 重构分段式进度条 ─────────────────────────────────────────────────── */
.contrast-bars {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.contrast-bar-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.contrast-bar-label {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  opacity: 0.55;
}

.bar-ratio {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  transition: color 0.3s;
}

/* 4 段分色轨道 */
.segmented-track {
  display: flex;
  gap: 2px;
  height: 8px;
  border-radius: 4px;
  position: relative;
  overflow: visible;
}

/* 各段宽度比例 = 各区间长度 / 21 */
/* Fail: 0~3 → 3/21 ≈ 14.3% */
/* AA Large: 3~4.5 → 1.5/21 ≈ 7.1% */
/* AA: 4.5~7 → 2.5/21 ≈ 11.9% */
/* AAA: 7~21 → 14/21 ≈ 66.7% */
.seg {
  height: 100%;
  border-radius: 3px;
  transition: opacity 0.3s, filter 0.3s;
  opacity: 0.22;

  &.active {
    opacity: 1;
    filter: brightness(1.05);
  }
}

.seg-fail   { flex: 3; background: #ef4444; }
.seg-aal    { flex: 1.5; background: #f59e0b; }
.seg-aa     { flex: 2.5; background: #10b981; }
.seg-aaa    { flex: 14; background: #22c55e; }

/* 当前值指针 */
.bar-pointer {
  position: absolute;
  top: -2px;
  width: 3px;
  height: 12px;
  border-radius: 2px;
  transform: translateX(-50%);
  transition: left 0.3s ease, background 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  z-index: 2;
}

/* ── 图例 ──────────────────────────────────────────────────────────────── */
.wcag-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  opacity: 0.55;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ── 深色模式修正 ─────────────────────────────────────────────────────── */
.dark .alpha-track-bg {
  background-image:
    linear-gradient(45deg, #374151 25%, transparent 25%),
    linear-gradient(-45deg, #374151 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #374151 75%),
    linear-gradient(-45deg, transparent 75%, #374151 75%);
  background-size: 8px 8px;
  background-position: 0 0, 0 4px, 4px -4px, -4px 0;
}

.dark .color-preview {
  background-image:
    linear-gradient(45deg, #374151 25%, transparent 25%),
    linear-gradient(-45deg, #374151 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #374151 75%),
    linear-gradient(-45deg, transparent 75%, #374151 75%);
  background-size: 12px 12px;
  background-position: 0 0, 0 6px, 6px -6px, -6px 0;
}
</style>
