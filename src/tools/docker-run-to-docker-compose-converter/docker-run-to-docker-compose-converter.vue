<script setup lang="ts">
import { MessageType, composerize } from 'composerize-ts';
import { refDebounced } from '@vueuse/core';
import { withDefaultOnError } from '@/utils/defaults';
import { useDownloadFileFromBase64 } from '@/composable/downloadBase64';
import { textToBase64 } from '@/utils/base64';
import { useCopy } from '@/composable/copy';

const { t } = useI18n();

const dockerRun = useStorage(
  'docker-compose-converter:input',
  'docker run -p 80:80 -v /var/run/docker.sock:/tmp/docker.sock:ro --restart always --log-opt max-size=1g nginx',
);

const debouncedDockerRun = refDebounced(dockerRun, 200);

// ── 转换逻辑 ──────────────────────────────────────────────────
const conversionResult = computed(() =>
  withDefaultOnError(() => composerize(debouncedDockerRun.value.trim()), { yaml: '', messages: [] }),
);

const dockerCompose = computed(() => conversionResult.value.yaml);

const notImplemented = computed(() =>
  conversionResult.value.messages
    .filter(msg => msg.type === MessageType.notImplemented)
    .map(msg => msg.value),
);
const notComposable = computed(() =>
  conversionResult.value.messages
    .filter(msg => msg.type === MessageType.notTranslatable)
    .map(msg => msg.value),
);
const errors = computed(() =>
  conversionResult.value.messages
    .filter(msg => msg.type === MessageType.errorDuringConversion)
    .map(msg => msg.value),
);

const hasInput = computed(() => dockerRun.value.trim().length > 0);
const hasOutput = computed(() => dockerCompose.value.trim().length > 0);

// 输入不以 docker run 开头认为是非法格式
const isInvalidFormat = computed(() =>
  hasInput.value && !debouncedDockerRun.value.trim().startsWith('docker'),
);

// ── 清空 ──────────────────────────────────────────────────────
function clearInput() {
  dockerRun.value = '';
}

// ── 复制 YAML ─────────────────────────────────────────────────
const { copy: copyYaml, isJustCopied } = useCopy({
  source: dockerCompose,
  text: computed(() => t('tools.docker-run-to-docker-compose-converter.yamlCopied')),
});

// ── 下载 ──────────────────────────────────────────────────────
const dockerComposeBase64 = computed(() => `data:application/yaml;base64,${textToBase64(dockerCompose.value)}`);
const { download } = useDownloadFileFromBase64({ source: dockerComposeBase64, filename: 'docker-compose.yml' });
</script>

<template>
  <div class="converter-root tool-wide">
    <!-- ── 双面板 ───────────────────────────────────────────── -->
    <div class="panes">
      <!-- 输入面板 -->
      <div class="pane">
        <div class="pane-header">
          <span class="pane-title">{{ t('tools.docker-run-to-docker-compose-converter.inputTitle') }}</span>
          <c-tooltip v-if="hasInput" :tooltip="t('tools.docker-run-to-docker-compose-converter.clearInput')" position="bottom">
            <button class="hdr-btn" @click="clearInput">
              <icon-mdi-close-circle-outline />
            </button>
          </c-tooltip>
        </div>

        <div class="input-wrap" :class="{ 'input-wrap--error': isInvalidFormat }">
          <textarea
            v-model="dockerRun"
            class="docker-textarea"
            :placeholder="t('tools.docker-run-to-docker-compose-converter.inputPlaceholder')"
            spellcheck="false"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
          />
        </div>

        <!-- 格式错误提示 -->
        <transition name="slide-down">
          <div v-if="isInvalidFormat" class="error-panel">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
              <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
            <span>{{ t('tools.docker-run-to-docker-compose-converter.invalidFormat') }}</span>
          </div>
        </transition>
      </div>

      <!-- 输出面板 -->
      <div class="pane">
        <div class="pane-header">
          <span class="pane-title">docker-compose.yml</span>
          <div class="action-group">
            <!-- 复制 -->
            <c-tooltip :tooltip="isJustCopied ? t('tools.docker-run-to-docker-compose-converter.copied') : t('tools.docker-run-to-docker-compose-converter.copyYaml')" position="bottom">
              <button
                class="hdr-btn"
                :class="{ 'hdr-btn--success': isJustCopied }"
                :disabled="!hasOutput"
                @click="copyYaml()"
              >
                <icon-mdi-check v-if="isJustCopied" />
                <icon-mdi-content-copy v-else />
              </button>
            </c-tooltip>
            <!-- 下载 -->
            <c-tooltip :tooltip="t('tools.docker-run-to-docker-compose-converter.downloadFile')" position="bottom">
              <button class="hdr-btn" :disabled="!hasOutput" @click="download">
                <icon-mdi-download />
              </button>
            </c-tooltip>
          </div>
        </div>

        <!-- YAML 输出 -->
        <c-code-input
          :model-value="dockerCompose"
          language="yaml"
          :placeholder="t('tools.docker-run-to-docker-compose-converter.outputPlaceholder')"
          class="code-editor"
          readonly
        />
      </div>
    </div>

    <!-- ── 警告/提示信息区 ───────────────────────────────────── -->
    <div v-if="notComposable.length > 0 || notImplemented.length > 0 || errors.length > 0" class="alerts-area">
      <div v-if="errors.length > 0" class="alert-box alert-box--error">
        <div class="alert-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
            <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          {{ t('tools.docker-run-to-docker-compose-converter.conversionError') }}
        </div>
        <ul class="alert-list">
          <li v-for="(message, i) in errors" :key="i">{{ message }}</li>
        </ul>
      </div>

      <div v-if="notImplemented.length > 0" class="alert-box alert-box--warning">
        <div class="alert-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" stroke-width="2" />
            <path d="M12 9v4M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          {{ t('tools.docker-run-to-docker-compose-converter.notImplemented') }}
        </div>
        <ul class="alert-list">
          <li v-for="(message, i) in notImplemented" :key="i">{{ message }}</li>
        </ul>
      </div>

      <div v-if="notComposable.length > 0" class="alert-box alert-box--info">
        <div class="alert-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
            <path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          {{ t('tools.docker-run-to-docker-compose-converter.notComposable') }}
        </div>
        <ul class="alert-list">
          <li v-for="(message, i) in notComposable" :key="i">{{ message }}</li>
        </ul>
      </div>
    </div>

    <!-- ── 下载按钮（主 CTA） ─────────────────────────────────── -->
    <div class="download-row">
      <button class="download-btn" :disabled="!hasOutput" @click="download">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        {{ t('tools.docker-run-to-docker-compose-converter.downloadBtn') }}
      </button>
    </div>
  </div>
