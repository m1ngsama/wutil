import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import path from 'node:path';

const ACCESSIBILITY_ROUTES = [
  '/',
  '/changelog',
  '/privacy',
  '/tools/password-generator',
  '/tools/color-converter',
  '/tools/url-encoder',
  '/tools/text-case',
  '/tools/regex-tester',
  '/tools/timestamp',
  '/tools/word-counter',
  '/tools/json-formatter',
  '/tools/base64-converter',
  '/tools/unit-converter',
  '/tools/hash-generator',
  '/tools/uuid-generator',
  '/tools/date-calculator',
  '/tools/image-converter',
  '/tools/pdf-merge',
];

async function expectNoAccessibilityViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  const violations = results.violations.map(({ id, impact, description, nodes }) => ({
    id,
    impact,
    description,
    targets: nodes.map((node) => node.target),
  }));
  expect(violations).toEqual([]);
}

test('home search filters tools and opens a tool', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Web Utilities' })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Find a tool' }).fill('regex');

  await expect(page.getByRole('link', { name: /Regex Tester/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Password Generator/ })).toBeHidden();

  await page.getByRole('link', { name: /Regex Tester/ }).click();
  await expect(page).toHaveURL(/\/tools\/regex-tester$/);
  await expect(page.getByRole('heading', { name: 'Regex Tester' })).toBeVisible();
});

test('home search result can be opened with the keyboard', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('searchbox', { name: 'Find a tool' }).focus();
  await page.keyboard.type('hash');

  const hashTool = page.getByRole('link', { name: /Hash Generator/ });
  await expect(hashTool).toBeVisible();

  await hashTool.focus();
  await expect(hashTool).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(/\/tools\/hash-generator$/);
  await expect(page.getByRole('heading', { name: 'Hash Generator' })).toBeVisible();
});

test('home search shortcut and tool wayfinding are keyboard accessible', async ({ page }) => {
  await page.goto('/');

  await page.keyboard.press('/');
  const search = page.getByRole('searchbox', { name: 'Find a tool' });
  await expect(search).toBeFocused();
  await page.keyboard.type('json');
  await page.getByRole('link', { name: /JSON Formatter/ }).click();

  const allTools = page.getByRole('link', { name: 'All tools' });
  await expect(allTools).toBeVisible();
  await allTools.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/$/);
});

test('appearance control supports system, light, and dark modes', async ({ page }) => {
  await page.goto('/');

  const appearance = page.getByRole('combobox', { name: 'Appearance' });
  await appearance.selectOption('dark');
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(page.locator('meta[name="theme-color"]').first()).toHaveAttribute('content', '#11100f');

  await appearance.selectOption('light');
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await expect(page.locator('meta[name="theme-color"]').first()).toHaveAttribute('content', '#fafaf9');
});

test('touch layouts preserve comfortable controls and reveal work in short landscapes', async ({ browser, baseURL }) => {
  const context = await browser.newContext({
    baseURL: baseURL ?? 'http://localhost:3100',
    viewport: { width: 768, height: 1024 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 2,
  });
  const touchPage = await context.newPage();

  try {
    await touchPage.goto('/');
    expect(await touchPage.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);

    for (const control of [
      touchPage.getByRole('button', { name: 'All tools' }),
      touchPage.getByRole('combobox', { name: 'Appearance' }),
      touchPage.getByRole('link', { name: 'View wutil on GitHub' }),
    ]) {
      const box = await control.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
      expect(box?.width).toBeGreaterThanOrEqual(44);
    }

    await touchPage.setViewportSize({ width: 844, height: 390 });
    await touchPage.goto('/tools/json-formatter');

    const formatBox = await touchPage.getByRole('button', { name: 'Format', exact: true }).boundingBox();
    const inputBox = await touchPage.getByRole('textbox', { name: 'Input' }).boundingBox();
    const inputFontSize = await touchPage.getByRole('textbox', { name: 'Input' }).evaluate(
      (element) => Number.parseFloat(getComputedStyle(element).fontSize),
    );
    expect(formatBox?.height).toBeGreaterThanOrEqual(44);
    expect(inputFontSize).toBeGreaterThanOrEqual(16);
    expect(inputBox?.y).toBeLessThan(390);

    await touchPage.setViewportSize({ width: 320, height: 568 });
    await touchPage.goto('/tools/json-formatter');
    const copyBox = await touchPage.getByRole('button', { name: 'Copy output' }).boundingBox();
    const clearBox = await touchPage.getByRole('button', { name: 'Clear' }).boundingBox();
    expect(Math.abs((copyBox?.y ?? 0) - (clearBox?.y ?? 0))).toBeLessThan(2);

    const widths = await touchPage.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      page: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
    }));
    expect(widths.page).toBeLessThanOrEqual(widths.viewport + 1);
  } finally {
    await context.close();
  }
});

