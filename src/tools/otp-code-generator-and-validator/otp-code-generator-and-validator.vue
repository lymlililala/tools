<script setup lang="ts">
import { useTimestamp, useClipboard } from '@vueuse/core';
import { useQRCode } from '../qr-code-generator/useQRCode';
import { base32toHex, buildKeyUri, generateSecret, generateTOTP, getCounterFromTime } from './otp.service';
import { useStyleStore } from '@/stores/style.store';
import { computedRefreshable } from '@/composable/computedRefreshable';

const now = useTimestamp();
const styleStore = useStyleStore();
const { copy } = useClipboard();

// ── Secret ────────────────────────────────────────────────────────────────
const secret = ref(generateSecret());

const secretValidationRules = [
  { message: 'Please set a secret', validator: (v: string) => v !== '' },
  { message: 'Secret must be a Base32 string (A–Z, 2–7)', validator: (v: string) => /^[A-Z2-7]+$/i.test(v) },
];

function refreshSecret() { secret.value = generateSecret(); }

// ── Tokens ────────────────────────────────────────────────────────────────
const [tokens] = computedRefreshable(() => ({
  previous: generateTOTP({ key: secret.value, now: now.value - 30000 }),
  current: generateTOTP({ key: secret.value, now: now.value }),
  next: generateTOTP({ key: secret.value, now: now.value + 30000 }),
}), { throttle: 500 });

// ── 进度条（0~1，末 5s 变红）────────────────────────────────────────────
const interval = computed(() => (now.value / 1000) % 30);
const progressPct = computed(() => (interval.value / 30) * 100);
const remaining = computed(() => Math.ceil(30 - interval.value));
const progressColor = computed(() => remaining.value <= 5 ? '#ef4444' : '#6366f1');

// ── QR Code ───────────────────────────────────────────────────────────────
const keyUri = computed(() => buildKeyUri({ secret: secret.value }));
const { qrcode } = useQRCode({
  text: keyUri,
  color: {
    background: computed(() => styleStore.isDarkTheme ? '#1a1a2e' : '#ffffff'),
    foreground: computed(() => styleStore.isDarkTheme ? '#e2e8f0' : '#000000'),
  },
  options: { width: 180 },
});

// ── 复制反馈 ─────────────────────────────────────────────────────────────
const copiedKey = ref('');
async function copyValue(key: string, value: string) {
  await copy(value);
  copiedKey.value = key;
  setTimeout(() => { copiedKey.value = ''; }, 1600);
}

// ── 高级信息折叠 ──────────────────────────────────────────────────────────
const showAdvanced = ref(false);
</script>

