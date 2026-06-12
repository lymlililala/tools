<script setup lang="ts">
// eslint-disable-next-line no-restricted-imports
import { useClipboard } from '@vueuse/core';
import {
  EAPMethods,
  EAPPhase2Methods,
  useWifiQRCode,
} from './useQRCode';
import { useDownloadFileFromBase64 } from '@/composable/downloadBase64';
import { useStyleStore } from '@/stores/style.store';

const styleStore = useStyleStore();
const { t } = useI18n();

// ── 颜色（只存 6 位 hex，内部拼接 ff 用于 useWifiQRCode） ────────
const fgHex = ref('#000000');
const bgHex = ref('#ffffff');
const foreground = computed(() => `${fgHex.value}ff`);
const background = computed(() => `${bgHex.value}ff`);

const ssid = ref('');
const password = ref('');
const eapMethod = ref<string>();
const isHiddenSSID = ref(false);
const eapAnonymous = ref(false);
const eapIdentity = ref('');
const eapPhase2Method = ref<string>();

const { qrcode, encryption } = useWifiQRCode({
  ssid,
  password,
  eapMethod: eapMethod as any,
  isHiddenSSID,
  eapAnonymous,
  eapIdentity,
  eapPhase2Method: eapPhase2Method as any,
  color: { background, foreground },
  options: { width: 1024 },
});

const { download } = useDownloadFileFromBase64({ source: qrcode, filename: 'wifi-qr-code.png' });

// ── 状态判断 ──────────────────────────────────────────────────
const needPassword = computed(() => encryption.value !== 'nopass');
const isEAP = computed(() => encryption.value === 'WPA2-EAP');
const sameColor = computed(() => fgHex.value.toLowerCase() === bgHex.value.toLowerCase());
const canDownload = computed(() => !!qrcode.value && !!ssid.value.trim());

// ── 密码可见 ──────────────────────────────────────────────────
const showPassword = ref(false);

// ── 复制图片 ──────────────────────────────────────────────────
const copyFeedback = ref(false);
async function copyImage() {
  if (!qrcode.value) {
    return;
  }
  try {
    const blob = await (await fetch(qrcode.value)).blob();
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
  }
  catch {
    const { copy } = useClipboard({ legacy: true });
    await copy(qrcode.value);
  }
  copyFeedback.value = true;
  setTimeout(() => (copyFeedback.value = false), 2000);
}

// ── 加密方式选项 ─────────────────────────────────────────────
const encryptionOptions = computed(() => [
  { label: `WPA / WPA2 (${t('tools.wifi-qr-code-generator.recommended')})`, value: 'WPA' },
  { label: 'WEP', value: 'WEP' },
  { label: t('tools.wifi-qr-code-generator.noPassword'), value: 'nopass' },
  { label: `WPA2-EAP (${t('tools.wifi-qr-code-generator.enterprise')})`, value: 'WPA2-EAP' },
]);
</script>

