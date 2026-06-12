import { describe, expect, it } from 'vitest';

// Unix 时间戳转换核心逻辑

function parseTs(ts: string, ms: boolean): Date | null {
  const trimmed = ts.trim();
  if (trimmed === '') {
    return null;
  }
  const n = Number(trimmed);
  if (Number.isNaN(n)) {
    return null;
  }
  try {
    return ms ? new Date(n) : new Date(n * 1000);
  }
  catch {
    return null;
  }
}

function parseDateString(dateStr: string): { unix: number; ms: number } | null {
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) {
      return null;
    }
    return { unix: Math.floor(d.getTime() / 1000), ms: d.getTime() };
  }
  catch {
    return null;
  }
}

describe('Unix Timestamp Converter', () => {
  describe('parseTs - 时间戳转日期', () => {
    it('秒级时间戳解析 - Unix 纪元', () => {
      const d = parseTs('0', false);
      expect(d).not.toBeNull();
      expect(d!.getTime()).toBe(0);
    });

    it('秒级时间戳解析 - 已知时间点', () => {
      // 2024-01-01 00:00:00 UTC = 1704067200
      const d = parseTs('1704067200', false);
      expect(d).not.toBeNull();
      expect(d!.getUTCFullYear()).toBe(2024);
      expect(d!.getUTCMonth()).toBe(0); // January
      expect(d!.getUTCDate()).toBe(1);
    });

    it('毫秒级时间戳解析', () => {
      const d = parseTs('1704067200000', true);
      expect(d).not.toBeNull();
      expect(d!.getUTCFullYear()).toBe(2024);
    });

    it('空字符串返回 null', () => {
      expect(parseTs('', false)).toBeNull();
    });

    it('非数字字符串返回 null', () => {
      expect(parseTs('abc', false)).toBeNull();
      expect(parseTs('2024-01-01', false)).toBeNull();
    });

    it('负数时间戳（1970年以前）', () => {
      const d = parseTs('-86400', false); // 1969-12-31
      expect(d).not.toBeNull();
      expect(d!.getUTCFullYear()).toBe(1969);
      expect(d!.getUTCDate()).toBe(31);
    });

    it('大时间戳（未来）', () => {
      // 2038-01-19 03:14:07 UTC = 2147483647 (32位最大值)
      const d = parseTs('2147483647', false);
      expect(d).not.toBeNull();
      expect(d!.getUTCFullYear()).toBe(2038);
    });

    it('秒转毫秒的一致性', () => {
      const ts = '1704067200';
      const dSec = parseTs(ts, false);
      const dMs = parseTs(String(Number(ts) * 1000), true);
      expect(dSec!.getTime()).toBe(dMs!.getTime());
    });
  });

  describe('parseDateString - 日期转时间戳', () => {
    it('ISO 格式解析', () => {
      const result = parseDateString('2024-01-01T00:00:00.000Z');
      expect(result).not.toBeNull();
      expect(result!.unix).toBe(1704067200);
      expect(result!.ms).toBe(1704067200000);
    });

    it('日期字符串解析', () => {
      const result = parseDateString('2024-01-01');
      expect(result).not.toBeNull();
      expect(result!.ms).toBeGreaterThan(0);
    });

    it('毫秒与秒的关系', () => {
      const result = parseDateString('2024-01-01T00:00:00.000Z');
      expect(result!.ms).toBe(result!.unix * 1000);
    });

    it('无效日期返回 null', () => {
      expect(parseDateString('not-a-date')).toBeNull();
      expect(parseDateString('2024-13-01')).toBeNull(); // 月份超出
    });

    it('空字符串返回 null', () => {
      expect(parseDateString('')).toBeNull();
    });
  });

  describe('边界情况', () => {
    it('Unix 纪元 (1970-01-01)', () => {
      const result = parseDateString('1970-01-01T00:00:00.000Z');
      expect(result!.unix).toBe(0);
      expect(result!.ms).toBe(0);
    });

    it('1970年以前日期返回负时间戳', () => {
      const result = parseDateString('1969-12-31T00:00:00.000Z');
      expect(result).not.toBeNull();
      expect(result!.unix).toBeLessThan(0);
    });

    it('带空格的时间戳字符串', () => {
      expect(parseTs('  1704067200  ', false)).not.toBeNull();
    });
  });
});