<template>
  <div class="otp-wrap">
    <!-- Secret 输入 -->
    <div class="secret-row">
      <c-input-text
        v-model:value="secret"
        label="Secret (Base32)"
        placeholder="Paste your TOTP secret…"
        :validation-rules="secretValidationRules"
        style="flex:1"
      >
        <template #suffix>
          <c-tooltip tooltip="Generate a new random secret">
            <c-button circle variant="text" size="small" @click="refreshSecret">
              <icon-mdi-refresh />
            </c-button>
          </c-tooltip>
        </template>
      </c-input-text>
    </div>

    <!-- OTP 展示卡 -->
    <div class="otp-card">
      <!-- 三段标签 -->
      <div class="otp-labels">
        <span class="otp-label side">Previous</span>
        <span class="otp-label center">Current OTP</span>
        <span class="otp-label side">Next</span>
      </div>

      <!-- 三段数值 -->
      <div class="otp-tokens">
        <!-- Previous -->
        <c-tooltip :tooltip="copiedKey === 'prev' ? 'Copied!' : 'Copy Previous OTP'" position="bottom">
          <button
            class="otp-token side-token"
            :class="{ copied: copiedKey === 'prev' }"
            @click="copyValue('prev', tokens.previous)"
          >
            {{ tokens.previous }}
          </button>
        </c-tooltip>

        <!-- Current -->
        <c-tooltip :tooltip="copiedKey === 'cur' ? 'Copied!' : 'Copy Current OTP'" position="bottom">
          <button
            class="otp-token current-token"
            :class="{ copied: copiedKey === 'cur' }"
            @click="copyValue('cur', tokens.current)"
          >
            {{ tokens.current }}
            <icon-mdi-check v-if="copiedKey === 'cur'" class="cur-check" />
          </button>
        </c-tooltip>

        <!-- Next -->
        <c-tooltip :tooltip="copiedKey === 'next' ? 'Copied!' : 'Copy Next OTP'" position="bottom">
          <button
            class="otp-token side-token"
            :class="{ copied: copiedKey === 'next' }"
            @click="copyValue('next', tokens.next)"
          >
            {{ tokens.next }}
          </button>
        </c-tooltip>
      </div>

      <!-- 进度条 -->
      <div class="progress-wrap">
        <div
          class="progress-bar"
          :style="{ width: `${progressPct}%`, background: progressColor }"
        />
      </div>
      <div class="countdown" :class="{ urgent: remaining <= 5 }">
        Next in {{ String(remaining).padStart(2, '0') }}s
      </div>
    </div>

    <!-- QR Code + 链接 -->
    <div class="qr-section">
      <div class="qr-wrap">
        <img :src="qrcode" class="qr-img" alt="TOTP QR Code">
      </div>
      <c-button :href="keyUri" target="_blank" variant="text" size="small">
        <icon-mdi-open-in-new style="font-size:13px; margin-right:4px" />
        Open Key URI in new tab
      </c-button>
    </div>

    <!-- 高级信息折叠 -->
    <div class="advanced-section">
      <button class="advanced-toggle" @click="showAdvanced = !showAdvanced">
        <icon-mdi-chevron-right class="adv-arrow" :class="{ open: showAdvanced }" />
        <span>Debug / Advanced info</span>
      </button>

      <transition name="adv-slide">
        <div v-if="showAdvanced" class="advanced-body">
          <!-- Secret in Hex -->
          <div class="adv-row">
            <span class="adv-label">Secret (hex)</span>
            <div class="adv-value-wrap">
              <span class="adv-value mono">{{ base32toHex(secret) }}</span>
              <button class="adv-copy" @click="copyValue('hex', base32toHex(secret))">
                <icon-mdi-check v-if="copiedKey === 'hex'" class="copy-check" />
                <icon-mdi-content-copy v-else class="copy-icon" />
              </button>
            </div>
          </div>

          <!-- Epoch -->
          <div class="adv-row">
            <span class="adv-label">Epoch (s)</span>
            <div class="adv-value-wrap">
              <span class="adv-value mono">{{ Math.floor(now / 1000) }}</span>
              <button class="adv-copy" @click="copyValue('epoch', String(Math.floor(now / 1000)))">
                <icon-mdi-check v-if="copiedKey === 'epoch'" class="copy-check" />
                <icon-mdi-content-copy v-else class="copy-icon" />
              </button>
            </div>
          </div>

          <!-- Iteration count -->
          <div class="adv-row">
            <span class="adv-label">Iteration count</span>
            <div class="adv-value-wrap">
              <span class="adv-value mono">{{ getCounterFromTime({ now, timeStep: 30 }) }}</span>
              <button class="adv-copy" @click="copyValue('iter', String(getCounterFromTime({ now, timeStep: 30 })))">
                <icon-mdi-check v-if="copiedKey === 'iter'" class="copy-check" />
                <icon-mdi-content-copy v-else class="copy-icon" />
              </button>
            </div>
          </div>

          <!-- Padded hex -->
          <div class="adv-row">
            <span class="adv-label">Padded hex</span>
            <div class="adv-value-wrap">
              <span class="adv-value mono">{{ getCounterFromTime({ now, timeStep: 30 }).toString(16).padStart(16, '0') }}</span>
              <button class="adv-copy" @click="copyValue('phex', getCounterFromTime({ now, timeStep: 30 }).toString(16).padStart(16, '0'))">
                <icon-mdi-check v-if="copiedKey === 'phex'" class="copy-check" />
                <icon-mdi-content-copy v-else class="copy-icon" />
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style lang="less" scoped>
.otp-wrap {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 420px;
  margin: 0 auto;
}

// ── Secret 行 ──────────────────────────────────────────────────────────────
.secret-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

// ── OTP 展示卡 ────────────────────────────────────────────────────────────
.otp-card {
  padding: 16px;
  border-radius: 12px;
  border: 1.5px solid rgba(99, 102, 241, 0.15);
  background: rgba(99, 102, 241, 0.04);

  :global(.dark) & {
    background: rgba(99, 102, 241, 0.07);
    border-color: rgba(99, 102, 241, 0.2);
  }
}

