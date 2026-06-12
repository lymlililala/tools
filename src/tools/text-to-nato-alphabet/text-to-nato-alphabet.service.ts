import { natoDigitMap, natoLetterMap } from './text-to-nato-alphabet.constants';

export { textToNatoAlphabet, textToNatoWords };

// ── 单字符 → NATO 单词 ────────────────────────────────────────────────────
function charToNato(char: string): string {
  const lower = char.toLowerCase();
  if (natoLetterMap[lower]) {
    return natoLetterMap[lower];
  }
  if (natoDigitMap[char]) {
    return natoDigitMap[char];
  }
  // 非英文字母/数字 → 原样保留
  return char;
}

// ── 主转换：返回原始拼接字符串（向后兼容） ──────────────────────────────
function textToNatoAlphabet({ text }: { text: string }): string {
  return text
    .split('')
    .map(char => charToNato(char))
    .join(' ');
}

// ── 增强转换：返回分词结构（每个原始「单词」为一组） ─────────────────────
// 结构：Array of word-groups，每组是一个 NATO 单词数组
// 空格/多空格被视为分隔符，多余空格被合并
export interface NatoGroup {
  original: string // 原始词（不含空格）
  words: string[] // 每个字符对应的 NATO 单词
}

function textToNatoWords(text: string): NatoGroup[] {
  if (!text.trim()) {
    return [];
  }

  // 按空白字符分割，过滤空项
  const tokens = text.split(/\s+/).filter(t => t.length > 0);

  return tokens.map((token) => {
    const words = token.split('').map(char => charToNato(char));
    return { original: token, words };
  });
}
