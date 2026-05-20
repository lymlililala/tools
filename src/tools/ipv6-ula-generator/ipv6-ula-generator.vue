<script setup lang="ts">
import { SHA1 } from 'crypto-js';
import { macAddressValidation } from '@/utils/macAddress';
import { useCopy } from '@/composable/copy';

const { t } = useI18n();

// ── 输入与校验 ────────────────────────────────────────────────
const macAddress = ref('20:37:06:12:34:56');
const addressValidation = macAddressValidation(macAddress);

// ── 生成逻辑（手动触发 + computedRefreshable 模式） ───────────
interface UlaResult {
  ula48: string
  first64: string
  last64: string
}

const result = ref<UlaResult | null>(null);

function generateUla(): UlaResult {
  const timestamp = new Date().getTime();
  const hex40bit = SHA1(timestamp + macAddress.value)
    .toString()
    .substring(30);
  const ula = `fd${hex40bit.substring(0, 2)}:${hex40bit.substring(2, 6)}:${hex40bit.substring(6)}`;
  return {
    ula48:   `${ula}::/48`,
    first64: `${ula}:0::/64`,
    last64:  `${ula}:ffff::/64`,
  };
}

// 首次自动生成（有有效默认值时）
onMounted(() => {
  if (addressValidation.isValid) result.value = generateUla();
});

// MAC 变化且合法时自动更新结果
watch(() => addressValidation.isValid, (valid) => {
  if (valid) result.value = generateUla();
  else result.value = null;
});

function onGenerate() {
  if (!addressValidation.isValid) return;
  result.value = generateUla();
}

// ── 单行复制 ──────────────────────────────────────────────────
const copiedKey = ref('');
const { copy: copyText } = useCopy({ createToast: true, text: computed(() => t('tools.ipv6-ula-generator.copied')) });

async function copyRow(key: string, value: string) {
  await copyText(value);
  copiedKey.value = key;
  setTimeout(() => { copiedKey.value = ''; }, 1800);
}

// ── 结果行定义 ────────────────────────────────────────────────
const resultRows = computed(() => result.value
  ? [
      { key: 'ula48',   label: 'IPv6 ULA',                                               value: result.value.ula48 },
      { key: 'first64', label: t('tools.ipv6-ula-generator.firstRoutable'),              value: result.value.first64 },
      { key: 'last64',  label: t('tools.ipv6-ula-generator.lastRoutable'),               value: result.value.last64 },
    ]
  : [],
);
</script>

<template>
  <div class="ula-root">
    <!-- ── Info 提示（中文） ─────────────────────────────── -->
    <div class="info-banner">
      <icon-mdi-information-outline class="info-icon" />
      <p class="info-text">
        {{ t('tools.ipv6-ula-generator.infoText') }}
      </p>
    </div>

    <!-- ── MAC 输入区 ─────────────────────────────────────── -->
    <div class="input-section">
      <label class="input-label">{{ t('tools.ipv6-ula-generator.macAddressLabel') }}</label>
      <div class="input-row">
        <div
          class="input-wrap"
          :class="{ 'input-wrap--error': addressValidation.status === 'error' }"
        >
          <icon-mdi-chip class="input-prefix-icon" />
          <input
            v-model="macAddress"
            class="mac-input"
            :placeholder="t('tools.ipv6-ula-generator.placeholder')"
            spellcheck="false"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            autofocus
          />
          <button
            v-if="macAddress"
            class="clear-btn"
            :title="t('tools.ipv6-ula-generator.clear')"
            @click="macAddress = ''"
          >
            <icon-mdi-close />
          </button>
        </div>
        <!-- 生成按钮 -->
        <button
          class="gen-btn"
          :disabled="!addressValidation.isValid"
          @click="onGenerate"
        >
          <icon-mdi-refresh class="gen-btn-icon" />
          {{ t('tools.ipv6-ula-generator.generate') }}
        </button>
      </div>

      <transition name="slide-down">
        <div v-if="addressValidation.status === 'error'" class="field-error">
          <icon-mdi-alert-circle-outline />
          {{ t('tools.ipv6-ula-generator.errorMsg') }}
        </div>
      </transition>
    </div>

    <!-- ── 结果区 ───────────────────────────────────────────── -->
    <transition name="fade">
      <div v-if="result && resultRows.length" class="result-card">
        <div
          v-for="row in resultRows"
          :key="row.key"
          class="result-row"
          @click="copyRow(row.key, row.value)"
        >
          <span class="row-label">{{ row.label }}</span>
          <code class="row-value">{{ row.value }}</code>
          <span class="row-copy">
            <icon-mdi-check v-if="copiedKey === row.key" class="row-copy--ok" />
            <icon-mdi-content-copy v-else />
          </span>
        </div>
      </div>
    </transition>
  </div>
</template>

