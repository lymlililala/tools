<script setup lang="ts">
// eslint-disable-next-line no-restricted-imports
import { useClipboard, useStorage } from '@vueuse/core';
import { useStyleStore } from '@/stores/style.store';

const styleStore = useStyleStore();
const { copy } = useClipboard();

// ── 输入 ──────────────────────────────────────────────────────────────────
const urlToParse = useStorage(
  'url-parser:url',
  'https://me:pwd@it-tools.tech:3000/url-parser?key1=value1&key2=value2#the-hash',
);

// ── 解析 ──────────────────────────────────────────────────────────────────
const urlParsed = computed((): URL | null => {
  try {
    return new URL(urlToParse.value.trim());
  }
  catch { return null; }
});

// 只有输入不为空且解析失败才显示错误
const showError = computed(() =>
  urlToParse.value.trim() !== '' && urlParsed.value === null,
);

// ── 结构字段 ──────────────────────────────────────────────────────────────
const filteredFields = computed(() => {
  const u = urlParsed.value;
  if (!u) {
    return [];
  }
  return [
    { label: 'Protocol', value: u.protocol, color: '#6366f1', icon: '🔒' },
    { label: 'Username', value: u.username, color: '#f59e0b', icon: '👤' },
    { label: 'Password', value: u.password, color: '#f59e0b', icon: '🔑' },
    { label: 'Hostname', value: u.hostname, color: '#10b981', icon: '🌐' },
    { label: 'Port', value: u.port, color: '#3b82f6', icon: '🔌' },
    { label: 'Pathname', value: u.pathname, color: '#8b5cf6', icon: '📁' },
    { label: 'Search', value: u.search, color: '#f97316', icon: '🔗' },
    { label: 'Hash', value: u.hash, color: '#ec4899', icon: '#️⃣' },
  ].filter(f => f.value !== '' && f.value !== null);
});

// ── Query 参数（可编辑） ───────────────────────────────────────────────────
interface QueryParam { key: string; value: string }

const queryParams = ref<QueryParam[]>([]);

// URL 解析成功时同步 params
watch(urlParsed, (u) => {
  if (!u) {
    return;
  }
  const current = queryParams.value;
  const next = Array.from(u.searchParams.entries()).map(([k, v]) => ({ key: k, value: v }));
  // 只有 URL 主体变化（非由 params 编辑触发）才重置
  if (JSON.stringify(current) !== JSON.stringify(next)) {
    queryParams.value = next;
  }
}, { immediate: true });

// 编辑 params → 同步回 URL
function rebuildUrl() {
  const u = urlParsed.value;
  if (!u) {
    return;
  }
  const sp = new URLSearchParams();
  queryParams.value.forEach((p) => {
    if (p.key) {
      sp.append(p.key, p.value);
    }
  });
  u.search = sp.toString();
  urlToParse.value = u.toString();
}

function updateParamKey(idx: number, newKey: string) {
  queryParams.value[idx].key = newKey;
  rebuildUrl();
}
function updateParamValue(idx: number, newValue: string) {
  queryParams.value[idx].value = newValue;
  rebuildUrl();
}
function addParam() {
  queryParams.value.push({ key: '', value: '' });
}
function removeParam(idx: number) {
  queryParams.value.splice(idx, 1);
  rebuildUrl();
}

// ── 清空 ─────────────────────────────────────────────────────────────────
function clearUrl() {
  urlToParse.value = '';
  queryParams.value = [];
}

// ── 复制 ─────────────────────────────────────────────────────────────────
const copiedKey = ref('');
async function copyField(key: string, value: string) {
  await copy(value);
  copiedKey.value = key;
  setTimeout(() => {
    copiedKey.value = '';
  }, 1500);
}
</script>

