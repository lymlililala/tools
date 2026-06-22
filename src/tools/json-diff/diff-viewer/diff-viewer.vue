<script lang="ts" setup>
import _ from 'lodash';
import { diff } from '../json-diff.models';
import { DiffRootViewer } from './diff-viewer.models';
import { useAppTheme } from '@/ui/theme/themes';

const { t } = useI18n();

const props = defineProps<{ leftJson: unknown; rightJson: unknown }>();
const onlyShowDifferences = ref(false);
const { leftJson, rightJson } = toRefs(props);
const appTheme = useAppTheme();

const result = computed(() =>
  diff(leftJson.value, rightJson.value, { onlyShowDifferences: onlyShowDifferences.value }),
);

const jsonAreTheSame = computed(() => _.isEqual(leftJson.value, rightJson.value));
const showResults = computed(() => !_.isUndefined(leftJson.value) && !_.isUndefined(rightJson.value));
</script>

<template>
  <div v-if="showResults" class="diff-section">
    <!-- 结果区标题栏 -->
    <div class="diff-header">
      <div class="diff-title">
        <icon-mdi-compare class="dh-icon" />
        <span>{{ t('tools.json-diff.diffResult') }}</span>
        <!-- 状态徽章 -->
        <span v-if="jsonAreTheSame" class="status-badge same">
          <icon-mdi-check-circle-outline class="sb-icon" />
          {{ t('tools.json-diff.identical') }}
        </span>
        <span v-else class="status-badge diff">
          <icon-mdi-swap-horizontal class="sb-icon" />
          {{ t('tools.json-diff.differencesFound') }}
        </span>
      </div>

      <div class="diff-controls">
        <!-- 图例 -->
        <div class="legend">
          <span class="legend-item added">+ {{ t('tools.json-diff.added') }}</span>
          <span class="legend-item removed">− {{ t('tools.json-diff.removed') }}</span>
          <span class="legend-item updated">~ {{ t('tools.json-diff.updated') }}</span>
        </div>

        <n-form-item v-if="!jsonAreTheSame" :label="t('tools.json-diff.onlyShowDifferences')" label-placement="left" style="margin-bottom:0">
          <n-switch v-model:value="onlyShowDifferences" size="small" />
        </n-form-item>
      </div>
    </div>

    <c-card data-test-id="diff-result" class="diff-card">
      <div v-if="jsonAreTheSame" class="same-state">
        <icon-mdi-check-circle-outline class="same-icon" />
        <span>{{ t('tools.json-diff.identicalMessage') }}</span>
      </div>
      <DiffRootViewer v-else :diff="result" />
    </c-card>
  </div>

  <!-- 空状态引导 -->
  <div v-else class="diff-empty">
    <icon-mdi-code-json class="de-icon" />
    <span>{{ t('tools.json-diff.emptyHint') }}</span>
  </div>
</template>

<style lang="less" scoped>
// ── 结果区 ────────────────────────────────────────────────────────────────
.diff-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 4px;
}

.diff-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.diff-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(0, 0, 0, 0.5);
}

.dh-icon { font-size: 16px; }

// 状态徽章
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;

  &.same { background: rgba(22, 163, 74, 0.1); color: #16a34a; }
  &.diff { background: rgba(234, 179, 8, 0.12); color: #b45309; }
}

.sb-icon { font-size: 12px; }

// 控制栏（图例 + 开关）
.diff-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.legend {
  display: flex;
  gap: 8px;
}

.legend-item {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 5px;

  &.added   { background: rgba(22, 163, 74, 0.1);  color: #16a34a; }
  &.removed { background: rgba(220, 38, 38, 0.08); color: #dc2626; }
  &.updated { background: rgba(234, 179, 8, 0.1);  color: #b45309; }
}

.diff-card {
  overflow: auto;
  max-height: 600px;
}

// 完全相同的状态
.same-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px 0;
  color: #16a34a;
  font-size: 14px;
  font-weight: 500;
}

.same-icon { font-size: 20px; }

// 空状态
.diff-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 40px 20px;
  opacity: 0.28;
  text-align: center;
  font-size: 13px;
}

.de-icon { font-size: 36px; }
</style>

<style lang="less" scoped>
::v-deep(.diffs-viewer) {
  color: v-bind('appTheme.text.mutedColor');

  & > ul {
    padding-left: 0 !important;
  }

  ul {
    list-style: none;
    padding-left: 20px;
    margin: 0;

    li {
      .updated-line {
        padding: 3px 0;
      }

      .result,
      .array,
      .object,
      .value {
        &:not(:last-child) {
          margin-right: 4px;
        }

        &.added {
          padding: 3px 5px;
          border-radius: 4px;
          background-color: v-bind('appTheme.success.colorFaded');
          color: v-bind('appTheme.success.color');
          .key {
            color: inherit;
          }
        }

        &.removed {
          padding: 3px 5px;
          border-radius: 4px;
          background-color: v-bind('appTheme.error.colorFaded');
          color: v-bind('appTheme.error.color');

          .key {
            color: inherit;
          }
        }
      }

      .value {
        cursor: pointer;
        border: 1px solid transparent;
        transition: border-color 0.2s ease-in-out;

        &.added:hover {
          border-color: v-bind('appTheme.success.color');
        }

        &.removed:hover {
          border-color: v-bind('appTheme.error.color');
        }
      }

      .added .added,
      .removed .removed {
        background-color: transparent;
        color: inherit;
      }

      .key {
        font-weight: 500;
        color: v-bind('appTheme.text.baseColor');
      }
    }
  }
}
</style>