<style lang="less" scoped>
/* ─── 根容器 ─────────────────────────────────────────────────── */
.ula-root {
  max-width: 580px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ─── Info 横幅 ─────────────────────────────────────────────── */
.info-banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 9px;
  background: rgba(99,102,241,0.06);
  border: 1px solid rgba(99,102,241,0.18);
  .dark & { background: rgba(129,140,248,0.07); border-color: rgba(129,140,248,0.2); }
}

.info-icon {
  font-size: 18px;
  color: #6366f1;
  flex-shrink: 0;
  margin-top: 1px;
  .dark & { color: #818cf8; }
}

.info-text {
  font-size: 13px;
  color: #475569;
  line-height: 1.65;
  margin: 0;
  .dark & { color: #94a3b8; }
}

/* ─── 输入区 ─────────────────────────────────────────────────── */
.input-section {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.input-label {
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
  .dark & { color: #94a3b8; }
}

.input-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  border-radius: 8px;
  border: 1.5px solid rgba(0,0,0,0.12);
  background: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus-within {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.11);
  }
  &--error {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 3px rgba(239,68,68,0.09) !important;
  }

  .dark & {
    background: #0f1117;
    border-color: rgba(255,255,255,0.12);
    &:focus-within { border-color: #818cf8; box-shadow: 0 0 0 3px rgba(129,140,248,0.12); }
    &.input-wrap--error { border-color: #f87171 !important; }
  }
}

.input-prefix-icon {
  font-size: 16px;
  color: #94a3b8;
  flex-shrink: 0;
  margin-left: 10px;
  .dark & { color: #6b7280; }
}

.mac-input {
  flex: 1;
  padding: 10px 8px;
  border: none;
  outline: none;
  background: transparent;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 14px;
  letter-spacing: 0.04em;
  color: #1e293b;
  min-width: 0;
  .dark & { color: #e2e8f0; }
  &::placeholder { color: rgba(0,0,0,0.28); font-style: italic; .dark & { color: rgba(255,255,255,0.2); } }
}

.clear-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  flex-shrink: 0;
  margin-right: 3px;
  &:hover { color: #ef4444; background: rgba(239,68,68,0.06); }
}

.field-error {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #ef4444;
  padding: 6px 10px;
  background: rgba(239,68,68,0.05);
  border: 1px solid rgba(239,68,68,0.14);
  border-radius: 7px;
  .dark & { color: #f87171; background: rgba(239,68,68,0.08); }
}

/* ─── 生成按钮 ───────────────────────────────────────────────── */
.gen-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 10px 18px;
  border-radius: 8px;
  border: none;
  background: #6366f1;
  color: #fff;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background 0.15s, transform 0.1s;

  &:hover:not(:disabled) { background: #4f46e5; }
  &:active:not(:disabled) { transform: scale(0.97); }
  &:disabled { opacity: 0.45; cursor: not-allowed; }

  .dark & { background: #818cf8; color: #1e1b4b; }
  .dark &:hover:not(:disabled) { background: #6366f1; color: #fff; }
}

.gen-btn-icon { font-size: 16px; }

/* ─── 结果卡片 ───────────────────────────────────────────────── */
.result-card {
  border-radius: 10px;
  border: 1.5px solid rgba(0,0,0,0.09);
  background: #fff;
  overflow: hidden;
  .dark & { background: #0f1117; border-color: rgba(255,255,255,0.09); }
}

.result-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  transition: background 0.12s;

  &:last-child { border-bottom: none; }

  &:nth-child(even) {
    background: rgba(0,0,0,0.018);
    .dark & { background: rgba(255,255,255,0.02); }
  }

  &:hover {
    background: rgba(99,102,241,0.07) !important;
    .dark & { background: rgba(129,140,248,0.1) !important; }
    .row-copy { opacity: 1; }
  }

  .dark & { border-color: rgba(255,255,255,0.05); }
}

.row-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  white-space: nowrap;
  width: 110px;
  flex-shrink: 0;
  .dark & { color: #6b7280; }
}

.row-value {
  flex: 1;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 13px;
  background: rgba(99,102,241,0.07);
  color: #4338ca;
  padding: 3px 8px;
  border-radius: 5px;
  border: 1px solid rgba(99,102,241,0.12);
  word-break: break-all;
  min-width: 0;

  .dark & {
    background: rgba(129,140,248,0.1);
    color: #a5b4fc;
    border-color: rgba(129,140,248,0.18);
  }
}

.row-copy {
  font-size: 14px;
  color: #94a3b8;
  opacity: 0;
  transition: opacity 0.15s;
  flex-shrink: 0;
  display: flex;
  align-items: center;

  &--ok { color: #22c55e; }
  .dark & { color: #6b7280; }
}

/* ─── 动画 ───────────────────────────────────────────────────── */
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-5px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
