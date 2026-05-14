<script setup lang="ts">
import type { QRCodeErrorCorrectionLevel } from 'qrcode';
import QRCode from 'qrcode';
import { useStorage } from '@vueuse/core';
import { useDownloadFileFromBase64 } from '@/composable/downloadBase64';
import { useStyleStore } from '@/stores/style.store';

const styleStore = useStyleStore();

// ── 输入参数（自动 LocalStorage 持久化）────────────────────────
const text = useStorage('qr:text', 'https://it-tools.tech');
const foreground = useStorage('qr:fg', '#000000');
const background = useStorage('qr:bg', '#ffffff');
const errorCorrectionLevel = useStorage<QRCodeErrorCorrectionLevel>('qr:ec', 'M');
const margin = useStorage('qr:margin', 2);   // 边距 (0-10)
const size = useStorage('qr:size', 300);     // 预览尺寸 px

const errorCorrectionOptions = [
  { label: 'Low (7%)', value: 'L' },
  { label: 'Medium (15%)', value: 'M' },
  { label: 'Quartile (25%)', value: 'Q' },
  { label: 'High (30%)', value: 'H' },
];

// ── 生成二维码 ─────────────────────────────────────────────────
const qrcode = ref('');
const generating = ref(false);

watchEffect(async () => {
  if (!text.value.trim()) {
    qrcode.value = '';
    return;
  }
  generating.value = true;
  try {
    qrcode.value = await QRCode.toDataURL(text.value.trim(), {
      color: {
        dark: foreground.value + 'ff',
        light: background.value + 'ff',
      },
      errorCorrectionLevel: errorCorrectionLevel.value,
      margin: margin.value,
      width: 1024,
    });
  }
  catch {
    qrcode.value = '';
  }
  generating.value = false;
});

const { download } = useDownloadFileFromBase64({ source: qrcode, filename: 'qr-code.png' });

// ── 统计 ──────────────────────────────────────────────────────
const charCount = computed(() => text.value.length);
const capacityWarning = computed(() => charCount.value > 200);
</script>

<template>
  <div class="qr-root" :class="{ dark: styleStore.isDarkTheme }">
    <div class="qr-layout">
      <!-- 左：输入与参数 -->
      <div class="qr-controls">
        <c-card mb-3>
          <div class="ctrl-label">
            Content
          </div>
          <c-input-text
            v-model:value="text"
            placeholder="Enter URL, text, or any content…"
            multiline
            rows="3"
            raw-text
            autosize
            autofocus
            mb-1
          />
          <div class="char-count" :class="{ warn: capacityWarning }">
            {{ charCount }} characters
            <span v-if="capacityWarning" class="warn-hint">· Large content may reduce scannability</span>
          </div>
        </c-card>

        <c-card mb-3>
          <div class="ctrl-label">
            Colors
          </div>
          <div class="color-row">
            <div class="color-item">
              <div class="color-field-label">
                Foreground
              </div>
              <div class="color-input-wrap">
                <input v-model="foreground" type="color" class="color-swatch" :title="foreground">
                <span class="color-hex">{{ foreground.toUpperCase() }}</span>
              </div>
            </div>
            <div class="color-item">
              <div class="color-field-label">
                Background
              </div>
              <div class="color-input-wrap">
                <input v-model="background" type="color" class="color-swatch" :title="background">
                <span class="color-hex">{{ background.toUpperCase() }}</span>
              </div>
            </div>
          </div>
        </c-card>

        <c-card mb-3>
          <div class="ctrl-label">
            Settings
          </div>

          <!-- 错误纠正 -->
          <div class="setting-row">
            <div class="setting-label">
              <span>Error correction</span>
              <span class="setting-hint">Higher = more damage-tolerant</span>
            </div>
            <div class="ec-buttons">
              <button
                v-for="opt in errorCorrectionOptions"
                :key="opt.value"
                class="ec-btn"
                :class="{ active: errorCorrectionLevel === opt.value }"
                @click="errorCorrectionLevel = opt.value as QRCodeErrorCorrectionLevel"
              >
                {{ opt.value }}
              </button>
            </div>
          </div>

          <!-- 边距滑块 -->
          <div class="setting-row mt-3">
            <div class="setting-label">
              <span>Margin</span>
              <span class="setting-value-badge">{{ margin }}</span>
            </div>
            <input
              v-model.number="margin"
              type="range"
              min="0"
              max="10"
              step="1"
              class="slider"
            >
          </div>

          <!-- 预览尺寸 -->
          <div class="setting-row mt-3">
            <div class="setting-label">
              <span>Preview size</span>
              <span class="setting-value-badge">{{ size }}px</span>
            </div>
            <input
              v-model.number="size"
              type="range"
              min="100"
              max="500"
              step="10"
              class="slider"
            >
          </div>
        </c-card>
      </div>

      <!-- 右：预览区 -->
      <div class="qr-preview-panel">
        <c-card>
          <div class="preview-header">
            <span class="ctrl-label">Preview</span>
            <div class="preview-actions">
              <c-button variant="text" size="small" @click="download">
                <icon-mdi-download style="margin-right: 4px" />
                Download PNG
              </c-button>
            </div>
          </div>

          <div class="qr-preview-wrap" :style="{ background: background }">
            <template v-if="qrcode && !generating">
              <img
                :src="qrcode"
                :width="size"
                :height="size"
                alt="QR Code"
                class="qr-img"
              >
            </template>
            <div v-else-if="generating" class="qr-loading">
              <div class="qr-spinner" />
            </div>
            <div v-else class="qr-empty">
              Enter content above to generate QR code
            </div>
          </div>

          <!-- 二维码信息 -->
          <div v-if="qrcode" class="qr-meta">
            <span class="meta-item">
              <icon-mdi-qrcode style="opacity:0.5; font-size:13px" />
              {{ errorCorrectionLevel }} correction
            </span>
            <span class="meta-item">
              <icon-mdi-border-all style="opacity:0.5; font-size:13px" />
              margin: {{ margin }}
            </span>
          </div>
        </c-card>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.qr-root {
  max-width: 900px;
  margin: 0 auto;
}

