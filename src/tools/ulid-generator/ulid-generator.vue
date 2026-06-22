<script setup lang="ts">
import { ulid } from 'ulid';
import { computedRefreshable } from '@/composable/computedRefreshable';
import { useCopy } from '@/composable/copy';

const { t } = useI18n();

// ── 数量：1 ~ 500 ──────────────────────────────────────────────────────────────
const amount = useStorage('ulid-generator-amount', 1);
const safeAmount = computed({
  get: () => amount.value,
  set: (v: number) => {
    const n = Math.round(Number(v));
    amount.value = Number.isNaN(n) ? 1 : Math.min(500, Math.max(1, n));
  },
});

const formats = [{ label: 'Raw', value: 'raw' }, { label: 'JSON', value: 'json' }] as const;
const format = useStorage<typeof formats[number]['value']>('ulid-generator-format', formats[0].value);

// ── 生成 ULID 列表（格式变化时复用同一批数据）─────────────────────────────────────
const rawUlids = ref<string[]>([]);

function generateIds() {
  rawUlids.value = Array.from({ length: amount.value }, () => ulid());
}

// 初始生成
generateIds();

// 数量变化时重新生成
watch(amount, generateIds);

const [ulids, refreshUlids] = computedRefreshable(() => {
  if (format.value === 'json') {
    return JSON.stringify(rawUlids.value, null, 2);
  }
  return rawUlids.value.join('\n');
});

// 刷新时重新生成
function handleRefresh() {
  generateIds();
  refreshUlids();
}

// ── 时间戳解析（仅 Raw 单个时显示）──────────────────────────────────────────────
// ULID 前 10 个字符是 Crockford Base32 编码的 48-bit 时间戳（毫秒）
const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function decodeCrockford(s: string): number {
  let n = 0;
  for (const c of s.toUpperCase()) {
    n = n * 32 + CROCKFORD.indexOf(c);
  }
  return n;
}

const timestampInfo = computed(() => {
  if (format.value !== 'raw' || rawUlids.value.length !== 1) {
    return null;
  }
  const id = rawUlids.value[0];
  if (!id || id.length < 10) {
    return null;
  }
  const ts = decodeCrockford(id.slice(0, 10));
  const d = new Date(ts);
  return {
    ms: ts,
    utc: d.toISOString().replace('T', ' ').replace('Z', ' UTC'),
  };
});

// ── 复制 ──────────────────────────────────────────────────────────────────────
const { copy, isJustCopied } = useCopy({ source: ulids, text: t('tools.ulid-generator.copiedToast') });
</script>

<template>
  <div class="ulid-wrap">
    <!-- ① 数量 -->
    <div mb-3 flex items-center>
      <label class="field-label">{{ t('tools.ulid-generator.quantity') }}</label>
      <n-input-number v-model:value="safeAmount" flex-1 :min="1" :max="500" :placeholder="t('tools.ulid-generator.quantityPlaceholder')" />
    </div>

    <!-- ② 格式 -->
    <c-buttons-select v-model:value="format" :options="formats" :label="t('tools.ulid-generator.format')" label-width="75px" mb-3 />

    <!-- ③ 输出框：左对齐、等宽字体、max-height 滚动 -->
    <div class="output-card" data-test-id="ulids">
      <pre class="ulid-pre">{{ ulids }}</pre>
    </div>

    <!-- ④ 时间戳解析提示（仅 Raw 单个时显示） -->
    <transition name="fade">
      <div v-if="timestampInfo" class="ts-hint">
        <icon-mdi-clock-outline class="ts-icon" />
        {{ t('tools.ulid-generator.timestamp') }} {{ timestampInfo.utc }}
        <span class="ts-ms">({{ timestampInfo.ms }} ms)</span>
      </div>
    </transition>

    <!-- ⑤ 按钮：Refresh 左、Copy Primary 右 -->
    <div mt-4 flex items-center justify-center gap-3>
      <c-button data-test-id="refresh" @click="handleRefresh()">
        <icon-mdi-refresh class="btn-icon" />
        {{ t('tools.ulid-generator.refresh') }}
      </c-button>

      <c-button type="primary" @click="copy()">
        <transition name="icon-switch" mode="out-in">
          <icon-mdi-check v-if="isJustCopied" key="check" class="btn-icon" />
          <icon-mdi-content-copy v-else key="copy" class="btn-icon" />
        </transition>
        {{ isJustCopied ? t('tools.ulid-generator.copied') : t('tools.ulid-generator.copy') }}
      </c-button>
    </div>
  </div>
</template>

<style scoped lang="less">
.ulid-wrap {
  width: 100%;
}

.field-label {
  width: 75px;
  flex-shrink: 0;
  font-size: 14px;
  text-align: right;
  padding-right: 12px;
}

/* ── 输出卡片 ────────────────────────────────────────────────────── */
.output-card {
  border: 1px solid rgba(128, 128, 128, 0.25);
  border-radius: 6px;
  overflow: hidden;
  margin-top: 8px;
}

.ulid-pre {
  /* 左对齐、等宽字体 */
  text-align: left;
  font-family: 'Fira Code', 'Consolas', 'Menlo', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.8;
  /* max-height 滚动，防止极长列表撑爆页面 */
  max-height: 320px;
  overflow-y: auto;
  /* 内边距 */
  margin: 0;
  padding: 12px 16px;
  /* 代码不换行 */
  white-space: pre;
  word-break: normal;
  overflow-x: auto;
}

/* ── 时间戳提示 ──────────────────────────────────────────────────── */
.ts-hint {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  opacity: 0.55;
  margin-top: 8px;
  font-style: italic;
}

.ts-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.ts-ms {
  opacity: 0.7;
  font-family: monospace;
}

/* ── 按钮图标 ────────────────────────────────────────────────────── */
.btn-icon {
  font-size: 15px;
  margin-right: 4px;
  vertical-align: middle;
}

/* ── 淡入淡出 ─────────────────────────────────────────────────────── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ── 图标切换 ─────────────────────────────────────────────────────── */
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

/* ── 移动端 ──────────────────────────────────────────────────────── */
@media (max-width: 480px) {
  .ulid-pre {
    font-size: 11.5px;
    padding: 10px 12px;
  }
}
</style>
