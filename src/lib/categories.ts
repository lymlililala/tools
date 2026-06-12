// 工具分类元数据 —— 分类 hub 页(/c/<slug>)与首页"按分类浏览"共用。
// name 必须与 src/tools/index.ts 的 toolsByCategory 分类名一致。

export interface CategoryMeta {
  slug: string
  name: string
  label: string
  description: string
}

export const CATEGORY_META: CategoryMeta[] = [
  { slug: 'crypto', name: 'Crypto', label: 'Crypto & Security Tools', description: 'Free online cryptography and security tools — hashing, encryption, token and key generation, password strength, and more. Everything runs in your browser.' },
  { slug: 'converter', name: 'Converter', label: 'Converter Tools', description: 'Free online converters for dates, numbers, colors, text encodings, and data formats like JSON, YAML, TOML, and XML. Fast, private, no upload required.' },
  { slug: 'web', name: 'Web', label: 'Web Developer Tools', description: 'Free online tools for web developers — URL encoding, HTML entities, JWT, basic auth, HTTP status codes, user-agent parsing, and more.' },
  { slug: 'images-and-videos', name: 'Images and videos', label: 'Image & Video Tools', description: 'Free online image and video tools — QR code and SVG placeholder generators, color palettes, and an in-browser camera recorder.' },
  { slug: 'development', name: 'Development', label: 'Developer Utilities', description: 'Free online developer utilities — JSON/SQL/XML/YAML formatting, regex testing, crontab, chmod, Docker, and Git references. Runs entirely in your browser.' },
  { slug: 'network', name: 'Network', label: 'Network Tools', description: 'Free online network tools — IPv4 subnet and range calculators, MAC address lookup and generation, and IPv6 ULA generation.' },
  { slug: 'math', name: 'Math', label: 'Math & Calculator Tools', description: 'Free online math and finance calculators — expression evaluator, percentage, mortgage, income tax, ETA, and number formatting.' },
  { slug: 'measurement', name: 'Measurement', label: 'Measurement Tools', description: 'Free online measurement tools — chronometer, temperature converter, BMI calculator, and a code benchmark builder.' },
  { slug: 'text', name: 'Text', label: 'Text Tools', description: 'Free online text tools — lorem ipsum, text statistics, diffing, emoji picker, string obfuscation, ASCII art, and more.' },
  { slug: 'data', name: 'Data', label: 'Data Tools', description: 'Free online data tools — phone number parsing and formatting, and IBAN validation and parsing.' },
];

export function categorySlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export function findCategoryBySlug(slug: string): CategoryMeta | undefined {
  return CATEGORY_META.find(c => c.slug === slug);
}
