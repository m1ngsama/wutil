import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MAX_HASH_FILE_SIZE,
  hashesMatch,
  normalizeExpectedHash,
  validateExpectedHash,
  validateHashFile,
} from '../src/lib/hash-utils.ts';

test('checksum normalization accepts common pasted formats', () => {
  const value = 'a'.repeat(64);
  assert.equal(normalizeExpectedHash(`SHA-256: ${value}`), value);
  assert.equal(normalizeExpectedHash(`${value}  archive.zip`), value);
  assert.equal(validateExpectedHash(value.toUpperCase(), 'SHA-256'), null);
  assert.match(validateExpectedHash('xyz', 'SHA-256') ?? '', /64-character/);
});

test('checksum comparison validates every character', () => {
  const checksum = '0123456789abcdef'.repeat(4);
  assert.equal(hashesMatch(checksum, checksum.toUpperCase()), true);
  assert.equal(hashesMatch(checksum, `${checksum.slice(0, -1)}0`), false);
  assert.equal(hashesMatch(checksum, checksum.slice(1)), false);
});

test('file hashing limits empty and oversized inputs', () => {
  assert.equal(validateHashFile({ size: 1 }), 'ok');
  assert.equal(validateHashFile({ size: 0 }), 'empty');
  assert.equal(validateHashFile({ size: MAX_HASH_FILE_SIZE + 1 }), 'too-large');
});
