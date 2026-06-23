import _ from 'lodash';

export { getPasswordCrackTimeEstimation, getCharsetLength, getHumanFriendlyDurationParts };

export type CrackDurationParts =
  | { special: 'instantly' | 'lessThanASecond' }
  | { parts: { unit: string; count: number; display: string }[] };

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

// 与 getHumanFriendlyDuration 同逻辑，但返回结构化片段供 UI 做 i18n 渲染（单位名/复数交给 vue-i18n）
function getHumanFriendlyDurationParts({ seconds }: { seconds: number }): CrackDurationParts {
  if (seconds <= 0.001) {
    return { special: 'instantly' };
  }

  if (seconds <= 1) {
    return { special: 'lessThanASecond' };
  }

  const timeUnits = [
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

  const parts = _.chain(timeUnits)
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
  const crackDurationParts = getHumanFriendlyDurationParts({ seconds: secondsToCrack });

  const score = Math.min(entropy / 128, 1);

  return {
    entropy,
    charsetLength,
    passwordLength,
    crackDurationFormatted,
    crackDurationParts,
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
