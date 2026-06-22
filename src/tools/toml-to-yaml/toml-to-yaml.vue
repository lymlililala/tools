<script setup lang="ts">
import { parse as parseToml } from 'iarna-toml-esm';
import { stringify as stringifyYaml } from 'yaml';

const { t } = useI18n();

// ── 状态 ─────────────────────────────────────────────────────────────────
const tomlInput = ref('');
const debouncedToml = refDebounced(tomlInput, 150);

// ── 转换逻辑 ─────────────────────────────────────────────────────────────
interface ConvertResult {
  yaml: string
  error: string | null
}

const result = computed((): ConvertResult => {
  const raw = debouncedToml.value.trim();
  if (!raw) {
    return { yaml: '', error: null };
  }

  try {
    const obj = parseToml(raw);
    return { yaml: stringifyYaml(obj).trim(), error: null };
  }
  catch (e: any) {
    return { yaml: '', error: e?.message ?? 'Invalid TOML' };
  }
});

const yamlOutput = computed(() => result.value.yaml);
const parseError = computed(() => result.value.error);

// ── 清空 ─────────────────────────────────────────────────────────────────
function clearInput() {
  tomlInput.value = '';
}
</script>

<template>
  <div class="tool-wide toml-yaml-wrap">
    <div class="editor-grid">
      <!-- 左：TOML 输入 -->
      <div class="pane">
        <div class="pane-header">
          <span class="pane-title">{{ t('tools.toml-to-yaml.tomlInput') }}</span>
          <div class="pane-actions">
            <c-button
              v-if="tomlInput"
              variant="text"
              size="small"
              class="action-btn"
              :title="t('tools.toml-to-yaml.clear')"
              @click="clearInput"
            >
              <icon-mdi-close class="action-icon" />
            </c-button>
          </div>
        </div>

        <c-code-input
          v-model="tomlInput"
          language="toml"
          :placeholder="t('tools.toml-to-yaml.inputPlaceholder')"
          min-height="calc(100vh - 218px)"
        />
      </div>

      <!-- 右：YAML 输出 -->
      <div class="pane">
        <div class="pane-header">
          <span class="pane-title">{{ t('tools.toml-to-yaml.yamlOutput') }}</span>
          <div class="pane-actions">
            <c-output-actions
              :value="yamlOutput"
              :downloadable="true"
              download-filename="output.yaml"
            />
          </div>
        </div>

        <!-- 正常输出 -->
        <c-code-input
          v-if="!parseError"
          :model-value="yamlOutput"
          language="yaml"
          :placeholder="t('tools.toml-to-yaml.outputPlaceholder')"
          min-height="calc(100vh - 218px)"
          readonly
        />

        <!-- 错误状态 -->
        <div v-else class="error-pane" style="min-height:420px">
          <div class="error-icon-wrap">
            <icon-mdi-alert-circle-outline class="error-icon" />
          </div>
          <div class="error-title">
            {{ t('tools.toml-to-yaml.parseError') }}
          </div>
          <pre class="error-message">{{ parseError }}</pre>
          <div class="error-tip">
            {{ t('tools.toml-to-yaml.tomlTip') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.toml-yaml-wrap {
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