test('Base64 converter handles Unicode and copy feedback', async ({ page }) => {
  await page.goto('/tools/base64-converter');

  await page.locator('textarea').first().fill('hello 世界 👋');
  await expect(page.locator('textarea').nth(1)).toHaveValue('aGVsbG8g5LiW55WMIPCfkYs=');

  await page.getByRole('button', { name: 'Copy' }).click();
  await expect(page.getByText('Copied')).toBeVisible();
});

test('Regex tester shows match details and copy feedback', async ({ page }) => {
  await page.goto('/tools/regex-tester');

  await page.getByRole('button', { name: 'Email' }).click();

  await expect(page.getByText('2 matches')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copy match 1' })).toContainText('hello@example.com');

  await page.getByRole('button', { name: 'Copy match 1' }).click();
  await expect(page.getByText('Match copied')).toBeVisible();
});

test('Password generator creates constrained passwords and copies them', async ({ page }) => {
  await page.goto('/tools/password-generator');

  await page.getByRole('switch', { name: /Uppercase/ }).click();
  await page.getByRole('switch', { name: /Numbers/ }).click();
  await page.getByRole('button', { name: 'Generate Password' }).click();

  const password = (await page.getByTestId('generated-password').textContent())?.trim() ?? '';
  expect(password).toHaveLength(16);
  expect(password).toMatch(/^[a-z]+$/);

  await page.getByRole('button', { name: 'Copy' }).click();
  await expect(page.getByText('Copied')).toBeVisible();
});

test('Password generator options are operable from the keyboard', async ({ page }) => {
  await page.goto('/tools/password-generator');

  const uppercase = page.getByRole('switch', { name: /Uppercase/ });
  const numbers = page.getByRole('switch', { name: /Numbers/ });
  const generate = page.getByRole('button', { name: 'Generate Password' });

  await uppercase.focus();
  await page.keyboard.press('Space');
  await numbers.focus();
  await page.keyboard.press('Space');
  await generate.focus();
  await page.keyboard.press('Enter');

  const password = (await page.getByTestId('generated-password').textContent())?.trim() ?? '';
  expect(password).toHaveLength(16);
  expect(password).toMatch(/^[a-z]+$/);
});

test('Color converter keeps HEX, RGB, and HSL values in sync', async ({ page }) => {
  await page.goto('/tools/color-converter');

  await page.getByPlaceholder('#000000').fill('#ff00aa');

  await expect(page.locator('input[type="number"]').nth(0)).toHaveValue('255');
  await expect(page.locator('input[type="number"]').nth(1)).toHaveValue('0');
  await expect(page.locator('input[type="number"]').nth(2)).toHaveValue('170');
  await expect(page.getByText('hsl(320, 100%, 50%)')).toBeVisible();

  await page.getByRole('spinbutton', { name: 'RGB R' }).fill('12.5');
  await expect(page.getByRole('spinbutton', { name: 'RGB R' })).toHaveValue('13');
  await expect(page.getByText('#0D00AA')).toBeVisible();
});

test('URL encoder decodes invalid input errors and successful round trips', async ({ page }) => {
  await page.goto('/tools/url-encoder');

  await page.locator('textarea').first().fill('https://example.com/search?q=hello world&lang=en');
  await expect(page.locator('textarea').nth(1)).toHaveValue('https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world%26lang%3Den');

  await page.getByRole('button', { name: 'decode', exact: true }).click();
  await page.locator('textarea').first().fill('%E0%A4%A');
  await expect(page.getByText('Invalid encoded string')).toBeVisible();
});

test('URL decoder mode and copy action are operable from the keyboard', async ({ page }) => {
  await page.goto('/tools/url-encoder');

  const decode = page.getByRole('button', { name: 'decode', exact: true });
  await decode.focus();
  await page.keyboard.press('Enter');

  await page.locator('textarea').first().fill('hello%20world');
  await expect(page.locator('textarea').nth(1)).toHaveValue('hello world');

  const copy = page.getByRole('button', { name: 'Copy' });
  await copy.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Copied')).toBeVisible();
});

test('Text case converter transforms text to snake case', async ({ page }) => {
  await page.goto('/tools/text-case');

  await page.locator('textarea').first().fill('Hello world 42');
  await page.getByRole('button', { name: /snake_case/ }).click();

  await expect(page.locator('textarea').nth(1)).toHaveValue('hello_world_42');
});

test('Timestamp converter parses Unix seconds and reports invalid input', async ({ page }) => {
  await page.goto('/tools/timestamp');

  await page.getByPlaceholder(/1700000000/).fill('1700000000');
  await expect(page.getByRole('button', { name: /Copy ISO 8601 value/ })).toContainText('2023-11-14T22:13:20.000Z');

  await page.getByPlaceholder(/1700000000/).fill('not-a-date');
  await expect(page.getByText(/Cannot parse/)).toBeVisible();
});

test('Word counter updates statistics while typing', async ({ page }) => {
  await page.goto('/tools/word-counter');

  await page.locator('textarea').fill('Hello world.\n\nHello Codex!');

  await expect(page.getByText('Words', { exact: true }).locator('..')).toContainText('4');
  await expect(page.getByText('Characters', { exact: true }).locator('..')).toContainText('26');
  await expect(page.getByText('No spaces', { exact: true }).locator('..')).toContainText('22');
  await expect(page.getByText('Paragraphs', { exact: true }).locator('..')).toContainText('2');
});

test('JSON formatter formats valid JSON and reports invalid JSON', async ({ page }) => {
  await page.goto('/tools/json-formatter');

  await page.locator('textarea').first().fill('{"a":1,"b":true}');
  await page.getByRole('button', { name: 'Format', exact: true }).click();
  await expect(page.locator('textarea').nth(1)).toHaveValue('{\n  "a": 1,\n  "b": true\n}');

  await page.locator('textarea').first().fill('{bad');
  await page.getByRole('button', { name: 'Format', exact: true }).click();
  await expect(page.getByText('Invalid JSON')).toBeVisible();
});

test('JSON examples are runnable and populate formatted output immediately', async ({ page }) => {
  await page.goto('/tools/json-formatter');

  await page.getByRole('button', { name: 'Unicode' }).click();
  await expect(page.locator('textarea').first()).toHaveValue('{"message":"你好，世界 👋","language":"zh-CN"}');
  await expect(page.locator('textarea').nth(1)).toContainText('"message": "你好，世界 👋"');
});

test('tool pages expose related tools and recent history can be cleared', async ({ page }) => {
  await page.goto('/tools/json-formatter');

  await expect(page.getByRole('heading', { name: 'Related tools' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Regex Tester/ })).toBeVisible();

  await page.getByRole('link', { name: 'All tools' }).click();
  await expect(page.getByRole('heading', { name: 'Recently used' })).toBeVisible();
  await expect(page.getByRole('link', { name: /JSON Formatter/ }).first()).toBeVisible();

  await page.getByRole('button', { name: 'Clear history' }).click();
  await expect(page.getByRole('heading', { name: 'Recently used' })).toBeHidden();
});

test('Unit converter handles length and temperature conversions', async ({ page }) => {
  await page.goto('/tools/unit-converter');

  await expect(page.getByRole('button', { name: /Copy converted value 3\.28084/ })).toBeVisible();

  await page.getByRole('button', { name: 'Temperature' }).click();
  await page.locator('input[type="number"]').fill('100');
  await expect(page.getByRole('button', { name: /Copy converted value 212/ })).toBeVisible();
});

test('Unit converter does not overflow horizontally on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tools/unit-converter');

  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.viewport + 1);
});