</template>

<style lang="less" scoped>
.converter-root {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── 双面板布局 ───────────────────────────────────────────────── */
.panes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.pane {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* ── 面板标题栏 ───────────────────────────────────────────────── */
.pane-header {
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 28px;
}

.pane-title {
  font-size: 12.5px;
  font-weight: 600;
  color: #666;
  flex: 1;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  .dark & { color: #888; }
}

/* ── 操作按钮组 ───────────────────────────────────────────────── */
.action-group {
  display: flex;
  align-items: center;
  gap: 2px;
}

.hdr-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: inherit;
  opacity: 0.45;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  transition: opacity 0.15s, background 0.15s;

  &:hover:not(:disabled) {
    opacity: 1;
    background: rgba(99, 102, 241, 0.08);
  }

  &:disabled { opacity: 0.2; cursor: not-allowed; }

  &--success {
    opacity: 1 !important;
    color: #22c55e !important;
  }

  .dark &:hover:not(:disabled) {
    background: rgba(129, 140, 248, 0.1);
  }
}

/* ── 输入框 ───────────────────────────────────────────────────── */
.input-wrap {
  border-radius: 8px;
  border: 1.5px solid rgba(0,0,0,0.1);
  background: #fafafa;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus-within {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
    background: #fff;
  }

  &--error {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 3px rgba(239,68,68,0.1) !important;
    background: #fff9f9;
  }

  .dark & {
    background: #0f1117;
    border-color: rgba(255,255,255,0.1);

    &:focus-within {
      border-color: #818cf8;
      box-shadow: 0 0 0 3px rgba(129,140,248,0.12);
    }

    &.input-wrap--error {
      background: #1a0a0a;
      border-color: #ef4444 !important;
    }
  }
}

.docker-textarea {
  width: 100%;
  min-height: 300px;
  height: calc(100vh - 320px);
  max-height: 720px;
  padding: 14px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 13px;
  line-height: 1.6;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  color: #1e293b;
  caret-color: #6366f1;
  display: block;

  .dark & { color: #e2e8f0; }

  &::placeholder {
    color: rgba(0,0,0,0.3);
    font-style: italic;
    .dark & { color: rgba(255,255,255,0.2); }
  }

  &::-webkit-scrollbar { width: 6px; height: 6px; }
  &::-webkit-scrollbar-thumb {
    background: rgba(99,102,241,0.2);
    border-radius: 3px;
  }
}

/* ── 输出编辑器高度 ───────────────────────────────────────────── */
.code-editor {
  :deep(.editor-wrap) {
    min-height: 300px;
    height: calc(100vh - 320px);
    max-height: 720px;
  }
}

/* ── 错误/格式提示 ────────────────────────────────────────────── */
.error-panel {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.2);
  font-size: 12px;
  color: #dc2626;

  code {
    font-family: 'SF Mono', 'Fira Code', monospace;
    background: rgba(239,68,68,0.1);
    padding: 0 4px;
    border-radius: 3px;
  }

  svg { flex-shrink: 0; margin-top: 1px; }

  .dark & {
    background: rgba(239,68,68,0.1);
    border-color: rgba(239,68,68,0.25);
    color: #f87171;
  }
}

/* ── 警告区 ───────────────────────────────────────────────────── */
.alerts-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.alert-box {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid;

  &--error {
    background: rgba(239,68,68,0.06);
    border-color: rgba(239,68,68,0.2);
    color: #dc2626;
    .dark & { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.3); color: #f87171; }
  }
  &--warning {
    background: rgba(245,158,11,0.06);
    border-color: rgba(245,158,11,0.2);
    color: #b45309;
    .dark & { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.3); color: #fbbf24; }
  }
  &--info {
    background: rgba(99,102,241,0.05);
    border-color: rgba(99,102,241,0.15);
    color: #4f46e5;
    .dark & { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.25); color: #a5b4fc; }
  }
}

.alert-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 600;
  margin-bottom: 6px;
}

.alert-list {
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  line-height: 1.8;
  font-family: 'SF Mono', 'Fira Code', monospace;
  opacity: 0.85;
}

/* ── 下载按钮（主 CTA） ───────────────────────────────────────── */
.download-row {
  display: flex;
  justify-content: center;
}

.download-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 28px;
  border-radius: 8px;
  border: none;
  background: #0ea5e9;  // Docker 蓝
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s, opacity 0.15s;
  box-shadow: 0 2px 12px rgba(14,165,233,0.3);

  &:hover:not(:disabled) {
    background: #0284c7;
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(14,165,233,0.35);
  }

  &:active { transform: none; }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    box-shadow: none;
  }
}

/* ── 动画 ─────────────────────────────────────────────────────── */
.slide-down-enter-active,
.slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from,
.slide-down-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
