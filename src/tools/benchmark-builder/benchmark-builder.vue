<script setup lang="ts">
import { Plus } from '@vicons/tabler';
import { useStorage } from '@vueuse/core';
import _ from 'lodash';

import { arrayToMarkdownTable, computeAverage, computeVariance } from './benchmark-builder.models';
import DynamicValues from './dynamic-values.vue';
import { useCopy } from '@/composable/copy';

const { t } = useI18n();

const suites = useStorage('benchmark-builder:suites', [
  { title: 'Suite 1', data: [5, 10] },
  { title: 'Suite 2', data: [8, 12] },
]);

const unit = useStorage('benchmark-builder:unit', '');

const round = (v: number) => Math.round(v * 1000) / 1000;

const results = computed(() => {
  return suites.value
    .map(({ data: dirtyData, title }) => {
      const data = dirtyData.filter(_.isNumber);

      return {
        title,
        size: data.length,
        mean: computeAverage({ data }),
        variance: computeVariance({ data }),
      };
    })
    .sort((a, b) => a.mean - b.mean)
    .map(({ mean, variance, size, title }, index, suites) => {
      const cleanUnit = unit.value.trim();
      const bestMean: number = suites[0].mean;
      const deltaWithBestMean = mean - bestMean;
      const ratioWithBestMean = bestMean === 0 ? '∞' : round(mean / bestMean);

      const comparisonValues: string
        = (index !== 0 && bestMean !== mean) ? ` (+${round(deltaWithBestMean)}${cleanUnit} ; x${ratioWithBestMean})` : '';

      return {
        position: index + 1,
        title,
        mean: `${round(mean)}${cleanUnit}${comparisonValues}`,
        variance: `${round(variance)}${cleanUnit}${cleanUnit ? '²' : ''}`,
        size,
      };
    });
});

const { copy } = useCopy({ createToast: true });

const header = computed(() => ({
  position: t('tools.benchmark-builder.rank'),
  title: t('tools.benchmark-builder.groupName'),
  size: t('tools.benchmark-builder.sampleSize'),
  mean: t('tools.benchmark-builder.mean'),
  variance: t('tools.benchmark-builder.variance'),
}));

function copyAsMarkdown() {
  copy(arrayToMarkdownTable({ data: results.value, headerMap: header.value }));
}

function copyAsBulletList() {
  const bulletList = results.value
    .flatMap(({ title, ...sections }) => {
      return [
        ` - ${title}`,
        ...Object.entries(sections).map(
          ([key, value]) => `    - ${header.value[key as keyof typeof header.value] ?? key}: ${value}`,
        ),
      ];
    })
    .join('\n');

  copy(bulletList);
}

function addSuite() {
  suites.value.push({ data: [0], title: `Suite ${suites.value.length + 1}` });
}

function deleteSuite(index: number) {
  if (suites.value.length <= 1) {
    return;
  }
  suites.value.splice(index, 1);
}

function resetSuites() {
  suites.value = [
    { title: 'Suite 1', data: [] },
    { title: 'Suite 2', data: [] },
  ];
}
</script>

