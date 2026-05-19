export { convertTextToAsciiBinary, convertAsciiBinaryToText };

// ── 文本 → 二进制 ─────────────────────────────────────────────────────────
// 使用 TextEncoder 将文本编码为 UTF-8 字节序列，再转为二进制
function convertTextToAsciiBinary(text: string, { separator = ' ' }: { separator?: string } = {}): string {
  if (!text) return '';
  const bytes = new TextEncoder().encode(text);
  return Array.from(bytes)
    .map(byte => byte.toString(2).padStart(8, '0'))
    .join(separator);
}

// ── 二进制 → 文本 ─────────────────────────────────────────────────────────
// 1. 剔除非 0/1 字符（空格等分隔符）
// 2. 若不是 8 的整数倍，抛出错误
// 3. 用 TextDecoder 解码 UTF-8 字节序列（正确还原多字节中文等）
function convertAsciiBinaryToText(binary: string): string {
  const cleanBinary = binary.replace(/[^01]/g, '');

  if (cleanBinary.length === 0) return '';

  if (cleanBinary.length % 8 !== 0) {
    throw new Error('Invalid binary string: length must be a multiple of 8');
  }

  const byteStrings = cleanBinary.match(/.{8}/g) ?? [];
  const bytes = new Uint8Array(byteStrings.map(b => Number.parseInt(b, 2)));

  return new TextDecoder('utf-8').decode(bytes);
}