test('Hash generator computes SHA hashes in the browser', async ({ page }) => {
  await page.goto('/tools/hash-generator');

  await page.locator('textarea').fill('hello');

  await expect(page.getByRole('button', { name: 'Copy SHA-256 hash' })).toContainText(
    '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
  );
});

test('Date calculator computes differences and added days', async ({ page }) => {
  await page.goto('/tools/date-calculator');

  await page.locator('input[type="date"]').nth(0).fill('2024-01-01');
  await page.locator('input[type="date"]').nth(1).fill('2024-01-15');
  await expect(page.getByRole('button', { name: 'Copy days value 14' })).toBeVisible();

  await page.getByRole('button', { name: 'Add / subtract days' }).click();
  await page.locator('input[type="date"]').fill('2024-01-01');
  await page.locator('input[type="number"]').fill('30');
  await expect(page.getByRole('button', { name: 'Copy result date 2024-01-31' })).toBeVisible();
});

test('Image converter uploads and converts an image', async ({ page }) => {
  await page.goto('/tools/image-converter');

  await page.locator('#img-upload').setInputFiles(path.resolve('public/icon.svg'));
  await expect(page.getByText(/icon\.svg/)).toBeVisible();
  await expect(page.getByRole('button', { name: /Reset to original/ })).toBeVisible();

  await page.getByRole('spinbutton', { name: 'Output width' }).fill('-1');
  await expect(page.getByRole('spinbutton', { name: 'Output width' })).toHaveValue('1');
  await expect(page.getByRole('spinbutton', { name: 'Output height' })).toHaveValue('1');

  await page.getByRole('button', { name: 'Convert Image' }).click();
  await expect(page.getByRole('link', { name: 'Download' })).toBeVisible();
});

