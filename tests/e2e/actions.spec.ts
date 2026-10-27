import { expect, test } from '@playwright/test';
import path from 'node:path';
import { createHash } from 'node:crypto';
import AxeBuilder from '@axe-core/playwright';
import { TOOL_REGISTRY } from '../../src/lib/tool-registry.ts';

test('Every tool has a local decorative symbol without runtime icon requests', async ({ page, request }) => {
  const iconRequests: string[] = [];
  page.on('request', req => {
    const url = new URL(req.url());
    if (/^\/icon(?:-maskable)?\.svg$/.test(url.pathname)) return;
    if (/ionicons|unpkg|jsdelivr|\.svg(?:\?|$)/i.test(url.href)) iconRequests.push(url.href);
  });
  await page.goto('/');
  const directory = page.getByRole('region', { name: 'Tools', exact: true });
  for (const tool of TOOL_REGISTRY) {
    const link = directory.locator(`a[href="${tool.href}"]`);
    const icon = link.locator('svg[data-symbol]').first();
    await expect(icon).toBeVisible();
    await expect(icon).toHaveAttribute('viewBox', '0 0 512 512');
    await expect(icon).toHaveAttribute('aria-hidden', 'true');
    await expect(icon).toHaveAttribute('focusable', 'false');
    expect(await icon.locator('path, polyline, line, rect, circle').count()).toBeGreaterThan(0);
  }
  expect(iconRequests).toEqual([]);
  const html = await (await request.get('/')).text();
  expect(html).toContain('data-symbol="key-outline"');
  expect(html).toContain('data-symbol="documents-outline"');
  const license = await request.get('/licenses/ionicons.txt');
  expect(license.ok()).toBe(true);
  expect(await license.text()).toContain('Copyright (c) 2015-present Ionic');
});

test('Favorite symbols use distinct outline and filled artwork', async ({ page }) => {
  await page.goto('/tools/json-formatter');
  let favorite = page.getByRole('button', { name: 'Add JSON Formatter to favorites', exact: true });
  await expect(favorite.locator('[data-symbol="star-outline"]')).toBeVisible();
  const outline = await favorite.locator('path').getAttribute('d');
  await favorite.click();
  favorite = page.getByRole('button', { name: 'Remove JSON Formatter from favorites', exact: true });
  await expect(favorite).toHaveAttribute('aria-pressed', 'true');
  await expect(favorite.locator('[data-symbol="star"]')).toBeVisible();
  expect(await favorite.locator('path').getAttribute('d')).not.toBe(outline);
  await page.reload();
  await expect(favorite.locator('[data-symbol="star"]')).toBeVisible();
  await favorite.click();
  await expect(page.getByRole('button', { name: 'Add JSON Formatter to favorites', exact: true }).locator('[data-symbol="star-outline"]')).toBeVisible();
});

