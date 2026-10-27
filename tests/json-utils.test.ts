import assert from 'node:assert/strict';
import test from 'node:test';
import { MAX_JSON_INPUT_CHARS, transformJson } from '../src/lib/json-utils.ts';

test('JSON formatting changes only insignificant whitespace', () => {
  const source = ' { "name" : "wutil", "items" : [1, true, null, {}, []] } ';
  const expected = '{\n  "name": "wutil",\n  "items": [\n    1,\n    true,\n    null,\n    {},\n    []\n  ]\n}';
  assert.equal(transformJson(source, 'format'), expected);
  assert.equal(transformJson(expected, 'minify'), '{"name":"wutil","items":[1,true,null,{},[]]}');
  assert.equal(transformJson(expected, 'format'), expected);
});

test('JSON retains large numbers, numeric spellings, repeated keys, and source key order', () => {
  const source = '{"9":900719925474099312345,"2":-0,"9":1.2300e+400,"a":1E-99}';
  assert.equal(transformJson(transformJson(source, 'format'), 'minify'), source);
});

test('JSON preserves strings, escapes, and whitespace inside strings', () => {
  const source = String.raw`{"text":" hi  世界 👋 ","escaped":"\\\" [ ] { } , : \n\tA","empty":""}`;
  assert.equal(transformJson(transformJson(source, 'format'), 'minify'), source);
  const primitive = String.raw`"a \\"`;
  assert.equal(transformJson(primitive, 'format'), primitive);
});

test('JSON handles primitive values and empty containers', () => {
  for (const source of ['true', 'false', 'null', '-0', '1e400', '[]', '{}', '"value"']) {
    assert.equal(transformJson(` \t${source}\r\n`, 'format'), source);
    assert.equal(transformJson(source, 'minify'), source);
  }
});

test('JSON rejects invalid syntax instead of producing partial output', () => {
  for (const source of ['', '{', '{"x":1,}', 'NaN', '{"a":undefined}', '[1 2]', ' {}']) {
    assert.throws(() => transformJson(source, 'format'), SyntaxError);
  }
});

test('JSON checks the input budget before parsing and bounds formatting expansion', () => {
  assert.throws(() => transformJson('x'.repeat(MAX_JSON_INPUT_CHARS + 1), 'format'), /1,000,000/);
  const boundary = `"${'a'.repeat(MAX_JSON_INPUT_CHARS - 2)}"`;
  assert.equal(transformJson(boundary, 'minify'), boundary);
  const nested = '['.repeat(3000) + '0' + ']'.repeat(3000);
  assert.throws(() => transformJson(nested, 'format'), /output is too large/);
  assert.equal(transformJson(nested, 'minify'), nested);
});
