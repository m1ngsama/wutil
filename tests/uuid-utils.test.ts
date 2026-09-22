import assert from 'node:assert/strict';
import test from 'node:test';
import {
  formatUuid,
  generateUuidBatch,
  generateUuidV4,
  generateUuidV7,
  MAX_UUID_V7_TIMESTAMP,
} from '../src/lib/uuid-utils';

function filledRandomBytes(value: number) {
  return (length: number) => new Uint8Array(length).fill(value);
}

test('UUID v4 sets the RFC 9562 version and variant bits', () => {
  assert.equal(
    generateUuidV4({ randomBytes: filledRandomBytes(0x00) }),
    '00000000-0000-4000-8000-000000000000',
  );
  assert.equal(
    generateUuidV4({ randomBytes: filledRandomBytes(0xff) }),
    'ffffffff-ffff-4fff-bfff-ffffffffffff',
  );
});

test('UUID v7 encodes the 48-bit Unix millisecond timestamp and RFC marker bits', () => {
  const now = () => 0x0123456789ab;

  assert.equal(
    generateUuidV7({ now, randomBytes: filledRandomBytes(0x00) }),
    '01234567-89ab-7000-8000-000000000000',
  );
  assert.equal(
    generateUuidV7({ now, randomBytes: filledRandomBytes(0xff) }),
    '01234567-89ab-7fff-bfff-ffffffffffff',
  );
});

test('UUID v7 values sort chronologically when timestamps differ', () => {
  const randomBytes = filledRandomBytes(0x2a);
  const earlier = generateUuidV7({ now: () => 1_700_000_000_000, randomBytes });
  const later = generateUuidV7({ now: () => 1_700_000_000_001, randomBytes });

  assert.ok(earlier < later);
});

test('UUID formatting controls case and hyphens without changing bits', () => {
  const uuid = '01234567-89ab-7cde-8f01-23456789abcd';

  assert.equal(formatUuid(uuid), uuid);
  assert.equal(formatUuid(uuid, { uppercase: true }), '01234567-89AB-7CDE-8F01-23456789ABCD');
  assert.equal(
    formatUuid(uuid, { uppercase: true, hyphens: false }),
    '0123456789AB7CDE8F0123456789ABCD',
  );
});

test('batch generation supports v4 and v7 with 1 to 100 formatted results', () => {
  const v4Batch = generateUuidBatch({
    version: 'v4',
    count: 3,
    uppercase: true,
    hyphens: false,
    randomBytes: filledRandomBytes(0xab),
  });

  assert.deepEqual(v4Batch, [
    'ABABABABABAB4BABABABABABABABABAB',
    'ABABABABABAB4BABABABABABABABABAB',
    'ABABABABABAB4BABABABABABABABABAB',
  ]);
  assert.equal(
    generateUuidBatch({
      version: 'v4',
      count: 100,
      randomBytes: filledRandomBytes(0),
    }).length,
    100,
  );

  let timestamp = 100;
  const v7Batch = generateUuidBatch({
    version: 'v7',
    count: 2,
    randomBytes: filledRandomBytes(0),
    now: () => timestamp++,
  });

  assert.equal(v7Batch.length, 2);
  assert.ok(v7Batch[0] < v7Batch[1]);
});

test('UUID generation rejects invalid batch, timestamp, and random sources', () => {
  assert.throws(() => generateUuidBatch({ version: 'v4', count: 0 }), /1 to 100/);
  assert.throws(() => generateUuidBatch({ version: 'v4', count: 101 }), /1 to 100/);
  assert.throws(() => generateUuidBatch({ version: 'v4', count: 1.5 }), /whole number/);

  const randomBytes = filledRandomBytes(0);
  assert.throws(() => generateUuidV7({ now: () => -1, randomBytes }), /between 0/);
  assert.throws(
    () => generateUuidV7({ now: () => MAX_UUID_V7_TIMESTAMP + 1, randomBytes }),
    /between 0/,
  );
  assert.throws(() => generateUuidV7({ now: () => 1.5, randomBytes }), /whole number/);
  assert.throws(
    () => generateUuidV4({ randomBytes: () => new Uint8Array(15) }),
    /exactly 16 bytes/,
  );
});
