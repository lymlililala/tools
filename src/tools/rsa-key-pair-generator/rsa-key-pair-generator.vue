<script setup lang="ts">
import { generateKeyPair } from './rsa-key-pair-generator.service';
import { useCopy } from '@/composable/copy';
import { useValidation } from '@/composable/validation';

const bits = ref(2048);

// ── 位数校验 ───────────────────────────────────────────────────────────────────
const { attrs: bitsValidationAttrs } = useValidation({
  source: bits,
  rules: [
    {
      message: 'Bits should be 256 ≤ bits ≤ 16384 and be a multiple of 8',
      validator: value => value >= 256 && value <= 16384 && value % 8 === 0,
    },
  ],
});

// ── 密钥对状态 ─────────────────────────────────────────────────────────────────
const publicKeyPem = ref('');
const privateKeyPem = ref('');
const isGenerating = ref(false);

async function generate() {
  if (isGenerating.value) {
    return;
  }
  if (bits.value < 256 || bits.value > 16384 || bits.value % 8 !== 0) {
    return;
  }
  isGenerating.value = true;
  try {
    const result = await generateKeyPair({ bits: bits.value });
    publicKeyPem.value = result.publicKeyPem;
    privateKeyPem.value = result.privateKeyPem;
  }
  catch {
    // 生成失败时保留旧值，不崩溃
  }
  finally {
    isGenerating.value = false;
  }
}

// 初始生成
generate();

// ── 复制 ──────────────────────────────────────────────────────────────────────
const { copy: copyPublic, isJustCopied: pubCopied } = useCopy({ source: publicKeyPem, text: 'Public key copied' });
const { copy: copyPrivate, isJustCopied: privCopied } = useCopy({ source: privateKeyPem, text: 'Private key copied' });

