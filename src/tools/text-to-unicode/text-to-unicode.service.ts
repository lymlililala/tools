// ── Unicode 格式类型 ──────────────────────────────────────────────────────
export type UnicodeFormat = 'js' | 'point' | 'html' | 'css';

export interface UnicodeFormatOption {
  value: UnicodeFormat
  label: string
  example: string
}

export const unicodeFormatOptions: UnicodeFormatOption[] = [
  { value: 'js', label: '\\uXXXX', example: 'e.g. \\u0041\\u4F60 (JS/JSON/Java)' },
  { value: 'point', label: 'U+XXXX', example: 'e.g. U+0041 U+4F60 (Standard)' },
  { value: 'html', label: '&#xXXXX;', example: 'e.g. &#x41;&#x4F60; (HTML Hex Entity)' },
  { value: 'css', label: '\\XXXX', example: 'e.g. \\41 \\4F60 (CSS)' },
];

// ── 单个码点 → 指定格式 ───────────────────────────────────────────────────
function codePointToFormat(cp: number, format: UnicodeFormat): string {
  const hex = cp.toString(16).toUpperCase();
  // BMP 内至少 4 位，超 BMP 保留原始位数（通常 5-6 位）
  const padded = hex.padStart(4, '0');

  switch (format) {
    case 'js':
      // 超出 BMP（>0xFFFF）用 \u{XXXXX} 形式
      return cp > 0xFFFF ? `\\u{${hex}}` : `\\u${padded}`;
    case 'point':
      return `U+${padded}`;
    case 'html':
      return `&#x${hex};`;
    case 'css':
      // CSS 用反斜杠 + hex，后跟空格分隔
      return `\\${hex} `;
    default:
      return `\\u${padded}`;
  }
}

// ── 文本 → Unicode（使用 codePointAt 正确处理 Emoji/超 BMP 字符） ────────
export function convertTextToUnicode(text: string, format: UnicodeFormat = 'js'): string {
  if (!text) {
    return '';
  }
  const result: string[] = [];
  // for...of 迭代器按完整码点迭代（不会拆开代理对）
  for (const char of text) {
    const cp = char.codePointAt(0);
    if (cp !== undefined) {
      result.push(codePointToFormat(cp, format));
    }
  }
  // point 格式用空格连接；其他格式紧密拼接（css 本身已带尾部空格）
  const separator = format === 'point' ? ' ' : '';
  return result.join(separator);
}

// ── Unicode → 文本（多格式智能解析） ─────────────────────────────────────
export function convertUnicodeToText(input: string): string {
  if (!input.trim()) {
    return '';
  }

  let result = input;

  // 1. JS/Java \u{XXXXX} 形式（ES6 扩展码点）
  result = result.replace(/\\u\{([0-9a-fA-F]{1,6})\}/g, (_, hex) =>
    String.fromCodePoint(Number.parseInt(hex, 16)),
  );

  // 2. JS/Java \uXXXX 形式（4位，可能是代理对）
  // 先收集连续的 \uXXXX 序列，尝试合并代理对
  result = result.replace(/(\\u[0-9a-fA-F]{4})+/g, (matched) => {
    const codes = matched.match(/\\u([0-9a-fA-F]{4})/g)!.map(s => Number.parseInt(s.slice(2), 16));
    const chars: string[] = [];
    let i = 0;
    while (i < codes.length) {
      const hi = codes[i];
      // 高代理 + 低代理对
      if (hi >= 0xD800 && hi <= 0xDBFF && i + 1 < codes.length) {
        const lo = codes[i + 1];
        if (lo >= 0xDC00 && lo <= 0xDFFF) {
          const cp = 0x10000 + ((hi - 0xD800) << 10) + (lo - 0xDC00);
          chars.push(String.fromCodePoint(cp));
          i += 2;
          continue;
        }
      }
      chars.push(String.fromCharCode(hi));
      i++;
    }
    return chars.join('');
  });

  // 3. U+XXXX 形式
  result = result.replace(/U\+([0-9a-fA-F]{1,6})/g, (_, hex) =>
    String.fromCodePoint(Number.parseInt(hex, 16)),
  );

  // 4. HTML Hex Entity &#xXXXX;
  result = result.replace(/&#x([0-9a-fA-F]+);/gi, (_, hex) =>
    String.fromCodePoint(Number.parseInt(hex, 16)),
  );

  // 5. HTML Decimal Entity &#XXXXX;
  result = result.replace(/&#(\d+);/g, (_, dec) =>
    String.fromCodePoint(Number.parseInt(dec, 10)),
  );

  // 6. CSS \XXXX 形式（反斜杠 + 1~6位 hex，后跟可选空格）
  result = result.replace(/\\([0-9a-fA-F]{1,6})\s?/g, (_, hex) =>
    String.fromCodePoint(Number.parseInt(hex, 16)),
  );

  return result;
}

// 向后兼容旧的导出（e2e 测试可能用到）
export { convertTextToUnicode as default };
