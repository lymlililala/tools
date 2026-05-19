<script setup lang="ts">
import type { QRCodeErrorCorrectionLevel } from 'qrcode';
import QRCode from 'qrcode';
import { useStorage, useClipboard } from '@vueuse/core';
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
  { label: 'L – 低 (7%)', value: 'L', short: 'L' },
  { label: 'M – 中 (15%)', value: 'M', short: 'M' },
  { label: 'Q – 较高 (25%)', value: 'Q', short: 'Q' },
  { label: 'H – 最高 (30%)', value: 'H', short: 'H' },
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

// ── 前背景色相同警告 ───────────────────────────────────────────
const sameColorWarning = computed(() => foreground.value.toLowerCase() === background.value.toLowerCase());

// ── 复制图片到剪贴板 ───────────────────────────────────────────
const copyImgFeedback = ref(false);
async function copyImage() {
  if (!qrcode.value) return;
  try {
    const blob = await (await fetch(qrcode.value)).blob();
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ]);
    copyImgFeedback.value = true;
    setTimeout(() => (copyImgFeedback.value = false), 2000);
  }
  catch {
    // 部分浏览器不支持 clipboard.write，降级为复制 data URL
    const { copy } = useClipboard({ legacy: true });
    await copy(qrcode.value);
    copyImgFeedback.value = true;
    setTimeout(() => (copyImgFeedback.value = false), 2000);
  }
}
</script>

<template>
  <div class="qr-root" :class="{ dark: styleStore.isDarkTheme }">
    <div class="qr-layout">
      <!-- 左：输入与参数 -->
      <div class="qr-controls">
        <!-- 内容 -->
        <c-card mb-3>
          <div class="ctrl-label">
            二维码内容
          </div>
          <c-input-text
            v-model:value="text"
            placeholder="请输入网址、文本或任意内容…"
            multiline
            rows="3"
            raw-text
            autosize
            autofocus
            mb-1
          />
          <div class="char-count" :class="{ warn: capacityWarning }">
            {{ charCount }} 字符
            <span v-if="capacityWarning" class="warn-hint">· 内容过多可能影响扫码识别率</span>
          </div>
        </c-card>

        <!-- 颜色 -->
        <c-card mb-3>
          <div class="ctrl-label">
            颜色设置
          </div>
          <div class="color-row">
            <div class="color-item">
              <div class="color-field-label">
                前景色（码点颜色）
              </div>
              <div class="color-input-wrap">
                <input v-model="foreground" type="color" class="color-swatch" :title="foreground">
                <span class="color-hex">{{ foreground.toUpperCase() }}</span>
              </div>
            </div>
            <div class="color-item">
              <div class="color-field-label">
                背景色
              </div>
              <div class="color-input-wrap">
                <input v-model="background" type="color" class="color-swatch" :title="background">
                <span class="color-hex">{{ background.toUpperCase() }}</span>
              </div>
            </div>
          </div>
          <!-- 前背景色相同警告 -->
          <transition name="err-slide">
            <div v-if="sameColorWarning" class="color-warning">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style="flex-shrink:0">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.5" />
                <path d="M8 5v3M8 10.5v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
              前景色与背景色相同，二维码将无法被扫描识别
            </div>
          </transition>
        </c-card>

        <!-- 高级设置 -->
        <c-card>
          <div class="ctrl-label">
            高级设置
          </div>

          <!-- 容错率 -->
          <div class="setting-row">
            <div class="setting-label">
              <span>容错率</span>
              <span class="setting-hint">越高 → 损坏后越易识别</span>
            </div>
            <div class="ec-buttons">
              <button
                v-for="opt in errorCorrectionOptions"
                :key="opt.value"
                class="ec-btn"
                :class="{ active: errorCorrectionLevel === opt.value }"
                :title="opt.label"
                @click="errorCorrectionLevel = opt.value as QRCodeErrorCorrectionLevel"
              >
                {{ opt.short }}
              </button>
            </div>
          </div>

          <!-- 边距滑块 -->
          <div class="setting-row mt-3">
            <div class="setting-label">
              <span>白边边距</span>
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
              <span>预览尺寸</span>
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

      <!-- 右：预览区（sticky 定位，不随左侧滚动） -->
      <div class="qr-preview-panel">
        <c-card class="preview-card">
          <div class="preview-header">
            <span class="ctrl-label">实时预览</span>
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
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity="0.25">
                <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2" fill="none" />
                <rect x="28" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2" fill="none" />
                <rect x="4" y="28" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2" fill="none" />
                <rect x="8" y="8" width="8" height="8" rx="1" fill="currentColor" />
                <rect x="32" y="8" width="8" height="8" rx="1" fill="currentColor" />
                <rect x="8" y="32" width="8" height="8" rx="1" fill="currentColor" />
                <rect x="30" y="30" width="4" height="4" fill="currentColor" />
                <rect x="37" y="30" width="4" height="4" fill="currentColor" />
                <rect x="30" y="37" width="4" height="4" fill="currentColor" />
                <rect x="37" y="37" width="4" height="4" fill="currentColor" />
              </svg>
              <span>在左侧输入内容后<br>自动生成二维码</span>
            </div>
          </div>

          <!-- 二维码信息 -->
          <div v-if="qrcode" class="qr-meta">
            <span class="meta-item">
              <icon-mdi-qrcode style="font-size:13px" />
              容错 {{ errorCorrectionLevel }}
            </span>
            <span class="meta-item">
              <icon-mdi-border-all style="font-size:13px" />
              边距 {{ margin }}
            </span>
            <span class="meta-item">
              <icon-mdi-image-size-select-actual style="font-size:13px" />
              {{ size }}px
            </span>
          </div>

          <!-- 主操作区 -->
          <div class="preview-cta">
            <button
              class="btn-download"
              :disabled="!qrcode || generating"
              @click="download"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 3v13M6 11l6 6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M4 20h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
              下载 PNG
            </button>
            <button
              class="btn-copy-img"
              :class="{ copied: copyImgFeedback }"
              :disabled="!qrcode || generating"
              :title="copyImgFeedback ? '已复制！' : '复制图片到剪贴板'"
              @click="copyImage"
            >
              <svg v-if="!copyImgFeedback" width="15" height="15" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2" />
              </svg>
              <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              {{ copyImgFeedback ? '已复制' : '复制图片' }}
            </button>
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
  grid-template-columns: 1fr 300px;
  gap: 16px;
  align-items: start;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
}

