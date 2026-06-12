<script setup lang="ts">
import { v1 as generateUuidV1, v3 as generateUuidV3, v4 as generateUuidV4, v5 as generateUuidV5, NIL as nilUuid } from 'uuid';
import { useCopy } from '@/composable/copy';
import { computedRefreshable } from '@/composable/computedRefreshable';
import { withDefaultOnError } from '@/utils/defaults';

const { t } = useI18n();

const versions = ['NIL', 'v1', 'v3', 'v4', 'v5'] as const;

const version = useStorage<typeof versions[number]>('uuid-generator:version', 'v4');
const count = useStorage('uuid-generator:quantity', 1);

// v3/v5 命名空间预设
const NAMESPACE_PRESETS = {
  DNS: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  URL: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
  OID: '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
  X500: '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
} as const;

const v35Args = ref<{ namespace: string; name: string }>({ namespace: NAMESPACE_PRESETS.URL, name: '' });

// 当前选中的预设快捷按钮
const selectedPreset = computed(() => {
  return (Object.entries(NAMESPACE_PRESETS) as [string, string][]).find(
    ([, v]) => v === v35Args.value.namespace,
  )?.[0] ?? null;
});

function applyPreset(key: keyof typeof NAMESPACE_PRESETS) {
  v35Args.value.namespace = NAMESPACE_PRESETS[key];
}

// Namespace 合法性校验
const validUuidRules = [
  {
    message: 'Invalid UUID',
    validator: (value: string) => {
      if (value === nilUuid) {
        return true;
      }
      return Boolean(value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/));
    },
  },
];

// 数量限制在 1-1000
const safeCount = computed({
  get: () => count.value,
  set: (v: number) => {
    const n = Math.round(Number(v));
    count.value = Number.isNaN(n) ? 1 : Math.min(1000, Math.max(1, n));
  },
});

const generators = {
  NIL: () => nilUuid,
  v1: (index: number) => generateUuidV1({
    clockseq: index,
    msecs: Date.now(),
    nsecs: Math.floor(Math.random() * 10000),
    node: Array.from({ length: 6 }, () => Math.floor(Math.random() * 256)),
  }),
  v3: () => generateUuidV3(v35Args.value.name, v35Args.value.namespace),
  v4: () => generateUuidV4(),
  v5: () => generateUuidV5(v35Args.value.name, v35Args.value.namespace),
};

// 按行换行输出
const [uuids, refreshUUIDs] = computedRefreshable(() => withDefaultOnError(() =>
  Array.from({ length: count.value }, (_ignored, index) => {
    const generator = generators[version.value] ?? generators.NIL;
    return generator(index);
  }).join('\n'), ''));

// 复制
const { copy, isJustCopied } = useCopy({ source: uuids, text: 'UUIDs copied to the clipboard' });

// 版本切换时重置 v3/v5 的 name（namespace 保持）
watch(version, () => {
  if (version.value !== 'v3' && version.value !== 'v5') {
    // 非 v3/v5 时不需要重置任何东西
  }
});
</script>

