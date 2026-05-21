<script setup lang="ts">
import { useClipboard } from '@vueuse/core';
import { useStorage } from '@vueuse/core';
import CryptoJS from 'crypto-js';
import { decodeJwt } from './jwt-parser.service';
import { withDefaultOnError } from '@/utils/defaults';
import { useStyleStore } from '@/stores/style.store';

const { copy } = useClipboard();
const styleStore = useStyleStore();

// ── JWT 输入 ──────────────────────────────────────────────────────────────
const rawJwt = useStorage(
  'jwt:raw',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
);

// 是否是合法三段式
const jwtParts = computed(() => {
  const parts = rawJwt.value.trim().split('.');
  return {
    header: parts[0] ?? '',
    payload: parts[1] ?? '',
    signature: parts[2] ?? '',
    count: parts.length,
  };
});

const isEmpty = computed(() => rawJwt.value.trim() === '');

const isValidFormat = computed(() => {
  if (isEmpty.value) return false;
  return jwtParts.value.count === 3 && jwtParts.value.header && jwtParts.value.payload;
});

const decodedJWT = computed(() =>
  withDefaultOnError(() => decodeJwt({ jwt: rawJwt.value }), { header: [], payload: [] }),
);

const isDecodeSuccess = computed(() => {
  if (!isValidFormat.value) return false;
  try {
    decodeJwt({ jwt: rawJwt.value });
    return true;
  }
  catch {
    return false;
  }
});

// ── 复制反馈 ───────────────────────────────────────────────────────────────
const copiedKey = ref('');
async function docopy(key: string, text: string) {
  await copy(text);
  copiedKey.value = key;
  setTimeout(() => { copiedKey.value = ''; }, 1400);
}

function copyToken() { docopy('token', rawJwt.value); }
function clearToken() { rawJwt.value = ''; }

async function copySection(key: string, items: { claim: string; value: string }[]) {
  const obj: Record<string, string> = {};
  for (const { claim, value } of items)
    obj[claim] = value;
  await copy(JSON.stringify(obj, null, 2));
  copiedKey.value = key;
  setTimeout(() => { copiedKey.value = ''; }, 1400);
}

function copyHeaderJson() { copySection('header', decodedJWT.value.header); }
function copyPayloadJson() { copySection('payload', decodedJWT.value.payload); }

// ── 签名验证 ──────────────────────────────────────────────────────────────
const secretKey = ref('');
const showSecret = ref(false);

type VerifyState = 'idle' | 'valid' | 'invalid' | 'unsupported';

const verifyState = computed<VerifyState>(() => {
  if (!isDecodeSuccess.value || !secretKey.value.trim()) return 'idle';

  // 只支持 HS256/HS384/HS512
  const alg = (decodedJWT.value.header.find(h => h.claim === 'alg')?.value ?? '').toUpperCase();
  const algMap: Record<string, string> = { HS256: 'SHA256', HS384: 'SHA384', HS512: 'SHA512' };
  const hashAlg = algMap[alg];
  if (!hashAlg) return 'unsupported';

  try {
    const signingInput = `${jwtParts.value.header}.${jwtParts.value.payload}`;
    const hmac = CryptoJS.HmacSHA256
      ? (hashAlg === 'SHA256'
          ? CryptoJS.HmacSHA256(signingInput, secretKey.value)
          : hashAlg === 'SHA384'
            ? CryptoJS.HmacSHA384(signingInput, secretKey.value)
            : CryptoJS.HmacSHA512(signingInput, secretKey.value))
      : null;
    if (!hmac) return 'unsupported';

    // Base64URL encode
    const b64 = CryptoJS.enc.Base64.stringify(hmac)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return b64 === jwtParts.value.signature ? 'valid' : 'invalid';
  }
  catch {
    return 'unsupported';
  }
});

// ── 颜色配置 ──────────────────────────────────────────────────────────────
const COLORS = {
  header: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.4)', text: '#ef4444', badge: '#ef4444' },
  payload: { bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.4)', text: '#a855f7', badge: '#a855f7' },
  // 加深绿色以满足 WCAG 对比度
  signature: { bg: 'rgba(22,163,74,0.1)', border: 'rgba(22,163,74,0.4)', text: '#16a34a', badge: '#16a34a' },
};
</script>