.qr-layout {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 16px;
  align-items: start;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

.ctrl-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.5;
  margin-bottom: 10px;
}

.char-count {
  font-size: 12px;
  opacity: 0.45;
  text-align: right;
  margin-top: 4px;

  &.warn {
    color: #f59e0b;
    opacity: 0.85;
  }
}

.warn-hint {
  font-size: 11px;
}

// ── 颜色选择 ───────────────────────────────────────────────────
.color-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.color-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.color-field-label {
  font-size: 12px;
  opacity: 0.55;
}

.color-input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid rgba(99,102,241,0.15);
  background: rgba(99,102,241,0.04);
  cursor: pointer;
  transition: border-color 0.15s;

  &:hover {
    border-color: rgba(99,102,241,0.3);
  }
}

.color-swatch {
  width: 28px;
  height: 28px;
  border: none;
  padding: 0;
  border-radius: 6px;
  cursor: pointer;
  background: none;
  -webkit-appearance: none;
  flex-shrink: 0;

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  &::-webkit-color-swatch {
    border: 2px solid rgba(0,0,0,0.12);
    border-radius: 6px;
  }
}

.color-hex {
  font-family: 'SF Mono', monospace;
  font-size: 12px;
  font-weight: 600;
  opacity: 0.8;
}

// ── 设置行 ─────────────────────────────────────────────────────
.setting-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.setting-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
}

.setting-hint {
  font-size: 11px;
  opacity: 0.45;
}

.setting-value-badge {
  font-size: 12px;
  font-weight: 700;
  background: rgba(99,102,241,0.1);
  color: #6366f1;
  padding: 1px 8px;
  border-radius: 20px;
}

// ── EC 按钮 ────────────────────────────────────────────────────
.ec-buttons {
  display: flex;
  gap: 6px;
}

.ec-btn {
  flex: 1;
  padding: 5px 0;
  border-radius: 8px;
  border: 1.5px solid rgba(99,102,241,0.18);
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  color: inherit;
  opacity: 0.6;
  transition: all 0.15s;

  &:hover {
    border-color: rgba(99,102,241,0.4);
    opacity: 0.9;
  }

  &.active {
    background: rgba(99,102,241,0.12);
    border-color: #6366f1;
    color: #6366f1;
    opacity: 1;
  }
}

// ── 滑块 ──────────────────────────────────────────────────────
.slider {
  width: 100%;
  -webkit-appearance: none;
  height: 4px;
  border-radius: 4px;
  background: rgba(99,102,241,0.2);
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #6366f1;
    cursor: pointer;
    box-shadow: 0 1px 4px rgba(99,102,241,0.4);
    transition: transform 0.1s;

    &:hover {
      transform: scale(1.2);
    }
  }
}

// ── 预览 ──────────────────────────────────────────────────────
.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;

  .ctrl-label {
    margin-bottom: 0;
  }
}

.preview-actions {
  display: flex;
  align-items: center;
}

.qr-preview-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  min-height: 180px;
  padding: 12px;
  transition: background 0.2s;
}

.qr-img {
  max-width: 100%;
  border-radius: 6px;
}

.qr-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
}

.qr-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(99,102,241,0.2);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.qr-empty {
  font-size: 13px;
  opacity: 0.4;
  text-align: center;
  padding: 20px;
}

// ── Meta ──────────────────────────────────────────────────────
.qr-meta {
  display: flex;
  gap: 12px;
  margin-top: 10px;
  font-size: 12px;
  opacity: 0.5;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.mt-3 {
  margin-top: 12px;
}
</style>
