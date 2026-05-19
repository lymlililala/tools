<script setup lang="ts">
import {
  chineseSimplifiedWordList,
  chineseTraditionalWordList,
  czechWordList,
  englishWordList,
  entropyToMnemonic,
  frenchWordList,
  generateEntropy,
  italianWordList,
  japaneseWordList,
  koreanWordList,
  mnemonicToEntropy,
  portugueseWordList,
  spanishWordList,
} from '@it-tools/bip39';

import { useCopy } from '@/composable/copy';
import { useValidation } from '@/composable/validation';
import { isNotThrowing } from '@/utils/boolean';
import { withDefaultOnError } from '@/utils/defaults';

// ── 词库 ──────────────────────────────────────────────────────────────────────
const languages = {
  'English': englishWordList,
  'Chinese simplified': chineseSimplifiedWordList,
  'Chinese traditional': chineseTraditionalWordList,
  'Czech': czechWordList,
  'French': frenchWordList,
  'Italian': italianWordList,
  'Japanese': japaneseWordList,
  'Korean': koreanWordList,
  'Portuguese': portugueseWordList,
  'Spanish': spanishWordList,
};

// ── Word Count → Entropy 字节数映射 ──────────────────────────────────────────
// BIP39: 12w=128bit=16B, 15w=160bit=20B, 18w=192bit=24B, 21w=224bit=28B, 24w=256bit=32B
const wordCountOptions = [
  { label: '12 words', value: 12 },
  { label: '15 words', value: 15 },
  { label: '18 words', value: 18 },
  { label: '21 words', value: 21 },
  { label: '24 words', value: 24 },
];

const wordCountToBytes: Record<number, number> = {
  12: 16,
  15: 20,
  18: 24,
  21: 28,
  24: 32,
};

const wordCount = ref(12);
const language = ref<keyof typeof languages>('English');

// ── Entropy ───────────────────────────────────────────────────────────────────
const entropy = ref(generateEntropy(wordCountToBytes[12]));
const passphraseInput = ref('');

// 当 wordCount 改变时重新生成对应长度的熵
watch(wordCount, (n) => {
  entropy.value = generateEntropy(wordCountToBytes[n]);
});

// ── Mnemonic（双向绑定）──────────────────────────────────────────────────────
const mnemonic = computed({
  get() {
    return withDefaultOnError(
      () => entropyToMnemonic(entropy.value, languages[language.value]),
      passphraseInput.value,
    );
  },
  set(value: string) {
    passphraseInput.value = value;
    const newEntropy = withDefaultOnError(
      () => mnemonicToEntropy(value, languages[language.value]),
      '',
    );
    entropy.value = newEntropy;
    // 根据单词数自动推断 wordCount
    if (newEntropy) {
      const words = value.trim().split(/\s+/).length;
      if (wordCountToBytes[words]) {
        wordCount.value = words;
      }
    }
  },
});

// ── 校验 ──────────────────────────────────────────────────────────────────────
const entropyValidation = useValidation({
  source: entropy,
  rules: [
    {
      validator: value => value === '' || (value.length <= 64 && value.length >= 32 && value.length % 8 === 0),
      message: 'Entropy must be 32, 40, 48, 56 or 64 hex characters (128–256 bits)',
    },
    {
      validator: value => /^[a-fA-F0-9]*$/.test(value),
      message: 'Entropy must be a hexadecimal string',
    },
  ],
});

const mnemonicValidation = useValidation({
  source: mnemonic,
  rules: [
    {
      validator: value => value === '' || isNotThrowing(() => mnemonicToEntropy(value, languages[language.value])),
      message: 'Invalid mnemonic: word not in wordlist or checksum mismatch',
    },
  ],
});

function refreshEntropy() {
  entropy.value = generateEntropy(wordCountToBytes[wordCount.value]);
}

// ── 复制（带图标反馈）─────────────────────────────────────────────────────────
const { copy: copyEntropy, isJustCopied: entropyCopied } = useCopy({ source: entropy, text: 'Entropy copied' });
const { copy: copyMnemonic, isJustCopied: mnemonicCopied } = useCopy({ source: mnemonic, text: 'Mnemonic copied' });
</script>

