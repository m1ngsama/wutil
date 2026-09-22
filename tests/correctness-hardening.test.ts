import assert from 'node:assert/strict';
import test from 'node:test';
import {
  hexToRgb,
  hslToRgb,
  normalizeHexColor,
  rgbToHex,
  rgbToHsl,
} from '../src/lib/color-utils';
import {
  MAX_PDF_FILES,
  MAX_PDF_TOTAL_SIZE,
  validatePdfCollection,
} from '../src/lib/pdf-utils';
import { parseTimestampInput } from '../src/lib/timestamp-utils';
import { calculateWordStats } from '../src/lib/word-stats';

test('timestamp auto mode handles common values and rejects ambiguous lengths', () => {
  const seconds = parseTimestampInput('1700000000', 'auto');
  assert.ok(seconds.date);
  assert.equal(seconds.date.toISOString(), '2023-11-14T22:13:20.000Z');

  const milliseconds = parseTimestampInput('1700000000000', 'auto');
  assert.ok(milliseconds.date);
  assert.equal(milliseconds.date.toISOString(), '2023-11-14T22:13:20.000Z');

  for (const value of ['99999999999', '946684800000']) {
    const ambiguous = parseTimestampInput(value, 'auto');
    assert.equal(ambiguous.date, null);
    assert.match(ambiguous.error ?? '', /Ambiguous timestamp length/);
  }
});

test('timestamp explicit units resolve ambiguous and fractional numeric values', () => {
  const milliseconds = parseTimestampInput('946684800000', 'milliseconds');
  assert.ok(milliseconds.date);
  assert.equal(milliseconds.date.toISOString(), '2000-01-01T00:00:00.000Z');

  const fractionalAuto = parseTimestampInput('1.5', 'auto');
  assert.equal(fractionalAuto.date, null);
  assert.match(fractionalAuto.error ?? '', /Choose seconds or milliseconds/);

  const fractionalSeconds = parseTimestampInput('1.5', 'seconds');
  assert.ok(fractionalSeconds.date);
  assert.equal(fractionalSeconds.date.toISOString(), '1970-01-01T00:00:01.500Z');
});

test('HEX parsing accepts only standard three- and six-digit forms', () => {
  assert.equal(normalizeHexColor('#abc'), '#aabbcc');
  assert.equal(normalizeHexColor('fff'), '#ffffff');
  assert.equal(normalizeHexColor('3B82F6'), '#3b82f6');
  assert.equal(normalizeHexColor('#AbCdEf'), '#abcdef');
  assert.deepEqual(hexToRgb('#ff00aa'), { r: 255, g: 0, b: 170 });

  for (const invalid of ['##fff', '#abcd', '#abcde', '#zzzzzz', '#12345678']) {
    assert.equal(normalizeHexColor(invalid), null, `${invalid} should be rejected`);
  }
});

test('RGB, HEX, and HSL conversions remain synchronized and clamped', () => {
  assert.equal(rgbToHex(999, -5, 12.5), '#ff000d');
  const hsl = rgbToHsl(255, 0, 170);
  assert.deepEqual(hsl, { h: 320, s: 100, l: 50 });
  assert.deepEqual(hslToRgb(hsl.h, hsl.s, hsl.l), { r: 255, g: 0, b: 170 });
});

test('word statistics use language-aware segmentation for CJK and uniqueness', () => {
  const chinese = calculateWordStats('你好世界你好。', 'zh');
  assert.ok(chinese);
  assert.equal(chinese.words, 3);
  assert.equal(chinese.uniqueWords, 2);
  assert.equal(chinese.sentences, 1);

  const mixed = calculateWordStats('Hello hello world.\n\n你好世界。', 'en');
  assert.ok(mixed);
  assert.equal(mixed.words, 5);
  assert.equal(mixed.uniqueWords, 4);
  assert.equal(mixed.sentences, 2);
  assert.equal(mixed.paragraphs, 2);
});

test('PDF collection limits cap file count and cumulative bytes', () => {
  const withinLimits = Array.from({ length: MAX_PDF_FILES }, () => ({
    size: MAX_PDF_TOTAL_SIZE / MAX_PDF_FILES,
  }));
  assert.equal(validatePdfCollection(withinLimits), 'ok');
  assert.equal(validatePdfCollection([...withinLimits, { size: 1 }]), 'too-many');
  assert.equal(
    validatePdfCollection([{ size: MAX_PDF_TOTAL_SIZE }, { size: 1 }]),
    'total-too-large',
  );
});