for (const route of ['base64-converter', 'url-encoder']) {
  test(`${route} reverses the current output and preserves mode semantics`, async ({ page }) => {
    await page.goto(`/tools/${route}`);
    const input = page.locator('textarea').first();
    const output = page.locator('textarea').nth(1);
    const reverse = page.getByRole('button', { name: 'Reverse', exact: true });
    await expect(reverse).toBeDisabled();
    await expect(page.getByRole('group', { name: 'Conversion mode', exact: true })).toBeVisible();
    const source = '中文 👩🏽‍💻 / hello?x=1&y=20%';
    await input.fill(source);
    const encoded = await output.inputValue();
    await expect(reverse).toHaveAccessibleDescription('Use output as input and switch to Decode.');
    await reverse.focus();
    await reverse.press('Enter');
    await expect(input).toHaveValue(encoded);
    await expect(output).toHaveValue(source);
    await expect(page.getByRole('button', { name: 'decode', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(reverse).toHaveAccessibleDescription('Use output as input and switch to Encode.');
    await reverse.click();
    await expect(input).toHaveValue(source);
    await expect(output).toHaveValue(encoded);
    await expect(page.getByRole('button', { name: 'encode', exact: true })).toHaveAttribute('aria-pressed', 'true');
  });
}

test('URL-safe Base64 and unit swaps retain their existing values', async ({ page }) => {
  await page.goto('/tools/base64-converter');
  await page.getByRole('switch', { name: 'URL-safe Base64' }).click();
  await page.locator('#base64-input').fill('你好 👋');
  const encoded = await page.locator('#base64-output').inputValue();
  await page.getByRole('button', { name: 'Reverse', exact: true }).click();
  await expect(page.locator('#base64-output')).toHaveValue('你好 👋');
  await page.getByRole('button', { name: 'Reverse', exact: true }).click();
  await expect(page.getByRole('switch', { name: 'URL-safe Base64' })).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('#base64-output')).toHaveValue(encoded);
  await page.goto('/tools/unit-converter');
  await page.getByRole('spinbutton', { name: 'Input value' }).fill('2');
  await page.getByRole('combobox', { name: 'To unit' }).selectOption('cm');
  const swap = page.getByRole('button', { name: 'Swap units', exact: true });
  await swap.click();
  await expect(page.getByRole('combobox', { name: 'From unit' })).toHaveValue('cm');
  await expect(page.getByRole('spinbutton', { name: 'Input value' })).toHaveValue('200');
  await swap.click();
  await expect(page.getByRole('combobox', { name: 'From unit' })).toHaveValue('m');
  await expect(page.getByRole('spinbutton', { name: 'Input value' })).toHaveValue('2');
});

test('Copy feedback follows the value version, serializes writes, and clears after failure', async ({ page }) => {
  await page.addInitScript(() => {
    const writes: { value: string; resolve: () => void; reject: () => void }[] = [];
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: (value: string) => new Promise<void>((resolve, reject) => writes.push({ value, resolve, reject: () => reject(new Error('Denied')) })) },
    });
    Object.assign(window, { clipboardWrites: writes });
  });
  await page.goto('/tools/base64-converter');
  const input = page.locator('#base64-input');
  const copy = page.getByRole('button', { name: 'Copy', exact: true });
  const check = copy.locator('[data-symbol="checkmark-outline"]');
  await input.fill('A');
  await copy.click();
  await expect(copy).toBeDisabled();
  await expect(copy).toHaveAttribute('aria-busy', 'true');
  await copy.dispatchEvent('click');
  expect(await page.evaluate(() => (window as unknown as { clipboardWrites: unknown[] }).clipboardWrites.length)).toBe(1);
  await input.fill('B');
  await input.fill('A');
  await page.evaluate(() => (window as unknown as { clipboardWrites: { resolve: () => void }[] }).clipboardWrites[0].resolve());
  await expect(copy).toBeEnabled();
  await expect(check).toHaveCount(0);
  await copy.click();
  await page.evaluate(() => (window as unknown as { clipboardWrites: { resolve: () => void }[] }).clipboardWrites[1].resolve());
  await expect(check).toBeVisible();
  await expect(copy).toHaveText('Copy');
  await input.fill('B');
  await expect(check).toHaveCount(0);
  await input.fill('A');
  await expect(check).toHaveCount(0);
  await copy.click();
  await page.evaluate(() => (window as unknown as { clipboardWrites: { resolve: () => void }[] }).clipboardWrites[2].resolve());
  await expect(check).toBeVisible();
  await copy.click();
  await expect(check).toHaveCount(0);
  await page.evaluate(() => (window as unknown as { clipboardWrites: { reject: () => void }[] }).clipboardWrites[3].reject());
  await expect(page.getByText('Copy failed', { exact: true })).toBeVisible();
  await expect(page.locator('[data-sonner-toast][data-type="error"] [data-symbol="alert-circle"]')).toBeVisible();
  await expect(copy).toBeEnabled();
  await expect(check).toHaveCount(0);
  await copy.click();
  await page.evaluate(() => (window as unknown as { clipboardWrites: { resolve: () => void }[] }).clipboardWrites[4].resolve());
  await expect(check).toBeVisible();
  await expect(check).toHaveCount(0, { timeout: 3000 });
});

