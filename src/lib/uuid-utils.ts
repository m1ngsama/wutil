import { toHex } from './utils.ts';

export const MIN_UUID_BATCH_SIZE = 1;
export const MAX_UUID_BATCH_SIZE = 100;
export const MAX_UUID_V7_TIMESTAMP = 0xffffffffffff;

export type UuidVersion = 'v4' | 'v7';
type UuidRandomSource = (length: number) => Uint8Array;
type UuidTimeSource = () => number;

interface UuidFormatOptions {
  uppercase?: boolean;
  hyphens?: boolean;
}

interface UuidV4Options {
  randomBytes?: UuidRandomSource;
}

interface UuidV7Options extends UuidV4Options {
  now?: UuidTimeSource;
}

interface UuidBatchOptions extends UuidFormatOptions, UuidV7Options {
  version: UuidVersion;
  count: number;
}

function secureRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

function readRandomBytes(randomBytes: UuidRandomSource): Uint8Array {
  const bytes = randomBytes(16);

  if (!(bytes instanceof Uint8Array) || bytes.length !== 16) {
    throw new RangeError('The random source must return exactly 16 bytes.');
  }

  return Uint8Array.from(bytes);
}

function bytesToUuid(bytes: Uint8Array): string {
  const hex = toHex(bytes);
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join('-');
}

function assertV7Timestamp(unixMilliseconds: number): void {
  if (!Number.isInteger(unixMilliseconds)) {
    throw new RangeError('The UUID v7 timestamp must be a whole number of milliseconds.');
  }

  if (unixMilliseconds < 0 || unixMilliseconds > MAX_UUID_V7_TIMESTAMP) {
    throw new RangeError(`The UUID v7 timestamp must be between 0 and ${MAX_UUID_V7_TIMESTAMP}.`);
  }
}

export function formatUuid(uuid: string, options: UuidFormatOptions = {}): string {
  const { uppercase = false, hyphens = true } = options;
  const formatted = hyphens ? uuid : uuid.replace(/-/g, '');

  return uppercase ? formatted.toUpperCase() : formatted.toLowerCase();
}

export function generateUuidV4(options: UuidV4Options = {}): string {
  const bytes = readRandomBytes(options.randomBytes ?? secureRandomBytes);

  // RFC 9562: version 4 in the high nibble of octet 6, variant 10 in octet 8.
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return bytesToUuid(bytes);
}

export function generateUuidV7(options: UuidV7Options = {}): string {
  const unixMilliseconds = (options.now ?? Date.now)();

  assertV7Timestamp(unixMilliseconds);
  const bytes = readRandomBytes(options.randomBytes ?? secureRandomBytes);

  let remainingTimestamp = unixMilliseconds;
  for (let index = 5; index >= 0; index -= 1) {
    bytes[index] = remainingTimestamp % 0x100;
    remainingTimestamp = Math.floor(remainingTimestamp / 0x100);
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return bytesToUuid(bytes);
}

export function generateUuidBatch(options: UuidBatchOptions): string[] {
  const {
    version,
    count,
    uppercase = false,
    hyphens = true,
    randomBytes,
    now,
  } = options;

  if (version !== 'v4' && version !== 'v7') {
    throw new RangeError('UUID version must be v4 or v7.');
  }

  if (!Number.isInteger(count) || count < MIN_UUID_BATCH_SIZE || count > MAX_UUID_BATCH_SIZE) {
    throw new RangeError(
      `UUID batch size must be a whole number from ${MIN_UUID_BATCH_SIZE} to ${MAX_UUID_BATCH_SIZE}.`,
    );
  }

  return Array.from({ length: count }, () => {
    const uuid = version === 'v4'
      ? generateUuidV4({ randomBytes })
      : generateUuidV7({ randomBytes, now });

    return formatUuid(uuid, { uppercase, hyphens });
  });
}
