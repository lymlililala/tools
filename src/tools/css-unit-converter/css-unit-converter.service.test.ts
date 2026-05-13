import { describe, expect, it } from 'vitest';

// 单位转换核心逻辑（从组件中提取的纯函数，与组件保持一致）

function toPx(
  value: number,
  unit: string,
  {
    baseFontSize = 16,
    parentFontSize = 16,
    viewportWidth = 1440,
    viewportHeight = 900,
  } = {},
): number {
  switch (unit) {
    case 'px': return value;
    case 'rem': return value * baseFontSize;
    case 'em': return value * parentFontSize;
    case 'vw': return (value / 100) * viewportWidth;
    case 'vh': return (value / 100) * viewportHeight;
    case 'pt': return value * (96 / 72);
    case 'percent': return (value / 100) * parentFontSize;
    default: return value;
  }
}

function fromPx(
  px: number,
  unit: string,
  {
    baseFontSize = 16,
    parentFontSize = 16,
    viewportWidth = 1440,
    viewportHeight = 900,
  } = {},
): number {
  switch (unit) {
    case 'px': return px;
    case 'rem': return px / baseFontSize;
    case 'em': return px / parentFontSize;
    case 'vw': return (px / viewportWidth) * 100;
    case 'vh': return (px / viewportHeight) * 100;
    case 'pt': return px * (72 / 96);
    case 'percent': return (px / parentFontSize) * 100;
    default: return px;
  }
}

describe('CSS Unit Converter', () => {
  describe('toPx', () => {
    it('px → px 不变', () => {
      expect(toPx(16, 'px')).toBe(16);
      expect(toPx(0, 'px')).toBe(0);
    });

    it('rem → px（默认根字体16px）', () => {
      expect(toPx(1, 'rem')).toBe(16);
      expect(toPx(2, 'rem')).toBe(32);
      expect(toPx(0.5, 'rem')).toBe(8);
    });

    it('rem → px（自定义根字体）', () => {
      expect(toPx(1, 'rem', { baseFontSize: 20 })).toBe(20);
      expect(toPx(2.5, 'rem', { baseFontSize: 14 })).toBe(35);
    });

    it('em → px（默认父字体16px）', () => {
      expect(toPx(1, 'em')).toBe(16);
      expect(toPx(1.5, 'em')).toBe(24);
    });

    it('vw → px（默认视口1440px）', () => {
      expect(toPx(100, 'vw')).toBe(1440);
      expect(toPx(50, 'vw')).toBe(720);
      expect(toPx(1, 'vw')).toBe(14.4);
    });

    it('vh → px（默认视口900px）', () => {
      expect(toPx(100, 'vh')).toBe(900);
      expect(toPx(50, 'vh')).toBe(450);
    });

    it('pt → px（1pt = 96/72 px ≈ 1.333px）', () => {
      expect(toPx(72, 'pt')).toBeCloseTo(96, 5);
      expect(toPx(12, 'pt')).toBeCloseTo(16, 5);
    });

    it('percent → px（相对父字体）', () => {
      expect(toPx(100, 'percent')).toBe(16);
      expect(toPx(50, 'percent')).toBe(8);
      expect(toPx(150, 'percent')).toBe(24);
    });
  });

  describe('fromPx', () => {
    it('px → px', () => {
      expect(fromPx(32, 'px')).toBe(32);
    });

    it('px → rem', () => {
      expect(fromPx(16, 'rem')).toBe(1);
      expect(fromPx(32, 'rem')).toBe(2);
      expect(fromPx(8, 'rem')).toBe(0.5);
    });

    it('px → em', () => {
      expect(fromPx(16, 'em')).toBe(1);
      expect(fromPx(24, 'em')).toBe(1.5);
    });

    it('px → vw（默认1440px视口）', () => {
      expect(fromPx(1440, 'vw')).toBe(100);
      expect(fromPx(144, 'vw')).toBeCloseTo(10, 5);
    });

    it('px → pt', () => {
      expect(fromPx(96, 'pt')).toBeCloseTo(72, 5);
      expect(fromPx(16, 'pt')).toBeCloseTo(12, 5);
    });

    it('px → percent', () => {
      expect(fromPx(16, 'percent')).toBe(100);
      expect(fromPx(8, 'percent')).toBe(50);
    });
  });

  describe('往返转换精度', () => {
    const units = ['px', 'rem', 'em', 'vw', 'vh', 'pt', 'percent'];
    const testValues = [1, 8, 16, 24, 100, 1440];

    units.forEach((unit) => {
      testValues.forEach((v) => {
        it(`${v}px → ${unit} → px 应保持精度`, () => {
          const converted = fromPx(v, unit);
          const backToPx = toPx(converted, unit);
          expect(backToPx).toBeCloseTo(v, 5);
        });
      });
    });
  });

  describe('边界情况', () => {
    it('0值转换', () => {
      expect(toPx(0, 'rem')).toBe(0);
      expect(toPx(0, 'vw')).toBe(0);
      expect(fromPx(0, 'rem')).toBe(0);
    });

    it('负值转换', () => {
      expect(toPx(-1, 'rem')).toBe(-16);
      expect(fromPx(-16, 'rem')).toBe(-1);
    });

    it('自定义大视口', () => {
      expect(toPx(100, 'vw', { viewportWidth: 2560 })).toBe(2560);
      expect(fromPx(2560, 'vw', { viewportWidth: 2560 })).toBe(100);
    });
  });
});
