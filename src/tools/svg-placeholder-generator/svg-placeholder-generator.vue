<script setup lang="ts">
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import { useDownloadFileFromBase64 } from '@/composable/downloadBase64';
import { textToBase64 } from '@/utils/base64';
import { useStyleStore } from '@/stores/style.store';

const styleStore = useStyleStore();
const { t } = useI18n();

// ── 默认值 ────────────────────────────────────────────────────
const DEFAULTS = { width: 600, height: 350, fontSize: 26, bgColor: '#cccccc', fgColor: '#333333', useExactSize: true, customText: '' };

const width = ref(DEFAULTS.width);
const height = ref(DEFAULTS.height);
const fontSize = ref(DEFAULTS.fontSize);
const bgColor = ref(DEFAULTS.bgColor);
const fgColor = ref(DEFAULTS.fgColor);
const useExactSize = ref(DEFAULTS.useExactSize);
const customText = ref(DEFAULTS.customText);

// ── SVG 生成 ──────────────────────────────────────────────────
const svgString = computed(() => {
  const w = Math.max(1, Math.min(width.value || 1, 4096));
  const h = Math.max(1, Math.min(height.value || 1, 4096));
  const text = customText.value.trim() || `${w}x${h}`;
  const sizeAttr = useExactSize.value ? ` width="${w}" height="${h}"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"${sizeAttr}>
  <rect width="${w}" height="${h}" fill="${bgColor.value}"></rect>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="${fontSize.value}px" fill="${fgColor.value}">${text}</text>
</svg>`.trim();
});

const base64 = computed(() => `data:image/svg+xml;base64,${textToBase64(svgString.value)}`);

const { download } = useDownloadFileFromBase64({ source: base64 });

// ── 重置 ──────────────────────────────────────────────────────
function resetDefaults() {
  width.value = DEFAULTS.width;
  height.value = DEFAULTS.height;
  fontSize.value = DEFAULTS.fontSize;
  bgColor.value = DEFAULTS.bgColor;
  fgColor.value = DEFAULTS.fgColor;
  useExactSize.value = DEFAULTS.useExactSize;
  customText.value = DEFAULTS.customText;
}

// ── Tooltip 文案 ─────────────────────────────────────────────
const exactSizeTooltip = computed(() => t('tools.svg-placeholder-generator.exactSizeTooltip'));
</script>

