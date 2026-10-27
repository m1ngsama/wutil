import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateRegex } from '../src/lib/regex-utils.ts';

test('Regex respects global and case-insensitive flags independently', () => {
  for (const [flags, count] of [['', 1], ['g', 2], ['i', 1], ['gi', 3]] as const) {
    const result = evaluateRegex('a', flags, 'aAa');
    assert.equal(result.valid, true);
    if (!result.valid) return;
    assert.equal(result.matchCount, count);
    assert.equal(result.parts.map((part) => part.text).join(''), 'aAa');
  }
});

test('Regex preserves captures, no-match input, and sticky semantics', () => {
  const captured = evaluateRegex('(a)(b)?', '', 'ac ab');
  assert.equal(captured.valid, true);
  if (captured.valid) {
    assert.equal(captured.matchCount, 1);
    assert.deepEqual(captured.matches[0].groups, ['a', null]);
    assert.equal(captured.parts.map((part) => part.text).join(''), 'ac ab');
  }
  for (const flags of ['', 'g', 'y', 'gy']) {
    const result = evaluateRegex('z', flags, 'abc');
    assert.equal(result.valid, true);
    if (result.valid) {
      assert.equal(result.matchCount, 0);
      assert.deepEqual(result.parts, [{ text: 'abc', isMatch: false }]);
    }
  }
  const sticky = evaluateRegex('a', 'gy', 'aa a');
  assert.equal(sticky.valid && sticky.matchCount, 2);
});

test('Regex zero-width matches terminate and advance over Unicode code points', () => {
  for (const [flags, count] of [['', 1], ['g', 3], ['gu', 2], ['gv', 2]] as const) {
    const result = evaluateRegex('(?:)', flags, '👋');
    assert.equal(result.valid, true);
    if (!result.valid) return;
    assert.equal(result.matchCount, count);
    assert.equal(result.parts.map((part) => part.text).join(''), '👋');
  }
  const empty = evaluateRegex('^$', '', '');
  assert.equal(empty.valid && empty.matchCount, 1);
});

test('Regex rejects invalid flags and bounds details without truncating highlights', () => {
  for (const flags of ['gg', 'q', 'uv']) assert.equal(evaluateRegex('a', flags, 'a').valid, false);
  const result = evaluateRegex('a', 'g', 'a'.repeat(30), 2);
  assert.equal(result.valid, true);
  if (result.valid) {
    assert.equal(result.matches.length, 2);
    assert.equal(result.matchCount, 30);
    assert.equal(result.parts.map((part) => part.text).join(''), 'a'.repeat(30));
  }
});
