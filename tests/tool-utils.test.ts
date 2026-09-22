import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { decodeBase64, encodeBase64 } from '../src/lib/base64-utils.ts';
import { addCalendarDays, daysBetween, toDateInputValue } from '../src/lib/date-utils.ts';
import {
  fitImageWithinOutputLimits,
  MAX_IMAGE_DIMENSION,
  MAX_IMAGE_FILE_SIZE,
  MAX_IMAGE_OUTPUT_PIXELS,
  validateImageDimensions,
  validateImageFile,
} from '../src/lib/image-utils.ts';
import { generatePassword, randomIndex } from '../src/lib/password-utils.ts';
import { MAX_PDF_SIZE, validatePdfFile } from '../src/lib/pdf-utils.ts';
import { getPrivacyToolNames, PRIVACY_NOTES } from '../src/lib/privacy-notes.ts';
import { addRecentToolId, MAX_RECENT_TOOLS, parseToolIds } from '../src/lib/tool-store.ts';
import { evaluateRegex, MAX_REGEX_MATCH_DETAILS, MAX_REGEX_TEST_CHARS } from '../src/lib/regex-utils.ts';
import { createPageMetadata } from '../src/lib/seo.ts';
import { SITE_URL } from '../src/lib/site-config.ts';
import { getHomeStructuredData, getToolStructuredData } from '../src/lib/structured-data.ts';
import {
  getRelatedTools,
  SITEMAP_ROUTES,
  STATIC_ROUTES,
  TOOL_REGISTRY,
  TOOL_REGISTRY_BY_ID,
  TOOL_ROUTES,
} from '../src/lib/tool-registry.ts';
import { parseUnitInput } from '../src/lib/unit-utils.ts';

test('Base64 round-trips Unicode and URL-safe values', () => {
  const input = 'hello 世界 👋';
  assert.equal(decodeBase64(encodeBase64(input, false)), input);

  const urlSafe = encodeBase64('???>>>', true);
  assert.doesNotMatch(urlSafe, /[+/=]/);
  assert.equal(decodeBase64(urlSafe), '???>>>');
});

test('date helpers use local calendar dates and DST-safe day differences', () => {
  assert.equal(toDateInputValue(new Date(2026, 4, 6, 1, 30)), '2026-05-06');
  assert.equal(daysBetween(new Date('2024-01-31T00:00:00'), new Date('2024-02-02T00:00:00')), 2);
  assert.equal(toDateInputValue(addCalendarDays(new Date('2024-02-28T00:00:00'), 1)), '2024-02-29');
});

test('PDF validation accepts extension fallback and enforces size limit', () => {
  assert.equal(validatePdfFile({ name: 'paper.pdf', type: '', size: 100 }), 'ok');
  assert.equal(validatePdfFile({ name: 'paper.txt', type: 'text/plain', size: 100 }), 'not-pdf');
  assert.equal(validatePdfFile({ name: 'large.pdf', type: 'application/pdf', size: MAX_PDF_SIZE + 1 }), 'too-large');
});

test('image validation limits file size and canvas memory pressure', () => {
  assert.equal(validateImageFile({ name: 'photo.jpg', type: 'image/jpeg', size: 100 }), 'ok');
  assert.equal(validateImageFile({ name: 'graphic.svg', type: '', size: 100 }), 'ok');
  assert.equal(validateImageFile({ name: 'notes.txt', type: 'text/plain', size: 100 }), 'not-image');
  assert.equal(
    validateImageFile({ name: 'large.png', type: 'image/png', size: MAX_IMAGE_FILE_SIZE + 1 }),
    'too-large',
  );

  assert.equal(validateImageDimensions(6000, 4000), 'ok');
  assert.equal(validateImageDimensions(0, 4000), 'invalid');
  assert.equal(validateImageDimensions(MAX_IMAGE_DIMENSION + 1, 100), 'too-large');
  assert.equal(validateImageDimensions(8000, 6000), 'too-large');

  const fitted = fitImageWithinOutputLimits(8000, 6000);
  assert.ok(fitted.width * fitted.height <= MAX_IMAGE_OUTPUT_PIXELS);
  assert.ok(fitted.width <= MAX_IMAGE_DIMENSION);
  assert.ok(fitted.height <= MAX_IMAGE_DIMENSION);
  assert.ok(Math.abs(fitted.width / fitted.height - 4 / 3) < 0.001);
});

