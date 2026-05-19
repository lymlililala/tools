<script setup lang="ts">
import { parse as parseToml } from 'iarna-toml-esm';

// ── 状态 ─────────────────────────────────────────────────────────────────
const tomlInput = ref('');
const debouncedToml = refDebounced(tomlInput, 150);

// ── 转换逻辑 ─────────────────────────────────────────────────────────────
interface ConvertResult {
  json: string
  error: string | null
}

const result = computed((): ConvertResult => {
  const raw = debouncedToml.value.trim();
  if (!raw) return { json: '', error: null };

  try {
    const obj = parseToml(raw);
    return { json: JSON.stringify(obj, null, 2), error: null };
  }
  catch (e: any) {
    return { json: '', error: e?.message ?? 'Invalid TOML' };
  }
});

const jsonOutput = computed(() => result.value.json);
const parseError = computed(() => result.value.error);

// ── 清空 ─────────────────────────────────────────────────────────────────
function clearInput() {
  tomlInput.value = '';
}
</script>

<template>
  <div class="toml-json-wrap">
    <div class="editor-grid">
      <!-- 左：TOML 输入 -->
      <div class="pane">
        <div class="pane-header">
          <span class="pane-title">TOML Input</span>
          <div class="pane-actions">
            <c-button
              v-if="tomlInput"
              variant="text"
              size="small"
              class="action-btn"
              title="Clear"
              @click="clearInput"
            >
              <icon-mdi-close class="action-icon" />
            </c-button>
          </div>
        </div>

        <c-code-input
          v-model="tomlInput"
          language="toml"
          placeholder="Paste your TOML here..."
          min-height="420px"
        />
      </div>

      <!-- 右：JSON 输出 -->
      <div class="pane">
        <div class="pane-header">
          <span class="pane-title">JSON Output</span>
          <div class="pane-actions">
            <c-output-actions
              :value="jsonOutput"
              :downloadable="true"
              download-filename="output.json"
            />
          </div>
        </div>

        <!-- 正常输出 -->
        <c-code-input
          v-if="!parseError"
          :model-value="jsonOutput"
          language="json"
          placeholder="Converted JSON will appear here…"
          min-height="420px"
          readonly
        />

        <!-- 错误状态 -->
        <div v-else class="error-pane" style="min-height:420px">
          <div class="error-icon-wrap">
            <icon-mdi-alert-circle-outline class="error-icon" />
          </div>
          <div class="error-title">
            Parse Error
          </div>
          <pre class="error-message">{{ parseError }}</pre>
          <div class="error-tip">
            Make sure your TOML syntax is valid. Check for missing quotes or incorrect table headers.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.toml-json-wrap {
  display: flex;
  flex-direction: column;
}

.editor-grid {
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
  min-width: 0;
}

.pane-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px;
  min-height: 28px;
}

.pane-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  opacity: 0.4;
}

.pane-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.action-btn {
  opacity: 0.45;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.9;
  }
}

.action-icon {
  font-size: 15px;
}

// ── 错误面板 ──────────────────────────────────────────────────────────────
.error-pane {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 28px 20px;
  border-radius: 8px;
  border: 1.5px solid rgba(239, 68, 68, 0.25);
  background: rgba(239, 68, 68, 0.04);
}

.error-icon-wrap {
  font-size: 32px;
  color: #ef4444;
  opacity: 0.7;
}

.error-title {
  font-size: 14px;
  font-weight: 700;
  color: #ef4444;
}

.error-message {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 12px;
  color: #dc2626;
  background: rgba(239, 68, 68, 0.07);
  border-radius: 6px;
  padding: 10px 14px;
  margin: 0;
  width: 100%;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.6;
}

.error-tip {
  font-size: 11px;
  opacity: 0.5;
  text-align: center;
  max-width: 340px;
}
</style>
