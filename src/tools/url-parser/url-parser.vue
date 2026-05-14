<script setup lang="ts">
import { isNotThrowing } from '@/utils/boolean';
import { withDefaultOnError } from '@/utils/defaults';
import { useStyleStore } from '@/stores/style.store';
import { useClipboard, useStorage } from '@vueuse/core';

const styleStore = useStyleStore();
const { copy } = useClipboard();

const urlToParse = useStorage('url-parser:url', 'https://me:pwd@it-tools.tech:3000/url-parser?key1=value1&key2=value2#the-hash');

const urlParsed = computed(() => withDefaultOnError(() => new URL(urlToParse.value), undefined));
const isValid = computed(() => isNotThrowing(() => new URL(urlToParse.value)));

// 结构化字段
const mainFields = computed(() => {
  const u = urlParsed.value;
  if (!u) return [];
  return [
    { label: 'Protocol', value: u.protocol, color: '#6366f1', icon: '🔒' },
    { label: 'Username', value: u.username, color: '#f59e0b', icon: '👤' },
    { label: 'Password', value: u.password, color: '#f59e0b', icon: '🔑' },
    { label: 'Hostname', value: u.hostname, color: '#10b981', icon: '🌐' },
    { label: 'Port', value: u.port, color: '#3b82f6', icon: '🔌' },
    { label: 'Pathname', value: u.pathname, color: '#8b5cf6', icon: '📁' },
    { label: 'Hash', value: u.hash, color: '#ec4899', icon: '#️⃣' },
  ].filter(f => f.value);
});

// Query 参数
const queryParams = computed(() => {
  if (!urlParsed.value) return [];
  return Array.from(urlParsed.value.searchParams.entries()).map(([k, v]) => ({ key: k, value: v }));
});

// 复制状态
const copiedField = ref('');
async function copyField(label: string, value: string) {
  await copy(value);
  copiedField.value = label;
  setTimeout(() => { copiedField.value = ''; }, 1500);
}
</script>

<template>
  <div class="url-parser" :class="{ dark: styleStore.isDarkTheme }">
    <!-- 输入区 -->
    <c-card mb-4>
      <c-input-text
        v-model:value="urlToParse"
        label="URL to parse"
        placeholder="https://example.com/path?key=value#hash"
        raw-text
        :validation-rules="[{ validator: (v: string) => isNotThrowing(() => new URL(v)), message: 'Invalid URL' }]"
        clearable
      />
    </c-card>

    <!-- 解析结果树 -->
    <template v-if="isValid && urlParsed">
      <!-- 主字段 -->
      <c-card mb-3>
        <div class="tree-title">
          <span class="tree-icon">🌳</span>
          URL Structure
        </div>

        <!-- URL 高亮预览 -->
        <div class="url-preview" :class="{ dark: styleStore.isDarkTheme }">
          <span class="url-part url-protocol">{{ urlParsed.protocol }}//</span>
          <template v-if="urlParsed.username">
            <span class="url-part url-auth">{{ urlParsed.username }}</span>
            <template v-if="urlParsed.password">
              <span class="url-sep">:</span>
              <span class="url-part url-auth">{{ urlParsed.password }}</span>
            </template>
            <span class="url-sep">@</span>
          </template>
          <span class="url-part url-host">{{ urlParsed.hostname }}</span>
          <span v-if="urlParsed.port" class="url-part url-port">:{{ urlParsed.port }}</span>
          <span class="url-part url-path">{{ urlParsed.pathname }}</span>
          <span v-if="urlParsed.search" class="url-part url-query">{{ urlParsed.search }}</span>
          <span v-if="urlParsed.hash" class="url-part url-hash">{{ urlParsed.hash }}</span>
        </div>

        <div class="field-tree">
          <div
            v-for="field in mainFields"
            :key="field.label"
            class="tree-node"
          >
            <div class="tree-connector">
              <span class="connector-line" />
              <span class="connector-dot" :style="{ background: field.color }" />
            </div>
            <div class="tree-content">
              <div class="node-icon">{{ field.icon }}</div>
              <div class="node-label" :style="{ color: field.color }">
                {{ field.label }}
              </div>
              <div class="node-value">
                {{ field.value }}
              </div>
              <button class="node-copy" :class="{ copied: copiedField === field.label }" @click="copyField(field.label, field.value)">
                <icon-mdi-check v-if="copiedField === field.label" style="font-size:12px; color:#22c55e" />
                <icon-mdi-content-copy v-else style="font-size:12px" />
              </button>
            </div>
          </div>
        </div>
      </c-card>

      <!-- Query Params -->
      <c-card v-if="queryParams.length > 0">
        <div class="tree-title">
          <span class="tree-icon">🔍</span>
          Query Parameters
          <span class="param-count">{{ queryParams.length }}</span>
        </div>

        <div class="param-grid">
          <div
            v-for="param in queryParams"
            :key="param.key"
            class="param-row"
          >
            <div class="param-key">
              {{ param.key }}
            </div>
            <div class="param-eq">
              =
            </div>
            <div class="param-value">
              {{ param.value }}
            </div>
            <button class="node-copy" @click="copyField(`${param.key}=${param.value}`, param.value)">
              <icon-mdi-check v-if="copiedField === `${param.key}=${param.value}`" style="font-size:12px; color:#22c55e" />
              <icon-mdi-content-copy v-else style="font-size:12px" />
            </button>
          </div>
        </div>
      </c-card>
    </template>
  </div>