// ── 下载 .pem ─────────────────────────────────────────────────────────────────
function downloadPem(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <div class="rsa-wrap">
    <!-- ① 控制栏 -->
    <div class="controls">
      <n-form-item label="Bits:" v-bind="bitsValidationAttrs as any" label-placement="left" label-width="60" :show-feedback="false">
        <n-input-number v-model:value="bits" :min="256" :max="16384" :step="8" style="width: 140px" />
      </n-form-item>

      <c-button :disabled="isGenerating" @click="generate()">
        <n-spin v-if="isGenerating" size="small" class="btn-spin" />
        <icon-mdi-refresh v-else class="btn-icon" />
        {{ isGenerating ? 'Generating…' : 'Refresh key-pair' }}
      </c-button>
    </div>

    <!-- ② 密钥对左右布局（移动端上下堆叠） -->
    <div class="keys-layout">
      <!-- 公钥 -->
      <div class="key-card">
        <div class="key-header">
          <span class="key-title">Public key</span>
          <div class="key-actions">
            <!-- 复制 -->
            <c-tooltip :tooltip="pubCopied ? 'Copied!' : 'Copy public key'" position="top">
              <button
                class="key-btn"
                :class="{ copied: pubCopied }"
                :disabled="isGenerating || !publicKeyPem"
                @click="copyPublic()"
              >
                <transition name="icon-switch" mode="out-in">
                  <icon-mdi-check v-if="pubCopied" key="check" class="key-icon success" />
                  <icon-mdi-content-copy v-else key="copy" class="key-icon" />
                </transition>
              </button>
            </c-tooltip>
            <!-- 下载 -->
            <c-tooltip tooltip="Download public.pem" position="top">
              <button
                class="key-btn"
                :disabled="isGenerating || !publicKeyPem"
                @click="downloadPem(publicKeyPem, 'public.pem')"
              >
                <icon-mdi-download class="key-icon" />
              </button>
            </c-tooltip>
          </div>
        </div>
        <div class="key-body" :class="{ loading: isGenerating }">
          <pre class="key-pre">{{ publicKeyPem }}</pre>
        </div>
      </div>

      <!-- 私钥 -->
      <div class="key-card">
        <div class="key-header">
          <span class="key-title">Private key</span>
          <div class="key-actions">
            <!-- 复制 -->
            <c-tooltip :tooltip="privCopied ? 'Copied!' : 'Copy private key'" position="top">
              <button
                class="key-btn"
                :class="{ copied: privCopied }"
                :disabled="isGenerating || !privateKeyPem"
                @click="copyPrivate()"
              >
                <transition name="icon-switch" mode="out-in">
                  <icon-mdi-check v-if="privCopied" key="check" class="key-icon success" />
                  <icon-mdi-content-copy v-else key="copy" class="key-icon" />
                </transition>
              </button>
            </c-tooltip>
            <!-- 下载 -->
            <c-tooltip tooltip="Download private.pem" position="top">
              <button
                class="key-btn"
                :disabled="isGenerating || !privateKeyPem"
                @click="downloadPem(privateKeyPem, 'private.pem')"
              >
                <icon-mdi-download class="key-icon" />
              </button>
            </c-tooltip>
          </div>
        </div>
        <div class="key-body" :class="{ loading: isGenerating }">
          <pre class="key-pre">{{ privateKeyPem }}</pre>
        </div>
      </div>
    </div>

    <!-- ③ 生成中全局遮罩提示 -->
    <transition name="fade">
      <div v-if="isGenerating" class="generating-hint">
        <n-spin size="small" />
        <span>Generating RSA {{ bits }}-bit key pair… This may take a few seconds for large key sizes.</span>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="less">
.rsa-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── 控制栏 ────────────────────────────────────────────────────── */
.controls {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.btn-spin {
  margin-right: 6px;
}

.btn-icon {
  font-size: 16px;
  margin-right: 5px;
  vertical-align: middle;
}

/* ── 密钥对双栏布局 ───────────────────────────────────────────── */
.keys-layout {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.key-card {
  flex: 1 1 0;
  min-width: 0;
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: 6px;
  overflow: hidden;
  /* 两栏等高：固定高度，内部滚动 */
  display: flex;
  flex-direction: column;
}

/* ── 密钥头部 ─────────────────────────────────────────────────── */
.key-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.15);
  background: rgba(128, 128, 128, 0.04);
  flex-shrink: 0;
}

.key-title {
  font-weight: 600;
  font-size: 14px;
}

.key-actions {
  display: flex;
  gap: 4px;
}

.key-btn {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  color: inherit;
  opacity: 0.45;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s, color 0.15s, background 0.15s;

  &:hover:not(:disabled) {
    opacity: 1;
    background: rgba(128, 128, 128, 0.1);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.15;
  }

  &.copied {
    opacity: 1;
    color: #22c55e;
  }
}

.key-icon {
  font-size: 15px;
}

.key-icon.success {
  color: #22c55e;
}

/* ── 密钥内容区：等高 + 内部滚动 ──────────────────────────────── */
.key-body {
  flex: 1;
  overflow: hidden;
  transition: opacity 0.2s;
  /* 固定最大高度，两栏视觉等高 */
  max-height: 460px;

  &.loading {
    opacity: 0.35;
  }
}

.key-pre {
  margin: 0;
  padding: 12px 14px;
  font-family: 'Fira Code', 'Consolas', 'Menlo', 'Monaco', monospace;
  font-size: 12px;
  line-height: 1.6;
  /* PEM 格式每行 64 字符，保留换行，不横向溢出 */
  white-space: pre-wrap;
  word-break: break-all;
  overflow-wrap: break-word;
  height: 100%;
  overflow-y: auto;
  max-height: 460px;
}

/* ── 生成提示 ────────────────────────────────────────────────── */
.generating-hint {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  opacity: 0.65;
  padding: 8px 12px;
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: 6px;
  background: rgba(128, 128, 128, 0.04);
}

/* ── 图标切换动画 ─────────────────────────────────────────────── */
.icon-switch-enter-active,
.icon-switch-leave-active {
  transition: all 0.16s ease;
}

.icon-switch-enter-from {
  opacity: 0;
  transform: scale(0.5) rotate(-10deg);
}

.icon-switch-leave-to {
  opacity: 0;
  transform: scale(0.5) rotate(10deg);
}

/* ── 淡入淡出 ─────────────────────────────────────────────────── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ── 移动端：上下堆叠 ─────────────────────────────────────────── */
@media (max-width: 640px) {
  .keys-layout {
    flex-direction: column;
  }

  .key-card {
    width: 100%;
  }

  .key-body,
  .key-pre {
    max-height: 240px;
  }
}
</style>
