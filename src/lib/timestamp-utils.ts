export type TimestampUnit = 'auto' | 'seconds' | 'milliseconds';

type TimestampParseResult =
  | { date: Date; error: null }
  | { date: null; error: string | null };

const DECIMAL_NUMBER_PATTERN = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
const INTEGER_PATTERN = /^[+-]?\d+$/;

function dateFromMilliseconds(milliseconds: number): TimestampParseResult {
  if (!Number.isFinite(milliseconds)) {
    return { date: null, error: 'Timestamp is outside the supported date range.' };
  }

  const date = new Date(milliseconds);
  if (Number.isNaN(date.getTime())) {
    return { date: null, error: 'Timestamp is outside the supported date range.' };
  }

  return { date, error: null };
}

function integerDigits(value: string): number {
  return value.replace(/^[+-]/, '').length;
}

export function parseTimestampInput(
  value: string,
  unit: TimestampUnit = 'auto',
): TimestampParseResult {
  const trimmed = value.trim();
  if (!trimmed) return { date: null, error: null };

  if (DECIMAL_NUMBER_PATTERN.test(trimmed)) {
    const numericValue = Number(trimmed);
    if (!Number.isFinite(numericValue)) {
      return { date: null, error: 'Timestamp is outside the supported date range.' };
    }

    if (unit === 'seconds') return dateFromMilliseconds(numericValue * 1000);
    if (unit === 'milliseconds') return dateFromMilliseconds(numericValue);

    if (!INTEGER_PATTERN.test(trimmed)) {
      return {
        date: null,
        error: 'Choose seconds or milliseconds for decimal or exponential timestamps.',
      };
    }

    const digitCount = integerDigits(trimmed);
    if (digitCount === 11 || digitCount === 12) {
      return {
        date: null,
        error: 'Ambiguous timestamp length. Choose seconds or milliseconds.',
      };
    }

    return dateFromMilliseconds(digitCount <= 10 ? numericValue * 1000 : numericValue);
  }

  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    return {
      date: null,
      error: 'Cannot parse this value. Try a Unix timestamp or ISO date string.',
    };
  }

  return { date, error: null };
}
