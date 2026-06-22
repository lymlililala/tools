<script setup lang="ts">
// eslint-disable-next-line no-restricted-imports
import { useClipboard } from '@vueuse/core';
import { types as extensionToMimeType, extensions as mimeTypeToExtension } from 'mime-types';

const { t } = useI18n();
const { copy } = useClipboard();

// ── 选择器数据 ─────────────────────────────────────────────────────────────
const mimeToExtensionsOptions = Object.keys(mimeTypeToExtension).map(label => ({ label, value: label }));
const extensionToMimeTypeOptions = Object.keys(extensionToMimeType).map((label) => {
  const extension = `.${label}`;
  return { label: extension, value: label };
});

const selectedMimeType = ref<string | undefined>(undefined);
const selectedExtension = ref<string | undefined>(undefined);

const extensionsFound = computed(() => selectedMimeType.value ? mimeTypeToExtension[selectedMimeType.value] : []);
const mimeTypeFound = computed(() => selectedExtension.value ? extensionToMimeType[selectedExtension.value] : '');

// ── 胶囊复制反馈 ──────────────────────────────────────────────────────────
const copiedTag = ref('');
async function copyTag(text: string) {
  await copy(text);
  copiedTag.value = text;
  setTimeout(() => {
    copiedTag.value = '';
  }, 1400);
}

// ── 全量列表 + 搜索过滤 ───────────────────────────────────────────────────
const mimeInfos = Object.entries(mimeTypeToExtension).map(([mimeType, extensions]) => ({ mimeType, extensions }));

const tableSearch = ref('');
const PAGE_SIZE = 50;
const currentPage = ref(1);

const filteredInfos = computed(() => {
  const q = tableSearch.value.trim().toLowerCase();
  if (!q) {
    return mimeInfos;
  }
  return mimeInfos.filter(({ mimeType, extensions }) =>
    mimeType.includes(q) || extensions.some(e => e.includes(q)),
  );
});

const totalPages = computed(() => Math.ceil(filteredInfos.value.length / PAGE_SIZE));

const pagedInfos = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return filteredInfos.value.slice(start, start + PAGE_SIZE);
});

// 搜索时重置到第一页
watch(tableSearch, () => {
  currentPage.value = 1;
});
</script>