<template>
  <div class="svg-root" :class="{ dark: styleStore.isDarkTheme }">
    <div class="svg-layout">
      <!-- ── 左侧：控制面板 ────────────────────────────────────── -->
      <div class="svg-controls">
        <c-card>
          <!-- 顶部标题 + 重置 -->
          <div class="panel-header">
            <span class="panel-title">{{ t('tools.svg-placeholder-generator.settingsTitle') }}</span>
            <button class="reset-btn" :title="t('tools.svg-placeholder-generator.resetTitle')" @click="resetDefaults">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M3 3v5h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              {{ t('tools.svg-placeholder-generator.reset') }}
            </button>
          </div>

          <!-- 宽度 / 高度 -->
          <div class="field-row">
            <div class="field">
              <label class="field-label">{{ t('tools.svg-placeholder-generator.widthLabel') }}</label>
              <n-input-number
                v-model:value="width"
                class="num-input"
                :placeholder="t('tools.svg-placeholder-generator.widthPlaceholder')"
                :min="1"
                :max="4096"
              />
            </div>
            <div class="field">
              <label class="field-label">{{ t('tools.svg-placeholder-generator.heightLabel') }}</label>
              <n-input-number
                v-model:value="height"
                class="num-input"
                :placeholder="t('tools.svg-placeholder-generator.heightPlaceholder')"
                :min="1"
                :max="4096"
              />
            </div>
          </div>

          <!-- 背景色 / 文字色 -->
          <div class="field-row">
            <div class="field">
              <label class="field-label">{{ t('tools.svg-placeholder-generator.bgColor') }}</label>
              <div class="color-input-wrap">
                <input v-model="bgColor" type="color" class="color-swatch">
                <input
                  v-model="bgColor"
                  class="hex-input"
                  placeholder="#cccccc"
                  maxlength="7"
                  spellcheck="false"
                >
              </div>
            </div>
            <div class="field">
              <label class="field-label">{{ t('tools.svg-placeholder-generator.fgColor') }}</label>
              <div class="color-input-wrap">
                <input v-model="fgColor" type="color" class="color-swatch">
                <input
                  v-model="fgColor"
                  class="hex-input"
                  placeholder="#333333"
                  maxlength="7"
                  spellcheck="false"
                >
              </div>
            </div>
          </div>

          <!-- 字号 / 自定义文本 -->
          <div class="field-row">
            <div class="field">
              <label class="field-label">{{ t('tools.svg-placeholder-generator.fontSizeLabel') }}</label>
              <n-input-number
                v-model:value="fontSize"
                class="num-input"
                :placeholder="t('tools.svg-placeholder-generator.fontSizePlaceholder')"
                :min="1"
                :max="300"
              />
            </div>
            <div class="field">
              <label class="field-label">{{ t('tools.svg-placeholder-generator.customText') }}</label>
              <input
                v-model="customText"
                class="text-input"
                :placeholder="t('tools.svg-placeholder-generator.customTextPlaceholder', { w: width, h: height })"
                maxlength="100"
                spellcheck="false"
              >
            </div>
          </div>

          <!-- Use exact size 开关 -->
          <div class="field-row-inline">
            <label class="field-label">{{ t('tools.svg-placeholder-generator.exactSize') }}</label>
            <n-switch v-model:value="useExactSize" size="small" />
            <c-tooltip :tooltip="exactSizeTooltip" position="right">
              <span class="help-icon" title="">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8" />
                  <path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
              </span>
            </c-tooltip>
            <span class="switch-hint">
              {{ useExactSize ? t('tools.svg-placeholder-generator.exactSizeOn') : t('tools.svg-placeholder-generator.exactSizeOff') }}
            </span>
          </div>
        </c-card>

        <!-- 代码输出 -->
        <c-card mt-4>
          <div class="output-section">
            <div class="output-label">
              {{ t('tools.svg-placeholder-generator.svgCode') }}
            </div>
            <TextareaCopyable :value="svgString" language="html" copy-placement="top-right" />
          </div>
          <div class="output-section" mt-4>
            <div class="output-label">
              {{ t('tools.svg-placeholder-generator.base64Code') }}
            </div>
            <TextareaCopyable :value="base64" copy-placement="top-right" />
          </div>

          <!-- 下载主按钮 -->
          <div class="cta-row">
            <button class="btn-download" @click="download()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M12 3v13M6 11l6 6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M4 20h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
              {{ t('tools.svg-placeholder-generator.downloadSvg') }}
            </button>
          </div>
        </c-card>
      </div>

      <!-- ── 右侧：实时预览 (sticky) ───────────────────────────── -->
      <div class="svg-preview-panel">
        <c-card class="preview-card">
          <div class="preview-title">
            {{ t('tools.svg-placeholder-generator.livePreview') }}
          </div>
          <div class="preview-area">
            <img
              :src="base64"
              alt="SVG placeholder preview"
              class="preview-img"
            >
          </div>
          <div class="preview-meta">
            <span class="meta-chip">{{ width }} × {{ height }}</span>
            <span class="meta-chip">{{ fontSize }}px {{ t('tools.svg-placeholder-generator.fontSizeUnit') }}</span>
            <span class="meta-chip">{{ useExactSize ? t('tools.svg-placeholder-generator.exactSizeLabel') : t('tools.svg-placeholder-generator.responsiveLabel') }}</span>
          </div>
        </c-card>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.svg-root {
  max-width: 1000px;
  margin: 0 auto;
}

/* ── 双栏布局 ─────────────────────────────────────────────────── */
.svg-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 20px;
  align-items: start;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
}

/* ── 右侧 sticky ──────────────────────────────────────────────── */
.svg-preview-panel {
  position: sticky;
  top: 16px;
}

/* ── 顶部标题行 ───────────────────────────────────────────────── */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.panel-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #888;

  .dark & { color: #aaa; }
}

