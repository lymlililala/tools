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

const formats = {
  picker: buildColorFormat({
    label: 'color picker',
    format: (v: Colord) => v.toHex(),
    type: 'color-picker',
  }),
  hex: buildColorFormat({
    label: 'hex',
    format: (v: Colord) => v.toHex(),
    placeholder: 'e.g. #ff0000',
  }),
  rgb: buildColorFormat({
    label: 'rgb',
    format: (v: Colord) => v.toRgbString(),
    placeholder: 'e.g. rgb(255, 0, 0)',
  }),
  hsl: buildColorFormat({
    label: 'hsl',
    format: (v: Colord) => v.toHslString(),
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
  if (value === undefined) return;
  if (!value.isValid()) return;
  _.forEach(formats, ({ value: valueRef, format }, key) => {
    if (key !== omitLabel) {
      valueRef.value = format(value);
    }
  });
}

// ── WCAG 对比度 ────────────────────────────────────────────────
const currentColord = computed(() => {
  const hex = formats.hex.value.value;
  if (!hex) return null;
  const c = colord(hex);
  return c.isValid() ? c : null;
});

function relativeLuminance(c: Colord): number {
  const { r, g, b } = c.toRgb();
  const toLinear = (v: number) => {
    const n = v / 255;
    return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
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

function wcagRating(ratio: number): { level: string; color: string } {
  if (ratio >= 7) return { level: 'AAA', color: '#22c55e' };
  if (ratio >= 4.5) return { level: 'AA', color: '#10b981' };
  if (ratio >= 3) return { level: 'AA Large', color: '#f59e0b' };
  return { level: 'Fail', color: '#f87171' };
}

const whiteRating = computed(() => wcagRating(wcagWhite.value));
const blackRating = computed(() => wcagRating(wcagBlack.value));

// 颜色亮度（判断文字颜色）
const isDark = computed(() => currentColord.value ? currentColord.value.isDark() : false);
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
                placement="bottom-end"
                @update:value="(v:string) => updateColorValue(parse(v), key)"
              />
            </n-form-item>
          </template>
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
            :style="{ background: formats.hex.value.value || '#ccc' }"
          >
            <span class="preview-hex" :style="{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.75)' }">
              {{ formats.hex.value.value?.toUpperCase() || '#------' }}
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
              <div class="wcag-swatch" :style="{ background: formats.hex.value.value || '#ccc' }" />
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
              <div class="wcag-swatch" :style="{ background: formats.hex.value.value || '#ccc' }" />
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

          <!-- 进度条可视化 -->
          <div class="contrast-bars">
            <div class="contrast-bar-wrap">
              <div class="contrast-bar-label">
                <span>White</span>
                <span>{{ wcagWhite.toFixed(1) }}</span>
              </div>
              <div class="contrast-bar-track">
                <div
                  class="contrast-bar-fill"
                  :style="{
                    width: `${Math.min(100, (wcagWhite / 21) * 100)}%`,
                    background: whiteRating.color,
                  }"
                />
                <div class="contrast-bar-marker" style="left: calc(4.5 / 21 * 100%)" title="AA: 4.5" />
                <div class="contrast-bar-marker" style="left: calc(7 / 21 * 100%)" title="AAA: 7" />
              </div>
            </div>
            <div class="contrast-bar-wrap">
              <div class="contrast-bar-label">
                <span>Black</span>
                <span>{{ wcagBlack.toFixed(1) }}</span>
              </div>
              <div class="contrast-bar-track">
                <div
                  class="contrast-bar-fill"
                  :style="{
                    width: `${Math.min(100, (wcagBlack / 21) * 100)}%`,
                    background: blackRating.color,
                  }"
                />
                <div class="contrast-bar-marker" style="left: calc(4.5 / 21 * 100%)" title="AA: 4.5" />
                <div class="contrast-bar-marker" style="left: calc(7 / 21 * 100%)" title="AAA: 7" />
              </div>
            </div>
          </div>

          <div class="wcag-legend">
            <span>Fail &lt; 3</span>
            <span>AA Large ≥ 3</span>
            <span>AA ≥ 4.5</span>
            <span>AAA ≥ 7</span>
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
  grid-template-columns: 1fr 260px;
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
  background: rgba(99,102,241,0.1);
  color: #6366f1;
  border-radius: 12px;
  padding: 1px 7px;
  text-transform: none;
  letter-spacing: 0;
  font-weight: 600;
}

// 颜色大预览
.color-preview {
  height: 100px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: background 0.2s ease;
  border: 1px solid rgba(0,0,0,0.06);
}

.preview-hex {
  font-family: 'SF Mono', monospace;
  font-size: 18px;
  font-weight: 700;
}

.preview-name {
  font-size: 12px;
  font-style: italic;
  text-transform: capitalize;
}

// WCAG
.wcag-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

.wcag-divider {
  height: 1px;
  background: rgba(99,102,241,0.1);
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
  border: 1px solid rgba(0,0,0,0.08);
  border-right: none;
}

.wcag-on {
  width: 28px;
  height: 28px;
  border-radius: 0 6px 6px 0;
  border: 1px solid rgba(0,0,0,0.08);
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
  font-family: 'SF Mono', monospace;
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

// 对比度进度条
.contrast-bars {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contrast-bar-wrap {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.contrast-bar-label {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  opacity: 0.55;
}

.contrast-bar-track {
  height: 6px;
  border-radius: 3px;
  background: rgba(99,102,241,0.1);
  position: relative;
  overflow: visible;
}

.contrast-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease, background 0.3s ease;
}

.contrast-bar-marker {
  position: absolute;
  top: -3px;
  width: 2px;
  height: 12px;
  background: rgba(255,255,255,0.9);
  border-radius: 1px;
  transform: translateX(-50%);
  box-shadow: 0 0 0 1px rgba(0,0,0,0.2);
}

.dark .contrast-bar-marker {
  background: rgba(15,17,23,0.9);
}

.wcag-legend {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 10px;
  opacity: 0.35;
}
</style>