<template>
  <div class="uuid-wrap">
    <!-- ① 版本选择 -->
    <c-buttons-select v-model:value="version" :options="versions" :label="t('tools.uuid-generator.versionLabel')" label-width="110px" mb-3 />

    <!-- ② 数量 -->
    <div mb-3 flex items-center gap-3>
      <span class="field-label">{{ t('tools.uuid-generator.quantity') }}</span>
      <n-input-number v-model:value="safeCount" flex-1 :min="1" :max="1000" :placeholder="t('tools.uuid-generator.quantityPlaceholder')" />
    </div>

    <!-- ③ v3/v5 专用表单（条件渲染） -->
    <transition name="slide-down">
      <div v-if="version === 'v3' || version === 'v5'" class="v35-panel">
        <div class="v35-title">
          {{ version === 'v3' ? t('tools.uuid-generator.v3HashInfo') : t('tools.uuid-generator.v5HashInfo') }}
          — {{ t('tools.uuid-generator.namespaceNameInfo') }}
        </div>

        <!-- Namespace 快捷预设 -->
        <div mb-2 flex flex-wrap items-center gap-2>
          <span class="field-label">{{ t('tools.uuid-generator.namespace') }}</span>
          <div class="preset-row">
            <button
              v-for="(val, key) in NAMESPACE_PRESETS"
              :key="key"
              class="preset-btn"
              :class="{ active: selectedPreset === key }"
              @click="applyPreset(key as keyof typeof NAMESPACE_PRESETS)"
            >
              {{ key }}
            </button>
          </div>
        </div>

        <!-- Namespace 自定义输入 -->
        <div mb-2>
          <c-input-text
            v-model:value="v35Args.namespace"
            placeholder="e.g. 6ba7b810-9dad-11d1-80b4-00c04fd430c8"
            label=" "
            label-width="110px"
            label-position="left"
            :validation-rules="validUuidRules"
            raw-text
            monospace
          />
        </div>

        <!-- Name 输入 -->
        <div mb-2>
          <c-input-text
            v-model:value="v35Args.name"
            :placeholder="t('tools.uuid-generator.namePlaceholder')"
            :label="t('tools.uuid-generator.nameLabel')"
            label-width="110px"
            label-position="left"
            raw-text
          />
        </div>
      </div>
    </transition>

    <!-- ④ 结果输出框：每行一个 UUID，高度自适应最大 320px -->
    <c-input-text
      :value="uuids"
      multiline
      :placeholder="t('tools.uuid-generator.outputPlaceholder')"
      rows="1"
      readonly
      raw-text
      monospace
      my-3
      class="uuid-display"
    />

    <!-- ⑤ 按钮：Primary 复制 + 次级刷新 -->
    <div flex items-center justify-center gap-3>
      <c-button type="primary" class="btn-copy" @click="copy()">
        <transition name="icon-switch" mode="out-in">
          <icon-mdi-check v-if="isJustCopied" key="check" class="btn-icon" />
          <icon-mdi-content-copy v-else key="copy" class="btn-icon" />
        </transition>
        <span>{{ isJustCopied ? t('tools.uuid-generator.copied') : t('tools.uuid-generator.copy') }}</span>
      </c-button>

      <c-button @click="refreshUUIDs">
        <icon-mdi-refresh class="btn-icon" />
        <span>{{ t('tools.uuid-generator.refresh') }}</span>
      </c-button>
    </div>
  </div>
</template>

<style scoped lang="less">
.uuid-wrap {
  width: 100%;
}

/* 标签统一宽度 */
.field-label {
  flex-shrink: 0;
  width: 110px;
  font-size: 14px;
  text-align: right;
  padding-right: 12px;
}

/* ── v3/v5 面板 ────────────────────────────────────────────────── */
.v35-panel {
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: 6px;
  padding: 14px 16px;
  margin-bottom: 12px;
  background: rgba(128, 128, 128, 0.03);
}

.v35-title {
  font-size: 12.5px;
  opacity: 0.6;
  margin-bottom: 12px;
  line-height: 1.5;
}

/* 预设快捷按钮组 */
.preset-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.preset-btn {
  padding: 3px 10px;
  font-size: 12px;
  border-radius: 4px;
  border: 1px solid rgba(128, 128, 128, 0.3);
  background: transparent;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  transition: all 0.15s;
  font-family: 'Fira Code', monospace;

  &:hover {
    opacity: 1;
    border-color: rgba(128, 128, 128, 0.6);
  }

  &.active {
    border-color: #18a058;
    color: #18a058;
    opacity: 1;
    background: rgba(24, 160, 88, 0.08);
  }
}

/* ── 结果框 ─────────────────────────────────────────────────────── */
::v-deep(.uuid-display) {
  textarea {
    text-align: left !important;
    font-family: 'Fira Code', 'Consolas', 'Menlo', monospace !important;
    font-size: 13px;
    line-height: 1.8;
    max-height: 320px;
    overflow-y: auto;
    min-height: 44px;
  }
}

/* ── 按钮图标 ────────────────────────────────────────────────────── */
.btn-icon {
  font-size: 15px;
  margin-right: 5px;
  vertical-align: middle;
}

/* ── 展开动画 ─────────────────────────────────────────────────────── */
.slide-down-enter-active {
  transition: all 0.22s ease-out;
  overflow: hidden;
}

.slide-down-leave-active {
  transition: all 0.18s ease-in;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-bottom: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  max-height: 300px;
}

/* ── 图标切换动画 ─────────────────────────────────────────────────── */
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

/* ── 移动端适配 ──────────────────────────────────────────────────── */
@media (max-width: 520px) {
  .field-label {
    width: 80px;
    font-size: 13px;
  }

  .preset-row {
    gap: 4px;
  }

  .preset-btn {
    font-size: 11px;
    padding: 2px 7px;
  }
}
</style>