test('unit input parsing accepts complete numbers only', () => {
  assert.equal(parseUnitInput('42'), 42);
  assert.equal(parseUnitInput(' 1.5e3 '), 1500);
  assert.equal(parseUnitInput('-0.25'), -0.25);
  assert.equal(parseUnitInput(''), null);
  assert.equal(parseUnitInput('1abc'), null);
  assert.equal(parseUnitInput('1e'), null);
  assert.equal(parseUnitInput('Infinity'), null);
});

test('tool registry routes are unique and backed by pages', () => {
  assert.equal(SITE_URL, 'https://wutil.m1ng.space');
  assert.equal(new Set(TOOL_ROUTES).size, TOOL_ROUTES.length);
  assert.equal(TOOL_REGISTRY.length, TOOL_ROUTES.length);
  assert.ok(SITEMAP_ROUTES.includes('/privacy'));
  assert.ok(SITEMAP_ROUTES.includes('/changelog'));

  for (const route of STATIC_ROUTES) {
    const pagePath = route === '' ? 'src/app/page.tsx' : join('src/app', route.slice(1), 'page.tsx');
    assert.ok(existsSync(join(process.cwd(), pagePath)), `${route || '/'} is missing a page`);
  }

  for (const tool of TOOL_REGISTRY) {
    const route = tool.href.replace('/tools/', '');
    assert.ok(existsSync(join(process.cwd(), 'src/app/tools', route, 'page.tsx')), `${tool.href} is missing a page`);
    assert.equal(new Set(tool.relatedIds).size, tool.relatedIds.length, `${tool.id} has duplicate related tools`);
    assert.ok(!tool.relatedIds.includes(tool.id), `${tool.id} cannot relate to itself`);
    for (const relatedId of tool.relatedIds) {
      assert.ok(TOOL_REGISTRY_BY_ID.has(relatedId), `${tool.id} references missing related tool ${relatedId}`);
    }
    assert.equal(getRelatedTools(tool.id).length, tool.relatedIds.length);
  }
});

test('recent tool history is validated, deduplicated, and ordered most-recent first', () => {
  assert.deepEqual(parseToolIds(null, MAX_RECENT_TOOLS), []);
  assert.deepEqual(parseToolIds('not-json', MAX_RECENT_TOOLS), []);
  assert.deepEqual(
    parseToolIds(JSON.stringify(['json-formatter', 'missing-tool', 'json-formatter', 'regex-tester']), MAX_RECENT_TOOLS),
    ['json-formatter', 'regex-tester'],
  );

  let recentIds: string[] = [];
  for (const tool of TOOL_REGISTRY.slice(0, MAX_RECENT_TOOLS + 1)) {
    recentIds = addRecentToolId(recentIds, tool.id);
  }
  assert.equal(recentIds.length, MAX_RECENT_TOOLS);
  assert.equal(recentIds[0], TOOL_REGISTRY[MAX_RECENT_TOOLS].id);

  const movedToFront = addRecentToolId(recentIds, recentIds.at(-1)!);
  assert.equal(movedToFront[0], recentIds.at(-1));
  assert.equal(new Set(movedToFront).size, movedToFront.length);
  assert.deepEqual(addRecentToolId(recentIds, 'missing-tool'), recentIds);
});

test('structured data describes the home page and every tool', () => {
  const homeData = getHomeStructuredData();
  assert.equal(homeData['@context'], 'https://schema.org');
  const homeGraph = homeData['@graph'] as Record<string, unknown>[];
  assert.ok(Array.isArray(homeGraph));
  const itemList = homeGraph.find((item) => item['@type'] === 'ItemList');
  assert.ok(itemList);
  const itemListElement = itemList.itemListElement as unknown[];
  assert.ok(Array.isArray(itemListElement));
  assert.equal(itemListElement.length, TOOL_REGISTRY.length);

  for (const tool of TOOL_REGISTRY) {
    const toolData = getToolStructuredData(tool.id);
    assert.equal(toolData['@context'], 'https://schema.org');
    const toolGraph = toolData['@graph'] as Record<string, unknown>[];
    assert.ok(Array.isArray(toolGraph));
    const app = toolGraph.find((item) => item['@type'] === 'SoftwareApplication');
    assert.ok(app, `${tool.id} is missing SoftwareApplication data`);
    assert.equal(app.name, tool.name);
    assert.equal(app.url, `${SITE_URL}${tool.href}`);
    assert.equal(app.isAccessibleForFree, true);
  }

  assert.throws(() => getToolStructuredData('missing-tool'), /Unknown tool id/);
});