test('Copy notifications remain readable in both themes', async ({ page, browserName }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => {} } });
  });
  for (const theme of ['light', 'dark']) {
    await page.goto('/tools/base64-converter');
    await page.getByRole('combobox', { name: 'Appearance' }).selectOption(theme);
    await expect(page.locator('html')).toHaveClass(new RegExp(`(^|\\s)${theme}(\\s|$)`));
    await page.locator('#base64-input').fill('Readable feedback');
    await page.getByRole('button', { name: 'Copy', exact: true }).click();
    const notification = page.locator('[data-sonner-toast][data-type="success"]').first();
    await expect(notification).toBeVisible();
    await expect(notification).toHaveCSS('opacity', '1');
    await expect(notification.locator('[data-symbol="checkmark-circle"]')).toBeVisible();
    const close = notification.getByRole('button', { name: 'Close toast', exact: true });
    await expect(close.locator('[data-symbol="close-outline"]')).toHaveAttribute('aria-hidden', 'true');
    const scan = await new AxeBuilder({ page }).include('[data-sonner-toaster]').withTags(['wcag2a', 'wcag2aa']).setLegacyMode(browserName === 'webkit').analyze();
    expect(scan.violations).toEqual([]);
    await close.click();
    await expect(notification).not.toBeVisible();
  }
});

test('Appearance icons represent the selected policy and persist it', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  const appearance = page.getByRole('combobox', { name: 'Appearance' });
  const label = page.locator('label').filter({ has: appearance });
  for (const [theme, icon] of [['light', 'sunny-outline'], ['dark', 'moon-outline'], ['system', 'desktop-outline']]) {
    await appearance.selectOption(theme);
    await expect(label.locator(`[data-symbol="${icon}"]`)).toBeVisible();
    await expect(appearance).toHaveValue(theme);
    await expect(label).toHaveAttribute('title', `Appearance: ${theme[0].toUpperCase()}${theme.slice(1)}`);
  }
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.reload();
  await expect(appearance).toHaveValue('system');
  await expect(label.locator('[data-symbol="desktop-outline"]')).toBeVisible();
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await expect(label.locator('[data-symbol="desktop-outline"]')).toBeVisible();
});

test('Search icon actions preserve keyboard focus and 44px targets', async ({ page }) => {
  await page.goto('/tools/json-formatter');
  const trigger = page.getByRole('button', { name: /Open tool search/ });
  await trigger.focus();
  await trigger.press('Control+k');
  const dialog = page.getByRole('dialog', { name: 'Find a tool', exact: true });
  await expect(dialog).toBeVisible();
  const close = dialog.getByRole('button', { name: 'Close tool search', exact: true });
  const box = await close.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);
  await expect(close.locator('svg')).toHaveAttribute('aria-hidden', 'true');
  await close.focus();
  await close.press('Enter');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.press('Control+k');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('File checksum download names and contents follow the algorithm', async ({ page }) => {
  await page.goto('/tools/hash-generator');
  await page.getByRole('button', { name: 'file', exact: true }).click();
  await page.locator('input[type="file"]').setInputFiles({ name: 'example.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') });
  await expect(page.locator('[data-symbol="document-outline"]')).toBeVisible();
  const remove = page.getByRole('button', { name: 'Remove example.txt', exact: true });
  const box = await remove.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);
  for (const algorithm of ['SHA-256', 'SHA-512']) {
    await page.getByRole('combobox', { name: 'Algorithm', exact: true }).selectOption(algorithm);
    await page.getByRole('button', { name: `Calculate ${algorithm}`, exact: true }).click();
    const download = page.getByRole('link', { name: 'Download checksum', exact: true });
    const extension = algorithm.toLowerCase().replace('-', '');
    await expect(download).toHaveAttribute('download', `example.txt.${extension}`);
    const content = await download.evaluate(async el => {
      const response = await fetch((el as HTMLAnchorElement).href);
      return { type: response.headers.get('content-type'), text: await response.text() };
    });
    expect(content.type).toContain('text/plain');
    expect(content.text).toBe(`${createHash(extension).update('hello').digest('hex')}  example.txt\n`);
  }
});