<template>
  <div class="tool-wide mime-wrap">
    <!-- ① 双卡片转换区 -->
    <div class="cards-grid">
      <!-- Mime → Extension -->
      <c-card class="conv-card">
        <div class="card-title">
          {{ t('tools.mime-types.mimeToExtTitle') }}
        </div>
        <div class="card-desc">
          {{ t('tools.mime-types.mimeToExtDesc') }}
        </div>

        <c-select
          v-model:value="selectedMimeType"

          searchable mb-3 mt-3
          :options="mimeToExtensionsOptions"
          :placeholder="t('tools.mime-types.selectMimePlaceholder')"
        />

        <transition name="result-fade">
          <div v-if="extensionsFound.length > 0" class="result-area">
            <span class="result-hint">
              {{ t('tools.mime-types.extensionsFor') }} <code class="inline-code">{{ selectedMimeType }}</code>:
            </span>
            <div class="tags-row">
              <n-tooltip
                v-for="ext of extensionsFound"
                :key="ext"
                trigger="hover"
                placement="top"
              >
                <template #trigger>
                  <n-tag
                    round
                    :bordered="false"
                    :type="copiedTag === `.${ext}` ? 'success' : 'primary'"
                    class="copy-tag"
                    @click="copyTag(`.${ext}`)"
                  >
                    <icon-mdi-check v-if="copiedTag === `.${ext}`" style="font-size:11px; margin-right:3px" />
                    .{{ ext }}
                  </n-tag>
                </template>
                {{ t('tools.mime-types.clickToCopy') }}
              </n-tooltip>
            </div>
          </div>
        </transition>
      </c-card>

      <!-- Extension → Mime -->
      <c-card class="conv-card">
        <div class="card-title">
          {{ t('tools.mime-types.extToMimeTitle') }}
        </div>
        <div class="card-desc">
          {{ t('tools.mime-types.extToMimeDesc') }}
        </div>

        <c-select
          v-model:value="selectedExtension"

          searchable mb-3 mt-3
          :options="extensionToMimeTypeOptions"
          :placeholder="t('tools.mime-types.selectExtPlaceholder')"
        />

        <transition name="result-fade">
          <div v-if="selectedExtension && mimeTypeFound" class="result-area">
            <span class="result-hint">
              {{ t('tools.mime-types.mimeTypeFor') }} <code class="inline-code">.{{ selectedExtension }}</code>:
            </span>
            <div class="tags-row">
              <n-tooltip trigger="hover" placement="top">
                <template #trigger>
                  <n-tag
                    round
                    :bordered="false"
                    :type="copiedTag === mimeTypeFound ? 'success' : 'primary'"
                    class="copy-tag"
                    @click="copyTag(mimeTypeFound)"
                  >
                    <icon-mdi-check v-if="copiedTag === mimeTypeFound" style="font-size:11px; margin-right:3px" />
                    {{ mimeTypeFound }}
                  </n-tag>
                </template>
                {{ t('tools.mime-types.clickToCopy') }}
              </n-tooltip>
            </div>
          </div>
        </transition>
      </c-card>
    </div>

    <!-- ② 全量列表 -->
    <div class="table-section">
      <!-- 搜索 + 统计 -->
      <div class="table-toolbar">
        <div class="table-search-wrap">
          <icon-mdi-magnify class="search-icon" />
          <input
            v-model="tableSearch"
            class="table-search"
            :placeholder="t('tools.mime-types.filterPlaceholder')"
            spellcheck="false"
          >
        </div>
        <span class="table-count">
          {{ t('tools.mime-types.resultCount', { count: filteredInfos.length }) }}
        </span>
      </div>

      <!-- 表格 -->
      <div class="table-wrap">
        <table class="mime-table">
          <thead>
            <tr>
              <th class="th-mime">
                {{ t('tools.mime-types.colMimeType') }}
              </th>
              <th class="th-ext">
                {{ t('tools.mime-types.colExtensions') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="{ mimeType, extensions } of pagedInfos"
              :key="mimeType"
              class="table-row"
            >
              <td class="td-mime">
                {{ mimeType }}
              </td>
              <td class="td-ext">
                <n-tooltip
                  v-for="ext of extensions"
                  :key="ext"
                  trigger="hover"
                  placement="top"
                >
                  <template #trigger>
                    <n-tag
                      round
                      :bordered="false"
                      :type="copiedTag === `.${ext}` ? 'success' : 'default'"
                      class="copy-tag small-tag"
                      @click="copyTag(`.${ext}`)"
                    >
                      <icon-mdi-check v-if="copiedTag === `.${ext}`" style="font-size:10px; margin-right:2px" />
                      .{{ ext }}
                    </n-tag>
                  </template>
                  {{ t('tools.mime-types.clickToCopyExt', { ext: `.${ext}` }) }}
                </n-tooltip>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          class="page-btn"
          :disabled="currentPage === 1"
          @click="currentPage = 1"
        >
          «
        </button>
        <button
          class="page-btn"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          ‹
        </button>

        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>

        <button
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          ›
        </button>
        <button
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="currentPage = totalPages"
        >
          »
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.mime-wrap {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

// ── 双卡片 ────────────────────────────────────────────────────────────────
.cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
}

.conv-card {
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 4px;
}

.card-desc {
  font-size: 12px;
  opacity: 0.55;
  line-height: 1.5;
}

.result-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-hint {
  font-size: 12px;
  opacity: 0.6;
}

.inline-code {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 11px;
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  padding: 1px 5px;
  border-radius: 4px;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

// 可复制胶囊
.copy-tag {
  cursor: pointer;
  transition: transform 0.12s;

  &:hover { transform: translateY(-1px); }
  &:active { transform: translateY(0); }
}

.result-fade-enter-active,
.result-fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.result-fade-enter-from,
.result-fade-leave-to { opacity: 0; transform: translateY(-4px); }

// ── 全量列表区 ────────────────────────────────────────────────────────────
.table-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.table-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.table-search-wrap {
  position: relative;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 15px;
  opacity: 0.35;
  pointer-events: none;
}

.table-search {
  width: 100%;
  padding: 8px 12px 8px 34px;
  font-size: 13px;
  font-family: inherit;
  border: 1.5px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: #fafafa;
  color: inherit;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &::placeholder { color: rgba(0, 0, 0, 0.28); }

  :global(.dark) & {
    background: #0f1117;
    border-color: rgba(255, 255, 255, 0.1);
    color: #e2e8f0;
    &::placeholder { color: rgba(255, 255, 255, 0.22); }
    &:focus { border-color: #818cf8; box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.12); }
  }
}

.table-count {
  font-size: 12px;
  opacity: 0.4;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.table-wrap {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  overflow: hidden;

  :global(.dark) & { border-color: rgba(255, 255, 255, 0.08); }
}

.mime-table {
  width: 100%;
  border-collapse: collapse;
}

.th-mime,
.th-ext {
  padding: 10px 16px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.45;
  text-align: left;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.07);

  :global(.dark) & {
    background: rgba(255, 255, 255, 0.02);
    border-color: rgba(255, 255, 255, 0.07);
  }
}

.table-row {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: background 0.12s;

  &:last-child { border-bottom: none; }

  &:hover {
    background: rgba(99, 102, 241, 0.04);
  }

  :global(.dark) & {
    border-color: rgba(255, 255, 255, 0.05);
    &:hover { background: rgba(99, 102, 241, 0.07); }
  }
}

.td-mime {
  padding: 9px 16px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 12.5px;
  min-width: 220px;
}

.td-ext {
  padding: 7px 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
}

.small-tag {
  font-size: 11px !important;
}

// ── 分页 ──────────────────────────────────────────────────────────────────
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  color: inherit;
  transition: background 0.15s;

  &:hover:not(:disabled) { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
  &:disabled { opacity: 0.3; cursor: not-allowed; }

  :global(.dark) & { border-color: rgba(255, 255, 255, 0.1); }
}

.page-info {
  font-size: 12px;
  opacity: 0.5;
  padding: 0 8px;
  font-variant-numeric: tabular-nums;
}
</style>