test('page metadata includes canonical and social URLs', () => {
  const metadata = createPageMetadata({
    title: 'JSON Formatter',
    description: 'Format, validate, and inspect JSON in your browser.',
    path: '/tools/json-formatter',
  });

  assert.equal(metadata.title, 'JSON Formatter');
  assert.equal(metadata.description, 'Format, validate, and inspect JSON in your browser.');
  assert.equal(metadata.alternates?.canonical, '/tools/json-formatter');

  const openGraph = metadata.openGraph as Record<string, unknown>;
  assert.equal(openGraph.url, `${SITE_URL}/tools/json-formatter`);
  assert.equal(openGraph.title, 'JSON Formatter | wutil');
  assert.equal(openGraph.siteName, 'wutil');

  const twitter = metadata.twitter as Record<string, unknown>;
  assert.equal(twitter.title, 'JSON Formatter | wutil');
  assert.equal(twitter.card, 'summary_large_image');
});

test('privacy notes reference real tools and cover file tools', () => {
  const coveredToolIds = new Set<string>();
  const registryToolIds = new Set(TOOL_REGISTRY.map((tool) => tool.id));

  for (const group of PRIVACY_NOTES) {
    assert.ok(group.title);
    assert.ok(group.note);
    assert.ok(group.toolIds.length > 0);
    assert.deepEqual(getPrivacyToolNames(group.toolIds).length, group.toolIds.length);

    for (const toolId of group.toolIds) {
      assert.ok(registryToolIds.has(toolId), `${toolId} is not in the tool registry`);
      coveredToolIds.add(toolId);
    }
  }

  assert.ok(coveredToolIds.has('image-converter'));
  assert.ok(coveredToolIds.has('pdf-merge'));
  assert.throws(() => getPrivacyToolNames(['missing-tool']), /Unknown privacy tool id/);
});

test('Cloudflare Pages headers are configured for production hardening', () => {
  const headersPath = join(process.cwd(), 'public', '_headers');
  assert.ok(existsSync(headersPath), 'public/_headers is required for Cloudflare Pages');
  const headers = readFileSync(headersPath, 'utf8');
  assert.match(headers, /Content-Security-Policy:/);
  assert.match(headers, /https:\/\/static\.cloudflareinsights\.com/);
  assert.match(headers, /connect-src 'self' https:\/\/cloudflareinsights\.com/);
  assert.match(headers, /X-Frame-Options: DENY/);
  assert.match(headers, /Cache-Control: public, max-age=60, s-maxage=3600, stale-while-revalidate=86400/);
  assert.match(headers, /\/tools\/\*/);
  assert.match(headers, /\/_next\/static\/\*/);
  assert.match(headers, /Cache-Control: public, max-age=31536000, immutable/);
});

test('password generation keeps length and required character classes', () => {
  const password = generatePassword(16, ['ABC', 'abc', '123', '!@#']);
  assert.equal(password.length, 16);
  assert.match(password, /[ABC]/);
  assert.match(password, /[abc]/);
  assert.match(password, /[123]/);
  assert.match(password, /[!@#]/);
  assert.throws(() => generatePassword(2, ['ABC', 'abc', '123']), /shorter/);

  for (let i = 0; i < 100; i += 1) {
    const index = randomIndex(7);
    assert.ok(index >= 0 && index < 7);
  }
});

test('regex evaluation highlights matches, capture groups, and input limits', () => {
  const result = evaluateRegex('(\\w+)@(\\w+\\.\\w+)', 'g', 'Email a@b.co and c@d.dev');
  assert.equal(result.valid, true);
  if (!result.valid) return;
  assert.equal(result.matchCount, 2);
  assert.equal(result.matches[0].text, 'a@b.co');
  assert.deepEqual(result.matches[0].groups, ['a', 'b.co']);
  assert.ok(result.parts.some((part) => part.isMatch && part.text === 'c@d.dev'));
});

test('regex evaluation caps details and reports invalid or oversized input', () => {
  const many = evaluateRegex('\\d', 'g', '1234567890123456789012345');
  assert.equal(many.valid, true);
  if (!many.valid) return;
  assert.equal(many.matchCount, 25);
  assert.equal(many.matches.length, MAX_REGEX_MATCH_DETAILS);

  const invalid = evaluateRegex('[', 'g', 'abc');
  assert.equal(invalid.valid, false);

  const oversized = evaluateRegex('.', 'g', 'x'.repeat(MAX_REGEX_TEST_CHARS + 1));
  assert.equal(oversized.valid, false);
});