<template>
  <div class="benchmark-wrapper">
    <!-- 卡片区 + 虚线"添加"占位 -->
    <div class="suites-scroll-wrapper">
      <div class="suites-row">
        <!-- 每张 Suite 卡片 -->
        <div v-for="(suite, index) of suites" :key="index" class="suite-card-wrapper">
          <c-card class="suite-card">
            <!-- 标题行 -->
            <div class="suite-header">
              <input
                v-model="suite.title"
                class="suite-title-input"
                :placeholder="t('tools.benchmark-builder.groupNamePlaceholder')"
              >
              <c-tooltip :tooltip="t('tools.benchmark-builder.deleteGroup')">
                <button
                  class="suite-close-btn"
                  :class="{ disabled: suites.length <= 1 }"
                  :disabled="suites.length <= 1"
                  @click="deleteSuite(index)"
                >
                  ×
                </button>
              </c-tooltip>
            </div>

            <div class="suite-divider" />

            <!-- 数值列表 -->
            <div class="suite-values-section">
              <span class="suite-values-label">{{ t('tools.benchmark-builder.measurements') }}</span>
              <DynamicValues v-model:values="suite.data" />
            </div>
          </c-card>
        </div>

        <!-- 虚线"添加新组"占位卡片 -->
        <div class="add-suite-card" @click="addSuite">
          <n-icon :component="Plus" size="24" class="add-suite-icon" />
          <span>{{ t('tools.benchmark-builder.addGroup') }}</span>
        </div>
      </div>
    </div>

    <!-- 全局控制区 -->
    <div class="controls-bar">
      <div class="controls-inner">
        <div class="unit-control">
          <span class="control-label">{{ t('tools.benchmark-builder.unit') }}</span>
          <input
            v-model="unit"
            class="unit-input"
            :placeholder="t('tools.benchmark-builder.unitPlaceholder')"
          >
        </div>
        <button class="reset-btn" @click="resetSuites">
          {{ t('tools.benchmark-builder.resetAll') }}
        </button>
      </div>
    </div>

    <!-- 结果表格 -->
    <div class="results-section">
      <table class="results-table">
        <thead>
          <tr>
            <th class="col-rank">
              {{ t('tools.benchmark-builder.rank') }}
            </th>
            <th class="col-suite">
              {{ t('tools.benchmark-builder.groupName') }}
            </th>
            <th class="col-num">
              {{ t('tools.benchmark-builder.sampleSize') }}
            </th>
            <th class="col-num">
              {{ t('tools.benchmark-builder.mean') }}
            </th>
            <th class="col-num">
              {{ t('tools.benchmark-builder.variance') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in results"
            :key="row.title"
            :class="{ 'row-best': row.position === 1 }"
          >
            <td class="col-rank">
              <span v-if="row.position === 1" class="badge-best">🥇</span>
              <span v-else>{{ row.position }}</span>
            </td>
            <td class="col-suite">
              {{ row.title }}
            </td>
            <td class="col-num">
              {{ row.size }}
            </td>
            <td class="col-num">
              {{ row.mean }}
            </td>
            <td class="col-num">
              {{ row.variance }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 复制按钮 -->
    <div class="copy-btns">
      <c-button @click="copyAsMarkdown">
        {{ t('tools.benchmark-builder.copyMarkdown') }}
      </c-button>
      <c-button @click="copyAsBulletList">
        {{ t('tools.benchmark-builder.copyList') }}
      </c-button>
    </div>
  </div>
</template>

<style scoped>
/* ── 总容器 ── */
.benchmark-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 4px;
}

/* ── 卡片滚动区 ── */
.suites-scroll-wrapper {
  overflow-x: auto;
  padding-bottom: 4px;
}

.suites-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-start;
  min-width: min-content;
}

/* ── 单张卡片 ── */
.suite-card-wrapper {
  flex: 0 0 auto;
}

.suite-card {
  width: 280px;
}

/* 卡片标题行 */
.suite-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.suite-title-input {
  flex: 1;
  background: transparent;
  border: none;
  border-bottom: 1.5px solid transparent;
  outline: none;
  font-size: 15px;
  font-weight: 600;
  color: var(--n-text-color, #1a1a1a);
  padding: 2px 4px;
  border-radius: 4px;
  transition: border-color 0.2s, background 0.2s;
}

.suite-title-input:hover,
.suite-title-input:focus {
  border-bottom-color: var(--primary-color, #18a058);
  background: rgba(24, 160, 88, 0.04);
}

/* 关闭按钮 */
.suite-close-btn {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--n-text-color-3, #999);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}

.suite-close-btn:hover:not(.disabled) {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.suite-close-btn.disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.suite-divider {
  height: 1px;
  background: var(--n-divider-color, #e8e8e8);
  margin: 10px 0;
}

.suite-values-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suite-values-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--n-text-color-3, #999);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ── 虚线"添加新组"占位 ── */
.add-suite-card {
  flex: 0 0 auto;
  width: 280px;
  min-height: 100px;
  border: 2px dashed var(--n-border-color, #ddd);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  color: var(--n-text-color-3, #aaa);
  font-size: 14px;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
  user-select: none;
}

.add-suite-card:hover {
  border-color: var(--primary-color, #18a058);
  color: var(--primary-color, #18a058);
  background: rgba(24, 160, 88, 0.04);
}

.add-suite-icon {
  opacity: 0.7;
}

/* ── 全局控制栏 ── */
.controls-bar {
  display: flex;
  justify-content: center;
}

.controls-inner {
  display: flex;
  align-items: center;
  gap: 12px;
}

.unit-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-label {
  font-size: 13px;
  color: var(--n-text-color-3, #888);
  white-space: nowrap;
}

.unit-input {
  width: 140px;
  padding: 5px 10px;
  border: 1.5px solid var(--n-border-color, #e0e0e0);
  border-radius: 6px;
  font-size: 13px;
  background: var(--n-input-color, #fff);
  color: var(--n-text-color, #333);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.unit-input:hover {
  border-color: var(--n-border-color-hover, #bbb);
}

.unit-input:focus {
  border-color: var(--primary-color, #18a058);
  box-shadow: 0 0 0 3px rgba(24, 160, 88, 0.12);
}

.reset-btn {
  padding: 6px 14px;
  border: 1.5px solid var(--n-border-color, #e0e0e0);
  border-radius: 6px;
  font-size: 13px;
  background: var(--n-card-color, #fff);
  color: var(--n-text-color-2, #555);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
  white-space: nowrap;
}

.reset-btn:hover {
  border-color: #dc3545;
  color: #dc3545;
  background: rgba(220, 53, 69, 0.05);
}

/* ── 结果表格 ── */
.results-section {
  overflow-x: auto;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
}

.results-table th {
  text-align: left;
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--n-text-color-3, #999);
  border-bottom: 1.5px solid var(--n-divider-color, #eee);
}

.results-table th.col-num,
.results-table td.col-num {
  text-align: right;
}

.results-table td {
  padding: 10px 12px;
  color: var(--n-text-color, #333);
  border-bottom: 1px solid var(--n-divider-color, #f0f0f0);
}

.results-table tr:last-child td {
  border-bottom: none;
}

.results-table tr:hover td {
  background: rgba(0, 0, 0, 0.025);
}

/* 最优行高亮 */
.row-best td {
  background: rgba(24, 160, 88, 0.06);
  font-weight: 500;
}

.row-best:hover td {
  background: rgba(24, 160, 88, 0.1);
}

.badge-best {
  font-size: 16px;
}

.col-rank {
  width: 60px;
  text-align: center;
}

.col-suite {
  min-width: 80px;
}

/* ── 复制按钮区 ── */
.copy-btns {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

/* ── 响应式：移动端单列 ── */
@media (max-width: 600px) {
  .suites-row {
    flex-direction: column;
    flex-wrap: nowrap;
  }

  .suite-card,
  .add-suite-card {
    width: 100%;
  }

  .controls-inner {
    flex-direction: column;
    align-items: stretch;
  }

  .unit-input {
    width: 100%;
  }
}
</style>
