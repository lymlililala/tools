<script setup lang="ts">
import { useClipboard } from '@vueuse/core';
import { useMessage } from 'naive-ui';

const { t } = useI18n();
const { copy } = useClipboard({ legacy: true });
const message = useMessage();

async function copyExpr(expr: string) {
  await copy(expr);
  message.success(t('tools.regex-memo.copied'));
}

// ── 数据 ──────────────────────────────────────────────────────
interface Row { expr: string; desc: string }
interface Section {
  id: string
  title: string
  tables: { caption?: string; head: [string, string]; rows: Row[] }[]
  notes?: string[]
}

const sections: Section[] = [
  {
    id: 'normal',
    title: 'Normal characters',
    tables: [
      {
        head: ['Expression', 'Description'],
        rows: [
          { expr: '. or [^\\n\\r]', desc: 'any character excluding a newline or carriage return' },
          { expr: '[A-Za-z]', desc: 'alphabet' },
          { expr: '[a-z]', desc: 'lowercase alphabet' },
          { expr: '[A-Z]', desc: 'uppercase alphabet' },
          { expr: '\\d or [0-9]', desc: 'digit' },
          { expr: '\\D or [^0-9]', desc: 'non-digit' },
          { expr: '_', desc: 'underscore' },
          { expr: '\\w or [A-Za-z0-9_]', desc: 'alphabet, digit or underscore' },
          { expr: '\\W or [^A-Za-z0-9_]', desc: 'inverse of \\w' },
          { expr: '\\S', desc: 'inverse of \\s' },
        ],
      },
    ],
  },
  {
    id: 'whitespace',
    title: 'Whitespace characters',
    tables: [
      {
        head: ['Expression', 'Description'],
        rows: [
          { expr: ' ', desc: 'space' },
          { expr: '\\t', desc: 'tab' },
          { expr: '\\n', desc: 'newline' },
          { expr: '\\r', desc: 'carriage return' },
          { expr: '\\s', desc: 'space, tab, newline or carriage return' },
        ],
      },
    ],
  },
  {
    id: 'charset',
    title: 'Character set',
    tables: [
      {
        head: ['Expression', 'Description'],
        rows: [
          { expr: '[xyz]', desc: 'either x, y or z' },
          { expr: '[^xyz]', desc: 'neither x, y nor z' },
          { expr: '[1-3]', desc: 'either 1, 2 or 3' },
          { expr: '[^1-3]', desc: 'neither 1, 2 nor 3' },
        ],
      },
    ],
    notes: [
      'Think of a character set as an OR operation on the single characters enclosed between the square brackets.',
      'Use ^ after the opening [ to "negate" the character set.',
      'Within a character set, . means a literal period.',
    ],
  },
  {
    id: 'escaping',
    title: 'Characters that require escaping',
    tables: [
      {
        caption: 'Outside a character set',
        head: ['Expression', 'Description'],
        rows: [
          { expr: '\\.', desc: 'period' },
          { expr: '\\^', desc: 'caret' },
          { expr: '\\$', desc: 'dollar sign' },
          { expr: '\\|', desc: 'pipe' },
          { expr: '\\\\', desc: 'back slash' },
          { expr: '\\/', desc: 'forward slash' },
          { expr: '\\(', desc: 'opening bracket' },
          { expr: '\\)', desc: 'closing bracket' },
          { expr: '\\[', desc: 'opening square bracket' },
          { expr: '\\]', desc: 'closing square bracket' },
          { expr: '\\{', desc: 'opening curly bracket' },
          { expr: '\\}', desc: 'closing curly bracket' },
        ],
      },
      {
        caption: 'Inside a character set',
        head: ['Expression', 'Description'],
        rows: [
          { expr: '\\\\', desc: 'back slash' },
          { expr: '\\]', desc: 'closing square bracket' },
        ],
      },
    ],
    notes: [
      'A ^ must be escaped only if it occurs immediately after the opening [ of the character set.',
      'A - must be escaped only if it occurs between two alphabets or two digits.',
    ],
  },
  {
    id: 'quantifiers',
    title: 'Quantifiers',
    tables: [
      {
        head: ['Expression', 'Description'],
        rows: [
          { expr: '{2}', desc: 'exactly 2' },
          { expr: '{2,}', desc: 'at least 2' },
          { expr: '{2,7}', desc: 'at least 2 but no more than 7' },
          { expr: '*', desc: '0 or more' },
          { expr: '+', desc: '1 or more' },
          { expr: '?', desc: 'exactly 0 or 1' },
        ],
      },
    ],
    notes: ['The quantifier goes after the expression to be quantified.'],
  },
  {
    id: 'boundaries',
    title: 'Boundaries',
    tables: [
      {
        head: ['Expression', 'Description'],
        rows: [
          { expr: '^', desc: 'start of string' },
          { expr: '$', desc: 'end of string' },
          { expr: '\\b', desc: 'word boundary' },
        ],
      },
    ],
    notes: [
      'At the beginning of the string if the first character is \\w.',
      'Between two adjacent characters, if the first is \\w and the second is \\W.',
      'At the end of the string if the last character is \\w.',
    ],
  },
  {
    id: 'matching',
    title: 'Matching',
    tables: [
      {
        head: ['Expression', 'Description'],
        rows: [
          { expr: 'foo|bar', desc: 'match either foo or bar' },
          { expr: 'foo(?=bar)', desc: "match foo if it's before bar" },
          { expr: 'foo(?!bar)', desc: "match foo if it's NOT before bar" },
          { expr: '(?<=bar)foo', desc: "match foo if it's after bar" },
          { expr: '(?<!bar)foo', desc: "match foo if it's NOT after bar" },
        ],
      },
    ],
  },
  {
    id: 'grouping',
    title: 'Grouping and capturing',
    tables: [
      {
        head: ['Expression', 'Description'],
        rows: [
          { expr: '(foo)', desc: 'capturing group; match and capture foo' },
          { expr: '(?:foo)', desc: 'non-capturing group; match foo without capturing' },
          { expr: '(foo)bar\\1', desc: '\\1 backreference to 1st group; matches foobarfoo' },
        ],
      },
    ],
    notes: [
      'Capturing groups are only relevant in: string.match(), string.matchAll(), string.replace().',
      '\\N is a backreference to the Nth capturing group (numbered from 1).',
    ],
  },
];

