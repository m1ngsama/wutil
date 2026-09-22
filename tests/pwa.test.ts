import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

test('PWA manifest matches the product and exposes useful shortcuts', () => {
  const manifest = JSON.parse(readFileSync(join(process.cwd(), 'public/manifest.json'), 'utf8')) as {
    id?: string;
    scope?: string;
    icons?: Array<{ src: string; purpose?: string }>;
    shortcuts?: Array<{ url: string }>;
  };

  assert.equal(manifest.id, '/');
  assert.equal(manifest.scope, '/');
  assert.ok(manifest.icons?.some((icon) => icon.purpose === 'maskable'));
  assert.ok((manifest.shortcuts?.length ?? 0) >= 3);

  for (const icon of manifest.icons ?? []) {
    assert.ok(existsSync(join(process.cwd(), 'public', icon.src.replace(/^\//, ''))), `${icon.src} is missing`);
  }
});
