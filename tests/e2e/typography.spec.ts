import { expect, test } from '@playwright/test';

for (const width of [320, 1280]) {
  test(`Home and JSON remain usable with enlarged text at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.addStyleTag({ content: 'html { font-size: 200%; }' });
    const search = page.getByRole('searchbox', { name: 'Find a tool' });
    await search.fill('format json');
    const tool = page.getByRole('link', { name: /JSON Formatter/ });
    await expect(tool).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await tool.click();
    await page.addStyleTag({ content: 'html { font-size: 200%; }' });
    const input = page.getByRole('textbox', { name: 'Input', exact: true });
    await input.fill('{"title":"中文与 English 👋","value":9007199254740993}');
    await input.press('Control+Enter');
    await expect(page.getByRole('textbox', { name: 'Output', exact: true })).toHaveValue(/9007199254740993/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('button', { name: 'Clear', exact: true }).click();
    await expect(input).toBeFocused();
  });
}

test('Shared examples remain usable with enlarged text on narrow screens', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  for (const [route, example] of [
    ['base64-converter', 'Unicode + emoji'],
    ['url-encoder', 'Search URL'],
    ['regex-tester', 'Email'],
  ]) {
    await page.goto(`/tools/${route}`);
    await page.addStyleTag({ content: 'html { font-size: 200%; }' });
    const examples = page.getByRole('group', { name: 'Try an example', exact: true });
    await expect(examples).toBeVisible();
    await examples.getByRole('button', { name: example, exact: true }).click();
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const back = await page.getByRole('link', { name: 'All tools', exact: true }).boundingBox();
    const local = await page.locator('[title="Runs locally in your browser"]').boundingBox();
    expect(back!.x + back!.width <= local!.x || back!.y + back!.height <= local!.y).toBe(true);
    if (route !== 'regex-tester') {
      const encode = await page.getByRole('button', { name: /^encode$/i }).boundingBox();
      const decode = await page.getByRole('button', { name: /^decode$/i }).boundingBox();
      if (Math.abs(encode!.y - decode!.y) > 1) {
        expect(Math.abs(encode!.width - decode!.width)).toBeLessThan(1);
      }
    }
  }
});

test('JSON preserves mixed-script content and combining characters', async ({ page }) => {
  await page.goto('/tools/json-formatter');
  const source = '{"简体":"标点，。！？","繁體":"閱讀體驗","latin":"Il1 O0 é","arabic":"مرحبا","emoji":"👩🏽‍💻"}';
  await page.getByRole('textbox', { name: 'Input', exact: true }).fill(source);
  await page.getByRole('button', { name: 'Format', exact: true }).click();
  await page.getByRole('button', { name: 'Minify', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Output', exact: true })).toHaveValue(source);
});