// ── TOC 高亮追踪 ───────────────────────────────────────────────
const activeSection = ref('normal');

function onScroll() {
  const els = sections.map(s => document.getElementById(`section-${s.id}`));
  for (let i = els.length - 1; i >= 0; i--) {
    const el = els[i];
    if (el && el.getBoundingClientRect().top <= 120) {
      activeSection.value = sections[i].id;
      return;
    }
  }
  activeSection.value = sections[0].id;
}

function scrollTo(id: string) {
  document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }));
onUnmounted(() => window.removeEventListener('scroll', onScroll));
</script>

<template>
  <div class="tool-wide rm-root">
    <!-- ── 右侧固定 TOC ───────────────────────────────────── -->
    <nav class="rm-toc">
      <p class="toc-heading">{{ t('tools.regex-memo.toc') }}</p>
      <ul>
        <li
          v-for="sec in sections"
          :key="sec.id"
          class="toc-item"
          :class="{ 'toc-item--active': activeSection === sec.id }"
          @click="scrollTo(sec.id)"
        >
          {{ sec.title }}
        </li>
      </ul>
    </nav>

    <!-- ── 主内容 ─────────────────────────────────────────── -->
    <div class="rm-content">
      <section
        v-for="sec in sections"
        :id="`section-${sec.id}`"
        :key="sec.id"
        class="rm-section"
      >
        <h3 class="section-title">
          {{ sec.title }}
        </h3>

        <div
          v-for="(tbl, ti) in sec.tables"
          :key="ti"
          class="table-wrap"
        >
          <p v-if="tbl.caption" class="table-caption">
            {{ tbl.caption }}
          </p>
          <div class="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>{{ tbl.head[0] }}</th>
                  <th>{{ tbl.head[1] }}</th>
                  <th class="th-copy" />
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, ri) in tbl.rows"
                  :key="ri"
                  class="data-row"
                  @click="copyExpr(row.expr)"
                >
                  <td class="td-expr">
                    <code>{{ row.expr }}</code>
                  </td>
                  <td class="td-desc">
                    {{ row.desc }}
                  </td>
                  <td class="td-copy">
                    <span class="copy-btn" :title="t('tools.regex-memo.copyExpr')">
                      <icon-mdi-content-copy />
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <ul v-if="sec.notes" class="section-notes">
          <li v-for="(note, ni) in sec.notes" :key="ni">
            {{ note }}
          </li>
        </ul>
      </section>

      <!-- 参考链接 -->
      <section class="rm-section">
        <h3 class="section-title">
          References &amp; tools
        </h3>
        <ul class="ref-links">
          <li>
            <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions" target="_blank" rel="noopener">
              MDN – Regular Expressions
            </a>
          </li>
          <li>
            <a href="https://leaverou.github.io/regexplained/" target="_blank" rel="noopener">
              RegExplained
            </a>
          </li>
          <li>
            <router-link to="/regex-tester">
              {{ t('tools.regex-memo.regexTesterLink') }}
            </router-link>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style lang="less" scoped>
/* ─── 整体布局 ────────────────────────────────────────────────── */
.rm-root {
  display: flex;
  align-items: flex-start;
  gap: 32px;
}

/* ─── TOC ────────────────────────────────────────────────────── */
.rm-toc {
  position: sticky;
  top: 80px;
  width: 160px;
  flex-shrink: 0;
  background: rgba(0,0,0,0.02);
  border-radius: 10px;
  padding: 14px 0 14px 0;
  border: 1px solid rgba(0,0,0,0.07);

  .dark & {
    background: rgba(255,255,255,0.03);
    border-color: rgba(255,255,255,0.08);
  }

  /* 在窄屏隐藏 */
  @media (max-width: 720px) {
    display: none;
  }
}