<template>
  <div class="tool-wide url-parser" :class="{ dark: styleStore.isDarkTheme }">
    <!-- ① 输入区 -->
    <c-card mb-4>
      <div class="input-header">
        <span class="input-label">URL to parse</span>
        <n-tooltip v-if="urlToParse" trigger="hover" placement="top">
          <template #trigger>
            <button class="icon-btn icon-btn-danger" @click="clearUrl">
              <icon-mdi-close class="btn-icon" />
            </button>
          </template>
          Clear
        </n-tooltip>
      </div>

      <div class="input-wrap" :class="{ 'has-error': showError }">
        <input
          v-model="urlToParse"
          class="url-input"
          :class="{ 'is-error': showError }"
          placeholder="https://example.com/path?key=value#hash"
          spellcheck="false"
          autocomplete="off"
        >
      </div>

      <!-- 仅真正无效时才显示错误 -->
      <transition name="err-slide">
        <div v-if="showError" class="error-inline">
          <icon-mdi-alert-circle-outline class="ei-icon" />
          <span>Invalid URL — make sure the protocol (https://) is included</span>
        </div>
      </transition>
    </c-card>

    <!-- 解析结果（只有真正有效时才显示） -->
    <template v-if="urlParsed">
      <!-- ② URL Structure -->
      <c-card mb-3>
        <div class="section-title">
          <span>🌳</span> URL Structure
        </div>

        <!-- 彩色预览 -->
        <div class="url-preview">
          <span class="url-protocol">{{ urlParsed.protocol }}//</span>
          <template v-if="urlParsed.username">
            <span class="url-auth">{{ urlParsed.username }}</span>
            <template v-if="urlParsed.password">
              <span class="url-sep">:</span>
              <span class="url-auth">{{ urlParsed.password }}</span>
            </template>
            <span class="url-sep">@</span>
          </template>
          <span class="url-host">{{ urlParsed.hostname }}</span>
          <span v-if="urlParsed.port" class="url-port">:{{ urlParsed.port }}</span>
          <span class="url-path">{{ urlParsed.pathname }}</span>
          <span v-if="urlParsed.search" class="url-query">{{ urlParsed.search }}</span>
          <span v-if="urlParsed.hash" class="url-hash">{{ urlParsed.hash }}</span>
        </div>

        <!-- 字段树 -->
        <div class="field-tree">
          <div
            v-for="(field, i) in filteredFields"
            :key="field.label"
            class="tree-node"
            :class="{ last: i === filteredFields.length - 1 }"
          >
            <div class="tree-connector">
              <span v-if="i < filteredFields.length - 1" class="connector-line" />
              <span class="connector-dot" :style="{ background: field.color }" />
            </div>
            <div class="tree-content">
              <span class="node-icon">{{ field.icon }}</span>
              <span class="node-label" :style="{ color: field.color }">{{ field.label }}</span>
              <span class="node-value">{{ field.value }}</span>
              <button
                class="node-copy"
                :class="{ copied: copiedKey === field.label }"
                :title="`Copy ${field.label}`"
                @click="copyField(field.label, field.value)"
              >
                <icon-mdi-check v-if="copiedKey === field.label" class="copy-icon success" />
                <icon-mdi-content-copy v-else class="copy-icon" />
              </button>
            </div>
          </div>
        </div>
      </c-card>

      <!-- ③ Query Parameters（可编辑） -->
      <c-card>
        <div class="section-title">
          <span>🔍</span>
          Query Parameters
          <span class="param-count">{{ queryParams.length }}</span>
          <button class="add-param-btn" title="Add parameter" @click="addParam">
            <icon-mdi-plus class="btn-icon" />
            Add
          </button>
        </div>

        <div v-if="queryParams.length === 0" class="empty-params">
          No query parameters — click Add to insert one
        </div>

        <div v-else class="param-grid">
          <div
            v-for="(param, idx) in queryParams"
            :key="idx"
            class="param-row"
          >
            <!-- 可编辑 key -->
            <input
              class="param-input param-key"
              :value="param.key"
              placeholder="key"
              spellcheck="false"
              @input="updateParamKey(idx, ($event.target as HTMLInputElement).value)"
            >
            <span class="param-eq">=</span>
            <!-- 可编辑 value -->
            <input
              class="param-input param-value-input"
              :value="param.value"
              placeholder="value"
              spellcheck="false"
              @input="updateParamValue(idx, ($event.target as HTMLInputElement).value)"
            >
            <!-- 复制 value -->
            <button
              class="node-copy"
              :class="{ copied: copiedKey === `param-${idx}` }"
              :title="`Copy value: ${param.value}`"
              @click="copyField(`param-${idx}`, param.value)"
            >
              <icon-mdi-check v-if="copiedKey === `param-${idx}`" class="copy-icon success" />
              <icon-mdi-content-copy v-else class="copy-icon" />
            </button>
            <!-- 删除 -->
            <button class="node-copy remove-btn" :title="`Remove ${param.key}`" @click="removeParam(idx)">
              <icon-mdi-close class="copy-icon" />
            </button>
          </div>
        </div>
      </c-card>
    </template>

    <!-- 空状态 -->
    <div v-else-if="!showError && urlToParse.trim() === ''" class="empty-state">
      <span class="es-icon">🔗</span>
      <span>Paste a URL above to start parsing</span>
    </div>
  </div>
</template>

<style lang="less" scoped>
.url-parser {
  max-width: 900px;
}

// ── 输入区 ────────────────────────────────────────────────────────────────
.input-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.input-label {
  font-size: 12px;
  font-weight: 700;
  opacity: 0.5;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.input-wrap {
  border-radius: 8px;
  transition: box-shadow 0.15s;

  &.has-error .url-input {
    border-color: rgba(239, 68, 68, 0.6);
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }
}

.url-input {
  width: 100%;
  padding: 10px 14px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 13px;
  border: 1.5px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: #fafafa;
  color: inherit;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;

  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    background: #fff;
  }

  .dark & {
    background: #0f1117;
    border-color: rgba(255, 255, 255, 0.1);
    color: #e2e8f0;

    &:focus {
      border-color: #818cf8;
      box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.12);
    }
  }
}

// ── 错误提示 ──────────────────────────────────────────────────────────────
.error-inline {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 7px 12px;
  border-radius: 6px;
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.2);
  font-size: 12px;
  color: #dc2626;
}

