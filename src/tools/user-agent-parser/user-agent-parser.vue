<script setup lang="ts">
import { useClipboard } from '@vueuse/core';
import { UAParser } from 'ua-parser-js';
import { Adjustments, Browser, Cpu, Devices, Engine } from '@vicons/tabler';
import UserAgentResultCards from './user-agent-result-cards.vue';
import type { UserAgentResultSection } from './user-agent-parser.types';
import { withDefaultOnError } from '@/utils/defaults';
import { useStyleStore } from '@/stores/style.store';

const { t } = useI18n();
const styleStore = useStyleStore();
const { copy } = useClipboard();

const ua = ref(navigator.userAgent as string);

// If not input in the ua field is present return an empty object of type UAParser.IResult because otherwise
// UAParser returns the values for the current Browser. This is confusing because results are shown for an empty
// UA field value.
function getUserAgentInfo(userAgent: string) {
  return userAgent.trim().length > 0
    ? UAParser(userAgent.trim())
    : ({ ua: '', browser: {}, cpu: {}, device: {}, engine: {}, os: {} } as UAParser.IResult);
}
const userAgentInfo = computed(() => withDefaultOnError(() => getUserAgentInfo(ua.value), undefined));
const hasResult = computed(() => ua.value.trim().length > 0 && userAgentInfo.value !== undefined);

// ── 一键复制全部解析结果 JSON ──────────────────────────────────────────────
const copiedAll = ref(false);
async function copyAllJson() {
  if (!userAgentInfo.value) return;
  const result = {
    browser: userAgentInfo.value.browser,
    engine: userAgentInfo.value.engine,
    os: userAgentInfo.value.os,
    device: userAgentInfo.value.device,
    cpu: userAgentInfo.value.cpu,
  };
  await copy(JSON.stringify(result, null, 2));
  copiedAll.value = true;
  setTimeout(() => { copiedAll.value = false; }, 1400);
}

const sections: UserAgentResultSection[] = [
  {
    heading: 'Browser',
    icon: Browser,
    content: [
      {
        label: 'Name',
        getValue: block => block?.browser.name,
        undefinedFallback: 'No browser name available',
      },
      {
        label: 'Version',
        getValue: block => block?.browser.version,
        undefinedFallback: 'No browser version available',
      },
    ],
  },
  {
    heading: 'Engine',
    icon: Engine,
    content: [
      {
        label: 'Name',
        getValue: block => block?.engine.name,
        undefinedFallback: 'No engine name available',
      },
      {
        label: 'Version',
        getValue: block => block?.engine.version,
        undefinedFallback: 'No engine version available',
      },
    ],
  },
  {
    heading: 'OS',
    icon: Adjustments,
    content: [
      {
        label: 'Name',
        getValue: block => block?.os.name,
        undefinedFallback: 'No OS name available',
      },
      {
        label: 'Version',
        getValue: block => block?.os.version,
        undefinedFallback: 'No OS version available',
      },
    ],
  },
  {
    heading: 'Device',
    icon: Devices,
    content: [
      {
        label: 'Model',
        getValue: block => block?.device.model,
        undefinedFallback: 'No device model available',
      },
      {
        label: 'Type',
        getValue: block => block?.device.type,
        undefinedFallback: 'No device type available',
      },
      {
        label: 'Vendor',
        getValue: block => block?.device.vendor,
        undefinedFallback: 'No device vendor available',
      },
    ],
  },
  {
    heading: 'CPU',
    icon: Cpu,
    content: [
      {
        label: 'Architecture',
        getValue: block => block?.cpu.architecture,
        undefinedFallback: 'No CPU architecture available',
      },
    ],
  },
];
</script>

<template>
  <div class="ua-parser-wrap" :class="{ dark: styleStore.isDarkTheme }">
    <!-- 输入框 -->
    <c-input-text
      v-model:value="ua"
      label="User agent string"
      multiline
      placeholder="Put your user-agent here..."
      clearable
      raw-text
      rows="2"
      autosize
      monospace
      mb-3
    />

    <!-- 结果区标题栏 + 一键复制 JSON 按钮 -->
    <div v-if="hasResult" class="results-header">
      <span class="results-label">{{ t('tools.user-agent-parser.resultsLabel') }}</span>
      <n-tooltip trigger="hover" placement="top">
        <template #trigger>
          <button
            class="copy-all-btn"
            :class="{ 'is-copied': copiedAll }"
            @click="copyAllJson"
          >
            <icon-mdi-check v-if="copiedAll" class="btn-icon" />
            <icon-mdi-code-json v-else class="btn-icon" />
            {{ copiedAll ? t('tools.user-agent-parser.copiedBtn') : t('tools.user-agent-parser.copyJsonBtn') }}
          </button>
        </template>
        {{ copiedAll ? t('tools.user-agent-parser.copiedTooltip') : t('tools.user-agent-parser.copyJsonTooltip') }}
      </n-tooltip>
    </div>

    <UserAgentResultCards :user-agent-info="userAgentInfo" :sections="sections" />
  </div>
</template>

<style lang="less" scoped>
.ua-parser-wrap {
  max-width: 860px;
  margin: 0 auto;
}

// ── 结果区标题栏 ──────────────────────────────────────────────────────────
.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.results-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  // 提升对比度
  color: rgba(0, 0, 0, 0.48);

  .dark & { color: rgba(255, 255, 255, 0.42); }
}

// ── 复制 JSON 按钮 ────────────────────────────────────────────────────────
.copy-all-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 7px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: transparent;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  color: inherit;
  transition: background 0.15s, color 0.15s, border-color 0.15s;

  &:hover {
    background: rgba(99, 102, 241, 0.08);
    color: #6366f1;
    border-color: rgba(99, 102, 241, 0.25);
  }

  &.is-copied {
    color: #16a34a;
    border-color: rgba(22, 163, 74, 0.25);
    background: rgba(22, 163, 74, 0.07);
  }

  .dark & {
    border-color: rgba(255, 255, 255, 0.1);
    &:hover { background: rgba(99, 102, 241, 0.12); border-color: rgba(129, 140, 248, 0.3); color: #818cf8; }
  }
}

.btn-icon { font-size: 14px; }
</style>