test('Image download labels follow the actual MIME when encoding falls back', async ({ page }) => {
  await page.addInitScript(() => {
    window.Worker = class {
      constructor() { throw new Error('Worker unavailable'); }
    } as unknown as typeof Worker;
    const toBlob = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = function (callback) {
      toBlob.call(this, callback, 'image/png');
    };
  });
  await page.goto('/tools/image-converter');
  await page.locator('#img-upload').setInputFiles(path.resolve('public/icon-192.png'));
  await expect(page.getByRole('spinbutton', { name: 'Output width', exact: true })).toHaveValue('192');
  await expect(page.getByRole('button', { name: 'JPEG', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Convert Image', exact: true }).click();
  const link = page.getByRole('link', { name: 'Download PNG', exact: true });
  await expect(link).toHaveAttribute('download', 'converted.png');
  expect(await link.evaluate(async el => (await fetch((el as HTMLAnchorElement).href)).headers.get('content-type'))).toBe('image/png');
});

test('Download labels and controls fit enlarged text with real results', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/tools/image-converter');
  await page.locator('#img-upload').setInputFiles(path.resolve('public/icon-192.png'));
  await expect(page.getByRole('spinbutton', { name: 'Output width', exact: true })).toHaveValue('192');
  await page.getByRole('button', { name: 'Convert Image', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Download JPEG', exact: true })).toBeVisible();
  await page.addStyleTag({ content: 'html { font-size: 200%; }' });
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => ({
    width: innerWidth,
    fits: document.documentElement.scrollWidth <= innerWidth,
    overflow: [...document.querySelectorAll('main *')].flatMap(el => {
      const box = el.getBoundingClientRect();
      return box.right > innerWidth || box.left < 0 ? [{ tag: el.tagName, className: el.className, x: box.x, width: box.width }] : [];
    }),
  }))).toMatchObject({ width: 320, fits: true, overflow: [] });
  for (const name of ['Output width', 'Output height']) {
    const field = page.getByRole('spinbutton', { name, exact: true });
    expect(await field.evaluate(el => {
      const input = el as HTMLInputElement;
      const style = getComputedStyle(input);
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      context.font = `${style.fontSize} ${style.fontFamily}`;
      return context.measureText('16384').width + parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) + parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth) + 24 <= input.getBoundingClientRect().width;
    })).toBe(true);
  }
  const preview = page.getByRole('group', { name: 'Preview', exact: true });
  expect(await preview.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  for (const name of ['Original', 'Converted']) {
    const control = preview.getByRole('button', { name, exact: true });
    const groupBox = await preview.boundingBox();
    const controlBox = await control.boundingBox();
    expect(controlBox!.x + controlBox!.width).toBeLessThanOrEqual(groupBox!.x + groupBox!.width);
    await control.click();
    await expect(control).toHaveAttribute('aria-pressed', 'true');
  }
  await page.goto('/tools/hash-generator');
  await page.getByRole('button', { name: 'file', exact: true }).click();
  await page.locator('input[type="file"]').setInputFiles({ name: 'example.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') });
  await page.getByRole('button', { name: 'Calculate SHA-256', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Download checksum', exact: true })).toBeVisible();
  await page.addStyleTag({ content: 'html { font-size: 200%; }' });
  await page.evaluate(() => document.fonts.ready);
  expect(await page.getByRole('link', { name: 'Download checksum', exact: true }).evaluate(el => {
    const button = el.getBoundingClientRect();
    return [...el.children].every(child => {
      const box = child.getBoundingClientRect();
      return box.left >= button.left && box.right <= button.right;
    });
  })).toBe(true);
  expect(await page.getByRole('button', { name: 'Calculate SHA-256', exact: true }).evaluate(el => {
    const range = document.createRange();
    range.selectNodeContents(el);
    const text = range.getBoundingClientRect();
    const button = el.getBoundingClientRect();
    return text.top >= button.top && text.bottom <= button.bottom;
  })).toBe(true);
  expect(await page.evaluate(() => ({
    width: innerWidth,
    fits: document.documentElement.scrollWidth <= innerWidth,
    overflow: [...document.querySelectorAll('main *')].flatMap(el => {
      const box = el.getBoundingClientRect();
      return box.right > innerWidth || box.left < 0 ? [{ tag: el.tagName, className: el.className, x: box.x, width: box.width }] : [];
    }),
  }))).toMatchObject({ width: 320, fits: true, overflow: [] });
});
