<script setup lang="ts">
import JSON5 from 'json5';
import { useStorage } from '@vueuse/core';
import { formatJson } from './json.models';
import { withDefaultOnError } from '@/utils/defaults';
import { useValidation } from '@/composable/validation';

const rawJson = useStorage('json-prettify:raw-json', '{"hello": "world", "foo": "bar"}');
const indentSize = useStorage('json-prettify:indent-size', 3);
const sortKeys = useStorage('json-prettify:sort-keys', true);
const cleanJson = computed(() => withDefaultOnError(() => formatJson({ rawJson, indentSize, sortKeys }), ''));

const rawJsonValidation = useValidation({
  source: rawJson,
  rules: [
    {
      validator: v => v === '' || JSON5.parse(v),
      message: 'Provided JSON is not valid.',
    },
  ],
});

function clearInput() {
  rawJson.value = '';
}
</script>

<template>
  <!-- 配置栏 -->
  <div flex justify-start gap-4 mb-3 flex-wrap>
    <n-form-item label="Sort keys" label-placement="left" label-width="90" :show-feedback="false">
      <n-switch v-model:value="sortKeys" />
    </n-form-item>
    <n-form-item label="Indent size" label-placement="left" label-width="90" :show-feedback="false">
      <n-input-number v-model:value="indentSize" min="0" max="10" style="width: 90px" />
    </n-form-item>
  </div>

  <!-- 输入 / 输出并排 -->
  <div class="json-panes">
    <!-- 输入 -->
    <div class="pane">
      <div class="pane-header">
        <span class="pane-title">Raw JSON</span>
        <n-tag v-if="rawJsonValidation.isValid && rawJson" type="success" size="small" :bordered="false">
          Valid
        </n-tag>
        <n-tag v-else-if="rawJson" type="error" size="small" :bordered="false">
          Invalid
        </n-tag>
      </div>
      <c-code-input
        v-model="rawJson"
        language="json"
        placeholder="Paste your raw JSON here..."
        min-height="400px"
      />
      <div v-if="rawJsonValidation.message" class="validation-msg">
        {{ rawJsonValidation.message }}
      </div>
    </div>

    <!-- 输出 -->
    <div class="pane">
      <div class="pane-header">
        <span class="pane-title">Formatted JSON</span>
        <c-output-actions
          :value="cleanJson"
          :clearable="true"
          :downloadable="true"
          download-filename="formatted.json"
          @clear="clearInput"
        />
      </div>
      <c-code-input
        :model-value="cleanJson"
        language="json"
        placeholder="Formatted JSON will appear here..."
        min-height="400px"
        readonly
      />
    </div>
  </div>
</template>

<style lang="less" scoped>
.json-panes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.pane {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pane-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pane-title {
  font-size: 13px;
  font-weight: 600;
  opacity: 0.65;
  flex: 1;
}

.validation-msg {
  font-size: 12px;
  color: #f87171;
  margin-top: -4px;
}
</style>
