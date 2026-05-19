export { generateNumeronym, generateNumeronymPhrase };

function generateNumeronym(word: string): string {
  const wordLength = word.length;

  if (wordLength <= 3) {
    return word;
  }

  return `${word.at(0)}${wordLength - 2}${word.at(-1)}`;
}

/**
 * 对输入短语中的每个单词分别生成数字缩略词（TC-05）
 * 非字母的 token（符号、数字）原样保留
 */
function generateNumeronymPhrase(phrase: string): string {
  if (!phrase.trim()) return '';
  // 按空白分割，保留各 token，对纯字母单词生成缩略词
  return phrase
    .split(/(\s+)/)
    .map(token => /^[a-zA-Z]+$/.test(token) ? generateNumeronym(token) : token)
    .join('');
}
