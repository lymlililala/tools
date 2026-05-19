// 标准 ICAO/NATO 拼写（注意：Alfa 非 Alpha，Juliett 双 t）
export const natoLetterMap: Record<string, string> = {
  a: 'Alfa',
  b: 'Bravo',
  c: 'Charlie',
  d: 'Delta',
  e: 'Echo',
  f: 'Foxtrot',
  g: 'Golf',
  h: 'Hotel',
  i: 'India',
  j: 'Juliett',
  k: 'Kilo',
  l: 'Lima',
  m: 'Mike',
  n: 'November',
  o: 'Oscar',
  p: 'Papa',
  q: 'Quebec',
  r: 'Romeo',
  s: 'Sierra',
  t: 'Tango',
  u: 'Uniform',
  v: 'Victor',
  w: 'Whiskey',
  x: 'X-ray',
  y: 'Yankee',
  z: 'Zulu',
};

// 标准 NATO 数字发音
export const natoDigitMap: Record<string, string> = {
  0: 'Zero',
  1: 'One',
  2: 'Two',
  3: 'Tree',
  4: 'Fower',
  5: 'Fife',
  6: 'Six',
  7: 'Seven',
  8: 'Ait',
  9: 'Niner',
};

// 保留旧导出供向后兼容
export const natoAlphabet = Object.values(natoLetterMap);
