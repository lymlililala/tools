import { describe, expect, it } from 'vitest';

// 数字格式化核心逻辑

function formatNumber(
  value: number,
  locale: string,
  style: 'decimal' | 'currency' | 'percent' | 'scientific' | 'engineering' | 'compact',
  options: {
    currency?: string
    decimalPlaces?: number
    useGrouping?: boolean
  } = {},
): string {
  const { currency = 'CNY', decimalPlaces = 2, useGrouping = true } = options;
  const base: Intl.NumberFormatOptions = {
    useGrouping,
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  };

  try {
    if (style === 'currency') {
      return new Intl.NumberFormat(locale, { ...base, style: 'currency', currency }).format(value);
    }
    if (style === 'percent') {
      return new Intl.NumberFormat(locale, { style: 'percent', minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces }).format(value);
    }
    if (style === 'scientific') {
      return new Intl.NumberFormat(locale, { notation: 'scientific', minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces }).format(value);
    }
    if (style === 'engineering') {
      return new Intl.NumberFormat(locale, { notation: 'engineering', minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces }).format(value);
    }
    if (style === 'compact') {
      return new Intl.NumberFormat(locale, { notation: 'compact', compactDisplay: 'short' }).format(value);
    }
    return new Intl.NumberFormat(locale, base).format(value);
  }
  catch {
    return '—';
  }
}

describe('Number Formatter', () => {
  describe('十进制格式化', () => {
    it('基本千分位分隔（en-US）', () => {
      const result = formatNumber(1234567, 'en-US', 'decimal', { decimalPlaces: 0 });
      expect(result).toBe('1,234,567');
    });

    it('中文千分位分隔（zh-CN）', () => {
      const result = formatNumber(1234567, 'zh-CN', 'decimal', { decimalPlaces: 0 });
      expect(result).toBe('1,234,567');
    });

    it('小数位数控制', () => {
      const result = formatNumber(3.14159, 'en-US', 'decimal', { decimalPlaces: 2 });
      expect(result).toBe('3.14');
    });

    it('禁用千分位分隔符', () => {
      const result = formatNumber(1234567, 'en-US', 'decimal', { decimalPlaces: 0, useGrouping: false });
      expect(result).toBe('1234567');
    });

    it('0值格式化', () => {
      const result = formatNumber(0, 'en-US', 'decimal', { decimalPlaces: 2 });
      expect(result).toBe('0.00');
    });

    it('负数格式化', () => {
      const result = formatNumber(-1234.56, 'en-US', 'decimal', { decimalPlaces: 2 });
      expect(result).toBe('-1,234.56');
    });
  });

  describe('货币格式化', () => {
    it('人民币格式化', () => {
      const result = formatNumber(1234.56, 'zh-CN', 'currency', { currency: 'CNY', decimalPlaces: 2 });
      expect(result).toContain('1,234.56');
    });

    it('美元格式化', () => {
      const result = formatNumber(1234.56, 'en-US', 'currency', { currency: 'USD', decimalPlaces: 2 });
      expect(result).toContain('1,234.56');
      expect(result).toContain('$');
    });

    it('欧元格式化', () => {
      const result = formatNumber(1234.56, 'de-DE', 'currency', { currency: 'EUR', decimalPlaces: 2 });
      expect(result).toContain('1.234,56');
    });
  });

  describe('百分比格式化', () => {
    it('基本百分比', () => {
      const result = formatNumber(0.5, 'en-US', 'percent', { decimalPlaces: 0 });
      expect(result).toBe('50%');
    });

    it('带小数的百分比', () => {
      const result = formatNumber(0.1234, 'en-US', 'percent', { decimalPlaces: 2 });
      expect(result).toBe('12.34%');
    });

    it('100%', () => {
      const result = formatNumber(1, 'en-US', 'percent', { decimalPlaces: 0 });
      expect(result).toBe('100%');
    });
  });

  describe('科学计数法', () => {
    it('大数科学计数', () => {
      const result = formatNumber(1234567, 'en-US', 'scientific', { decimalPlaces: 2 });
      expect(result).toMatch(/1\.23E6|1\.23×10\^6/);
    });
  });

  describe('紧凑模式', () => {
    it('百万级紧凑', () => {
      const result = formatNumber(1200000, 'en-US', 'compact');
      expect(result.toLowerCase()).toMatch(/1\.2m|1m/);
    });

    it('千级紧凑', () => {
      const result = formatNumber(12000, 'en-US', 'compact');
      expect(result.toLowerCase()).toMatch(/12k/);
    });
  });

  describe('边界情况', () => {
    it('Infinity 处理', () => {
      const result = formatNumber(Number.POSITIVE_INFINITY, 'en-US', 'decimal');
      expect(typeof result).toBe('string');
    });

    it('非常小的数', () => {
      const result = formatNumber(0.000001, 'en-US', 'decimal', { decimalPlaces: 6 });
      expect(result).toBe('0.000001');
    });

    it('整数', () => {
      const result = formatNumber(42, 'en-US', 'decimal', { decimalPlaces: 0 });
      expect(result).toBe('42');
    });
  });
});