</template>

<style lang="less" scoped>
.url-parser {
  max-width: 760px;
  margin: 0 auto;
}

.tree-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 14px;
  opacity: 0.8;
}

.tree-icon {
  font-size: 16px;
}

.param-count {
  margin-left: 4px;
  background: rgba(99,102,241,0.12);
  color: #6366f1;
  border-radius: 20px;
  padding: 1px 8px;
  font-size: 11px;
  font-weight: 700;
}

// URL 彩色预览
.url-preview {
  padding: 10px 14px;
  border-radius: 8px;
  background: rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.06);
  font-family: 'SF Mono', monospace;
  font-size: 13px;
  word-break: break-all;
  line-height: 1.7;
  margin-bottom: 16px;
  transition: background 0.2s;

  &.dark {
    background: rgba(255,255,255,0.04);
    border-color: rgba(255,255,255,0.07);
  }
}

.url-part {
  font-weight: 600;
  border-radius: 3px;
  padding: 0 1px;
}

.url-sep { color: #94a3b8; font-weight: 400; }
.url-protocol { color: #6366f1; }
.url-auth { color: #f59e0b; }
.url-host { color: #10b981; }
.url-port { color: #3b82f6; }
.url-path { color: #8b5cf6; }
.url-query { color: #f97316; }
.url-hash { color: #ec4899; }

// 树形节点
.field-tree {
  display: flex;
  flex-direction: column;
  padding-left: 8px;
}

.tree-node {
  display: flex;
  align-items: stretch;
  min-height: 36px;

  &:last-child .connector-line {
    display: none;
  }
}

.tree-connector {
  width: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  position: relative;
}

.connector-line {
  width: 2px;
  flex: 1;
  background: rgba(99,102,241,0.15);
  margin-top: 8px;
}

.connector-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 12px;
  box-shadow: 0 0 0 2px rgba(255,255,255,0.8);

  .dark & {
    box-shadow: 0 0 0 2px rgba(15,17,23,0.8);
  }
}

.tree-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  margin: 2px 0 2px 8px;
  border-radius: 8px;
  transition: background 0.12s;
  min-width: 0;

  &:hover {
    background: rgba(99,102,241,0.06);

    .node-copy {
      opacity: 1;
    }
  }
}

.node-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.node-label {
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  width: 80px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.node-value {
  flex: 1;
  font-family: 'SF Mono', monospace;
  font-size: 13px;
  word-break: break-all;
  opacity: 0.85;
}

.node-copy {
  flex-shrink: 0;
  display: flex;
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

  &.copied {
    opacity: 1;
  }

  &:hover {
    background: rgba(99,102,241,0.1);
  }
}

// Query Params
.param-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.param-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(99,102,241,0.04);
  border: 1px solid rgba(99,102,241,0.1);
  transition: border-color 0.15s, background 0.15s;

  &:hover {
    border-color: rgba(99,102,241,0.25);
    background: rgba(99,102,241,0.08);

    .node-copy {
      opacity: 1;
    }
  }
}

.param-key {
  font-size: 13px;
  font-weight: 700;
  font-family: 'SF Mono', monospace;
  color: #6366f1;
  flex-shrink: 0;
}

.param-eq {
  color: #94a3b8;
  font-weight: 400;
}

.param-value {
  flex: 1;
  font-family: 'SF Mono', monospace;
  font-size: 13px;
  word-break: break-all;
}
</style>