.ei-icon {
  flex-shrink: 0;
  font-size: 14px;
  color: #ef4444;
}

.err-slide-enter-active,
.err-slide-leave-active { transition: opacity 0.2s, transform 0.2s; }
.err-slide-enter-from,
.err-slide-leave-to { opacity: 0; transform: translateY(-4px); }

// ── 图标按钮 ──────────────────────────────────────────────────────────────
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  opacity: 0.45;
  transition: opacity 0.15s, background 0.15s, color 0.15s;
  color: inherit;

  &:hover { opacity: 1; background: rgba(99, 102, 241, 0.1); color: #6366f1; }
  &.icon-btn-danger:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
}

.btn-icon { font-size: 15px; }

// ── 区块标题 ──────────────────────────────────────────────────────────────
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 14px;
  opacity: 0.8;
}

.param-count {
  background: rgba(99, 102, 241, 0.12);
  color: #6366f1;
  border-radius: 20px;
  padding: 1px 8px;
  font-size: 11px;
  font-weight: 700;
}

// Add 参数按钮
.add-param-btn {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 6px;
  border: 1px solid rgba(99, 102, 241, 0.25);
  background: rgba(99, 102, 241, 0.06);
  color: #6366f1;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;

  &:hover { background: rgba(99, 102, 241, 0.14); }
}

// ── URL 彩色预览 ──────────────────────────────────────────────────────────
.url-preview {
  padding: 10px 14px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.06);
  font-family: 'SF Mono', monospace;
  font-size: 13px;
  word-break: break-all;
  line-height: 1.7;
  margin-bottom: 16px;

  .dark & { background: rgba(255, 255, 255, 0.04); border-color: rgba(255, 255, 255, 0.07); }
}

.url-sep { color: #94a3b8; }
.url-protocol { color: #6366f1; font-weight: 600; }
.url-auth     { color: #f59e0b; font-weight: 600; }
.url-host     { color: #10b981; font-weight: 600; }
.url-port     { color: #3b82f6; font-weight: 600; }
.url-path     { color: #8b5cf6; font-weight: 600; }
.url-query    { color: #f97316; font-weight: 600; }
.url-hash     { color: #ec4899; font-weight: 600; }

// ── 树形字段列表 ──────────────────────────────────────────────────────────
.field-tree {
  display: flex;
  flex-direction: column;
  padding-left: 8px;
}

.tree-node {
  display: flex;
  align-items: stretch;
  min-height: 36px;
}

.tree-connector {
  width: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.connector-line {
  width: 2px;
  flex: 1;
  background: rgba(99, 102, 241, 0.15);
  margin-top: 6px;
}

.connector-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 13px;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.85);

  .dark & { box-shadow: 0 0 0 2px #0f1117; }
}

.tree-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  margin: 2px 0 2px 8px;
  border-radius: 8px;
  transition: background 0.12s;
  min-width: 0;

  &:hover { background: rgba(99, 102, 241, 0.06); .node-copy { opacity: 1; } }
}

.node-icon  { font-size: 14px; flex-shrink: 0; }
.node-label { font-size: 12px; font-weight: 700; flex-shrink: 0; width: 82px; text-transform: uppercase; letter-spacing: 0.04em; }
.node-value { flex: 1; font-family: 'SF Mono', monospace; font-size: 13px; word-break: break-all; opacity: 0.85; min-width: 0; }

// ── 复制按钮（公用） ──────────────────────────────────────────────────────
.node-copy {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 5px;
  background: transparent;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s, background 0.15s;
  color: inherit;

  &.copied { opacity: 1; }
  &:hover  { background: rgba(99, 102, 241, 0.1); opacity: 1; }
  &.remove-btn:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
}

.copy-icon { font-size: 12px; opacity: 0.6; &.success { color: #22c55e; opacity: 1; } }

// ── Query Params（可编辑） ────────────────────────────────────────────────
.empty-params {
  padding: 14px 0;
  text-align: center;
  font-size: 13px;
  opacity: 0.35;
}

.param-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.param-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(99, 102, 241, 0.04);
  border: 1px solid rgba(99, 102, 241, 0.1);
  transition: border-color 0.15s;

  &:hover {
    border-color: rgba(99, 102, 241, 0.25);
    .node-copy { opacity: 1; }
  }

  &:focus-within {
    border-color: #6366f1;
    background: rgba(99, 102, 241, 0.06);
  }
}

.param-input {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 13px;
  border: none;
  background: transparent;
  outline: none;
  color: inherit;
  min-width: 0;

  &::placeholder { opacity: 0.35; }
}

.param-key {
  width: 120px;
  flex-shrink: 0;
  font-weight: 700;
  color: #6366f1;
}

.param-eq { color: #94a3b8; flex-shrink: 0; }

.param-value-input {
  flex: 1;
}

// ── 空状态 ────────────────────────────────────────────────────────────────
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px 0;
  font-size: 13px;
  opacity: 0.35;
}

.es-icon { font-size: 20px; }
</style>
