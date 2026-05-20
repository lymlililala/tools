<script setup lang="ts">
import db from 'oui-data';
import { refDebounced } from '@vueuse/core';
import { useCopy } from '@/composable/copy';

const { t } = useI18n();

// ── 输入与校验 ────────────────────────────────────────────────
const macAddress = ref('20:37:06:12:34:56');
const debouncedMac = refDebounced(macAddress, 150);

// 支持 `:` `-` `.` 分隔符，以及无分隔符（6字节12字符）
const MAC_RE = /^([0-9A-Fa-f]{2}[:\-.]){5}[0-9A-Fa-f]{2}$|^[0-9A-Fa-f]{12}$/;
const isValidMac = computed(() => MAC_RE.test(debouncedMac.value.trim()));
const hasInput   = computed(() => debouncedMac.value.trim().length > 0);
const showError  = computed(() => hasInput.value && !isValidMac.value);

// ── OUI 查询 ──────────────────────────────────────────────────
const getVendorKey = (addr: string) =>
  addr.trim().replace(/[.:\-]/g, '').toUpperCase().substring(0, 6);

const details = computed<string | undefined>(() =>
  isValidMac.value
    ? (db as Record<string, string>)[getVendorKey(debouncedMac.value)]
    : undefined,
);

const detailLines = computed(() =>
  details.value ? details.value.split('\n').filter(Boolean) : [],
);

const vendorName = computed(() => detailLines.value[0] ?? '');
const vendorAddress = computed(() => detailLines.value.slice(1).join('\n'));

// ── 复制 ──────────────────────────────────────────────────────
const { copy, isJustCopied } = useCopy({
  source: () => details.value ?? '',
  text: computed(() => t('tools.mac-address-lookup.vendorCopied')),
});
</script>

<template>
  <div class="mal-root">
    <!-- ── 输入区 ──────────────────────────────────────────── -->
    <div class="input-section">
      <label class="input-label">{{ t('tools.mac-address-lookup.macAddressLabel') }}</label>
      <div class="input-wrap" :class="{ 'input-wrap--error': showError }">
        <icon-mdi-chip class="input-icon" />
        <input
          v-model="macAddress"
          class="mac-input"
          :placeholder="t('tools.mac-address-lookup.placeholder')"
          spellcheck="false"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          autofocus
        />
        <button
          v-if="macAddress"
          class="clear-btn"
          :title="t('tools.mac-address-lookup.clear')"
          @click="macAddress = ''"
        >
          <icon-mdi-close />
        </button>
      </div>
      <transition name="slide-down">
        <div v-if="showError" class="error-msg">
          <icon-mdi-alert-circle-outline />
          {{ t('tools.mac-address-lookup.errorMsg') }}
        </div>
      </transition>
    </div>

    <!-- ── 结果区 ───────────────────────────────────────────── -->
    <transition name="fade" mode="out-in">
      <!-- 有结果 -->
      <div v-if="isValidMac && details" key="found" class="result-card">
        <div class="result-header">
          <div class="oui-badge">
            OUI: <code>{{ getVendorKey(macAddress) }}</code>
          </div>
          <button
            class="copy-btn"
            :class="{ 'copy-btn--copied': isJustCopied }"
            :title="t('tools.mac-address-lookup.copyVendor')"
            @click="copy()"
          >
            <transition name="icon-fade" mode="out-in">
              <icon-mdi-check v-if="isJustCopied" key="check" />
              <icon-mdi-content-copy v-else key="copy" />
            </transition>
            {{ isJustCopied ? t('tools.mac-address-lookup.justCopied') : t('tools.mac-address-lookup.copyVendor') }}
          </button>
        </div>

        <div class="vendor-body">
          <p class="vendor-name">
            {{ vendorName }}
          </p>
          <p v-if="vendorAddress" class="vendor-address">
            {{ vendorAddress }}
          </p>
        </div>
      </div>

      <!-- 未找到厂商 -->
      <div v-else-if="isValidMac && !details" key="notfound" class="state-panel state-panel--warn">
        <icon-mdi-help-circle-outline class="state-icon" />
        <div>
          <p class="state-title">{{ t('tools.mac-address-lookup.notFound') }}</p>
          <p class="state-sub">{{ t('tools.mac-address-lookup.notFoundSub') }}<code>{{ getVendorKey(macAddress) }}</code>{{ t('tools.mac-address-lookup.notFoundSuffix') }}</p>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!hasInput" key="empty" class="state-panel">
        <icon-mdi-magnify class="state-icon" />
        <p class="state-sub">
          {{ t('tools.mac-address-lookup.emptyHint') }}
        </p>
      </div>
    </transition>
  </div>