.toc-heading {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94a3b8;
  padding: 0 14px 8px;
  margin: 0;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  .dark & { border-color: rgba(255,255,255,0.06); }
}

.toc-item {
  list-style: none;
  font-size: 12px;
  padding: 5px 14px;
  cursor: pointer;
  color: #64748b;
  border-left: 2px solid transparent;
  transition: all 0.15s;
  line-height: 1.4;

  &:hover { color: #6366f1; background: rgba(99,102,241,0.04); }
  &--active {
    color: #6366f1;
    border-left-color: #6366f1;
    background: rgba(99,102,241,0.06);
    font-weight: 600;
  }

  .dark & { color: #94a3b8; }
  .dark &:hover { color: #a5b4fc; background: rgba(129,140,248,0.05); }
  .dark &.toc-item--active { color: #a5b4fc; border-left-color: #818cf8; background: rgba(129,140,248,0.08); }
}

/* ─── 主内容区 ───────────────────────────────────────────────── */
.rm-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* ─── 章节 ───────────────────────────────────────────────────── */
.rm-section {
  scroll-margin-top: 80px;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(99,102,241,0.2);

  .dark & { color: #e2e8f0; border-color: rgba(129,140,248,0.2); }
}

/* ─── 表格 ───────────────────────────────────────────────────── */
.table-wrap {
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.09);
  overflow: hidden;
  margin-bottom: 12px;

  .dark & { border-color: rgba(255,255,255,0.09); }
}

.table-caption {
  font-size: 11.5px;
  font-weight: 600;
  color: #64748b;
  background: rgba(0,0,0,0.02);
  padding: 5px 14px;
  margin: 0;
  border-bottom: 1px solid rgba(0,0,0,0.07);
  .dark & { background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.07); color: #94a3b8; }
}

.table-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: rgba(0,0,0,0.03);
  .dark & { background: rgba(255,255,255,0.04); }
}

th {
  padding: 8px 14px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
  text-align: left;
  border-bottom: 1px solid rgba(0,0,0,0.09);
  white-space: nowrap;

  .dark & { color: #94a3b8; border-color: rgba(255,255,255,0.09); }
}

.th-copy { width: 36px; }

/* 斑马纹 */
.data-row {
  cursor: pointer;
  transition: background 0.12s;

  &:nth-child(even) {
    background: rgba(0,0,0,0.018);
    .dark & { background: rgba(255,255,255,0.02); }
  }

  &:hover {
    background: rgba(99,102,241,0.07) !important;
    .dark & { background: rgba(129,140,248,0.1) !important; }
  }
}

td {
  padding: 7px 14px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  font-size: 13.5px;
  color: #334155;
  vertical-align: middle;

  .dark & { color: #cbd5e1; border-color: rgba(255,255,255,0.05); }
}

.data-row:last-child td { border-bottom: none; }

/* ─── Expression 列 code chip ───────────────────────────────── */
.td-expr {
  white-space: nowrap;
  width: 220px;
  min-width: 140px;

  code {
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
    font-size: 12.5px;
    background: rgba(99,102,241,0.08);
    color: #4f46e5;
    border-radius: 5px;
    padding: 2px 7px;
    border: 1px solid rgba(99,102,241,0.15);
    word-break: break-all;

    .dark & {
      background: rgba(129,140,248,0.12);
      color: #a5b4fc;
      border-color: rgba(129,140,248,0.2);
    }
  }
}

.td-desc { color: #475569; .dark & { color: #94a3b8; } }

/* ─── 复制按钮列 ─────────────────────────────────────────────── */
.td-copy { width: 36px; padding: 0 8px; }

.copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 5px;
  font-size: 13px;
  color: #94a3b8;
  opacity: 0;
  transition: opacity 0.15s, background 0.15s;

  .dark & { color: #6b7280; }
}

.data-row:hover .copy-btn {
  opacity: 1;
  background: rgba(99,102,241,0.08);
  color: #6366f1;
  .dark & { color: #a5b4fc; background: rgba(129,140,248,0.1); }
}

/* ─── 备注列表 ───────────────────────────────────────────────── */
.section-notes {
  margin: 8px 0 0 0;
  padding: 10px 14px 10px 28px;
  background: rgba(0,0,0,0.02);
  border-radius: 7px;
  border: 1px solid rgba(0,0,0,0.06);
  list-style: disc;

  li {
    font-size: 12.5px;
    color: #64748b;
    line-height: 1.6;
    .dark & { color: #94a3b8; }
  }

  .dark & { background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.06); }
}

/* ─── 参考链接 ───────────────────────────────────────────────── */
.ref-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;

  a {
    font-size: 13.5px;
    color: #6366f1;
    text-decoration: none;
    &:hover { text-decoration: underline; }
    .dark & { color: #818cf8; }
  }
}
</style>
