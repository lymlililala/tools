import _ from 'lodash';

export { getPasswordCrackTimeEstimation, getCharsetLength, getHumanFriendlyDurationParts, DURATION_UNITS_EN, DURATION_UNITS_ZH };

export type CrackDurationParts =
  | { special: 'instantly' | 'lessThanASecond' }
  | { parts: { unit: string; count: number; display: string }[] };

export interface DurationUnit { unit: string; secondsInUnit: number; prettify?: boolean }

// 英文/西方语言：millennium / century / decade …（与原始 it-tools 一致）
const DURATION_UNITS_EN: DurationUnit[] = [
  { unit: 'millennium', secondsInUnit: 31536000000, prettify: true },
  { unit: 'century', secondsInUnit: 3153600000 },
  { unit: 'decade', secondsInUnit: 315360000 },
  { unit: 'year', secondsInUnit: 31536000 },
  { unit: 'month', secondsInUnit: 2592000 },
  { unit: 'week', secondsInUnit: 604800 },
  { unit: 'day', secondsInUnit: 86400 },
  { unit: 'hour', secondsInUnit: 3600 },
  { unit: 'minute', secondsInUnit: 60 },
  { unit: 'second', secondsInUnit: 1 },
];

// 中文：没有“个十年/个世纪”的说法，改用 亿年 / 万年 / 年 / 月 / 天 / 时 / 分 / 秒
const DURATION_UNITS_ZH: DurationUnit[] = [
  { unit: 'yi', secondsInUnit: 3153600000000000, prettify: true }, // 亿年 = 1e8 年
  { unit: 'wan', secondsInUnit: 315360000000 }, //                    万年 = 1e4 年
  { unit: 'year', secondsInUnit: 31536000 },
  { unit: 'month', secondsInUnit: 2592000 },
  { unit: 'day', secondsInUnit: 86400 },
  { unit: 'hour', secondsInUnit: 3600 },
  { unit: 'minute', secondsInUnit: 60 },
  { unit: 'second', secondsInUnit: 1 },
];

function prettifyExponentialNotation(exponentialNotation: number) {
  const [base, exponent] = exponentialNotation.toString().split('e');
  const baseAsNumber = Number.parseFloat(base);
  const prettyBase = baseAsNumber % 1 === 0 ? baseAsNumber.toLocaleString() : baseAsNumber.toFixed(2);
  return exponent ? `${prettyBase}e${exponent}` : prettyBase;
}

function getHumanFriendlyDuration({ seconds }: { seconds: number }) {
  if (seconds <= 0.001) {
    return 'Instantly';
  }

  if (seconds <= 1) {
    return 'Less than a second';
  }

  const timeUnits = [
    { unit: 'millenium', secondsInUnit: 31536000000, format: prettifyExponentialNotation, plural: 'millennia' },
    { unit: 'century', secondsInUnit: 3153600000, plural: 'centuries' },
    { unit: 'decade', secondsInUnit: 315360000, plural: 'decades' },
    { unit: 'year', secondsInUnit: 31536000, plural: 'years' },
    { unit: 'month', secondsInUnit: 2592000, plural: 'months' },
    { unit: 'week', secondsInUnit: 604800, plural: 'weeks' },
    { unit: 'day', secondsInUnit: 86400, plural: 'days' },
    { unit: 'hour', secondsInUnit: 3600, plural: 'hours' },
    { unit: 'minute', secondsInUnit: 60, plural: 'minutes' },
    { unit: 'second', secondsInUnit: 1, plural: 'seconds' },
  ];

  return _.chain(timeUnits)
    .map(({ unit, secondsInUnit, plural, format = _.identity }) => {
      const quantity = Math.floor(seconds / secondsInUnit);
      seconds %= secondsInUnit;

      if (quantity <= 0) {
        return undefined;
      }

      const formattedQuantity = format(quantity);
      return `${formattedQuantity} ${quantity > 1 ? plural : unit}`;
    })
    .compact()
    .take(2)
    .join(', ')
    .value();
}

// 与 getHumanFriendlyDuration 同逻辑，但返回结构化片段供 UI 做 i18n 渲染（单位名/复数交给 vue-i18n）。
// units 决定单位粒度，按语言传入（中文用 DURATION_UNITS_ZH，其余用 DURATION_UNITS_EN）。
function getHumanFriendlyDurationParts({ seconds, units = DURATION_UNITS_EN }: { seconds: number; units?: DurationUnit[] }): CrackDurationParts {
  if (seconds <= 0.001) {
    return { special: 'instantly' };
  }

  if (seconds <= 1) {
    return { special: 'lessThanASecond' };
  }

  const parts = _.chain(units)
    .map(({ unit, secondsInUnit, prettify }) => {
      const quantity = Math.floor(seconds / secondsInUnit);
      seconds %= secondsInUnit;

      if (quantity <= 0) {
        return undefined;
      }

      const display = prettify ? prettifyExponentialNotation(quantity) : String(quantity);
      return { unit, count: quantity, display };
    })
    .compact()
    .take(2)
    .value();

  return { parts };
}

function getPasswordCrackTimeEstimation({ password, guessesPerSecond = 1e9 }: { password: string; guessesPerSecond?: number }) {
  const charsetLength = getCharsetLength({ password });
  const passwordLength = password.length;

  const entropy = password === '' ? 0 : Math.log2(charsetLength) * passwordLength;

  const secondsToCrack = 2 ** entropy / guessesPerSecond;

  const crackDurationFormatted = getHumanFriendlyDuration({ seconds: secondsToCrack });

  const score = Math.min(entropy / 128, 1);

  return {
    entropy,
    charsetLength,
    passwordLength,
    crackDurationFormatted,
    secondsToCrack,
    score,
  };
}

function getCharsetLength({ password }: { password: string }) {
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasDigits = /\d/.test(password);
  const hasSpecialChars = /\W|_/.test(password);

  let charsetLength = 0;

  if (hasLowercase) {
    charsetLength += 26;
  }
  if (hasUppercase) {
    charsetLength += 26;
  }
  if (hasDigits) {
    charsetLength += 10;
  }
  if (hasSpecialChars) {
    charsetLength += 32;
  }

  return charsetLength;
}