<template>
  <div class="wifi-root" :class="{ dark: styleStore.isDarkTheme }">
    <div class="wifi-layout">
      <!-- ── 左侧：表单 ─────────────────────────────────────── -->
      <div class="wifi-form">
        <!-- 加密方式 -->
        <div class="field">
          <label class="field-label">{{ t('tools.wifi-qr-code-generator.encryption') }}</label>
          <c-select
            v-model:value="encryption"
            :options="encryptionOptions"
          />
        </div>

        <!-- SSID -->
        <div class="field">
          <label class="field-label">
            {{ t('tools.wifi-qr-code-generator.ssidLabel') }}
            <span class="required">*</span>
          </label>
          <div class="ssid-row">
            <input
              v-model="ssid"
              class="text-input"
              :placeholder="t('tools.wifi-qr-code-generator.ssidPlaceholder')"
              maxlength="32"
              autocomplete="off"
              spellcheck="false"
            >
            <label class="checkbox-label">
              <input v-model="isHiddenSSID" type="checkbox" class="checkbox">
              <span>{{ t('tools.wifi-qr-code-generator.hiddenNetwork') }}</span>
            </label>
          </div>
        </div>

        <!-- 密码 -->
        <div v-if="needPassword" class="field">
          <label class="field-label">{{ t('tools.wifi-qr-code-generator.passwordLabel') }}</label>
          <div class="password-wrap">
            <input
              v-model="password"
              class="text-input"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="t('tools.wifi-qr-code-generator.passwordPlaceholder')"
              maxlength="63"
              autocomplete="off"
            >
            <button class="eye-btn" :title="showPassword ? t('tools.wifi-qr-code-generator.hidePassword') : t('tools.wifi-qr-code-generator.showPassword')" @click="showPassword = !showPassword">
              <svg v-if="!showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" stroke-width="2" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <!-- EAP 专属字段 -->
        <template v-if="isEAP">
          <div class="field">
            <label class="field-label">{{ t('tools.wifi-qr-code-generator.eapMethod') }}</label>
            <c-select
              v-model:value="eapMethod"
              :options="EAPMethods.map(m => ({ label: m, value: m }))"
              searchable
            />
          </div>
          <div class="field">
            <label class="field-label">
              {{ t('tools.wifi-qr-code-generator.eapIdentityLabel') }}
              <label class="checkbox-label inline-ml">
                <input v-model="eapAnonymous" type="checkbox" class="checkbox">
                <span>{{ t('tools.wifi-qr-code-generator.anonymous') }}</span>
              </label>
            </label>
            <input
              v-model="eapIdentity"
              class="text-input"
              :placeholder="t('tools.wifi-qr-code-generator.eapIdentityPlaceholder')"
              :disabled="eapAnonymous"
            >
          </div>
          <div class="field">
            <label class="field-label">{{ t('tools.wifi-qr-code-generator.eapPhase2Label') }}</label>
            <c-select
              v-model:value="eapPhase2Method"
              :options="EAPPhase2Methods.map(m => ({ label: m, value: m }))"
            />
          </div>
        </template>

        <!-- 颜色设置 -->
        <div class="field">
          <label class="field-label">{{ t('tools.wifi-qr-code-generator.colorSettings') }}</label>
          <div class="color-row">
            <div class="color-item">
              <span class="color-sub-label">{{ t('tools.wifi-qr-code-generator.fgColor') }}</span>
              <div class="color-input-wrap">
                <input v-model="fgHex" type="color" class="color-swatch">
                <input
                  v-model="fgHex"
                  class="hex-input"
                  placeholder="#000000"
                  maxlength="7"
                  spellcheck="false"
                >
              </div>
            </div>
            <div class="color-item">
              <span class="color-sub-label">{{ t('tools.wifi-qr-code-generator.bgColor') }}</span>
              <div class="color-input-wrap">
                <input v-model="bgHex" type="color" class="color-swatch">
                <input
                  v-model="bgHex"
                  class="hex-input"
                  placeholder="#ffffff"
                  maxlength="7"
                  spellcheck="false"
                >
              </div>
            </div>
          </div>
          <!-- 相同色警告 -->
          <transition name="err-slide">
            <div v-if="sameColor" class="color-warning">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style="flex-shrink:0">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.5" />
                <path d="M8 5v3M8 10.5v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
              {{ t('tools.wifi-qr-code-generator.sameColorWarning') }}
            </div>
          </transition>
        </div>
      </div>

      <!-- ── 右侧：预览 (sticky) ──────────────────────────────── -->
      <div class="wifi-preview">
        <c-card class="preview-card">
          <div class="preview-title">
            {{ t('tools.wifi-qr-code-generator.livePreview') }}
          </div>

          <!-- QR 区域 -->
          <div class="qr-area" :style="{ background: bgHex }">
            <template v-if="qrcode && ssid.trim()">
              <img :src="qrcode" alt="WiFi QR Code" class="qr-img">
            </template>
            <div v-else class="qr-empty">
              <svg width="52" height="52" viewBox="0 0 52 52" fill="none" opacity="0.22">
                <rect x="4" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" fill="none" />
                <rect x="30" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" fill="none" />
                <rect x="4" y="30" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" fill="none" />
                <rect x="8" y="8" width="10" height="10" rx="1" fill="currentColor" />
                <rect x="34" y="8" width="10" height="10" rx="1" fill="currentColor" />
                <rect x="8" y="34" width="10" height="10" rx="1" fill="currentColor" />
                <rect x="32" y="32" width="5" height="5" fill="currentColor" />
                <rect x="40" y="32" width="5" height="5" fill="currentColor" />
                <rect x="32" y="40" width="5" height="5" fill="currentColor" />
                <rect x="40" y="40" width="5" height="5" fill="currentColor" />
              </svg>
              <span>{{ t('tools.wifi-qr-code-generator.qrEmptyHint') }}</span>
            </div>
          </div>

          <!-- 信息标签 -->
          <div v-if="qrcode && ssid.trim()" class="qr-meta">
            <span class="meta-chip">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" /></svg>
              {{ ssid }}
            </span>
            <span class="meta-chip">{{ encryption === 'nopass' ? t('tools.wifi-qr-code-generator.noPassword') : encryption }}</span>
            <span v-if="isHiddenSSID" class="meta-chip">{{ t('tools.wifi-qr-code-generator.hiddenNetwork') }}</span>
          </div>

          <!-- CTA 按钮 -->
          <div class="preview-cta">
            <button class="btn-download" :disabled="!canDownload" @click="download">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M12 3v13M6 11l6 6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M4 20h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
              {{ t('tools.wifi-qr-code-generator.downloadPng') }}
            </button>
            <button
              class="btn-copy"
              :class="{ copied: copyFeedback }"
              :disabled="!canDownload"
              @click="copyImage"
            >
              <svg v-if="!copyFeedback" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2" />
              </svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              {{ copyFeedback ? t('tools.wifi-qr-code-generator.copied') : t('tools.wifi-qr-code-generator.copyImage') }}
            </button>
          </div>

          <p v-if="!ssid.trim()" class="hint-text">
            {{ t('tools.wifi-qr-code-generator.ssidRequired') }}
          </p>
        </c-card>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.wifi-root {
  max-width: 900px;
  margin: 0 auto;
}

