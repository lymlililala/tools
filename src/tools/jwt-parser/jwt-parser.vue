<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { decodeJwt } from './jwt-parser.service';
import { useValidation } from '@/composable/validation';
import { isNotThrowing } from '@/utils/boolean';
import { withDefaultOnError } from '@/utils/defaults';
import { useStyleStore } from '@/stores/style.store';

const rawJwt = useStorage(
  'jwt:raw',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
);

const styleStore = useStyleStore();

const decodedJWT = computed(() =>
  withDefaultOnError(() => decodeJwt({ jwt: rawJwt.value }), { header: [], payload: [] }),
);

// 分拆出三段 raw base64
const jwtParts = computed(() => {
  const parts = rawJwt.value.split('.');
  return {
    header: parts[0] ?? '',
    payload: parts[1] ?? '',
    signature: parts[2] ?? '',
  };
});

const validation = useValidation({
  source: rawJwt,
  rules: [
    {
      validator: value => value.length > 0 && isNotThrowing(() => decodeJwt({ jwt: rawJwt.value })),
      message: 'Invalid JWT',
    },
  ],
});

// 颜色配置
const COLORS = {
  header: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.4)', text: '#ef4444', badge: '#ef4444' },
  payload: { bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.4)', text: '#a855f7', badge: '#a855f7' },
  signature: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.4)', text: '#22c55e', badge: '#22c55e' },
};
</script>

<template>
  <div class="jwt-container">
    <!-- 输入区 -->
    <c-card mb-4>
      <div class="jwt-input-label">
        JWT Token
      </div>
      <c-input-text
        v-model:value="rawJwt"
        :validation="validation"
        placeholder="Put your token here..."
        rows="5"
        multiline
        raw-text
        autofocus
        monospace
      />

      <!-- 彩色分段展示 -->
      <div v-if="rawJwt" class="jwt-colored-preview" :class="{ dark: styleStore.isDarkTheme }">
        <span class="jwt-seg jwt-seg--header">{{ jwtParts.header }}</span>
        <span class="jwt-dot">.</span>
        <span class="jwt-seg jwt-seg--payload">{{ jwtParts.payload }}</span>
        <span class="jwt-dot">.</span>
        <span class="jwt-seg jwt-seg--signature">{{ jwtParts.signature }}</span>
      </div>

      <!-- 图例 -->
      <div class="jwt-legend">
        <span class="legend-item" style="color: #ef4444">
          <span class="legend-dot" style="background:#ef4444" />
          Header
        </span>
        <span class="legend-item" style="color: #a855f7">
          <span class="legend-dot" style="background:#a855f7" />
          Payload
        </span>
        <span class="legend-item" style="color: #22c55e">
          <span class="legend-dot" style="background:#22c55e" />
          Signature
        </span>
      </div>
    </c-card>

    <!-- 解析结果 -->
    <div v-if="validation.isValid" class="jwt-sections">
      <!-- Header -->
      <div class="jwt-section" :style="{ background: COLORS.header.bg, borderColor: COLORS.header.border }">
        <div class="section-header" :style="{ color: COLORS.header.text }">
          <span class="section-badge" :style="{ background: COLORS.header.badge }">H</span>
          Header
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

      <!-- Signature -->
      <div class="jwt-section" :style="{ background: COLORS.signature.bg, borderColor: COLORS.signature.border }">
        <div class="section-header" :style="{ color: COLORS.signature.text }">
          <span class="section-badge" :style="{ background: COLORS.signature.badge }">S</span>
          Signature
        </div>
        <div class="kv-sig">
          <code class="sig-code" :style="{ color: COLORS.signature.text }">{{ jwtParts.signature }}</code>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.jwt-container {
  max-width: 860px;
  margin: 0 auto;
}

.jwt-input-label {
  font-size: 13px;
  font-weight: 600;
  opacity: 0.65;
  margin-bottom: 8px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

// 彩色 Token 预览
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
  transition: background 0.2s;

  &.dark {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.07);
  }
}

.jwt-seg {
  font-weight: 600;

  &--header {
    color: #ef4444;
  }

  &--payload {
    color: #a855f7;
  }

  &--signature {
    color: #22c55e;
  }
}

.jwt-dot {
  color: #94a3b8;
  font-weight: 400;
  margin: 0 1px;
}

// 图例
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

// 解析区
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
  background: rgba(255, 255, 255, 0.35);

  @media (prefers-color-scheme: dark) {
    background: rgba(0, 0, 0, 0.2);
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
  padding: 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.35);
}

.sig-code {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 12px;
  word-break: break-all;
  font-weight: 600;
}
</style>