// 右侧预览卡片 sticky
.qr-preview-panel {
  position: sticky;
  top: 16px;
}

.ctrl-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #888;
  margin-bottom: 10px;

  .dark & { color: #aaa; }
}

.char-count {
  font-size: 12px;
  color: #999;
  text-align: right;
  margin-top: 4px;

  &.warn {
    color: #f59e0b;
  }

  .dark & { color: #666; }
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
  color: #666;
  .dark & { color: #bbb; }
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
    border-color: rgba(99,102,241,0.35);
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

  &::-webkit-color-swatch-wrapper { padding: 0; }
  &::-webkit-color-swatch { border: 2px solid rgba(0,0,0,0.12); border-radius: 6px; }
}

.color-hex {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 12px;
  font-weight: 600;
  color: #444;
  .dark & { color: #ddd; }
}

// ── 颜色警告 ──────────────────────────────────────────────────
.color-warning {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  font-size: 12px;
  color: #d97706;
  padding: 6px 10px;
  background: rgba(245, 158, 11, 0.08);
  border-radius: 6px;
  border: 1px solid rgba(245, 158, 11, 0.25);
}

.err-slide-enter-active,
.err-slide-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.err-slide-enter-from,
.err-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
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
  color: #333;
  .dark & { color: #ddd; }
}

.setting-hint {
  font-size: 11px;
  color: #888;
  .dark & { color: #aaa; }
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
  border: 1.5px solid rgba(99,102,241,0.2);
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  color: #555;
  transition: all 0.15s;

  .dark & { color: #ccc; border-color: rgba(99,102,241,0.25); }

  &:hover {
    border-color: rgba(99,102,241,0.5);
    color: #6366f1;
  }

  &.active {
    background: rgba(99,102,241,0.12);
    border-color: #6366f1;
    color: #6366f1;
  }
}

// ── 滑块 ──────────────────────────────────────────────────────
.slider {
  width: 100%;
  -webkit-appearance: none;
  height: 4px;
  border-radius: 4px;
  background: rgba(99,102,241,0.18);
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
    &:hover { transform: scale(1.2); }
  }
}

// ── 预览 ──────────────────────────────────────────────────────
.preview-header {
  margin-bottom: 12px;

  .ctrl-label { margin-bottom: 0; }
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
  border-radius: 4px;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #aaa;
  text-align: center;
  padding: 24px 16px;
  line-height: 1.6;

  .dark & { color: #555; }
}

// ── Meta ──────────────────────────────────────────────────────
.qr-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
  font-size: 11.5px;
  color: #888;
  .dark & { color: #aaa; }
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 3px;
}

// ── CTA 操作区 ────────────────────────────────────────────────
.preview-cta {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}

.btn-download {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 14px;
  border-radius: 8px;
  border: none;
  background: #6366f1;
  color: #fff;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s, transform 0.1s;

  &:hover:not(:disabled) {
    background: #4f46e5;
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: none;
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
}

.btn-copy-img {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 9px 12px;
  border-radius: 8px;
  border: 1.5px solid #d1d5db;
  background: transparent;
  color: #555;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    border-color: #9ca3af;
    background: #f3f4f6;
    color: #222;
  }

  &.copied {
    border-color: #22c55e;
    background: rgba(34, 197, 94, 0.08);
    color: #16a34a;
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .dark & {
    border-color: #444;
    color: #ccc;

    &:hover:not(:disabled) {
      border-color: #666;
      background: #2a2a2a;
      color: #eee;
    }

    &.copied {
      border-color: #22c55e;
      background: rgba(34, 197, 94, 0.1);
      color: #4ade80;
    }
  }
}

.mt-3 {
  margin-top: 12px;
}
</style>