<template>
  <div class="bip39-wrap">
    <!-- ① 安全警告 -->
    <div class="security-alert">
      <icon-mdi-alert class="alert-icon" />
      <span>
        <strong>Warning:</strong> Never use online tools to generate mnemonics for real wallets or assets. This tool is for development and testing only.
      </span>
    </div>

    <!-- ② 控制行：Language + Word Count -->
    <div class="controls-row">
      <c-select
        v-model:value="language"
        searchable
        label="Language:"
        :options="Object.keys(languages)"
        class="ctrl-item"
      />
      <c-select
        v-model:value="wordCount"
        label="Word count:"
        :options="wordCountOptions"
        class="ctrl-item"
      />
    </div>

    <!-- ③ Entropy 行 -->
    <n-form-item
      label="Entropy (seed):"
      :feedback="entropyValidation.message"
      :validation-status="entropyValidation.status"
      mb-2
    >
      <div class="input-action-row">
        <c-input-text v-model:value="entropy" placeholder="Hex entropy…" raw-text monospace class="grow" />

        <!-- 刷新 -->
        <c-tooltip tooltip="Generate new entropy" position="top">
          <button class="action-btn" @click="refreshEntropy()">
            <icon-mdi-refresh class="action-icon" />
          </button>
        </c-tooltip>

        <!-- 复制熵 -->
        <c-tooltip :tooltip="entropyCopied ? 'Copied!' : 'Copy entropy'" position="top">
          <button class="action-btn" :class="{ copied: entropyCopied }" @click="copyEntropy()">
            <transition name="icon-switch" mode="out-in">
              <icon-mdi-check v-if="entropyCopied" key="check" class="action-icon success" />
              <icon-mdi-content-copy v-else key="copy" class="action-icon" />
            </transition>
          </button>
        </c-tooltip>
      </div>
    </n-form-item>

    <!-- ④ Mnemonic Phrase 行 -->
    <n-form-item
      label="Mnemonic Phrase:"
      :feedback="mnemonicValidation.message"
      :validation-status="mnemonicValidation.status"
    >
      <div class="input-action-row">
        <c-input-text v-model:value="mnemonic" placeholder="Your mnemonic phrase…" raw-text class="grow" />

        <!-- 复制助记词 -->
        <c-tooltip :tooltip="mnemonicCopied ? 'Copied!' : 'Copy mnemonic'" position="top">
          <button class="action-btn" :class="{ copied: mnemonicCopied }" @click="copyMnemonic()">
            <transition name="icon-switch" mode="out-in">
              <icon-mdi-check v-if="mnemonicCopied" key="check" class="action-icon success" />
              <icon-mdi-content-copy v-else key="copy" class="action-icon" />
            </transition>
          </button>
        </c-tooltip>
      </div>
    </n-form-item>
  </div>
</template>

<style scoped lang="less">
.bip39-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* ── 安全警告 ────────────────────────────────────────────────────── */
.security-alert {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.4);
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 13px;
  color: #b45309;
  margin-bottom: 16px;
  line-height: 1.5;
}

.alert-icon {
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 1px;
  color: #d97706;
}

/* ── 控制行 ──────────────────────────────────────────────────────── */
.controls-row {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.ctrl-item {
  flex: 1;
  min-width: 0;
}

/* ── 输入+操作行 ─────────────────────────────────────────────────── */
.input-action-row {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
}

.grow {
  flex: 1;
  min-width: 0;
}

/* 操作按钮 */
.action-btn {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: 4px;
  border: 1px solid rgba(128, 128, 128, 0.25);
  background: transparent;
  cursor: pointer;
  color: inherit;
  opacity: 0.5;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s, color 0.15s, border-color 0.15s;

  &:hover {
    opacity: 1;
    border-color: rgba(128, 128, 128, 0.5);
  }

  &.copied {
    opacity: 1;
    color: #22c55e;
    border-color: #22c55e;
  }
}

.action-icon {
  font-size: 17px;
}

.action-icon.success {
  color: #22c55e;
}

/* ── 图标切换动画 ─────────────────────────────────────────────────── */
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
@media (max-width: 520px) {
  .controls-row {
    flex-direction: column;
  }

  .ctrl-item {
    width: 100%;
  }

  .security-alert {
    font-size: 12px;
  }
}
</style>
