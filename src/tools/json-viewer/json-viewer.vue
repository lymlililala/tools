<script setup lang="ts">
import JSON5 from 'json5';
import { useStorage } from '@vueuse/core';
import { formatJson } from './json.models';
import { withDefaultOnError } from '@/utils/defaults';
import { useValidation } from '@/composable/validation';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

const inputElement = ref<HTMLElement>();

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
    <n-form-item
      label="Raw JSON"
      :feedback="rawJsonValidation.message"
      :validation-status="rawJsonValidation.status"
      class="pane"
    >
      <c-input-text
        ref="inputElement"
        v-model:value="rawJson"
        placeholder="Paste your raw JSON here..."
        rows="30"
        multiline
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        monospace
        style="height: 100%"
      />
    </n-form-item>

    <n-form-item label="Prettified JSON" class="pane">
      <TextareaCopyable :value="cleanJson" language="json" :follow-height-of="inputElement" style="height: 100%" />
    </n-form-item>
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
  min-height: 480px;
}

.result-card {
  position: relative;
  .copy-button {
    position: absolute;
    top: 10px;
    right: 10px;
  }
}
</style>
