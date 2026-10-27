import { expect, test, type Download, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PDFDocument } from 'pdf-lib';
import path from 'node:path';

async function downloadBytes(download: Download): Promise<Buffer> {
  const stream = await download.createReadStream();
  const parts: Buffer[] = [];
  for await (const part of stream) parts.push(Buffer.from(part));
  return Buffer.concat(parts);
}

async function pdfFile(name: string, width: number) {
  const pdf = await PDFDocument.create();
  pdf.addPage([width, 200]);
  return { name, mimeType: 'application/pdf', buffer: Buffer.from(await pdf.save()) };
}

async function expectNoOverflow(page: Page) {
  const widths = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
  }));
  expect(widths.content).toBeLessThanOrEqual(widths.viewport + 1);
}

test('JSON workbench preserves source values, invalidates output, and supports its local shortcut', async ({ page }) => {
  await page.goto('/tools/json-formatter');
  const input = page.getByRole('textbox', { name: 'Input', exact: true });
  const output = page.getByRole('textbox', { name: 'Output', exact: true });
  const source = '{"9":900719925474099312345,"2":-0,"9":1.23e+400,"text":"hello  世界"}';
  const status = page.locator('.json-tool-workspace').getByRole('status');
  await expect(status).toHaveCount(1);
  await expect(status).toHaveText('');
  const examples = page.getByRole('group', { name: 'Examples', exact: true });
  await expect(examples.getByRole('button')).toHaveCount(3);
  expect(await examples.evaluate(element => Boolean(element.compareDocumentPosition(document.getElementById('json-input')!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  await expect(input).toHaveAttribute('aria-describedby', 'json-input-note');
  await expect(page.locator('#json-input-note')).toHaveText('Input limit: 1,000,000 characters.');
  await expect(page.getByRole('button', { name: 'Format', exact: true })).toBeDisabled();
  await input.fill(source);
  await input.press('Control+Enter');
  await expect(output).toHaveValue(/900719925474099312345/);
  await expect(status).toHaveText('Formatted');
  await page.getByRole('button', { name: 'Minify', exact: true }).click();
  await expect(output).toHaveValue(source);
  await expect(status).toHaveText('Minified');
  await input.fill('{"changed":true}');
  await expect(output).toHaveValue('');
  await expect(status).toHaveText('');
  await expect(page.getByRole('button', { name: 'Copy', exact: true })).toBeDisabled();
  await input.fill('{');
  await page.getByRole('button', { name: 'Format', exact: true }).click();
  const error = page.getByRole('main').getByRole('alert');
  await expect(error).toContainText('Invalid JSON');
  const errorBox = await error.boundingBox();
  const inputBox = await input.boundingBox();
  expect(errorBox!.y + errorBox!.height).toBeLessThanOrEqual(inputBox!.y);
  expect(await error.evaluate(element => Boolean(element.compareDocumentPosition(document.getElementById('json-output')!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(input).toHaveAttribute('aria-describedby', 'json-error json-input-note');
  await expect(status).toHaveText('');
  await input.fill('{}');
  await page.getByRole('button', { name: 'Format', exact: true }).click();
  await expect(output).toHaveValue('{}');
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(input).toBeFocused();
  await expect(output).toHaveValue('');
  await expect(status).toHaveText('');
});

test('Regex Global controls matching and patterns can match an empty input', async ({ page }) => {
  await page.goto('/tools/regex-tester');
  await page.getByRole('button', { name: 'Email', exact: true }).click();
  await expect(page.getByText('2 matches', { exact: true })).toBeVisible();
  await page.getByRole('checkbox', { name: 'g Global', exact: true }).uncheck();
  await expect(page.getByText('1 match', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copy match 2', exact: true })).toHaveCount(0);
  await page.getByRole('textbox', { name: 'Pattern', exact: true }).fill('^$');
  await page.getByRole('textbox', { name: 'Test string', exact: true }).fill('');
  await expect(page.getByText('1 match', { exact: true })).toBeVisible();
});

test('Regex isolates timeouts and recovers after the pattern changes', async ({ page }) => {
  await page.addInitScript(() => {
    const NativeWorker = window.Worker;
    window.Worker = class extends NativeWorker {
      postMessage(message: unknown, options?: Transferable[] | StructuredSerializeOptions) {
        // Regex engines can short-circuit pathological patterns, so stall one request explicitly.
        if (typeof message === 'object' && message !== null && 'pattern' in message && message.pattern === 'timeout') return;
        if (Array.isArray(options)) super.postMessage(message, options);
        else super.postMessage(message, options);
      }
    };
  });
  await page.goto('/tools/regex-tester');
  await page.getByRole('textbox', { name: 'Pattern', exact: true }).fill('timeout');
  await page.getByRole('textbox', { name: 'Test string', exact: true }).fill('timeout!');
  await expect(page.getByRole('main').getByRole('alert')).toContainText('Regex timed out', { timeout: 15_000 });
  await page.getByRole('textbox', { name: 'Pattern', exact: true }).fill('!');
  await expect(page.getByText('1 match', { exact: true })).toBeVisible();
});

test('Raster image conversion produces a correctly sized download and retains the original preview', async ({ page }) => {
  const errors: string[] = [];
  const workers: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('worker', (worker) => workers.push(worker.url()));
  await page.goto('/tools/image-converter');
  await page.locator('#img-upload').setInputFiles(path.resolve('public/icon-192.png'));
  await expect(page.getByRole('spinbutton', { name: 'Output width', exact: true })).toHaveValue('192');
  await page.getByRole('spinbutton', { name: 'Output width', exact: true }).fill('96');
  await page.getByRole('button', { name: 'PNG', exact: true }).click();
  await page.getByRole('button', { name: 'Convert Image', exact: true }).click();
  const link = page.getByRole('link', { name: 'Download PNG', exact: true });
  await expect(link).toBeVisible();
  expect(workers.length).toBeGreaterThan(0);
  const output = await link.evaluate(async (element) => {
    const response = await fetch((element as HTMLAnchorElement).href);
    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);
    const result = { type: blob.type, width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return result;
  });
  expect(output).toEqual({ type: 'image/png', width: 96, height: 96 });
  const downloading = page.waitForEvent('download');
  await link.click();
  const download = await downloading;
  expect(download.suggestedFilename()).toMatch(/\.png$/);
  expect((await downloadBytes(download)).subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  await page.getByRole('button', { name: 'Original', exact: true }).click();
  await expect(page.getByRole('img', { name: 'Original', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Converted', exact: true }).click();
  await expect(page.getByRole('img', { name: 'Converted', exact: true })).toBeVisible();
  await page.getByRole('spinbutton', { name: 'Output width', exact: true }).fill('64');
  await expect(link).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Converted', exact: true })).toBeDisabled();
  expect(errors).toEqual([]);
});

test('Image startup fallback and invalid-source recovery preserve a usable source', async ({ page }) => {
  await page.addInitScript(() => {
    window.Worker = class {
      constructor() { throw new Error('Worker unavailable'); }
    } as unknown as typeof Worker;
  });
  await page.goto('/tools/image-converter');
  await page.locator('#img-upload').setInputFiles(path.resolve('public/icon-192.png'));
  await expect(page.getByRole('spinbutton', { name: 'Output width', exact: true })).toHaveValue('192');
  await page.locator('#img-upload').setInputFiles({ name: 'broken.png', mimeType: 'image/png', buffer: Buffer.from('not an image') });
  await expect(page.getByRole('main').getByRole('alert')).toContainText(/load|decode|image/i);
  await page.getByRole('button', { name: 'Convert Image', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Download JPEG', exact: true })).toBeVisible();
});

test('Image replacement blocks conversion until the new source is ready', async ({ page }) => {
  await page.addInitScript(() => {
    const descriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')!;
    Object.defineProperty(HTMLImageElement.prototype, 'src', {
      ...descriptor,
      set(value: string) {
        const state = window as Window & { delayNextImage?: boolean };
        if (state.delayNextImage && value.startsWith('blob:')) {
          state.delayNextImage = false;
          setTimeout(() => descriptor.set!.call(this, value), 500);
        } else {
          descriptor.set!.call(this, value);
        }
      },
    });
  });
  await page.goto('/tools/image-converter');
  await page.locator('#img-upload').setInputFiles(path.resolve('public/icon-192.png'));
  await expect(page.getByRole('spinbutton', { name: 'Output width', exact: true })).toHaveValue('192');
  await page.evaluate(() => { (window as Window & { delayNextImage?: boolean }).delayNextImage = true; });
  await page.locator('#img-upload').setInputFiles(path.resolve('public/icon-512.png'));
  await expect(page.getByRole('button', { name: 'Convert Image', exact: true })).toBeDisabled();
  await expect(page.getByRole('spinbutton', { name: 'Output width', exact: true })).toHaveValue('512');
  await page.getByRole('button', { name: 'Convert Image', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Download JPEG', exact: true })).toBeVisible();
  await expect(page.locator('#image-preview-metadata')).toContainText('512 × 512');
});

test('Canceling image and PDF workers retains input without publishing results', async ({ page }) => {
  await page.addInitScript(() => {
    const NativeWorker = window.Worker;
    window.Worker = class extends NativeWorker {
      postMessage(message: unknown, options?: Transferable[] | StructuredSerializeOptions) {
        setTimeout(() => {
          if (Array.isArray(options)) super.postMessage(message, options);
          else super.postMessage(message, options);
        }, 600);
      }
    };
  });
  await page.goto('/tools/image-converter');
  await page.locator('#img-upload').setInputFiles(path.resolve('public/icon-192.png'));
  await expect(page.getByRole('spinbutton', { name: 'Output width', exact: true })).toHaveValue('192');
  await page.getByRole('button', { name: 'Convert Image', exact: true }).click();
  const imageProgress = page.getByRole('progressbar', { name: 'Image conversion progress', exact: true });
  await expect(imageProgress).toHaveAttribute('aria-valuemin', '0');
  await expect(imageProgress).toHaveAttribute('aria-valuemax', '100');
  expect(Number(await imageProgress.getAttribute('aria-valuenow'))).toBeGreaterThanOrEqual(0);
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Convert Image', exact: true })).toBeEnabled();
  await page.waitForTimeout(900);
  await expect(page.getByRole('link', { name: 'Download JPEG', exact: true })).toHaveCount(0);
  await page.goto('/tools/pdf-merge');
  await page.locator('#pdf-upload').setInputFiles([await pdfFile('first.pdf', 100), await pdfFile('second.pdf', 300)]);
  await page.getByRole('button', { name: 'Merge 2 PDFs', exact: true }).click();
  const pdfProgress = page.getByRole('progressbar', { name: 'PDF merge progress', exact: true });
  await expect(pdfProgress).toHaveAttribute('aria-valuemin', '0');
  await expect(pdfProgress).toHaveAttribute('aria-valuemax', '100');
  expect(Number(await pdfProgress.getAttribute('aria-valuenow'))).toBeLessThanOrEqual(100);
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Merge 2 PDFs', exact: true })).toBeEnabled();
  await page.waitForTimeout(900);
  await expect(page.getByRole('link', { name: 'Download PDF', exact: true })).toHaveCount(0);
});

test('PDF keyboard reordering preserves focus and controls actual page order', async ({ page }) => {
  const first = await pdfFile('first.pdf', 100);
  const second = await pdfFile('second.pdf', 300);
  await page.goto('/tools/pdf-merge');
  await page.locator('#pdf-upload').setInputFiles([first, second]);
  const move = page.getByRole('button', { name: 'Move up second.pdf', exact: true });
  await move.focus();
  await move.press('Enter');
  await expect(page.getByRole('listitem', { name: 'second.pdf, position 1 of 2', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Merge 2 PDFs', exact: true }).click();
  const link = page.getByRole('link', { name: 'Download PDF', exact: true });
  await expect(link).toBeVisible();
  const downloading = page.waitForEvent('download');
  await link.click();
  const merged = await PDFDocument.load(await downloadBytes(await downloading));
  expect(merged.getPages().map((pdfPage) => pdfPage.getWidth())).toEqual([300, 100]);
  await page.getByRole('button', { name: 'Move down second.pdf', exact: true }).click();
  await expect(link).toHaveCount(0);
  await page.getByRole('button', { name: 'Clear all', exact: true }).click();
  await expect(page.locator('button[aria-label="Choose PDF files"]')).toBeFocused();
  await page.locator('#pdf-upload').setInputFiles(first);
  await page.getByRole('button', { name: 'Remove first.pdf', exact: true }).click();
  await expect(page.locator('button[aria-label="Choose PDF files"]')).toBeFocused();
});

test('PDF supports duplicate filenames and identifies corrupt files without clearing the queue', async ({ page }) => {
  await page.goto('/tools/pdf-merge');
  await page.locator('#pdf-upload').setInputFiles([
    await pdfFile('same.pdf', 100),
    await pdfFile('same.pdf', 300),
  ]);
  await expect(page.getByRole('button', { name: /Remove same\.pdf/ })).toHaveCount(2);
  await page.getByRole('button', { name: 'Clear all', exact: true }).click();
  await page.locator('#pdf-upload').setInputFiles([
    await pdfFile('valid.pdf', 100),
    { name: 'broken.pdf', mimeType: 'application/pdf', buffer: Buffer.from('broken') },
  ]);
  await page.getByRole('button', { name: 'Merge 2 PDFs', exact: true }).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText('broken.pdf');
  await expect(page.getByRole('button', { name: 'Remove valid.pdf', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Remove broken.pdf', exact: true }).click();
  await page.locator('#pdf-upload').setInputFiles(await pdfFile('replacement.pdf', 300));
  await page.getByRole('button', { name: 'Merge 2 PDFs', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Download PDF', exact: true })).toBeVisible();
});

test('Service Worker cache keeps image, PDF, and regex workers independent on repeat visits', async ({ page }) => {
  await page.goto('/tools/image-converter');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (navigator.serviceWorker.controller) return;
    await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true }));
  });
  await page.locator('#img-upload').setInputFiles(path.resolve('public/icon-192.png'));
  await expect(page.getByRole('spinbutton', { name: 'Output width', exact: true })).toHaveValue('192');
  await page.getByRole('button', { name: 'Convert Image', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Download JPEG', exact: true })).toBeVisible();
  await page.goto('/tools/pdf-merge');
  await page.locator('#pdf-upload').setInputFiles([await pdfFile('first.pdf', 100), await pdfFile('second.pdf', 300)]);
  await page.getByRole('button', { name: 'Merge 2 PDFs', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Download PDF', exact: true })).toBeVisible();
  await page.goto('/tools/regex-tester');
  await page.getByRole('button', { name: 'Email', exact: true }).click();
  await expect(page.getByText('2 matches', { exact: true })).toBeVisible();
});

test('PDF fallback cancellation never publishes a late result', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'Worker', { configurable: true, value: undefined });
    const read = File.prototype.arrayBuffer;
    File.prototype.arrayBuffer = async function () {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return read.call(this);
    };
  });
  await page.goto('/tools/pdf-merge');
  await page.locator('#pdf-upload').setInputFiles([await pdfFile('first.pdf', 100), await pdfFile('second.pdf', 300)]);
  await page.getByRole('button', { name: 'Merge 2 PDFs', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Merge 2 PDFs', exact: true })).toBeEnabled();
  await page.waitForTimeout(1500);
  await expect(page.getByRole('link', { name: 'Download PDF', exact: true })).toHaveCount(0);
});

for (const theme of ['light', 'dark']) {
  test(`Populated workspaces remain accessible in ${theme} mode`, async ({ page, browserName }) => {
    test.setTimeout(60_000);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript((value) => localStorage.setItem('theme', value), theme);
    // axe's temporary result tab stalls this WebKit build; these pages have no cross-origin frames.
    const scan = () => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).setLegacyMode(browserName === 'webkit').analyze();
    for (const route of ['json-formatter', 'image-converter', 'pdf-merge']) {
      await page.goto(`/tools/${route}`);
      if (route === 'json-formatter') {
        await page.getByRole('button', { name: 'Unicode', exact: true }).click();
      } else if (route === 'image-converter') {
        await page.locator('#img-upload').setInputFiles(path.resolve('public/icon-192.png'));
        await expect(page.getByRole('spinbutton', { name: 'Output width', exact: true })).toHaveValue('192');
      } else {
        await page.locator('#pdf-upload').setInputFiles([await pdfFile('first.pdf', 100), await pdfFile('second.pdf', 300)]);
      }
      const results = await scan();
      expect(results.violations).toEqual([]);
      await expectNoOverflow(page);
      if (route === 'json-formatter') {
        await page.getByRole('textbox', { name: 'Input', exact: true }).fill('{');
        await page.getByRole('button', { name: 'Format', exact: true }).click();
      } else if (route === 'image-converter') {
        await page.locator('#img-upload').setInputFiles({ name: 'broken.png', mimeType: 'image/png', buffer: Buffer.from('broken') });
      } else {
        await page.locator('#pdf-upload').setInputFiles({ name: 'broken.pdf', mimeType: 'application/pdf', buffer: Buffer.from('broken') });
        await page.getByRole('button', { name: 'Merge 3 PDFs', exact: true }).click();
      }
      await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
      const errorState = await scan();
      expect(errorState.violations).toEqual([]);
    }
  });
}

for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 844, height: 390 }, { width: 1280, height: 800 }]) {
  test(`Workspaces fit ${viewport.width} by ${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const route of ['json-formatter', 'image-converter', 'pdf-merge']) {
      await page.goto(`/tools/${route}`);
      if (route === 'json-formatter') await page.getByRole('button', { name: 'Unicode', exact: true }).click();
      if (route === 'image-converter') {
        await page.locator('#img-upload').setInputFiles(path.resolve('public/icon-192.png'));
        await expect(page.getByRole('spinbutton', { name: 'Output width', exact: true })).toHaveValue('192');
      }
      if (route === 'pdf-merge') await page.locator('#pdf-upload').setInputFiles([await pdfFile('a-long-file-name-that-should-wrap-without-overflowing-the-workspace.pdf', 100), await pdfFile('second.pdf', 300)]);
      await expectNoOverflow(page);
    }
  });
}
