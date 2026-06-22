<script setup lang="ts">
import { generateMeta } from '@it-tools/oggen';
import _ from 'lodash';
import { image, ogSchemas, twitter, website } from './og-schemas';
import type { OGSchemaType, OGSchemaTypeElementSelect } from './OGSchemaType.type';

const { t } = useI18n();

// ── 元数据状态 ─────────────────────────────────────────────────────────────
const metadata = ref<{ type: string; [k: string]: any }>({
  'type': 'website',
  'twitter:card': 'summary_large_image',
});

watch(
  () => ref(metadata.value.type),
  (_ignored, prevSection) => {
    const section = ogSchemas[prevSection.value];
    if (!section) {
      return;
    }
    section.elements.forEach(({
      key,
    }) => { metadata.value[key] = ''; });
  },
);

const sections = computed((): OGSchemaType[] => {
  const secs: OGSchemaType[] = [website, image, twitter];
  const additionalSchema = ogSchemas[metadata.value.type];
  if (additionalSchema) {
    secs.push(additionalSchema);
  }
  return secs;
});

// ── 生成 Meta Tags ────────────────────────────────────────────────────────
const metaTags = computed(() => {
  const twitterMeta = _.chain(metadata.value)
    .pickBy((_v, k) => k.startsWith('twitter:'))
    .mapKeys((_v, k) => k.replace(/^twitter:/, ''))
    .value();
  const otherMeta = _.pickBy(metadata.value, (_v, k) => !k.startsWith('twitter:'));
  return generateMeta({ ...otherMeta, twitter: twitterMeta }, { generateTwitterCompatibleMeta: true });
});

// ── 复制反馈 ─────────────────────────────────────────────────────────────
const copySuccess = ref(false);
async function copyMeta() {
  if (!metaTags.value) {
    return;
  }
  await navigator.clipboard.writeText(metaTags.value);
  copySuccess.value = true;
  setTimeout(() => (copySuccess.value = false), 2000);
}
</script>

<template>
  <div class="meta-gen-wrap">
    <!-- 左右双栏 -->
    <div class="main-grid">
      <!-- 左：表单 -->
      <div class="form-col">
        <div
          v-for="{ name, elements } of sections"
          :key="name"
          class="form-section"
        >
          <!-- 分组标题 -->
          <div class="section-title">
            {{ name }}
          </div>

          <!-- 字段列表 -->
          <div class="fields-list">
            <div
              v-for="{ key, type, label, placeholder, ...element } of elements"
              :key="key"
              class="field-row"
            >
              <label class="field-label">{{ label }}</label>

              <c-input-text
                v-if="type === 'input'"
                v-model:value="metadata[key]"
                :placeholder="placeholder"
                clearable
                raw-text
              />

              <n-dynamic-input
                v-else-if="type === 'input-multiple'"
                v-model:value="metadata[key]"
                :min="1"
                :placeholder="placeholder"
                :default-value="['']"
                :show-sort-button="true"
              />

              <c-select
                v-else-if="type === 'select'"
                v-model:value="metadata[key]"
                w-full
                :placeholder="placeholder"
                :options="(element as OGSchemaTypeElementSelect).options"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 右：输出（sticky） -->
      <div class="output-col">
        <div class="output-sticky">
          <div class="output-header">
            <span class="output-title">{{ t('tools.meta-tag-generator.outputTitle') }}</span>
            <n-tooltip trigger="hover" placement="top">
              <template #trigger>
                <button
                  class="copy-btn"
                  :class="{ success: copySuccess }"
                  @click="copyMeta"
                >
                  <icon-mdi-check v-if="copySuccess" class="copy-icon" />
                  <icon-mdi-content-copy v-else class="copy-icon" />
                  <span>{{ copySuccess ? t('tools.meta-tag-generator.copied') : t('tools.meta-tag-generator.copy') }}</span>
                </button>
              </template>
              {{ t('tools.meta-tag-generator.copyAllTooltip') }}
            </n-tooltip>
          </div>

          <c-code-input
            :model-value="metaTags"
            language="xml"
            :placeholder="t('tools.meta-tag-generator.outputPlaceholder')"
            min-height="320px"

            readonly wrap
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.meta-gen-wrap {
  max-width: 1100px;
  margin: 0 auto;
}

// ── 左右双栏 ──────────────────────────────────────────────────────────────
.main-grid {
  display: grid;
  grid-template-columns: 58fr 42fr;
  gap: 28px;
  align-items: start;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
}

// ── 左：表单列 ────────────────────────────────────────────────────────────
.form-col {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

// 分组标题：加大字号、加粗、加底边线
.section-title {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  opacity: 0.55;
  padding-bottom: 8px;
  border-bottom: 1.5px solid rgba(99, 102, 241, 0.15);
}

.fields-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

// 字段行：标签上方、输入框下方
.field-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.6;
}

// ── 右：输出列（sticky） ──────────────────────────────────────────────────
.output-col {
  min-width: 0;
}

.output-sticky {
  position: sticky;
  top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.output-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px;
}

.output-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  opacity: 0.4;
}

// ── 复制按钮 ──────────────────────────────────────────────────────────────
.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid rgba(99, 102, 241, 0.25);
  background: rgba(99, 102, 241, 0.06);
  color: #6366f1;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;

  &:hover {
    background: rgba(99, 102, 241, 0.14);
    border-color: rgba(99, 102, 241, 0.4);
  }

  &.success {
    background: rgba(34, 197, 94, 0.08);
    border-color: rgba(34, 197, 94, 0.3);
    color: #16a34a;
  }
}

.copy-icon {
  font-size: 13px;
}

// ── n-dynamic-input 间距 ──────────────────────────────────────────────────
:deep(.n-dynamic-input-item) {
  margin-bottom: 5px;
}
</style>