</template>

<style lang="less" scoped>
/* ─── 根容器 ─────────────────────────────────────────────────── */
.mal-root {
  max-width: 540px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
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

.input-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  border-radius: 9px;
  border: 1.5px solid rgba(0,0,0,0.12);
  background: #fff;
  padding: 0 8px;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus-within {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
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

.input-icon {
  font-size: 17px;
  color: #94a3b8;
  flex-shrink: 0;
  .dark & { color: #6b7280; }
}

.mac-input {
  flex: 1;
  padding: 11px 4px;
  border: none;
  outline: none;
  background: transparent;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 14.5px;
  letter-spacing: 0.04em;
  color: #1e293b;
  min-width: 0;
  .dark & { color: #e2e8f0; }
  &::placeholder { color: rgba(0,0,0,0.28); font-style: italic; .dark & { color: rgba(255,255,255,0.2); } }
}

.clear-btn {
  width: 26px;
  height: 26px;
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
  &:hover { color: #ef4444; background: rgba(239,68,68,0.06); }
}

.error-msg {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 12px;
  color: #ef4444;
  padding: 7px 12px;
  background: rgba(239,68,68,0.05);
  border: 1px solid rgba(239,68,68,0.14);
  border-radius: 7px;
  line-height: 1.5;
  .dark & { background: rgba(239,68,68,0.08); color: #f87171; }
}

/* ─── 结果卡片 ───────────────────────────────────────────────── */
.result-card {
  border-radius: 10px;
  border: 1.5px solid rgba(99,102,241,0.2);
  background: #fff;
  overflow: hidden;
  .dark & { background: #0f1117; border-color: rgba(129,140,248,0.2); }
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 14px;
  background: rgba(99,102,241,0.04);
  border-bottom: 1px solid rgba(99,102,241,0.1);
  .dark & { background: rgba(129,140,248,0.05); border-color: rgba(129,140,248,0.12); }
}

.oui-badge {
  font-size: 12px;
  color: #64748b;
  .dark & { color: #94a3b8; }

  code {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 12px;
    background: rgba(99,102,241,0.08);
    color: #4338ca;
    padding: 1px 6px;
    border-radius: 4px;
    .dark & { background: rgba(129,140,248,0.12); color: #a5b4fc; }
  }
}

/* 复制按钮（主操作色） */
.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: 7px;
  border: none;
  background: #6366f1;
  color: #fff;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;

  &:hover { background: #4f46e5; }
  &:active { transform: scale(0.97); }

  &--copied {
    background: #22c55e !important;
    &:hover { background: #16a34a !important; }
  }

  .dark & { background: #818cf8; }
  .dark &:hover { background: #6366f1; }
  .dark &.copy-btn--copied { background: #4ade80 !important; color: #052e16 !important; }
}

.vendor-body {
  padding: 16px 18px;
}

.vendor-name {
  font-size: 17px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 6px 0;
  .dark & { color: #f1f5f9; }
}

.vendor-address {
  font-size: 13px;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
  white-space: pre-line;
  .dark & { color: #94a3b8; }
}

/* ─── 状态面板 ───────────────────────────────────────────────── */
.state-panel {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 22px 20px;
  border-radius: 10px;
  border: 1.5px dashed rgba(0,0,0,0.1);
  color: #94a3b8;

  &--warn {
    border-color: rgba(234,179,8,0.25);
    background: rgba(234,179,8,0.04);
    color: #a16207;
    .dark & { color: #fbbf24; background: rgba(234,179,8,0.06); border-color: rgba(234,179,8,0.2); }
  }

  .dark & { border-color: rgba(255,255,255,0.08); }
}

.state-icon { font-size: 26px; opacity: 0.6; flex-shrink: 0; }

.state-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 3px 0;
}

.state-sub {
  font-size: 12.5px;
  margin: 0;
  line-height: 1.5;

  code {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 12px;
    background: rgba(0,0,0,0.06);
    padding: 1px 5px;
    border-radius: 3px;
    .dark & { background: rgba(255,255,255,0.08); }
  }
}

/* ─── 动画 ───────────────────────────────────────────────────── */
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-5px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.18s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.icon-fade-enter-active, .icon-fade-leave-active { transition: opacity 0.15s; }
.icon-fade-enter-from, .icon-fade-leave-to { opacity: 0; }
</style>