<template>
  <div class="jwt-container tool-wide" :class="{ dark: styleStore.isDarkTheme }">
    <!-- ① 输入区 ────────────────────────────────────────────────────── -->
    <c-card mb-4>
      <div class="input-header">
        <span class="jwt-input-label">JWT Token</span>
        <div class="input-actions">
          <n-tooltip v-if="rawJwt" trigger="hover" placement="top">
            <template #trigger>
              <button
                class="icon-btn"
                :class="{ 'icon-btn-success': copiedKey === 'token' }"
                @click="copyToken"
              >
                <icon-mdi-check v-if="copiedKey === 'token'" class="btn-icon" />
                <icon-mdi-content-copy v-else class="btn-icon" />
              </button>
            </template>
            {{ copiedKey === 'token' ? 'Copied!' : 'Copy token' }}
          </n-tooltip>
          <n-tooltip v-if="rawJwt" trigger="hover" placement="top">
            <template #trigger>
              <button class="icon-btn icon-btn-danger" @click="clearToken">
                <icon-mdi-close class="btn-icon" />
              </button>
            </template>
            Clear
          </n-tooltip>
        </div>
      </div>

      <textarea
        v-model="rawJwt"
        class="jwt-textarea"
        :class="{ 'has-error': !isEmpty && !isDecodeSuccess }"
        placeholder="Paste your JWT here…&#10;e.g. eyJhbGci…"
        rows="5"
        spellcheck="false"
        autocomplete="off"
      />

      <!-- 错误提示 -->
      <transition name="err-slide">
        <div v-if="!isEmpty && !isDecodeSuccess" class="error-inline">
          <icon-mdi-alert-circle-outline class="ei-icon" />
          <span>Invalid JWT — must have 3 Base64URL-encoded segments separated by dots</span>
        </div>
      </transition>

      <!-- 彩色分段展示 -->
      <div v-if="isDecodeSuccess" class="jwt-colored-preview">
        <span class="jwt-seg jwt-seg--header">{{ jwtParts.header }}</span>
        <span class="jwt-dot">.</span>
        <span class="jwt-seg jwt-seg--payload">{{ jwtParts.payload }}</span>
        <span class="jwt-dot">.</span>
        <span class="jwt-seg jwt-seg--signature">{{ jwtParts.signature }}</span>
      </div>

      <!-- 图例 -->
      <div v-if="isDecodeSuccess" class="jwt-legend">
        <span class="legend-item" style="color: #ef4444">
          <span class="legend-dot" style="background:#ef4444" />
          Header
        </span>
        <span class="legend-item" style="color: #a855f7">
          <span class="legend-dot" style="background:#a855f7" />
          Payload
        </span>
        <span class="legend-item" style="color: #16a34a">
          <span class="legend-dot" style="background:#16a34a" />
          Signature
        </span>
      </div>
    </c-card>

    <!-- ② 空状态 ──────────────────────────────────────────────────────── -->
    <div v-if="isEmpty" class="empty-state">
      <icon-mdi-shield-key-outline class="es-icon" />
      <span class="es-text">Paste a JWT token above to decode and inspect it</span>
    </div>

    <!-- ③ 解析结果 ────────────────────────────────────────────────────── -->
    <div v-if="isDecodeSuccess" class="jwt-sections">
      <!-- Header -->
      <div class="jwt-section" :style="{ background: COLORS.header.bg, borderColor: COLORS.header.border }">
        <div class="section-header" :style="{ color: COLORS.header.text }">
          <span class="section-badge" :style="{ background: COLORS.header.badge }">H</span>
          Header
          <div class="section-actions">
            <n-tooltip trigger="hover" placement="top">
              <template #trigger>
                <button
                  class="icon-btn small"
                  :class="{ 'icon-btn-success': copiedKey === 'header' }"
                  @click="copyHeaderJson"
                >
                  <icon-mdi-check v-if="copiedKey === 'header'" class="btn-icon" />
                  <icon-mdi-content-copy v-else class="btn-icon" />
                </button>
              </template>
              {{ copiedKey === 'header' ? 'Copied!' : 'Copy as JSON' }}
            </n-tooltip>
          </div>
        </div>
        <div class="kv-list">
          <div
            v-for="{ claim, claimDescription, friendlyValue, value } in decodedJWT.header"
            :key="claim + value"
            class="kv-row"
          >
            <div class="kv-key">
              <span class="kv-claim" :style="{ color: COLORS.header.text }">{{ claim }}</span>
              <span v-if="claimDescription" class="kv-desc">{{ claimDescription }}</span>
            </div>
            <div class="kv-value">
              <span>{{ value }}</span>
              <span v-if="friendlyValue" class="kv-friendly">{{ friendlyValue }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Payload -->
      <div class="jwt-section" :style="{ background: COLORS.payload.bg, borderColor: COLORS.payload.border }">
        <div class="section-header" :style="{ color: COLORS.payload.text }">
          <span class="section-badge" :style="{ background: COLORS.payload.badge }">P</span>
          Payload
          <div class="section-actions">
            <n-tooltip trigger="hover" placement="top">
              <template #trigger>
                <button
                  class="icon-btn small"
                  :class="{ 'icon-btn-success': copiedKey === 'payload' }"
                  @click="copyPayloadJson"
                >
                  <icon-mdi-check v-if="copiedKey === 'payload'" class="btn-icon" />
                  <icon-mdi-content-copy v-else class="btn-icon" />
                </button>
              </template>
              {{ copiedKey === 'payload' ? 'Copied!' : 'Copy as JSON' }}
            </n-tooltip>
          </div>
        </div>
        <div class="kv-list">
          <div
            v-for="{ claim, claimDescription, friendlyValue, value } in decodedJWT.payload"
            :key="claim + value"
            class="kv-row"
          >
            <div class="kv-key">
              <span class="kv-claim" :style="{ color: COLORS.payload.text }">{{ claim }}</span>
              <span v-if="claimDescription" class="kv-desc">{{ claimDescription }}</span>
            </div>
            <div class="kv-value">
              <span>{{ value }}</span>
              <span v-if="friendlyValue" class="kv-friendly">{{ friendlyValue }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Signature + 验证 -->
      <div class="jwt-section" :style="{ background: COLORS.signature.bg, borderColor: COLORS.signature.border }">
        <div class="section-header" :style="{ color: COLORS.signature.text }">
          <span class="section-badge" :style="{ background: COLORS.signature.badge }">S</span>
          Signature
        </div>

        <div class="kv-sig">
          <code class="sig-code" :style="{ color: COLORS.signature.text }">{{ jwtParts.signature }}</code>
        </div>

        <!-- 签名验证区 -->
        <div class="verify-section">
          <div class="verify-label">
            <icon-mdi-shield-check-outline class="verify-icon" />
            Verify Signature
            <span class="verify-hint">(HS256 / HS384 / HS512)</span>
          </div>
          <div class="verify-input-row">
            <div class="verify-input-wrap">
              <input
                v-model="secretKey"
                class="verify-input"
                :type="showSecret ? 'text' : 'password'"
                placeholder="Enter your HMAC secret key to verify…"
                spellcheck="false"
                autocomplete="off"
              >
              <button class="eye-btn" :title="showSecret ? 'Hide' : 'Show'" @click="showSecret = !showSecret">
                <icon-mdi-eye-off-outline v-if="showSecret" class="eye-icon" />
                <icon-mdi-eye-outline v-else class="eye-icon" />
              </button>
            </div>
          </div>

          <!-- 验证结果 -->
          <transition name="verify-fade">
            <div v-if="verifyState === 'valid'" class="verify-result valid">
              <icon-mdi-shield-check class="vr-icon" />
              Signature verified — this JWT has not been tampered with
            </div>
            <div v-else-if="verifyState === 'invalid'" class="verify-result invalid">
              <icon-mdi-shield-alert class="vr-icon" />
              Invalid signature — the secret key is wrong or the token has been modified
            </div>
            <div v-else-if="verifyState === 'unsupported'" class="verify-result unsupported">
              <icon-mdi-information-outline class="vr-icon" />
              Signature verification is only supported for HS256 / HS384 / HS512 algorithms
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.jwt-container {
  max-width: 900px;
}

// ── 输入区 ────────────────────────────────────────────────────────────────
.input-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.jwt-input-label {
  font-size: 13px;
  font-weight: 600;
  opacity: 0.65;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.input-actions {
  display: flex;
  gap: 4px;
}

.jwt-textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 12.5px;
  line-height: 1.6;
  border: 1.5px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.02);
  color: inherit;
  resize: vertical;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &.has-error {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
  }

  &::placeholder { color: rgba(0,0,0,0.25); }

  .dark & {
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.1);
    &::placeholder { color: rgba(255,255,255,0.2); }
    &:focus { border-color: #818cf8; box-shadow: 0 0 0 3px rgba(129,140,248,0.12); }
    &.has-error { border-color: #f87171 !important; }
  }
}

// ── 错误提示 ──────────────────────────────────────────────────────────────
.error-inline {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 12px;
  color: #ef4444;
  .dark & { color: #f87171; }
}

.ei-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.err-slide-enter-active, .err-slide-leave-active { transition: opacity 0.2s, transform 0.2s; }
.err-slide-enter-from, .err-slide-leave-to { opacity: 0; transform: translateY(-4px); }

// ── 图标按钮 ─────────────────────────────────────────────────────────────
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid rgba(0,0,0,0.1);
  background: transparent;
  cursor: pointer;
  color: inherit;
  transition: background 0.15s, color 0.15s;

  &:hover { background: rgba(99,102,241,0.1); color: #6366f1; }
  &.icon-btn-success { color: #16a34a; border-color: rgba(22,163,74,0.3); background: rgba(22,163,74,0.08); }
  &.icon-btn-danger:hover { background: rgba(239,68,68,0.1); color: #ef4444; }
  &.small { width: 24px; height: 24px; }

  .dark & { border-color: rgba(255,255,255,0.1); }
}

.btn-icon { font-size: 14px; }

// ── 彩色 Token 预览 ───────────────────────────────────────────────────────
.jwt-colored-preview {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.06);
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 12px;
  line-height: 1.7;
  word-break: break-all;

  .dark & {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.07);
  }
}

.jwt-seg {
  font-weight: 600;
  &--header    { color: #ef4444; }
  &--payload   { color: #a855f7; }
  &--signature { color: #16a34a; }  // 加深满足 WCAG
}

.jwt-dot {
  color: #94a3b8;
  font-weight: 400;
  margin: 0 1px;
}

// ── 图例 ─────────────────────────────────────────────────────────────────
.jwt-legend {
  display: flex;
  gap: 16px;
  margin-top: 10px;
  font-size: 12px;
  font-weight: 500;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

// ── 空状态 ────────────────────────────────────────────────────────────────
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 40px 20px;
  opacity: 0.35;
  text-align: center;
}

.es-icon {
  font-size: 40px;
}

.es-text {
  font-size: 13px;
  line-height: 1.5;
  max-width: 320px;
}

// ── 解析区 ────────────────────────────────────────────────────────────────
.jwt-sections {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.jwt-section {
  border-radius: 10px;
  border: 1px solid;
  padding: 16px 18px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.section-badge {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  flex-shrink: 0;
}

.section-actions {
  margin-left: auto;
}

// KV 列表
.kv-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.kv-row {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 12px;
  font-size: 13px;
  padding: 6px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.45);
  transition: background 0.12s;

  &:hover { background: rgba(255, 255, 255, 0.65); }

  .dark & {
    background: rgba(0, 0, 0, 0.18);
    &:hover { background: rgba(0, 0, 0, 0.28); }
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
}

.kv-key {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.kv-claim {
  font-weight: 700;
  font-family: 'SF Mono', monospace;
  font-size: 12px;
}

.kv-desc {
  font-size: 11px;
  opacity: 0.55;
  line-height: 1.3;
}

.kv-value {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex-wrap: wrap;
  font-family: 'SF Mono', monospace;
  font-size: 12px;
  word-break: break-all;
}

.kv-friendly {
  opacity: 0.6;
  font-size: 11px;
  font-family: inherit;
}

// Signature 展示
.kv-sig {
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.45);

  .dark & { background: rgba(0, 0, 0, 0.18); }
}

.sig-code {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 12px;
  word-break: break-all;
  font-weight: 600;
}

// ── 签名验证区 ────────────────────────────────────────────────────────────
.verify-section {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(22, 163, 74, 0.2);
}

.verify-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  opacity: 0.7;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.verify-icon { font-size: 15px; }

.verify-hint {
  font-weight: 400;
  font-size: 11px;
  opacity: 0.6;
  text-transform: none;
  letter-spacing: 0;
}

.verify-input-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.verify-input-wrap {
  position: relative;
  flex: 1;
}

.verify-input {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 36px 8px 10px;
  font-size: 12.5px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  border: 1.5px solid rgba(22, 163, 74, 0.3);
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.5);
  color: inherit;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus {
    border-color: #16a34a;
    box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.12);
  }

  &::placeholder { color: rgba(0,0,0,0.28); }

  .dark & {
    background: rgba(0, 0, 0, 0.2);
    border-color: rgba(22, 163, 74, 0.25);
    &::placeholder { color: rgba(255,255,255,0.22); }
    &:focus { border-color: #22c55e; box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.12); }
  }
}

.eye-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  opacity: 0.4;
  padding: 0;
  display: flex;
  align-items: center;

  &:hover { opacity: 0.8; }
}

.eye-icon { font-size: 15px; }

// 验证结果条
.verify-result {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 7px;
  font-size: 12.5px;
  font-weight: 500;

  &.valid {
    background: rgba(22, 163, 74, 0.1);
    color: #16a34a;
    border: 1px solid rgba(22, 163, 74, 0.25);
    .dark & { color: #4ade80; background: rgba(22,163,74,0.12); }
  }

  &.invalid {
    background: rgba(239, 68, 68, 0.08);
    color: #dc2626;
    border: 1px solid rgba(239, 68, 68, 0.2);
    .dark & { color: #f87171; background: rgba(239,68,68,0.1); }
  }

  &.unsupported {
    background: rgba(234, 179, 8, 0.08);
    color: #b45309;
    border: 1px solid rgba(234, 179, 8, 0.2);
    .dark & { color: #fbbf24; background: rgba(234,179,8,0.08); }
  }
}

.vr-icon { font-size: 16px; flex-shrink: 0; }

.verify-fade-enter-active, .verify-fade-leave-active { transition: opacity 0.2s, transform 0.15s; }
.verify-fade-enter-from, .verify-fade-leave-to { opacity: 0; transform: translateY(-3px); }
</style>
