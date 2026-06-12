<script setup lang="ts">
import { Plus, Trash } from '@vicons/tabler';
import { useTemplateRefsList, useVModel } from '@vueuse/core';
import { nextTick } from 'vue';

const props = defineProps<{ values: (number | null)[] }>();

const emit = defineEmits(['update:values']);

const { t } = useI18n();

const refs = useTemplateRefsList<HTMLInputElement>();

const values = useVModel(props, 'values', emit);

// 将 input 的字符串值同步到数值数组
function onInput(index: number, event: Event) {
  const raw = (event.target as HTMLInputElement).value;
  const num = Number.parseFloat(raw);
  values.value[index] = Number.isFinite(num) ? num : null;
}

async function addValue() {
  values.value.push(null);
  await nextTick();
  refs.value.at(-1)?.focus();
}

function onInputEnter(index: number) {
  if (index === values.value.length - 1) {
    addValue();
    return;
  }
  refs.value.at(index + 1)?.focus();
}

// 显示值：null 时显示空字符串
function displayValue(v: number | null) {
  return v === null ? '' : String(v);
}
</script>

<template>
  <div class="dv-wrapper">
    <div v-for="(value, index) of values" :key="index" class="dv-row">
      <div class="dv-input-wrap" :class="{ invalid: value === null && displayValue(values[index]) !== '' }">
        <input
          :ref="refs.set"
          type="number"
          class="dv-input"
          :value="displayValue(value)"
          :placeholder="t('tools.benchmark-builder.valuePlaceholder')"
          @input="onInput(index, $event)"
          @keydown.enter="onInputEnter(index)"
        >
      </div>
      <c-tooltip :tooltip="t('tools.benchmark-builder.deleteValue')">
        <button class="dv-delete-btn" @click="values.splice(index, 1)">
          <n-icon :component="Trash" depth="3" size="16" />
        </button>
      </c-tooltip>
    </div>

    <button class="dv-add-btn" @click="addValue">
      <n-icon :component="Plus" depth="3" size="15" />
      <span>{{ t('tools.benchmark-builder.addValue') }}</span>
    </button>
  </div>
</template>

<style scoped>
.dv-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.dv-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 输入框容器（用于 invalid 红边） */
.dv-input-wrap {
  flex: 1;
  position: relative;
}

.dv-input {
  width: 100%;
  padding: 5px 10px;
  border: 1.5px solid var(--n-border-color, #e0e0e0);
  border-radius: 6px;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  background: var(--n-input-color, #fff);
  color: var(--n-text-color, #333);
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
  /* 隐藏 number 类型的步进箭头 */
  appearance: textfield;
  -moz-appearance: textfield;
}

.dv-input::-webkit-outer-spin-button,
.dv-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.dv-input:hover {
  border-color: var(--n-border-color-hover, #bbb);
}

.dv-input:focus {
  border-color: var(--primary-color, #18a058);
  box-shadow: 0 0 0 3px rgba(24, 160, 88, 0.12);
}

.dv-input-wrap.invalid .dv-input {
  border-color: #dc3545;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

/* 删除按钮 */
.dv-delete-btn {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  color: var(--n-text-color-3, #aaa);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
  padding: 0;
}

.dv-delete-btn:hover {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

/* "添加测量值"按钮 */
.dv-add-btn {
  margin-top: 4px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border: 1.5px dashed var(--n-border-color, #ddd);
  border-radius: 6px;
  background: transparent;
  font-size: 12px;
  color: var(--n-text-color-3, #aaa);
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.dv-add-btn:hover {
  border-color: var(--primary-color, #18a058);
  color: var(--primary-color, #18a058);
}
</style>
