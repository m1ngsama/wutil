const UINT32_SIZE = 2 ** 32;

export function randomIndex(max: number): number {
  if (!Number.isInteger(max) || max <= 0) {
    throw new RangeError('max must be a positive integer');
  }
  const limit = UINT32_SIZE - (UINT32_SIZE % max);
  const value = new Uint32Array(1);
  do {
    crypto.getRandomValues(value);
  } while (value[0] >= limit);
  return value[0] % max;
}

export function pick(chars: string): string {
  if (!chars) throw new RangeError('chars must not be empty');
  return chars[randomIndex(chars.length)];
}

function shuffle(chars: string[]) {
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars;
}

export function generatePassword(length: number, charsets: string[]): string {
  const selectedCharsets = charsets.filter(Boolean);
  const charset = selectedCharsets.join('');
  if (!charset) throw new RangeError('At least one character set is required');
  if (length < selectedCharsets.length) {
    throw new RangeError('Password length is shorter than the required character sets');
  }
  const required = selectedCharsets.map(pick);
  const remaining = Array.from({ length: length - required.length }, () => pick(charset));
  return shuffle([...required, ...remaining]).join('');
}
