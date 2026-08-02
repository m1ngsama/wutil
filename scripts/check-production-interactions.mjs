import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchProductionBrowser } from './lib/production-browser.mjs';

const origin = process.env.PRODUCTION_ORIGIN ?? 'https://wutil.m1ng.space';
const attempts = Number(process.env.PRODUCTION_INTERACTION_ATTEMPTS ?? 3);
const retryDelayMs = Number(process.env.PRODUCTION_INTERACTION_RETRY_DELAY_MS ?? 10_000);
const hydrationMarkerTimeoutMs = Number(
  process.env.PRODUCTION_INTERACTION_HYDRATION_MARKER_TIMEOUT_MS ?? 10_000,
);
const hydrationFallbackMs = Number(
  process.env.PRODUCTION_INTERACTION_HYDRATION_FALLBACK_MS ?? 1_500,
);
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const routes = [
  '/',
  '/tools/json-formatter',
  '/tools/base64-converter',
  '/tools/url-encoder',
  '/tools/regex-tester',
  '/tools/timestamp',
  '/tools/date-calculator',
  '/tools/unit-converter',
  '/tools/color-converter',
  '/tools/hash-generator',
  '/tools/password-generator',
  '/tools/text-case',
  '/tools/word-counter',
  '/tools/image-converter',
  '/tools/pdf-merge',
  '/privacy',
  '/changelog',
];

function fixturePath(...parts) {
  return path.join(rootDir, ...parts);
}

function routeUrl(route) {
  return new URL(route, origin).toString();
}

async function gotoInteractive(page, route) {
  await page.goto(routeUrl(route), { waitUntil: 'load' });
  await page.locator('#main-content').waitFor({ state: 'visible' });
  try {
    await page.locator('html[data-wutil-hydrated="true"]').waitFor({
      state: 'attached',
      timeout: hydrationMarkerTimeoutMs,
    });
  } catch {
    await page.waitForTimeout(hydrationFallbackMs);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function visibleText(page) {
  return (await page.locator('body').innerText()).replace(/\s+/g, ' ');
}

async function expect(condition, message) {
  if (!condition) throw new Error(message);
}

async function waitForText(page, textOrRegex, timeout = 5_000) {
  await page.getByText(textOrRegex).waitFor({ timeout });
}

function monitorPage(page, consoleErrors) {
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push({
        url: page.url(),
        source: message.location().url,
        text: message.text(),
      });
    }
  });
  page.on('pageerror', (error) => {
    consoleErrors.push({ url: page.url(), text: error.message });
  });
}

function isExpectedExternalNoise(entry) {
  return (
    entry.text.includes('net::ERR_ABORTED') ||
    entry.text.includes('https://cloudflareinsights.com/cdn-cgi/rum') ||
    entry.source === 'https://cloudflareinsights.com/cdn-cgi/rum'
  );
}

