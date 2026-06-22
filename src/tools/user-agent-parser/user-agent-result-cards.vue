<script setup lang="ts">
// eslint-disable-next-line no-restricted-imports
import { useClipboard } from '@vueuse/core';
import type { UAParser } from 'ua-parser-js';
import type { UserAgentResultSection } from './user-agent-parser.types';
import { useStyleStore } from '@/stores/style.store';

const props = defineProps<{
  userAgentInfo?: UAParser.IResult
  sections: UserAgentResultSection[]
}>();
const { userAgentInfo, sections } = toRefs(props);

const styleStore = useStyleStore();
const { copy } = useClipboard();
const { t } = useI18n();

// 把稳定的英文 heading / label 映射到 i18n key（保留英文作为复制 JSON 的键名）
const headingKeyMap: Record<string, string> = {
  Browser: 'browser',
  Engine: 'engine',
  OS: 'os',
  Device: 'device',
  CPU: 'cpu',
};
const labelKeyMap: Record<string, string> = {
  Name: 'name',
  Version: 'version',
  Model: 'model',
  Type: 'type',
  Vendor: 'vendor',
  Architecture: 'architecture',
};
function headingLabel(heading: string) {
  const k = headingKeyMap[heading];
  return k ? t(`tools.user-agent-parser.section.${k}`) : heading;
}
function fieldLabel(label: string) {
  const k = labelKeyMap[label];
  return k ? t(`tools.user-agent-parser.field.${k}`) : label;
}

// 各卡片的复制反馈
const copiedHeading = ref('');
async function copyCard(heading: string, content: UserAgentResultSection['content']) {
  const obj: Record<string, string> = {};
  for (const { label, getValue } of content) {
    const v = getValue(props.userAgentInfo);
    if (v) {
      obj[label] = v;
    }
  }
  if (Object.keys(obj).length === 0) {
    return;
  }
  await copy(JSON.stringify(obj, null, 2));
  copiedHeading.value = heading;
  setTimeout(() => {
    copiedHeading.value = '';
  }, 1400);
}

// 判断某卡片是否全部为空
function cardHasData(content: UserAgentResultSection['content']): boolean {
  return content.some(({ getValue }) => getValue(props.userAgentInfo) !== undefined);
}
</script>

<template>
  <div :class="{ dark: styleStore.isDarkTheme }">
    <n-grid :x-gap="12" :y-gap="10" cols="1 s:2" responsive="screen">
      <n-gi v-for="{ heading, icon, content } in sections" :key="heading">
        <div class="ua-card" :class="{ 'no-data': !cardHasData(content) }">
          <!-- 卡片标题栏 -->
          <div class="card-header">
            <div class="card-title-row">
              <n-icon size="20" :component="icon" class="card-icon" />
              <span class="card-heading">{{ headingLabel(heading) }}</span>
            </div>

            <!-- 每张卡片右上角复制按钮（有数据才显示） -->
            <n-tooltip v-if="cardHasData(content)" trigger="hover" placement="top">
              <template #trigger>
                <button
                  class="copy-btn"
                  :class="{ 'is-copied': copiedHeading === heading }"
                  :title="t('tools.user-agent-parser.copySection', { section: headingLabel(heading) })"
                  @click="copyCard(heading, content)"
                >
                  <icon-mdi-check v-if="copiedHeading === heading" class="copy-icon success" />
                  <icon-mdi-content-copy v-else class="copy-icon" />
                </button>
              </template>
              {{ copiedHeading === heading ? t('tools.user-agent-parser.copied') : t('tools.user-agent-parser.copySection', { section: headingLabel(heading) }) }}
            </n-tooltip>
          </div>

          <!-- 有数据时：展示标签 -->
          <div v-if="cardHasData(content)" class="tags-area">
            <template v-for="{ label, getValue } in content" :key="label">
              <n-tooltip v-if="getValue(userAgentInfo)" trigger="hover" placement="top">
                <template #trigger>
                  <n-tag
                    type="success"
                    size="large"
                    round
                    :bordered="false"
                    class="ua-tag"
                  >
                    {{ getValue(userAgentInfo) }}
                  </n-tag>
                </template>
                {{ fieldLabel(label) }}
              </n-tooltip>

              <!-- 空字段：灰色虚线占位符保持布局一致 -->
              <n-tag
                v-else
                size="large"
                round
                :bordered="false"
                class="ua-tag ua-tag--empty"
              >
                <icon-mdi-minus class="empty-icon" />
                {{ fieldLabel(label) }}
              </n-tag>
            </template>
          </div>

          <!-- 全部为空时：统一空状态 -->
          <div v-else class="empty-state">
            <icon-mdi-information-outline class="es-icon" />
            <span>{{ t('tools.user-agent-parser.notDetected', { section: headingLabel(heading) }) }}</span>
          </div>
        </div>
      </n-gi>
    </n-grid>
  </div>