test.describe('accessibility smoke scans', () => {
  for (const route of ACCESSIBILITY_ROUTES) {
    test(`${route} has no basic WCAG A/AA violations in light mode`, async ({ page }) => {
      await page.goto(route);
      await expectNoAccessibilityViolations(page);
    });

    test(`${route} has no basic WCAG A/AA violations in dark mode`, async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('theme', 'dark');
      });
      await page.goto(route);
      await expect(page.locator('html')).toHaveClass(/dark/);
      await expectNoAccessibilityViolations(page);
    });
  }
});

test('PDF merger uploads PDFs and exposes accessible removal controls', async ({ page }) => {
  await page.goto('/tools/pdf-merge');

  await page.locator('#pdf-upload').setInputFiles([
    path.resolve('tests/e2e/fixtures/minimal-a.pdf'),
    path.resolve('tests/e2e/fixtures/minimal-b.pdf'),
  ]);

  await expect(page.getByText('2 files')).toBeVisible();
  await expect(page.getByText('minimal-a.pdf')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Remove minimal-a.pdf' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear all' }).click();
  await expect(page.getByRole('button', { name: 'Add at least 2 PDFs' })).toBeVisible();

  await page.locator('#pdf-upload').setInputFiles([
    path.resolve('tests/e2e/fixtures/minimal-a.pdf'),
    path.resolve('tests/e2e/fixtures/minimal-b.pdf'),
  ]);
  await expect(page.getByText('2 files')).toBeVisible();

  await page.getByRole('button', { name: 'Merge 2 PDFs' }).click();
  await expect(page.getByRole('link', { name: 'Download' })).toBeVisible();
});
