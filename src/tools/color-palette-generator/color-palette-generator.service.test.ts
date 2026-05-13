import { describe, expect, it } from 'vitest';

// 颜色处理核心逻辑

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0; let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(255 * c).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '';
  return `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`;
}

describe('Color Palette Generator', () => {
  describe('hexToHsl', () => {
    it('纯红色 #ff0000', () => {
      const hsl = hexToHsl('#ff0000');
      expect(hsl).not.toBeNull();
      expect(hsl!.h).toBe(0);
      expect(hsl!.s).toBe(100);
      expect(hsl!.l).toBe(50);
    });

    it('纯绿色 #00ff00', () => {
      const hsl = hexToHsl('#00ff00');
      expect(hsl).not.toBeNull();
      expect(hsl!.h).toBe(120);
      expect(hsl!.s).toBe(100);
      expect(hsl!.l).toBe(50);
    });

    it('纯蓝色 #0000ff', () => {
      const hsl = hexToHsl('#0000ff');
      expect(hsl).not.toBeNull();
      expect(hsl!.h).toBe(240);
      expect(hsl!.s).toBe(100);
      expect(hsl!.l).toBe(50);
    });

    it('白色 #ffffff', () => {
      const hsl = hexToHsl('#ffffff');
      expect(hsl).not.toBeNull();
      expect(hsl!.s).toBe(0);
      expect(hsl!.l).toBe(100);
    });

    it('黑色 #000000', () => {
      const hsl = hexToHsl('#000000');
      expect(hsl).not.toBeNull();
      expect(hsl!.s).toBe(0);
      expect(hsl!.l).toBe(0);
    });

    it('无效十六进制返回 null', () => {
      expect(hexToHsl('#xyz')).toBeNull();
      expect(hexToHsl('not-a-color')).toBeNull();
      expect(hexToHsl('')).toBeNull();
    });

    it('不带 # 前缀也能解析', () => {
      const hsl = hexToHsl('ff0000');
      expect(hsl).not.toBeNull();
      expect(hsl!.h).toBe(0);
    });
  });

  describe('hslToHex', () => {
    it('红色 HSL(0, 100%, 50%) → #ff0000', () => {
      expect(hslToHex(0, 100, 50).toLowerCase()).toBe('#ff0000');
    });

    it('绿色 HSL(120, 100%, 50%) → #00ff00', () => {
      expect(hslToHex(120, 100, 50).toLowerCase()).toBe('#00ff00');
    });

    it('蓝色 HSL(240, 100%, 50%) → #0000ff', () => {
      expect(hslToHex(240, 100, 50).toLowerCase()).toBe('#0000ff');
    });

    it('白色 HSL(0, 0%, 100%) → #ffffff', () => {
      expect(hslToHex(0, 0, 100).toLowerCase()).toBe('#ffffff');
    });

    it('黑色 HSL(0, 0%, 0%) → #000000', () => {
      expect(hslToHex(0, 0, 0).toLowerCase()).toBe('#000000');
    });

    it('结果格式为 #rrggbb', () => {
      const result = hslToHex(210, 80, 60);
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe('往返转换精度', () => {
    const testColors = ['#ff0000', '#00ff00', '#0000ff', '#6366f1', '#18a058', '#ffffff', '#000000'];

    testColors.forEach((hex) => {
      it(`${hex} 十六进制往返转换应一致`, () => {
        const hsl = hexToHsl(hex);
        if (!hsl) return;
        const back = hslToHex(hsl.h, hsl.s, hsl.l).toLowerCase();
        // 允许 ±1 的舍入误差
        const originalR = parseInt(hex.slice(1, 3), 16);
        const originalG = parseInt(hex.slice(3, 5), 16);
        const originalB = parseInt(hex.slice(5, 7), 16);
        const backR = parseInt(back.slice(1, 3), 16);
        const backG = parseInt(back.slice(3, 5), 16);
        const backB = parseInt(back.slice(5, 7), 16);
        expect(Math.abs(originalR - backR)).toBeLessThanOrEqual(1);
        expect(Math.abs(originalG - backG)).toBeLessThanOrEqual(1);
        expect(Math.abs(originalB - backB)).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('互补色计算', () => {
    it('互补色色相差为180度', () => {
      const base = hexToHsl('#ff0000')!; // h=0
      const complementH = (base.h + 180) % 360;
      const complement = hslToHex(complementH, base.s, base.l);
      const compHsl = hexToHsl(complement);
      expect(compHsl!.h).toBe(180); // 青色
    });

    it('三角配色色相差为120度', () => {
      const base = hexToHsl('#ff0000')!;
      const h2 = (base.h + 120) % 360;
      const h3 = (base.h + 240) % 360;
      expect(h2).toBe(120); // 绿色
      expect(h3).toBe(240); // 蓝色
    });
  });

  describe('hexToRgb', () => {
    it('红色', () => {
      expect(hexToRgb('#ff0000')).toBe('rgb(255, 0, 0)');
    });

    it('白色', () => {
      expect(hexToRgb('#ffffff')).toBe('rgb(255, 255, 255)');
    });

    it('无效颜色返回空字符串', () => {
      expect(hexToRgb('invalid')).toBe('');
    });
  });
});