async function runStep(failures, name, fn) {
  try {
    await fn();
  } catch (error) {
    failures.push({
      check: name,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function runAuditOnce() {
  const failures = [];
  const consoleErrors = [];
  const browser = await launchProductionBrowser();

  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    monitorPage(page, consoleErrors);

    await runStep(failures, 'home search and filters', async () => {
      await gotoInteractive(page, '/');
      await page.getByRole('searchbox', { name: 'Find a tool' }).fill('definitely-no-tool');
      await waitForText(page, /No matching tools/);
      await page.getByRole('button', { name: 'Clear filters' }).click();
      await page.getByRole('link', { name: /JSON Formatter/ }).waitFor();
      await page.getByRole('button', { name: 'Images & PDF' }).click();
      await page.getByRole('link', { name: /Image Converter/ }).waitFor();
    });

    await runStep(failures, 'json formatter valid invalid and clear', async () => {
      await gotoInteractive(page, '/tools/json-formatter');
      await page.locator('textarea').first().fill('{"a":1,"b":[true]}');
      await page.getByRole('button', { name: 'Format' }).click();
      await expect(
        (await page.locator('textarea').nth(1).inputValue()) === '{\n  "a": 1,\n  "b": [\n    true\n  ]\n}',
        'formatted JSON output mismatch',
      );
      await page.getByRole('button', { name: 'Minify' }).click();
      await expect((await page.locator('textarea').nth(1).inputValue()) === '{"a":1,"b":[true]}', 'minified JSON output mismatch');
      await page.locator('textarea').first().fill('{bad');
      await page.getByRole('button', { name: 'Format' }).click();
      await waitForText(page, 'Invalid JSON');
      await page.getByRole('button', { name: 'Clear' }).click();
    });

    await runStep(failures, 'base64 url-safe swap and invalid decode', async () => {
      await gotoInteractive(page, '/tools/base64-converter');
      await page.locator('textarea').first().fill('???>>>');
      await page.getByRole('switch', { name: 'URL-safe Base64' }).click();
      const encoded = await page.locator('textarea').nth(1).inputValue();
      await expect(Boolean(encoded) && !/[+/=]/.test(encoded), `URL-safe output invalid: ${encoded}`);
      await page.getByRole('button', { name: 'Swap' }).click();
      await expect((await page.locator('textarea').nth(1).inputValue()) === '???>>>', 'Base64 swap decode mismatch');
      await page.getByRole('button', { name: 'Decode' }).click();
      await page.locator('textarea').first().fill('%%%');
      await waitForText(page, /Invalid Base64/);
    });

    await runStep(failures, 'url encode swap and invalid decode', async () => {
      await gotoInteractive(page, '/tools/url-encoder');
      await page.locator('textarea').first().fill('price: $50 & discount 20%');
      const encoded = await page.locator('textarea').nth(1).inputValue();
      await expect(encoded.includes('%2450') && encoded.includes('%26'), `URL encode mismatch: ${encoded}`);
      await page.getByRole('button', { name: 'Swap' }).click();
      await expect((await page.locator('textarea').nth(1).inputValue()) === 'price: $50 & discount 20%', 'URL swap decode mismatch');
      await page.locator('textarea').first().fill('%E0%A4%A');
      await waitForText(page, 'Invalid encoded string');
    });

    await runStep(failures, 'regex worker and invalid pattern', async () => {
      const regexPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      monitorPage(regexPage, consoleErrors);
      try {
        await gotoInteractive(regexPage, '/tools/regex-tester');
        const example = regexPage.getByRole('button', { name: 'URL', exact: true });
        const pattern = regexPage.locator('#regex-pattern');
        for (let attempt = 1; attempt <= 3; attempt += 1) {
          await example.click();
          await regexPage.waitForTimeout(500);
          if ((await pattern.inputValue()).startsWith('https?://')) break;
          if (attempt === 3) throw new Error('URL example did not populate the regex input');
        }
        await waitForText(regexPage, '2 matches', 10_000);
        await regexPage.locator('input[type="text"]').fill('[');
        await waitForText(regexPage, /Unterminated character class|Invalid regular expression/);
      } finally {
        await regexPage.close();
      }
    });

    await runStep(failures, 'timestamp epoch use-now and invalid input', async () => {
      await gotoInteractive(page, '/tools/timestamp');
      await page.getByRole('button', { name: 'Unix epoch', exact: true }).click();
      await page.getByRole('button', { name: /Copy ISO 8601 value/ }).waitFor();
      await expect((await visibleText(page)).includes('1970-01-01T00:00:00.000Z'), 'Unix epoch output missing');
      await page.getByRole('button', { name: 'Use now' }).click();
      await expect(/^\d{10}$/.test(await page.getByPlaceholder(/1700000000/).inputValue()), 'Use now did not set Unix seconds');
      await page.getByPlaceholder(/1700000000/).fill('not-a-date');
      await waitForText(page, /Cannot parse/);
    });

    await runStep(failures, 'date calculator diff and subtract', async () => {
      await gotoInteractive(page, '/tools/date-calculator');
      await page.getByLabel('Start date').fill('2024-01-15');
      await page.getByLabel('End date').fill('2024-01-01');
      await page.getByRole('button', { name: /Copy days value 14/ }).waitFor();
      await expect(/END IS BEFORE START/i.test(await visibleText(page)), 'date difference direction label missing');
      await page.getByRole('button', { name: 'Add / subtract days' }).click();
      await page.getByLabel('Starting date').fill('2024-01-31');
      await page.getByLabel('Days to add or subtract').fill('1');
      await page.getByRole('button', { name: 'Subtract days', exact: true }).click();
      await page.getByRole('button', { name: /Copy result date 2024-01-30/ }).waitFor();
    });

    await runStep(failures, 'unit converter categories and empty input', async () => {
      await gotoInteractive(page, '/tools/unit-converter');
      await page.getByLabel('Input value').fill('1e3');
      await page.getByRole('button', { name: /Copy converted value 3280.84/ }).waitFor();
      await page.getByLabel('Input value').fill('');
      await expect((await page.getByRole('button', { name: 'Converted value' }).innerText()).trim() === 'No result', 'empty unit input did not clear output');
      await page.getByRole('button', { name: 'Data' }).click();
      await page.getByLabel('Input value').fill('1');
      await page.getByRole('button', { name: /Copy converted value 1024/ }).waitFor();
    });

    await runStep(failures, 'color converter clamps and presets', async () => {
      await gotoInteractive(page, '/tools/color-converter');
      await page.getByRole('spinbutton', { name: 'RGB R' }).fill('999');
      await page.getByRole('spinbutton', { name: 'RGB G' }).fill('-5');
      await page.getByRole('spinbutton', { name: 'RGB B' }).fill('12.5');
      await expect((await visibleText(page)).includes('#FF000D'), 'RGB clamp output mismatch');
      await page.getByRole('button', { name: 'Use color #22c55e' }).click();
      await waitForText(page, '#22C55E');
    });

    await runStep(failures, 'hash generator computes and clears', async () => {
      await gotoInteractive(page, '/tools/hash-generator');
      await page.locator('textarea').fill('hello');
      await page.getByRole('button', { name: 'Copy SHA-512 hash' }).waitFor();
      await page.locator('textarea').fill('');
      await waitForText(page, 'Hashes update as you type.');
    });

    await runStep(failures, 'password generator options and length', async () => {
      await gotoInteractive(page, '/tools/password-generator');
      for (const label of [/Uppercase/, /Lowercase/, /Numbers/]) {
        const sw = page.getByRole('switch', { name: label });
        if ((await sw.getAttribute('aria-checked')) === 'true') await sw.click();
      }
      await page.getByRole('button', { name: 'Generate Password' }).click();
      await waitForText(page, 'Select at least one character type');
      await page.getByRole('switch', { name: /Lowercase/ }).click();
      await page.getByLabel('Password length').fill('64');
      await page.getByRole('button', { name: 'Generate Password' }).click();
      const password = ((await page.getByTestId('generated-password').textContent()) ?? '').trim();
      await expect(password.length === 64 && /^[a-z]+$/.test(password), `password constraints failed: ${password}`);
    });

    await runStep(failures, 'text case and clear', async () => {
      await gotoInteractive(page, '/tools/text-case');
      await page.locator('textarea').first().fill('Hello world 42');
      await page.getByRole('button', { name: /CONSTANT_CASE/ }).click();
      await expect((await page.locator('textarea').nth(1).inputValue()) === 'HELLO_WORLD_42', 'constant case output mismatch');
      await page.getByRole('button', { name: 'Clear' }).click();
    });

    await runStep(failures, 'word counter and clear', async () => {
      await gotoInteractive(page, '/tools/word-counter');
      await page.locator('textarea').fill('Hello world.\n\nHello Codex!');
      await page.getByText('Words', { exact: true }).locator('..').getByText('4').waitFor();
      await page.getByRole('button', { name: 'Clear' }).click();
      await waitForText(page, 'Stats appear here once you start typing.');
    });

    await runStep(failures, 'image converter dimensions and same-file reselect', async () => {
      await gotoInteractive(page, '/tools/image-converter');
      const imagePath = fixturePath('public', 'icon.svg');
      await page.locator('#img-upload').setInputFiles(imagePath);
      await waitForText(page, /icon\.svg/);
      await page.locator('#img-upload').setInputFiles(imagePath);
      await waitForText(page, /icon\.svg/);
      await page.getByLabel('Output width').fill('-1');
      await expect((await page.getByLabel('Output width').inputValue()) === '1', 'image width was not normalized');
      await expect((await page.getByLabel('Output height').inputValue()) === '1', 'image height was not normalized');
      await page.getByRole('button', { name: 'Convert Image' }).click();
      await page.getByRole('link', { name: 'Download' }).waitFor();
    });

    await runStep(failures, 'pdf merger clear reselect and merge', async () => {
      await gotoInteractive(page, '/tools/pdf-merge');
      const files = [
        fixturePath('tests', 'e2e', 'fixtures', 'minimal-a.pdf'),
        fixturePath('tests', 'e2e', 'fixtures', 'minimal-b.pdf'),
      ];
      await page.locator('#pdf-upload').setInputFiles(files);
      await waitForText(page, '2 files');
      await page.getByRole('button', { name: 'Remove minimal-a.pdf' }).click();
      await waitForText(page, '1 file');
      await page.getByRole('button', { name: 'Clear all' }).click();
      await page.getByRole('button', { name: 'Add at least 2 PDFs' }).waitFor();
      await page.locator('#pdf-upload').setInputFiles(files);
      await waitForText(page, '2 files');
      await page.getByRole('button', { name: 'Merge 2 PDFs' }).click();
      await page.getByRole('link', { name: 'Download' }).waitFor();
    });

    await runStep(failures, 'mobile routes have no horizontal overflow', async () => {
      const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
      try {
        for (const route of routes) {
          await mobile.goto(routeUrl(route), { waitUntil: 'load' });
          const dimensions = await mobile.evaluate(() => ({
            viewport: document.documentElement.clientWidth,
            scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
          }));
          if (dimensions.scrollWidth > dimensions.viewport + 1) {
            throw new Error(`${route} overflow ${JSON.stringify(dimensions)}`);
          }
        }
      } finally {
        await mobile.close();
      }
    });
  } finally {
    await browser.close();
  }

  return {
    failures,
    consoleErrors: consoleErrors.filter((entry) => !isExpectedExternalNoise(entry)),
  };
}

let lastResult = { failures: [], consoleErrors: [] };

for (let attempt = 1; attempt <= attempts; attempt += 1) {
  lastResult = await runAuditOnce();
  if (lastResult.failures.length === 0 && lastResult.consoleErrors.length === 0) break;
  if (attempt < attempts) {
    console.error(`Production interaction check failed on attempt ${attempt}/${attempts}; retrying in ${retryDelayMs}ms...`);
    await sleep(retryDelayMs);
  }
}

console.log(JSON.stringify(lastResult, null, 2));

if (lastResult.failures.length > 0 || lastResult.consoleErrors.length > 0) {
  process.exit(1);
}
