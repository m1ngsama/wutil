import { expect, test } from '@playwright/test';
import path from 'node:path';

test('home search filters tools and opens a tool', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Web Utilities' })).toBeVisible();
  await page.getByPlaceholder(/Search tools/).fill('regex');

  await expect(page.getByRole('link', { name: /Regex Tester/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Password Generator/ })).toBeHidden();

  await page.getByRole('link', { name: /Regex Tester/ }).click();
  await expect(page).toHaveURL(/\/tools\/regex-tester$/);
  await expect(page.getByRole('heading', { name: 'Regex Tester' })).toBeVisible();
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

test('Image converter uploads and converts an image', async ({ page }) => {
  await page.goto('/tools/image-converter');

  await page.locator('#img-upload').setInputFiles(path.resolve('public/icon.svg'));
  await expect(page.getByText(/icon\.svg/)).toBeVisible();

  await page.getByRole('button', { name: 'Convert Image' }).click();
  await expect(page.getByRole('link', { name: 'Download' })).toBeVisible();
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
  await page.getByRole('button', { name: 'Merge 2 PDFs' }).click();
  await expect(page.getByRole('link', { name: 'Download' })).toBeVisible();
});
