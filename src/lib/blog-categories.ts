// 博客文章分类（DB 里存英文值）→ 中文展示映射。
// 仅用于「中文视图」的展示，不改变筛选逻辑（筛选仍按英文 category 值匹配）。
// 大小写不敏感；无映射的（含技术专名 AI/TypeScript/Python/DevOps 等）原样保留。

const ZH: Record<string, string> = {
  'crypto': '加密',
  'converter': '转换',
  'web': 'Web',
  'web development': 'Web 开发',
  'development': '开发',
  'developer tools': '开发工具',
  'network': '网络',
  'networking': '网络',
  'math': '数学',
  'measurement': '测量',
  'text': '文本',
  'data': '数据',
  'data engineering': '数据工程',
  'data integrity': '数据完整性',
  'data-science': '数据科学',
  'database': '数据库',
  'databases': '数据库',
  'security': '安全',
  'performance': '性能',
  'architecture': '架构',
  'backend': '后端',
  'frontend': '前端',
  'mobile': '移动端',
  'cloud': '云',
  'health & fitness': '健康与健身',
  'software engineering': '软件工程',
  'system design': '系统设计',
  'utilities': '实用工具',
  'tools': '工具',
  'toolchain': '工具链',
  'images and videos': '图片与视频',
  'ai/ml engineering': 'AI/ML 工程',
};

/** 取分类的展示名：中文视图优先中文映射，缺映射或英文视图原样返回。 */
export function blogCategoryLabel(category: string, zh: boolean): string {
  if (!zh || !category) {
    return category;
  }
  return ZH[category.toLowerCase()] ?? category;
}