.otp-labels {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.otp-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.45;

  &.side { flex: 1; text-align: center; }
  &.center { flex: 1.4; text-align: center; }
}

.otp-tokens {
  display: flex;
  align-items: stretch;
  gap: 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);

  :global(.dark) & { border-color: rgba(255, 255, 255, 0.08); }
}

.otp-token {
  border: none;
  cursor: pointer;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-variant-numeric: tabular-nums;
  transition: background 0.15s, color 0.15s;
  user-select: none;

  &.side-token {
    flex: 1;
    padding: 14px 0;
    font-size: 16px;
    font-weight: 500;
    background: rgba(0, 0, 0, 0.03);
    color: inherit;
    opacity: 0.55;

    &:hover { background: rgba(99, 102, 241, 0.08); opacity: 0.85; }
    &.copied { color: #22c55e; opacity: 1; }

    :global(.dark) & { background: rgba(255, 255, 255, 0.03); }
  }

  &.current-token {
    flex: 1.4;
    padding: 14px 0;
    font-size: 24px;
    font-weight: 700;
    background: #fff;
    color: #1e1e2e;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border-left: 1px solid rgba(0, 0, 0, 0.08);
    border-right: 1px solid rgba(0, 0, 0, 0.08);

    &:hover { background: rgba(99, 102, 241, 0.06); }
    &.copied { color: #16a34a; }

    :global(.dark) & {
      background: #1e1e2e;
      color: #e2e8f0;
      border-color: rgba(255, 255, 255, 0.08);
    }
  }
}

.cur-check {
  font-size: 16px;
  color: #22c55e;
}

// ── 进度条 ────────────────────────────────────────────────────────────────
.progress-wrap {
  margin-top: 10px;
  height: 4px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 2px;
  overflow: hidden;

  :global(.dark) & { background: rgba(255, 255, 255, 0.08); }
}

.progress-bar {
  height: 100%;
  border-radius: 2px;
  transition: width 0.1s linear, background 0.3s;
}

.countdown {
  margin-top: 6px;
  text-align: center;
  font-size: 12px;
  opacity: 0.5;
  font-variant-numeric: tabular-nums;
  transition: color 0.3s;

  &.urgent {
    color: #ef4444;
    opacity: 1;
    font-weight: 600;
  }
}

// ── QR Code ────────────────────────────────────────────────────────────────
.qr-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.qr-wrap {
  padding: 10px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  display: inline-flex;

  :global(.dark) & { background: #1a1a2e; border-color: rgba(255, 255, 255, 0.1); }
}

.qr-img {
  display: block;
  width: 180px;
  height: 180px;
}

// ── 高级信息折叠 ──────────────────────────────────────────────────────────
.advanced-section {
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  overflow: hidden;

  :global(.dark) & { border-color: rgba(255, 255, 255, 0.1); }
}

.advanced-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: rgba(0, 0, 0, 0.02);
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  opacity: 0.6;
  color: inherit;
  text-align: left;
  transition: background 0.15s, opacity 0.15s;

  &:hover { background: rgba(99, 102, 241, 0.06); opacity: 0.9; }

  :global(.dark) & { background: rgba(255, 255, 255, 0.03); }
}

.adv-arrow {
  font-size: 16px;
  transition: transform 0.2s;

  &.open { transform: rotate(90deg); }
}

.advanced-body {
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);

  :global(.dark) & { border-color: rgba(255, 255, 255, 0.07); }
}

.adv-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.adv-label {
  font-size: 11px;
  font-weight: 600;
  opacity: 0.55;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  flex-shrink: 0;
  width: 110px;
}

.adv-value-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: flex-end;
  min-width: 0;
}

.adv-value {
  font-size: 12px;
  word-break: break-all;
  text-align: right;
  opacity: 0.8;
}

.mono { font-family: 'SF Mono', 'Fira Code', monospace; }

.adv-copy {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  opacity: 0.4;
  transition: opacity 0.15s, background 0.15s;
  color: inherit;

  &:hover { opacity: 1; background: rgba(99, 102, 241, 0.1); }
}

.copy-icon { font-size: 12px; }
.copy-check { font-size: 12px; color: #22c55e; }

// ── 动画 ─────────────────────────────────────────────────────────────────
.adv-slide-enter-active,
.adv-slide-leave-active { transition: opacity 0.2s, transform 0.2s; }
.adv-slide-enter-from,
.adv-slide-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
