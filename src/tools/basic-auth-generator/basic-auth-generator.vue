<script setup lang="ts">
import { textToBase64 } from '@/utils/base64';

const { t } = useI18n();

const username = ref('');
const password = ref('');
const showPassword = ref(false);

// 只有当 username 或 password 非空时才生成
const hasInput = computed(() => username.value !== '' || password.value !== '');

const token = computed(() => textToBase64(`${username.value}:${password.value}`));
const header = computed(() => `Authorization: Basic ${token.value}`);

// ── 复制反馈 ─────────────────────────────────────────────────────────────
const copySuccess = ref(false);
async function copyHeader() {
  if (!hasInput.value) {
    return;
  }
  await navigator.clipboard.writeText(header.value);
  copySuccess.value = true;
  setTimeout(() => (copySuccess.value = false), 2000);
}
</script>

<template>
  <div class="basic-auth-wrap">
    <!-- Username -->
    <div class="field-group">
      <label class="field-label">{{ t('tools.basic-auth-generator.username') }}</label>
      <input
        v-model="username"
        class="text-input"
        type="text"
        :placeholder="t('tools.basic-auth-generator.usernamePlaceholder')"
        autocomplete="off"
        spellcheck="false"
      >
    </div>

    <!-- Password -->
    <div class="field-group">
      <label class="field-label">{{ t('tools.basic-auth-generator.password') }}</label>
      <div class="password-wrap">
        <input
          v-model="password"
          class="text-input"
          :type="showPassword ? 'text' : 'password'"
          :placeholder="t('tools.basic-auth-generator.passwordPlaceholder')"
          autocomplete="off"
          spellcheck="false"
        >
        <button
          class="eye-btn"
          :title="showPassword ? t('tools.basic-auth-generator.hidePassword') : t('tools.basic-auth-generator.showPassword')"
          @click="showPassword = !showPassword"
        >
          <icon-mdi-eye-off-outline v-if="showPassword" class="eye-icon" />
          <icon-mdi-eye-outline v-else class="eye-icon" />
        </button>
      </div>
    </div>

    <!-- 结果区：仅当有输入时显示 -->
    <transition name="result-slide">
      <div v-if="hasInput" class="result-card">
        <div class="result-label">
          {{ t('tools.basic-auth-generator.authorizationHeader') }}
        </div>
        <div class="result-value">
          <span class="result-prefix">Authorization: Basic </span>
          <span class="result-token">{{ token }}</span>
        </div>
      </div>
    </transition>

    <!-- 空状态占位 -->
    <transition name="result-slide">
      <div v-if="!hasInput" class="empty-state">
        <icon-mdi-shield-key-outline class="es-icon" />
        <span>{{ t('tools.basic-auth-generator.emptyHint') }}</span>
      </div>
    </transition>

    <!-- 主操作按钮 -->
    <div class="action-row">
      <button
        class="copy-btn"
        :class="{ success: copySuccess, disabled: !hasInput }"
        :disabled="!hasInput"
        @click="copyHeader"
      >
        <icon-mdi-check v-if="copySuccess" class="btn-icon" />
        <icon-mdi-content-copy v-else class="btn-icon" />
        <span>{{ copySuccess ? t('tools.basic-auth-generator.copied') : t('tools.basic-auth-generator.copyHeader') }}</span>
      </button>
    </div>
  </div>
</template>

<style lang="less" scoped>
.basic-auth-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 640px;
  margin: 0 auto;
}

// ── 输入字段 ──────────────────────────────────────────────────────────────
.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  opacity: 0.65;
}

.text-input {
  width: 100%;
  padding: 10px 14px;
  font-size: 14px;
  font-family: inherit;
  border: 1.5px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: #fafafa;
  color: inherit;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    background: #fff;
  }

  &::placeholder {
    color: rgba(0, 0, 0, 0.28);
  }

  :global(.dark) & {
    background: #0f1117;
    border-color: rgba(255, 255, 255, 0.1);
    color: #e2e8f0;

    &::placeholder { color: rgba(255, 255, 255, 0.22); }
    &:focus {
      border-color: #818cf8;
      box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.12);
    }
  }
}

// 密码框容器（相对定位放眼睛按钮）
.password-wrap {
  position: relative;

  .text-input {
    padding-right: 42px;
  }
}

.eye-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.45;
  transition: opacity 0.15s;
  color: inherit;

  &:hover { opacity: 0.9; }
}

.eye-icon { font-size: 16px; }

// ── 结果区 ────────────────────────────────────────────────────────────────
.result-card {
  padding: 14px 18px;
  border-radius: 10px;
  background: rgba(99, 102, 241, 0.05);
  border: 1.5px solid rgba(99, 102, 241, 0.15);

  :global(.dark) & {
    background: rgba(99, 102, 241, 0.08);
    border-color: rgba(99, 102, 241, 0.2);
  }
}

.result-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.45;
  margin-bottom: 8px;
}

.result-value {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-all;
}

.result-prefix {
  opacity: 0.5;
}

.result-token {
  color: #6366f1;
  font-weight: 600;

  :global(.dark) & { color: #818cf8; }
}

// ── 空状态 ────────────────────────────────────────────────────────────────
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  border-radius: 10px;
  border: 1.5px dashed rgba(0, 0, 0, 0.1);
  font-size: 13px;
  opacity: 0.4;

  :global(.dark) & { border-color: rgba(255, 255, 255, 0.1); }
}

.es-icon { font-size: 18px; flex-shrink: 0; }

// ── 主操作按钮 ────────────────────────────────────────────────────────────
.action-row {
  display: flex;
  justify-content: center;
  padding-top: 4px;
}

.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 24px;
  border-radius: 8px;
  border: none;
  background: #1e1e2e;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s, opacity 0.15s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);

  &:hover:not(.disabled) {
    background: #2d2d44;
    transform: translateY(-1px);
  }

  &:active:not(.disabled) {
    transform: translateY(0);
  }

  &.success {
    background: #16a34a;
  }

  &.disabled {
    opacity: 0.35;
    cursor: not-allowed;
    box-shadow: none;
  }

  :global(.dark) & {
    background: #6366f1;

    &:hover:not(.disabled) { background: #4f46e5; }
    &.success { background: #16a34a; }
  }
}

.btn-icon { font-size: 15px; }

// ── 动画 ─────────────────────────────────────────────────────────────────
.result-slide-enter-active,
.result-slide-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.result-slide-enter-from,
.result-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
