<script setup lang="ts">
import * as monaco from 'monaco-editor';
import { useStyleStore } from '@/stores/style.store';

const props = withDefaults(defineProps<{
  options?: monaco.editor.IDiffEditorOptions
  originalPlaceholder?: string
  modifiedPlaceholder?: string
}>(), {
  options: () => ({}),
  originalPlaceholder: 'Paste original text here…',
  modifiedPlaceholder: 'Paste modified text here…',
});

const emit = defineEmits<{
  (e: 'update:original', v: string): void
  (e: 'update:modified', v: string): void
}>();

// 双向绑定：外部可传入初始值
const originalContent = defineModel<string>('original', { default: '' });
const modifiedContent = defineModel<string>('modified', { default: '' });

const { options } = toRefs(props);

const editorContainer = ref<HTMLElement | null>(null);
let editor: monaco.editor.IStandaloneDiffEditor | null = null;
let originalModel: monaco.editor.ITextModel | null = null;
let modifiedModel: monaco.editor.ITextModel | null = null;

// 防止 watch 和 Monaco change 事件互相触发死循环
let suppressWatch = false;

monaco.editor.defineTheme('it-tools-dark', {
  base: 'vs-dark',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#00000000',
    // 深色模式：柔和的红绿高亮，降低饱和度防止刺眼
    'diffEditor.insertedLineBackground': '#1a3a1a',
    'diffEditor.removedLineBackground': '#3a1a1a',
    'diffEditor.insertedTextBackground': '#2d5a2d80',
    'diffEditor.removedTextBackground': '#5a2d2d80',
  },
});

monaco.editor.defineTheme('it-tools-light', {
  base: 'vs',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#00000000',
  },
});

const styleStore = useStyleStore();

watch(
  () => styleStore.isDarkTheme,
  isDarkTheme => monaco.editor.setTheme(isDarkTheme ? 'it-tools-dark' : 'it-tools-light'),
  { immediate: true },
);

watch(
  () => options.value,
  options => editor?.updateOptions(options),
  { immediate: true, deep: true },
);

useResizeObserver(editorContainer, () => {
  editor?.layout();
});

// 当外部 v-model 变化时同步到 Monaco
watch(originalContent, (val) => {
  if (suppressWatch) return;
  if (originalModel && originalModel.getValue() !== val) {
    originalModel.setValue(val);
  }
});

watch(modifiedContent, (val) => {
  if (suppressWatch) return;
  if (modifiedModel && modifiedModel.getValue() !== val) {
    modifiedModel.setValue(val);
  }
});

onMounted(() => {
  if (!editorContainer.value) return;

  editor = monaco.editor.createDiffEditor(editorContainer.value, {
    originalEditable: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    renderSideBySide: true,
    ...options.value,
  });

  originalModel = monaco.editor.createModel(originalContent.value, 'txt');
  modifiedModel = monaco.editor.createModel(modifiedContent.value, 'txt');

  editor.setModel({
    original: originalModel,
    modified: modifiedModel,
  });

  // 监听 Monaco 内容变化，同步到外部 v-model
  originalModel.onDidChangeContent(() => {
    suppressWatch = true;
    originalContent.value = originalModel!.getValue();
    nextTick(() => { suppressWatch = false; });
  });

  modifiedModel.onDidChangeContent(() => {
    suppressWatch = true;
    modifiedContent.value = modifiedModel!.getValue();
    nextTick(() => { suppressWatch = false; });
  });
});

onUnmounted(() => {
  editor?.dispose();
  originalModel?.dispose();
  modifiedModel?.dispose();
});

// 暴露给父组件的方法
defineExpose({
  getOriginal: () => originalModel?.getValue() ?? '',
  getModified: () => modifiedModel?.getValue() ?? '',
  setOriginal: (v: string) => originalModel?.setValue(v),
  setModified: (v: string) => modifiedModel?.setValue(v),
});
</script>

<template>
  <div class="diff-editor-root">
    <!-- Placeholder（仅在内容为空时显示，浮于编辑器上方） -->
    <div
      v-if="!originalContent"
      class="diff-placeholder diff-placeholder--original"
      aria-hidden="true"
    >
      {{ originalPlaceholder }}
    </div>
    <div
      v-if="!modifiedContent"
      class="diff-placeholder diff-placeholder--modified"
      aria-hidden="true"
    >
      {{ modifiedPlaceholder }}
    </div>

    <div ref="editorContainer" class="diff-editor-container" />
  </div>
</template>

<style scoped>
.diff-editor-root {
  position: relative;
  width: 100%;
  height: 100%;
}

.diff-editor-container {
  width: 100%;
  height: 100%;
  min-height: 500px;
}

/* ── Placeholder 层：浮在编辑器上方，点击穿透 ── */
.diff-placeholder {
  position: absolute;
  top: 6px;
  pointer-events: none;
  z-index: 2;
  font-size: 13px;
  color: #bbb;
  font-style: italic;
  line-height: 1.5;
  padding: 0 64px; /* 对齐 Monaco 内边距 */
  user-select: none;
}

/* 左侧面板（original）大约占宽50%减去分割条 */
.diff-placeholder--original {
  left: 0;
  width: calc(50% - 14px);
  padding-left: 64px;
}

/* 右侧面板（modified）从50%开始 */
.diff-placeholder--modified {
  left: calc(50% + 14px);
  width: calc(50% - 14px);
  padding-left: 16px;
}
</style>