/* ── 双栏布局 ────────────────────────────────────────────────── */
.wifi-layout {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 20px;
  align-items: start;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
}

/* ── 右侧 sticky ─────────────────────────────────────────────── */
.wifi-preview {
  position: sticky;
  top: 16px;
}

/* ── 表单字段（顶部对齐） ───────────────────────────────────── */
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 18px;

  &:last-child { margin-bottom: 0; }
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 6px;

  .dark & { color: #ddd; }
}

.required {
  color: #ef4444;
  font-size: 14px;
  line-height: 1;
}

/* ── 通用文本输入框 ──────────────────────────────────────────── */
.text-input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1.5px solid #d9d9d9;
  background: #fff;
  font-size: 14px;
  color: #222;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;

  .dark & {
    background: #1e1e1e;
    border-color: #444;
    color: #e0e0e0;
  }

  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &::placeholder { color: #aaa; }
}

/* ── SSID 行 ─────────────────────────────────────────────────── */
.ssid-row {
  display: flex;
  align-items: center;
  gap: 12px;

  .text-input { flex: 1; }
}

/* ── 密码行 ──────────────────────────────────────────────────── */
.password-wrap {
  position: relative;
  display: flex;
  align-items: center;

  .text-input { padding-right: 38px; }
}

.eye-btn {
  position: absolute;
  right: 10px;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #888;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: color 0.15s;

  &:hover { color: #333; }
  .dark & { color: #aaa; &:hover { color: #eee; } }
}

/* ── Checkbox ───────────────────────────────────────────────── */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #555;
  cursor: pointer;
  white-space: nowrap;
  .dark & { color: #bbb; }
}

.inline-ml { margin-left: 12px; }

.checkbox {
  width: 15px;
  height: 15px;
  cursor: pointer;
  accent-color: #6366f1;
}

/* ── 颜色设置 ───────────────────────────────────────────────── */
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

.color-sub-label {
  font-size: 12px;
  color: #777;
  .dark & { color: #aaa; }
}

.color-input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1.5px solid #e0e0e0;
  background: #fafafa;
  transition: border-color 0.2s;

  .dark & { background: #1e1e1e; border-color: #444; }
  &:focus-within { border-color: #6366f1; }
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
  &::-webkit-color-swatch { border: 1.5px solid rgba(0,0,0,0.12); border-radius: 6px; }
}

.hex-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 12.5px;
  font-family: 'SF Mono', 'Menlo', monospace;
  font-weight: 600;
  color: #444;
  .dark & { color: #ddd; }
  &::placeholder { color: #bbb; }
}

/* ── 颜色警告 ───────────────────────────────────────────────── */
.color-warning {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 12px;
  color: #d97706;
  padding: 6px 10px;
  background: rgba(245, 158, 11, 0.08);
  border-radius: 6px;
  border: 1px solid rgba(245, 158, 11, 0.25);
}

.err-slide-enter-active, .err-slide-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.err-slide-enter-from, .err-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ── 预览卡片 ───────────────────────────────────────────────── */
.preview-card { overflow: hidden; }

.preview-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #888;
  margin-bottom: 12px;
  .dark & { color: #aaa; }
}

/* ── QR 图像区 ──────────────────────────────────────────────── */
.qr-area {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 180px;
  border-radius: 10px;
  padding: 12px;
  transition: background 0.2s;
}

.qr-img {
  max-width: 100%;
  width: 200px;
  height: 200px;
  border-radius: 4px;
}

.qr-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: #bbb;
  font-size: 12.5px;
  text-align: center;
  padding: 24px;
  line-height: 1.6;
  .dark & { color: #555; }
}

/* ── Meta 标签 ──────────────────────────────────────────────── */
.qr-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #666;
  background: rgba(0,0,0,0.05);
  padding: 2px 8px;
  border-radius: 20px;
  .dark & { color: #bbb; background: rgba(255,255,255,0.07); }
}

/* ── CTA 按钮 ───────────────────────────────────────────────── */
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
  transition: background 0.15s, transform 0.1s, opacity 0.15s;

  &:hover:not(:disabled) { background: #4f46e5; transform: translateY(-1px); }
  &:active:not(:disabled) { transform: none; }
  &:disabled { opacity: 0.35; cursor: not-allowed; }
}

.btn-copy {
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

  &:hover:not(:disabled) { border-color: #9ca3af; background: #f3f4f6; color: #222; }
  &.copied { border-color: #22c55e; background: rgba(34,197,94,0.08); color: #16a34a; }
  &:disabled { opacity: 0.35; cursor: not-allowed; }

  .dark & {
    border-color: #444; color: #ccc;
    &:hover:not(:disabled) { border-color: #666; background: #2a2a2a; color: #eee; }
    &.copied { border-color: #22c55e; background: rgba(34,197,94,0.1); color: #4ade80; }
  }
}

/* ── 提示文字 ───────────────────────────────────────────────── */
.hint-text {
  margin-top: 8px;
  font-size: 12px;
  color: #aaa;
  text-align: center;
  .dark & { color: #555; }
}
</style>
