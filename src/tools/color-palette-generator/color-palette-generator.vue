<script setup lang="ts">
const { t } = useI18n();

const baseColor = ref('#6366f1');

// HSL 解析
function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0; let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
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
  if (!result) return '';
  return `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`;
}

// 明度变体（10级）
const tints = computed(() => {
  const hsl = hexToHsl(baseColor.value);
  if (!hsl) return [];
  return [95, 88, 80, 70, 60, 50, 40, 30, 20, 10].map((l, i) => ({
    label: `${(i + 1) * 100}`,
    hex: hslToHex(hsl.h, hsl.s, l),
  }));
});

// 配色方案
const harmonies = computed(() => {
  const hsl = hexToHsl(baseColor.value);
  if (!hsl) return [];
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

// 灰度系列
const grays = computed(() => {
  const hsl = hexToHsl(baseColor.value);
  if (!hsl) return [];
  return [95, 88, 78, 65, 50, 38, 28, 18, 10, 5].map((l, i) => ({
    label: `${(i + 1) * 100}`,
    hex: hslToHex(hsl.h, 8, l), // 低饱和度 = 灰色调
  }));
});

// 复制状态
const copied = ref('');
async function copyColor(hex: string) {
  await navigator.clipboard.writeText(hex);
  copied.value = hex;
  setTimeout(() => { copied.value = ''; }, 1500);
}

// 判断文字颜色
function textColor(hex: string): string {
  const hsl = hexToHsl(hex);
  if (!hsl) return '#000';
  return hsl.l > 55 ? '#1a1a1a' : '#ffffff';
}
</script>

<template>
  <div style="max-width: 860px; margin: 0 auto">
    <!-- 选色 -->
    <c-card mb-4>
      <template #title>
        {{ t('tools.color-palette-generator.baseColor') }}
      </template>
      <div flex items-center gap-4 flex-wrap>
        <input v-model="baseColor" type="color" class="color-picker" />
        <n-input v-model:value="baseColor" placeholder="#6366f1" style="width:130px; font-family:monospace" />
        <div style="font-size:13px; opacity:0.6">
          {{ hexToRgb(baseColor) }} &nbsp;|&nbsp; HSL({{ hexToHsl(baseColor)?.h ?? 0 }}°, {{ hexToHsl(baseColor)?.s ?? 0 }}%, {{ hexToHsl(baseColor)?.l ?? 0 }}%)
        </div>
      </div>
    </c-card>

    <!-- 色阶 -->
    <c-card mb-4>
      <template #title>
        {{ t('tools.color-palette-generator.shades') }}
      </template>
      <div class="shade-row">
        <div
          v-for="s in tints"
          :key="s.label"
          class="shade-swatch"
          :style="{ background: s.hex, color: textColor(s.hex) }"
          @click="copyColor(s.hex)"
        >
          <span class="shade-label">{{ s.label }}</span>
          <span class="shade-hex">{{ copied === s.hex ? '✓' : s.hex }}</span>
        </div>
      </div>
    </c-card>

    <!-- 配色方案 -->
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
              :style="{ background: c }"
              :title="c"
              @click="copyColor(c)"
            >
              <span class="harmony-hex" :style="{ color: textColor(c) }">{{ copied === c ? '✓' : c }}</span>
            </div>
          </div>
        </div>
      </div>
    </c-card>

    <!-- 灰色调 -->
    <c-card>
      <template #title>
        {{ t('tools.color-palette-generator.grays') }}
      </template>
      <div class="shade-row">
        <div
          v-for="s in grays"
          :key="s.label"
          class="shade-swatch"
          :style="{ background: s.hex, color: textColor(s.hex) }"
          @click="copyColor(s.hex)"
        >
          <span class="shade-label">{{ s.label }}</span>
          <span class="shade-hex">{{ copied === s.hex ? '✓' : s.hex }}</span>
        </div>
      </div>
      <div mt-3 style="font-size:12px;opacity:0.45">
        {{ t('tools.color-palette-generator.clickToCopy') }}
      </div>
    </c-card>
  </div>
</template>

<style scoped lang="less">
.color-picker {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  padding: 0;
  background: none;
}

.shade-row {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
}

.shade-swatch {
  flex: 1;
  padding: 10px 4px 8px;
  cursor: pointer;
  text-align: center;
  transition: transform 0.12s;
  min-width: 0;

  &:hover {
    transform: scaleY(1.05);
    z-index: 1;
  }
}

.shade-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  opacity: 0.8;
}

.shade-hex {
  display: block;
  font-size: 10px;
  opacity: 0.7;
  font-family: monospace;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.harmony-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.harmony-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.harmony-name {
  font-size: 13px;
  opacity: 0.6;
  min-width: 160px;
  flex-shrink: 0;
}

.harmony-swatches {
  display: flex;
  gap: 4px;
  flex: 1;
}

.harmony-swatch {
  flex: 1;
  height: 52px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.12s;

  &:hover {
    transform: scale(1.05);
  }
}

.harmony-hex {
  font-size: 10px;
  font-family: monospace;
  opacity: 0.85;
}
</style>
