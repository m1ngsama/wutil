export const HASH_ALGORITHMS = [
  { name: 'SHA-1', algorithm: 'SHA-1', hexLength: 40, legacy: true },
  { name: 'SHA-256', algorithm: 'SHA-256', hexLength: 64, legacy: false },
  { name: 'SHA-384', algorithm: 'SHA-384', hexLength: 96, legacy: false },
  { name: 'SHA-512', algorithm: 'SHA-512', hexLength: 128, legacy: false },
] as const;

export type HashAlgorithmName = (typeof HASH_ALGORITHMS)[number]['name'];
export const MAX_HASH_FILE_SIZE = 50 * 1024 * 1024;

export function bytesToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function digestData(
  data: BufferSource,
  algorithmName: HashAlgorithmName,
): Promise<string> {
  const config = HASH_ALGORITHMS.find((item) => item.name === algorithmName);
  if (!config) throw new Error(`Unsupported hash algorithm: ${algorithmName}`);
  return bytesToHex(await crypto.subtle.digest(config.algorithm, data));
}

export function normalizeExpectedHash(value: string): string {
  const withoutPrefix = value
    .trim()
    .toLowerCase()
    .replace(/^sha(?:-?1|-?256|-?384|-?512)\s*[:=]\s*/i, '');
  return withoutPrefix.split(/\s+/)[0] ?? '';
}

export function validateExpectedHash(value: string, algorithmName: HashAlgorithmName): string | null {
  if (!value.trim()) return null;
  const normalized = normalizeExpectedHash(value);
  const config = HASH_ALGORITHMS.find((item) => item.name === algorithmName);
  if (!config || !new RegExp(`^[a-f0-9]{${config.hexLength}}$`).test(normalized)) {
    return `Enter a ${config?.hexLength ?? 'valid'}-character hexadecimal ${algorithmName} checksum.`;
  }
  return null;
}

export function hashesMatch(actual: string, expected: string): boolean {
  const normalizedExpected = normalizeExpectedHash(expected);
  if (!actual || actual.length !== normalizedExpected.length) return false;

  let difference = 0;
  for (let index = 0; index < actual.length; index += 1) {
    difference |= actual.charCodeAt(index) ^ normalizedExpected.charCodeAt(index);
  }
  return difference === 0;
}

export function validateHashFile(file: Pick<File, 'size'>): 'ok' | 'too-large' | 'empty' {
  if (file.size === 0) return 'empty';
  if (file.size > MAX_HASH_FILE_SIZE) return 'too-large';
  return 'ok';
}
