import assert from 'node:assert/strict';
import test from 'node:test';
import {
  parseFavoriteToolIds,
  toggleFavoriteToolId,
} from '../src/lib/favorite-tools';
import {
  matchesToolSearch,
  searchTools,
  TOOL_REGISTRY,
  TOOL_REGISTRY_BY_ID,
} from '../src/lib/tool-registry';

test('tool discovery matches task language, synonyms, and reordered tokens', () => {
  assert.equal(searchTools('merge files')[0]?.id, 'pdf-merge');
  assert.equal(searchTools('files merge')[0]?.id, 'pdf-merge');
  assert.equal(searchTools('picture compress')[0]?.id, 'image-converter');
  assert.equal(searchTools('colour hex')[0]?.id, 'color-converter');
  assert.equal(searchTools('regular expression')[0]?.id, 'regex-tester');
  assert.equal(searchTools('epoch time')[0]?.id, 'timestamp');
  assert.equal(searchTools('json beautify')[0]?.id, 'json-formatter');
});

test('tool discovery ranks exact names and applies the same matcher to subsets', () => {
  assert.equal(searchTools('JSON Formatter')[0]?.id, 'json-formatter');

  const mediaTools = TOOL_REGISTRY.filter((tool) => tool.category === 'media');
  assert.deepEqual(searchTools('photo', mediaTools).map((tool) => tool.id), ['image-converter']);

  const pdfMerger = TOOL_REGISTRY_BY_ID.get('pdf-merge');
  assert.ok(pdfMerger);
  assert.equal(matchesToolSearch(pdfMerger, 'combine documents'), true);
  assert.equal(matchesToolSearch(pdfMerger, 'password'), false);
});

test('every registry entry supplies useful discovery metadata', () => {
  for (const tool of TOOL_REGISTRY) {
    assert.ok(tool.keywords.length > 0, `${tool.id} needs search keywords`);
    assert.equal(new Set(tool.keywords).size, tool.keywords.length, `${tool.id} has duplicate keywords`);
    assert.equal(new Set(tool.aliases ?? []).size, tool.aliases?.length ?? 0, `${tool.id} has duplicate aliases`);
  }
});

test('favorite tools are local-safe, validated, deduplicated, and toggleable', () => {
  assert.deepEqual(parseFavoriteToolIds(null), []);
  assert.deepEqual(parseFavoriteToolIds('not-json'), []);
  assert.deepEqual(
    parseFavoriteToolIds(JSON.stringify(['json-formatter', 'missing-tool', 'json-formatter', 'pdf-merge'])),
    ['json-formatter', 'pdf-merge'],
  );

  const added = toggleFavoriteToolId([], 'json-formatter');
  assert.deepEqual(added, ['json-formatter']);
  assert.deepEqual(toggleFavoriteToolId(added, 'pdf-merge'), ['pdf-merge', 'json-formatter']);
  assert.deepEqual(toggleFavoriteToolId(added, 'json-formatter'), []);
  assert.deepEqual(toggleFavoriteToolId(added, 'missing-tool'), added);
});
