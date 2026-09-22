import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

test('PWA manifest matches the product and exposes useful shortcuts', () => {
  const manifest = JSON.parse(readFileSync(join(process.cwd(), 'public/manifest.json'), 'utf8')) as {
    id?: string;
    scope?: string;
    background_color?: string;
    theme_color?: string;
    icons?: Array<{ src: string; purpose?: string }>;
    shortcuts?: Array<{ url: string }>;
  };

  assert.equal(manifest.id, '/');
  assert.equal(manifest.scope, '/');
  assert.equal(manifest.background_color, '#fafaf9');
  assert.equal(manifest.theme_color, '#9a3412');
  assert.ok(manifest.icons?.some((icon) => icon.purpose === 'maskable'));
  assert.ok((manifest.shortcuts?.length ?? 0) >= 3);

  for (const icon of manifest.icons ?? []) {
    assert.ok(existsSync(join(process.cwd(), 'public', icon.src.replace(/^\//, ''))), `${icon.src} is missing`);
  }
});

test('service worker uses versioned, network-safe offline caching', () => {
  const worker = readFileSync(join(process.cwd(), 'public/sw.js'), 'utf8');
  assert.match(worker, /__BUILD_ID__/);
  assert.match(worker, /request\.mode === 'navigate'/);
  assert.match(worker, /networkFirst/);
  assert.match(worker, /cacheFirst/);
  assert.match(worker, /'\/offline'/);
  assert.match(worker, /\/cdn-cgi\//);

  const headers = readFileSync(join(process.cwd(), 'public/_headers'), 'utf8');
  assert.match(headers, /\/sw\.js\s+Cache-Control: no-cache, no-store, must-revalidate/);
  assert.match(headers, /Service-Worker-Allowed: \//);
});
