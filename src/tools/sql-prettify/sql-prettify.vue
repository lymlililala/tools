<script setup lang="ts">
import { type FormatOptionsWithLanguage, format as formatSQL } from 'sql-formatter';
import { refDebounced } from '@vueuse/core';
import { useCopy } from '@/composable/copy';

// ── 配置 ──────────────────────────────────────────────────────
const config = reactive<FormatOptionsWithLanguage>({
  keywordCase: 'upper',
  useTabs: false,
  language: 'sql',
  indentStyle: 'standard',
  tabulateAlias: true,
});

const dialectOptions = [
  { label: 'Standard SQL', value: 'sql' },
  { label: 'MySQL', value: 'mysql' },
  { label: 'PostgreSQL', value: 'postgresql' },
  { label: 'SQLite', value: 'sqlite' },
  { label: 'MariaDB', value: 'mariadb' },
  { label: 'SQL Server (T-SQL)', value: 'tsql' },
  { label: 'Oracle PL/SQL', value: 'plsql' },
  { label: 'GCP BigQuery', value: 'bigquery' },
  { label: 'Amazon Redshift', value: 'redshift' },
  { label: 'Apache Hive', value: 'hive' },
  { label: 'Apache Spark', value: 'spark' },
  { label: 'IBM DB2', value: 'db2' },
  { label: 'Couchbase N1QL', value: 'n1ql' },
];

const keywordCaseOptions = [
  { label: 'UPPERCASE', value: 'upper' },
  { label: 'lowercase', value: 'lower' },
  { label: '保留原样', value: 'preserve' },
];

const indentStyleOptions = [
  { label: 'Standard', value: 'standard' },
  { label: 'Tabular Left', value: 'tabularLeft' },
  { label: 'Tabular Right', value: 'tabularRight' },
];

// ── 输入 ──────────────────────────────────────────────────────
const rawSQL = useStorage('sql-prettify:raw', 'select field1,field2,field3 from my_table where my_condition;');
const debouncedSQL = refDebounced(rawSQL, 200);

// ── 格式化逻辑 ────────────────────────────────────────────────
interface Result {
  sql: string
  error: string | null
}

const result = computed((): Result => {
  const raw = debouncedSQL.value.trim();
  if (!raw) return { sql: '', error: null };

  try {
    const formatted = formatSQL(raw, config);
    return { sql: formatted, error: null };
  }
  catch (e: any) {
    return { sql: '', error: e?.message ?? 'SQL 格式化失败' };
  }
});

const prettySQL = computed(() => result.value.sql);
const parseError = computed(() => result.value.error);

const hasInput = computed(() => rawSQL.value.trim().length > 0);
const hasError = computed(() => hasInput.value && !!parseError.value);

// ── 清空 ──────────────────────────────────────────────────────
function clearInput() {
  rawSQL.value = '';
}

// ── 复制 ──────────────────────────────────────────────────────
const { copy: copySQL, isJustCopied } = useCopy({
  source: prettySQL,
  text: '格式化 SQL 已复制到剪贴板',
});

// ── 下载 ──────────────────────────────────────────────────────
function downloadSQL() {
  if (!prettySQL.value) return;
  const blob = new Blob([prettySQL.value], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'formatted.sql';
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <!-- ── 配置栏 ────────────────────────────────────────────── -->
  <div class="toolbar">
    <div class="toolbar-item">
      <span class="toolbar-label">方言</span>
      <c-select
        v-model:value="config.language"
        :options="dialectOptions"
        style="min-width: 160px"
      />
    </div>
    <div class="toolbar-divider" />
    <div class="toolbar-item">
      <span class="toolbar-label">关键字大小写</span>
      <c-select
        v-model:value="config.keywordCase"
        :options="keywordCaseOptions"
        style="min-width: 130px"
      />
    </div>
    <div class="toolbar-divider" />
    <div class="toolbar-item">
      <span class="toolbar-label">缩进风格</span>
      <c-select
        v-model:value="config.indentStyle"
        :options="indentStyleOptions"
        style="min-width: 130px"
      />
    </div>
  </div>

  <!-- ── 双面板 ─────────────────────────────────────────────── -->
  <div class="sql-panes">
    <!-- 输入面板 -->
    <div class="pane" :class="{ 'pane--error': hasError }">
      <div class="pane-header">
        <span class="pane-title">SQL 查询</span>
        <c-tooltip v-if="hasInput" tooltip="清除输入" position="bottom">
          <button class="hdr-btn" @click="clearInput">
            <icon-mdi-close-circle-outline />
          </button>
        </c-tooltip>
      </div>

      <c-code-input
        v-model="rawSQL"
        language="sql"
        placeholder="在此粘贴您的 SQL 查询语句..."
        class="code-editor"
        :class="{ 'editor--error': hasError }"
      />

      <!-- 错误面板 -->
      <transition name="slide-down">
        <div v-if="parseError" class="error-panel">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
            <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          <span>{{ parseError }}</span>
        </div>
      </transition>
    </div>

    <!-- 输出面板 -->
    <div class="pane">
      <div class="pane-header">
        <span class="pane-title">格式化结果</span>
        <div class="action-group">
          <c-tooltip :tooltip="isJustCopied ? '已复制！' : '复制 SQL'" position="bottom">
            <button
              class="hdr-btn"
              :class="{ 'hdr-btn--success': isJustCopied }"
              :disabled="!prettySQL"
              @click="copySQL()"
            >
              <icon-mdi-check v-if="isJustCopied" />
              <icon-mdi-content-copy v-else />
            </button>
          </c-tooltip>
          <c-tooltip tooltip="下载 formatted.sql" position="bottom">
            <button class="hdr-btn" :disabled="!prettySQL" @click="downloadSQL">
              <icon-mdi-download />
            </button>
          </c-tooltip>
        </div>
      </div>

      <c-code-input
        :model-value="prettySQL"
        language="sql"
        placeholder="格式化结果将显示在此..."
        class="code-editor"
        readonly
      />
    </div>
  </div>
</template>

<style lang="less" scoped>
/* ── 配置工具栏 ───────────────────────────────────────────────── */
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  padding: 8px 14px;
  background: rgba(0,0,0,0.025);
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.06);
  flex-wrap: wrap;

  .dark & {
    background: rgba(255,255,255,0.03);
    border-color: rgba(255,255,255,0.07);
  }
}

.toolbar-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-label {
  font-size: 12.5px;
  font-weight: 500;
  color: #555;
  white-space: nowrap;

  .dark & { color: #aaa; }
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: rgba(0,0,0,0.1);
  flex-shrink: 0;

  .dark & { background: rgba(255,255,255,0.1); }
}

/* ── 双面板布局 ───────────────────────────────────────────────── */
.sql-panes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  width: 100%;

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

/* ── 操作按钮 ─────────────────────────────────────────────────── */
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

/* ── 编辑器高度自适应 ─────────────────────────────────────────── */
.code-editor {
  :deep(.editor-wrap) {
    min-height: 320px;
    height: calc(100vh - 320px);
    max-height: 760px;
  }

  &.editor--error :deep(.editor-wrap) {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
    background: #fff9f9;

    .dark & {
      background: #1a0a0a;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15) !important;
    }
  }
}

/* ── 错误面板 ─────────────────────────────────────────────────── */
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
  font-family: 'SF Mono', 'Fira Code', monospace;
  word-break: break-all;

  svg { flex-shrink: 0; margin-top: 1px; }

  .dark & {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.25);
    color: #f87171;
  }
}

/* ── 动画 ─────────────────────────────────────────────────────── */
.slide-down-enter-active,
.slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from,
.slide-down-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