/* ── 重置按钮 ─────────────────────────────────────────────────── */
.reset-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #888;
  background: none;
  border: none;
  cursor: pointer;
  padding: 3px 6px;
  border-radius: 5px;
  transition: color 0.15s, background 0.15s;

  &:hover { color: #6366f1; background: rgba(99,102,241,0.07); }
  .dark & { color: #aaa; &:hover { color: #a5b4fc; } }
}

/* ── 字段行（两列） ───────────────────────────────────────────── */
.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 14px;
}

/* ── 开关行 ───────────────────────────────────────────────────── */
.field-row-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 2px;
}

/* ── 单字段 ───────────────────────────────────────────────────── */
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 12.5px;
  font-weight: 600;
  color: #444;
  .dark & { color: #ddd; }
}

/* ── 数值输入框 ───────────────────────────────────────────────── */
.num-input {
  width: 100%;
}

/* ── 文本输入框 ───────────────────────────────────────────────── */
.text-input {
  width: 100%;
  padding: 7px 10px;
  border-radius: 7px;
  border: 1.5px solid #d9d9d9;
  background: #fff;
  font-size: 13px;
  color: #222;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;

  .dark & { background: #1e1e1e; border-color: #444; color: #e0e0e0; }
  &:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
  &::placeholder { color: #bbb; }
}

/* ── 颜色选择器 ──────────────────────────────────────────────── */
.color-input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 10px;
  border-radius: 7px;
  border: 1.5px solid #d9d9d9;
  background: #fff;
  transition: border-color 0.2s;

  .dark & { background: #1e1e1e; border-color: #444; }
  &:focus-within { border-color: #6366f1; }
}

.color-swatch {
  width: 26px;
  height: 26px;
  border: none;
  padding: 0;
  border-radius: 5px;
  cursor: pointer;
  background: none;
  -webkit-appearance: none;
  flex-shrink: 0;

  &::-webkit-color-swatch-wrapper { padding: 0; }
  &::-webkit-color-swatch { border: 1.5px solid rgba(0,0,0,0.12); border-radius: 5px; }
}

.hex-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 12px;
  font-family: 'SF Mono', 'Menlo', monospace;
  font-weight: 600;
  color: #444;
  .dark & { color: #ddd; }
  &::placeholder { color: #bbb; }
}

/* ── 开关提示 ─────────────────────────────────────────────────── */
.help-icon {
  display: flex;
  align-items: center;
  color: #aaa;
  cursor: default;
  &:hover { color: #6366f1; }
}

.switch-hint {
  font-size: 11.5px;
  color: #999;
  .dark & { color: #666; }
}

/* ── 代码输出标签 ─────────────────────────────────────────────── */
.output-section { }

.output-label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 6px;
  .dark & { color: #aaa; }
}

/* ── 下载按钮 ─────────────────────────────────────────────────── */
.cta-row {
  margin-top: 14px;
  display: flex;
  justify-content: center;
}

.btn-download {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 28px;
  border-radius: 8px;
  border: none;
  background: #6366f1;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;

  &:hover { background: #4f46e5; transform: translateY(-1px); }
  &:active { transform: none; }
}

/* ── 预览卡片 ─────────────────────────────────────────────────── */
.preview-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #888;
  margin-bottom: 12px;
  .dark & { color: #aaa; }
}

.preview-area {
  border-radius: 8px;
  overflow: hidden;
  background: repeating-conic-gradient(#e5e7eb 0% 25%, #fff 0% 50%) 0 0 / 12px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;

  .dark & { background: repeating-conic-gradient(#2a2a2a 0% 25%, #1a1a1a 0% 50%) 0 0 / 12px 12px; }
}

.preview-img {
  max-width: 100%;
  display: block;
}

.preview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.meta-chip {
  display: inline-flex;
  font-size: 11px;
  color: #666;
  background: rgba(0,0,0,0.05);
  padding: 2px 8px;
  border-radius: 20px;
  .dark & { color: #bbb; background: rgba(255,255,255,0.07); }
}
</style>
