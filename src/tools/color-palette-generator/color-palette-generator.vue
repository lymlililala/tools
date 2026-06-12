<script setup lang="ts">
import { useMessage } from 'naive-ui';
import { useStyleStore } from '@/stores/style.store';

const { t } = useI18n();
const styleStore = useStyleStore();
const message = useMessage();

// ── 基础颜色 ──────────────────────────────────────────────────
const baseColor = ref('#6366f1');
const hexInput = ref('#6366f1');
const hexInputError = ref(false);

// ── 颜色工具函数 ──────────────────────────────────────────────
function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return null;
  }
  const r = Number.parseInt(result[1], 16) / 255;
  const g = Number.parseInt(result[2], 16) / 255;
  const b = Number.parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g: h = ((b - r) / d + 2) / 6;
        break;
      case b: h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(255 * c).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return '';
  }
  return `rgb(${Number.parseInt(result[1], 16)}, ${Number.parseInt(result[2], 16)}, ${Number.parseInt(result[3], 16)})`;
}

/** WCAG 相对亮度 → 自动选择白/黑前景色 */
function textColor(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return '#000';
  }
  const [r, g, b] = [result[1], result[2], result[3]].map((c) => {
    const v = Number.parseInt(c, 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return L > 0.179 ? '#1a1a1a' : '#ffffff';
}

// ── 验证并同步 hex 输入 ───────────────────────────────────────
function normalizeHex(raw: string): string | null {
  const s = raw.trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(s)) {
    return `#${s[0]}${s[0]}${s[1]}${s[1]}${s[2]}${s[2]}`;
  }
  if (/^[0-9a-f]{6}$/i.test(s)) {
    return `#${s}`;
  }
  return null;
}

function onHexInput() {
  const normalized = normalizeHex(hexInput.value);
  if (normalized) {
    baseColor.value = normalized;
    hexInput.value = normalized;
    hexInputError.value = false;
  }
  else {
    hexInputError.value = hexInput.value.trim() !== '';
  }
}

function onColorPickerChange(e: Event) {
  const val = (e.target as HTMLInputElement).value;
  baseColor.value = val;
  hexInput.value = val;
  hexInputError.value = false;
}

// ── 色阶 ──────────────────────────────────────────────────────
const tints = computed(() => {
  const hsl = hexToHsl(baseColor.value);
  if (!hsl) {
    return [];
  }
  return [95, 88, 80, 70, 60, 50, 40, 30, 20, 10].map((l, i) => ({
    label: `${(i + 1) * 100}`,
    hex: hslToHex(hsl.h, hsl.s, l),
  }));
});

// ── 配色方案 ──────────────────────────────────────────────────
const harmonies = computed(() => {
  const hsl = hexToHsl(baseColor.value);
  if (!hsl) {
    return [];
  }
  const { h, s, l } = hsl;
  return [
    {
      name: t('tools.color-palette-generator.complementary'),
      colors: [baseColor.value, hslToHex((h + 180) % 360, s, l)],
    },
    {
      name: t('tools.color-palette-generator.analogous'),
      colors: [
        hslToHex((h - 30 + 360) % 360, s, l),
        baseColor.value,
        hslToHex((h + 30) % 360, s, l),
      ],
    },
    {
      name: t('tools.color-palette-generator.triadic'),
      colors: [
        baseColor.value,
        hslToHex((h + 120) % 360, s, l),
        hslToHex((h + 240) % 360, s, l),
      ],
    },
    {
      name: t('tools.color-palette-generator.splitComplementary'),
      colors: [
        baseColor.value,
        hslToHex((h + 150) % 360, s, l),
        hslToHex((h + 210) % 360, s, l),
      ],
    },
    {
      name: t('tools.color-palette-generator.tetradic'),
      colors: [
        baseColor.value,
        hslToHex((h + 90) % 360, s, l),
        hslToHex((h + 180) % 360, s, l),
        hslToHex((h + 270) % 360, s, l),
      ],
    },
  ];
});

// ── 灰色系 ────────────────────────────────────────────────────
const grays = computed(() => {
  const hsl = hexToHsl(baseColor.value);
  if (!hsl) {
    return [];
  }
  return [95, 88, 78, 65, 50, 38, 28, 18, 10, 5].map((l, i) => ({
    label: `${(i + 1) * 100}`,
    hex: hslToHex(hsl.h, 8, l),
  }));
});

// ── 复制反馈（Toast）─────────────────────────────────────────
const copied = ref('');
async function copyColor(hex: string) {
  try {
    await navigator.clipboard.writeText(hex);
  }
  catch {
    const ta = document.createElement('textarea');
    ta.value = hex;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
  copied.value = hex;
  message.success(t('tools.color-palette-generator.copiedMsg', { hex }), { duration: 1800 });
  setTimeout(() => {
    copied.value = '';
  }, 1600);
}

// ── 导出弹窗 ─────────────────────────────────────────────────
const showExport = ref(false);
const exportFormat = ref<'css' | 'tailwind' | 'scss'>('css');

const exportCode = computed(() => {
  const shades = tints.value;
  const grayShades = grays.value;
  const prefix = 'color';

  if (exportFormat.value === 'css') {
    const lines = [':root {', '  /* 主色阶 */'];
    shades.forEach(s => lines.push(`  --${prefix}-${s.label}: ${s.hex};`));
    lines.push('', '  /* 灰色系 */');
    grayShades.forEach(s => lines.push(`  --${prefix}-gray-${s.label}: ${s.hex};`));
    lines.push('}');
    return lines.join('\n');
  }
  if (exportFormat.value === 'tailwind') {
    const obj: Record<string, string> = {};
    shades.forEach(s => (obj[s.label] = s.hex));
    const colorLines = Object.entries(obj).map(([k, v]) => `    '${k}': '${v}',`).join('\n');
    const grayObj: Record<string, string> = {};
    grayShades.forEach(s => (grayObj[s.label] = s.hex));
    const grayLines = Object.entries(grayObj).map(([k, v]) => `    '${k}': '${v}',`).join('\n');
    return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        '${prefix}': {\n${colorLines}\n        },\n        '${prefix}-gray': {\n${grayLines}\n        },\n      },\n    },\n  },\n};`;
  }
  // scss
  const lines: string[] = ['// 主色阶'];
  shades.forEach(s => lines.push(`$${prefix}-${s.label}: ${s.hex};`));
  lines.push('', '// 灰色系');
  grayShades.forEach(s => lines.push(`$${prefix}-gray-${s.label}: ${s.hex};`));
  return lines.join('\n');
});

const exportCopied = ref(false);
async function copyExport() {
  await navigator.clipboard.writeText(exportCode.value);
  exportCopied.value = true;
  setTimeout(() => (exportCopied.value = false), 2000);
}
</script>

<template>
  <div class="palette-root" :class="{ dark: styleStore.isDarkTheme }" style="max-width: 860px; margin: 0 auto">
    <!-- ── 选色卡片 ─────────────────────────────────────────── -->
    <c-card mb-4>
      <div class="picker-row">
        <!-- 颜色预览 + 原生 color input -->
        <div class="color-preview-wrap" :title="t('tools.color-palette-generator.clickToChange')">
          <div class="color-preview" :style="{ background: baseColor }" />
          <input
            type="color"
            class="color-native"
            :value="baseColor"
            :title="t('tools.color-palette-generator.openPicker')"
            @input="onColorPickerChange"
          >
          <span class="picker-hint-icon" :title="t('tools.color-palette-generator.openPicker')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20z" stroke="currentColor" stroke-width="1.5" />
              <path d="M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0" fill="currentColor" opacity="0.3" />
            </svg>
          </span>
        </div>

        <!-- Hex 输入 -->
        <div class="hex-wrap" :class="{ error: hexInputError }">
          <input
            v-model="hexInput"
            class="hex-input"
            placeholder="#6366f1"
            maxlength="7"
            spellcheck="false"
            @input="onHexInput"
            @blur="onHexInput"
          >
          <transition name="fade">
            <span v-if="hexInputError" class="hex-error-tip">{{ t('tools.color-palette-generator.hexError') }}</span>
          </transition>
        </div>

        <!-- 颜色信息 -->
        <div class="color-info">
          <span
            class="info-chip"
            :title="t('tools.color-palette-generator.clickToCopyVal', { val: hexToRgb(baseColor) })"
            @click="copyColor(hexToRgb(baseColor))"
          >{{ hexToRgb(baseColor) }}</span>
          <span class="info-sep">|</span>
          <span
            class="info-chip"
            :title="t('tools.color-palette-generator.clickToCopyHsl')"
            @click="copyColor(`hsl(${hexToHsl(baseColor)?.h ?? 0}, ${hexToHsl(baseColor)?.s ?? 0}%, ${hexToHsl(baseColor)?.l ?? 0}%)`)"
          >
            HSL({{ hexToHsl(baseColor)?.h ?? 0 }}°, {{ hexToHsl(baseColor)?.s ?? 0 }}%, {{ hexToHsl(baseColor)?.l ?? 0 }}%)
          </span>
        </div>

        <!-- 导出按钮 -->
        <button class="export-btn" @click="showExport = true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          {{ t('tools.color-palette-generator.exportCode') }}
        </button>
      </div>
    </c-card>

    <!-- ── 色阶 ──────────────────────────────────────────────── -->
    <c-card mb-4>
      <template #title>
        {{ t('tools.color-palette-generator.shades') }}
      </template>
      <div class="shade-row">
        <div
          v-for="s in tints"
          :key="s.label"
          class="shade-swatch"
          :class="{ copied: copied === s.hex }"
          :style="{ background: s.hex, color: textColor(s.hex) }"
          :title="t('tools.color-palette-generator.clickToCopyVal', { val: s.hex })"
          @click="copyColor(s.hex)"
        >
          <span class="shade-label">{{ s.label }}</span>
          <span class="shade-hex">{{ copied === s.hex ? `✓ ${t('tools.color-palette-generator.copiedShort')}` : s.hex }}</span>
        </div>
      </div>
    </c-card>

    <!-- ── 配色方案 ────────────────────────────────────────────── -->
    <c-card mb-4>
      <template #title>
        {{ t('tools.color-palette-generator.harmonies') }}
      </template>
      <div class="harmony-list">
        <div v-for="h in harmonies" :key="h.name" class="harmony-row">
          <div class="harmony-name">
            {{ h.name }}
          </div>
          <div class="harmony-swatches">
            <div
              v-for="c in h.colors"
              :key="c"
              class="harmony-swatch"
              :class="{ copied: copied === c }"
              :style="{ background: c }"
              :title="t('tools.color-palette-generator.clickToCopyVal', { val: c })"
              @click="copyColor(c)"
            >
              <span class="harmony-hex" :style="{ color: textColor(c) }">
                {{ copied === c ? '✓' : c }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </c-card>

    <!-- ── 灰色系 ──────────────────────────────────────────────── -->
    <c-card>
      <template #title>
        {{ t('tools.color-palette-generator.grays') }}
      </template>
      <div class="shade-row">
        <div
          v-for="s in grays"
          :key="s.label"
          class="shade-swatch"
          :class="{ copied: copied === s.hex }"
          :style="{ background: s.hex, color: textColor(s.hex) }"
          :title="t('tools.color-palette-generator.clickToCopyVal', { val: s.hex })"
          @click="copyColor(s.hex)"
        >
          <span class="shade-label">{{ s.label }}</span>
          <span class="shade-hex">{{ copied === s.hex ? `✓ ${t('tools.color-palette-generator.copiedShort')}` : s.hex }}</span>
        </div>
      </div>
      <div class="click-hint">
        {{ t('tools.color-palette-generator.clickToCopy') }}
      </div>
    </c-card>

    <!-- ── 导出弹窗 ────────────────────────────────────────────── -->
    <n-modal v-model:show="showExport" preset="card" style="max-width: 680px" :title="t('tools.color-palette-generator.exportModalTitle')">
      <div class="export-modal">
        <div class="export-tabs">
          <button
            v-for="fmt in (['css', 'tailwind', 'scss'] as const)"
            :key="fmt"
            class="export-tab"
            :class="{ active: exportFormat === fmt }"
            @click="exportFormat = fmt"
          >
            {{ fmt === 'css' ? 'CSS Variables' : fmt === 'tailwind' ? 'Tailwind CSS' : 'SCSS Variables' }}
          </button>
        </div>
        <div class="export-code-wrap">
          <pre class="export-code">{{ exportCode }}</pre>
        </div>
        <div class="export-actions">
          <button
            class="copy-code-btn"
            :class="{ copied: exportCopied }"
            @click="copyExport"
          >
            <svg v-if="!exportCopied" width="14" height="14" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2" />
            </svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            {{ exportCopied ? t('tools.color-palette-generator.copied') : t('tools.color-palette-generator.copyCode') }}
          </button>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<style scoped lang="less">
/* ── 选色行 ───────────────────────────────────────────────────── */
.picker-row {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.color-preview-wrap {
  position: relative;
  width: 52px;
  height: 52px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);

  &:hover .picker-hint-icon { opacity: 1; }
}

.color-preview {
  width: 100%;
  height: 100%;
}

.color-native {
  position: absolute;
  inset: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  padding: 0;
  border: none;
}

.picker-hint-icon {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.3);
  color: #fff;
  opacity: 0;
  transition: opacity 0.18s;
  pointer-events: none;
}

/* ── Hex 输入 ─────────────────────────────────────────────────── */
.hex-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hex-input {
  width: 130px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1.5px solid #d9d9d9;
  background: #fff;
  font-size: 15px;
  font-family: 'SF Mono', 'Menlo', monospace;
  font-weight: 600;
  color: #222;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }

  .dark & { background: #1e1e1e; border-color: #444; color: #e0e0e0; }
  .error & { border-color: #ef4444; }
}

.hex-error-tip {
  font-size: 11px;
  color: #ef4444;
  white-space: nowrap;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── 颜色信息 ─────────────────────────────────────────────────── */
.color-info {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.info-chip {
  font-size: 12.5px;
  color: #555;
  cursor: pointer;
  padding: 3px 7px;
  border-radius: 5px;
  transition: background 0.15s, color 0.15s;

  &:hover { background: rgba(99,102,241,0.08); color: #6366f1; }
  .dark & { color: #bbb; }
}

.info-sep {
  font-size: 12px;
  color: #ccc;
  .dark & { color: #555; }
}

/* ── 导出按钮 ─────────────────────────────────────────────────── */
.export-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-left: auto;
  padding: 7px 14px;
  border-radius: 7px;
  border: 1.5px solid #d1d5db;
  background: transparent;
  color: #555;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;

  &:hover { border-color: #6366f1; background: rgba(99,102,241,0.06); color: #6366f1; }
  .dark & { border-color: #444; color: #ccc; &:hover { border-color: #6366f1; color: #a5b4fc; } }
}

/* ── 色阶 ─────────────────────────────────────────────────────── */
.shade-row {
  display: flex;
  border-radius: 8px;
  overflow: hidden;

  @media (max-width: 600px) {
    overflow-x: auto;
  }
}

.shade-swatch {
  flex: 1;
  min-width: 56px;
  padding: 10px 4px 8px;
  cursor: pointer;
  text-align: center;
  transition: transform 0.12s, filter 0.12s;

  &:hover { transform: scaleY(1.06); z-index: 1; filter: brightness(1.08); }
  &.copied { outline: 2px solid #fff; outline-offset: -2px; }
}

.shade-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.shade-hex {
  display: block;
  font-size: 9.5px;
  font-family: monospace;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── 配色方案 ─────────────────────────────────────────────────── */
.harmony-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.harmony-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.harmony-name {
  font-size: 13px;
  font-weight: 500;
  color: #555;
  min-width: 80px;
  flex-shrink: 0;
  .dark & { color: #bbb; }
}

.harmony-swatches {
  display: flex;
  gap: 5px;
  flex: 1;
}

.harmony-swatch {
  flex: 1;
  height: 54px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.12s, filter 0.12s;

  &:hover { transform: scale(1.05); filter: brightness(1.08); z-index: 1; }
  &.copied { outline: 2px solid rgba(255,255,255,0.6); outline-offset: -2px; }
}

.harmony-hex {
  font-size: 10.5px;
  font-family: monospace;
  font-weight: 600;
}

/* ── 提示文字 ─────────────────────────────────────────────────── */
.click-hint {
  margin-top: 10px;
  font-size: 12px;
  color: #999;
  .dark & { color: #666; }
}

/* ── 导出弹窗 ─────────────────────────────────────────────────── */
.export-modal {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.export-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.export-tab {
  padding: 6px 14px;
  border-radius: 6px;
  border: 1.5px solid #e0e0e0;
  background: transparent;
  font-size: 12.5px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.15s;

  &:hover { border-color: #6366f1; color: #6366f1; }
  &.active { border-color: #6366f1; background: rgba(99,102,241,0.08); color: #6366f1; font-weight: 700; }
}

.export-code-wrap {
  border-radius: 8px;
  background: #1e1e2e;
  overflow: auto;
  max-height: 360px;
}

.export-code {
  padding: 16px;
  font-family: 'SF Mono', 'Menlo', 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #cdd6f4;
  line-height: 1.7;
  margin: 0;
  white-space: pre;
}

.export-actions {
  display: flex;
  justify-content: flex-end;
}

.copy-code-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 7px;
  border: none;
  background: #6366f1;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;

  &:hover { background: #4f46e5; }
  &.copied { background: #22c55e; }
}
</style>
