<script setup lang="ts">
import { tryOnBeforeUnmount, useVModel } from '@vueuse/core';
import { Editor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import { useThemeVars } from 'naive-ui';
import MenuBar from './menu-bar.vue';

const props = defineProps<{ html: string }>();
const emit = defineEmits(['update:html']);
const themeVars = useThemeVars();
const html = useVModel(props, 'html', emit);

const editor = new Editor({
  content: html.value,
  extensions: [StarterKit],
});

editor.on('update', ({ editor }) => emit('update:html', editor.getHTML()));

tryOnBeforeUnmount(() => {
  editor.destroy();
});
</script>

<template>
  <div v-if="editor" class="editor-wrap">
    <!-- 工具栏 -->
    <div class="toolbar-row">
      <MenuBar :editor="editor" />
    </div>
    <n-divider style="margin: 0" />
    <!-- 编辑内容区 -->
    <div class="content-area">
      <EditorContent class="editor-content" :editor="editor" />
    </div>
  </div>
</template>

<style scoped lang="less">
.editor-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 300px;
}

.toolbar-row {
  padding: 6px 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  flex-shrink: 0;
}

.content-area {
  flex: 1;
  padding: 16px 20px;
  overflow-y: auto;
}
</style>

<style scoped lang="less">
::v-deep(.ProseMirror-focused) {
  outline: none;
}

::v-deep(.ProseMirror) {
  min-height: 200px;

  > * + * {
    margin-top: 0.75em;
  }

  p {
    margin: 0;
    line-height: 1.6;
  }

  ul,
  ol {
    padding: 0 1rem;
  }

  h1 { font-size: 1.6em; font-weight: 800; line-height: 1.2; }
  h2 { font-size: 1.35em; font-weight: 700; line-height: 1.2; }
  h3 { font-size: 1.15em; font-weight: 700; line-height: 1.2; }
  h4 { font-size: 1em; font-weight: 700; line-height: 1.2; }

  code {
    background-color: v-bind('themeVars.codeColor');
    padding: 2px 5px;
    border-radius: 4px;
    font-size: 85%;
    font-family: 'SF Mono', 'Fira Code', monospace;
  }

  pre {
    background: v-bind('themeVars.codeColor');
    font-family: 'SF Mono', 'Fira Code', monospace;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;

    code {
      color: inherit;
      padding: 0;
      background: none;
      font-size: 0.8rem;
    }
  }

  mark {
    background-color: #faf594;
    border-radius: 2px;
    padding: 1px 2px;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  hr {
    border: none;
    border-top: 2px solid rgba(0, 0, 0, 0.1);
    margin: 1.5rem 0;
  }

  blockquote {
    padding-left: 1rem;
    border-left: 3px solid rgba(99, 102, 241, 0.4);
    color: rgba(0, 0, 0, 0.6);
    font-style: italic;
    margin-left: 0;
  }

  ul[data-type='taskList'] {
    list-style: none;
    padding: 0;

    li {
      display: flex;
      align-items: center;

      > label {
        flex: 0 0 auto;
        margin-right: 0.5rem;
        user-select: none;
      }

      > div {
        flex: 1 1 auto;
      }
    }
  }
}
</style>
