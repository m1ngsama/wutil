import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { decodeBase64, encodeBase64 } from '../src/lib/base64-utils';
import { addCalendarDays, daysBetween, toDateInputValue } from '../src/lib/date-utils';
import { generatePassword, randomIndex } from '../src/lib/password-utils';
import { MAX_PDF_SIZE, validatePdfFile } from '../src/lib/pdf-utils';
import { evaluateRegex, MAX_REGEX_MATCH_DETAILS, MAX_REGEX_TEST_CHARS } from '../src/lib/regex-utils';
import { SITE_URL } from '../src/lib/site-config';
import { getHomeStructuredData, getToolStructuredData } from '../src/lib/structured-data';
import { SITEMAP_ROUTES, STATIC_ROUTES, TOOL_REGISTRY, TOOL_ROUTES } from '../src/lib/tool-registry';
import { parseUnitInput } from '../src/lib/unit-utils';

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
  }
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

test('Cloudflare Pages headers are configured for production hardening', () => {
  const headersPath = join(process.cwd(), 'public', '_headers');
  assert.ok(existsSync(headersPath), 'public/_headers is required for Cloudflare Pages');
  const headers = readFileSync(headersPath, 'utf8');
  assert.match(headers, /Content-Security-Policy:/);
  assert.match(headers, /https:\/\/static\.cloudflareinsights\.com/);
  assert.match(headers, /X-Frame-Options: DENY/);
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