</template>

<style lang="less" scoped>
// ── 卡片 ─────────────────────────────────────────────────────────────────
.ua-card {
  height: 100%;
  padding: 16px 18px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #ffffff;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: box-shadow 0.15s, border-color 0.15s;

  &:hover {
    border-color: rgba(34, 197, 94, 0.25);
    box-shadow: 0 2px 10px rgba(34, 197, 94, 0.07);
  }

  &.no-data {
    border-color: rgba(0, 0, 0, 0.05);
    background: rgba(0, 0, 0, 0.01);
    &:hover { box-shadow: none; border-color: rgba(0, 0, 0, 0.07); }
  }

  .dark & {
    background: #1a1a2e;
    border-color: rgba(255, 255, 255, 0.08);
    &:hover { border-color: rgba(74, 222, 128, 0.25); box-shadow: 0 2px 10px rgba(74, 222, 128, 0.07); }
    &.no-data { background: rgba(255,255,255,0.01); border-color: rgba(255,255,255,0.05); }
  }
}

// ── 标题行 ────────────────────────────────────────────────────────────────
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-icon {
  opacity: 0.55;
}

.card-heading {
  font-size: 15px;
  font-weight: 600;
  // 加深对比度
  color: rgba(0, 0, 0, 0.72);

  .dark & { color: rgba(255, 255, 255, 0.75); }
}

// ── 复制按钮 ──────────────────────────────────────────────────────────────
.copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: transparent;
  cursor: pointer;
  color: inherit;
  opacity: 0;
  transition: opacity 0.15s, background 0.15s;

  .ua-card:hover & { opacity: 0.45; }
  .ua-card:hover &:hover { opacity: 1; background: rgba(99, 102, 241, 0.1); color: #6366f1; }
  &.is-copied { opacity: 1 !important; color: #16a34a; border-color: rgba(22, 163, 74, 0.25); background: rgba(22, 163, 74, 0.07); }

  .dark & { border-color: rgba(255, 255, 255, 0.1); }
}

.copy-icon { font-size: 13px; &.success { color: #16a34a; } }

// ── 标签区域 ──────────────────────────────────────────────────────────────
.tags-area {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

// 有数据标签 — 悬停加深
.ua-tag {
  cursor: default;
  transition: filter 0.12s, transform 0.1s;

  &:hover {
    filter: brightness(0.93);
    transform: translateY(-1px);
  }
}

// 空字段占位标签 — 灰色虚线风格
.ua-tag--empty {
  opacity: 0.38;
  border: 1px dashed rgba(0, 0, 0, 0.2) !important;
  background: transparent !important;
  font-size: 11px;
  cursor: default;

  &:hover { filter: none; transform: none; }

  .dark & { border-color: rgba(255, 255, 255, 0.15) !important; }
}

.empty-icon { font-size: 11px; margin-right: 3px; opacity: 0.6; }

// ── 空状态（全部未识别）──────────────────────────────────────────────────
.empty-state {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  // 提升空状态文字对比度（原来用 opacity 导致过浅）
  color: rgba(0, 0, 0, 0.38);
  padding: 4px 0;

  .dark & { color: rgba(255, 255, 255, 0.3); }
}

.es-icon { font-size: 14px; flex-shrink: 0; }
</style>
