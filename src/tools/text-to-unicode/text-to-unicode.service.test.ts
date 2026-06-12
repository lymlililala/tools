import { describe, expect, it } from 'vitest';
import { convertTextToUnicode, convertUnicodeToText } from './text-to-unicode.service';

describe('text-to-unicode', () => {
  describe('convertTextToUnicode', () => {
    it('converts text to the default JS \\uXXXX escape format', () => {
      expect(convertTextToUnicode('A')).toBe('\\u0041');
      expect(convertTextToUnicode('hi')).toBe('\\u0068\\u0069');
      expect(convertTextToUnicode('')).toBe('');
    });

    it('supports the point / html / css formats', () => {
      expect(convertTextToUnicode('A', 'point')).toBe('U+0041');
      expect(convertTextToUnicode('A', 'html')).toBe('&#x41;');
      expect(convertTextToUnicode('A', 'css')).toBe('\\41 ');
    });

    it('round-trips an arbitrary string through convertUnicodeToText', () => {
      const original = 'linke the string convert to unicode';
      expect(convertUnicodeToText(convertTextToUnicode(original))).toBe(original);
    });
  });

  describe('convertUnicodeToText', () => {
    it('an unicode string is converted to its text representation', () => {
      expect(convertUnicodeToText('&#65;')).toBe('A');
      expect(convertUnicodeToText('&#108;&#105;&#110;&#107;&#101;&#32;&#116;&#104;&#101;&#32;&#115;&#116;&#114;&#105;&#110;&#103;&#32;&#99;&#111;&#110;&#118;&#101;&#114;&#116;&#32;&#116;&#111;&#32;&#117;&#110;&#105;&#99;&#111;&#100;&#101;')).toBe('linke the string convert to unicode');
      expect(convertUnicodeToText('')).toBe('');
    });
  });
});
