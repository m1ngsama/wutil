import { launchProductionBrowser } from './lib/production-browser.mjs';

const origin = process.env.PRODUCTION_ORIGIN ?? 'https://wutil.m1ng.space';
const timeoutMs = Number(process.env.PRODUCTION_VERIFY_TIMEOUT_MS ?? 10_000);

function routeUrl(path) {
  return new URL(path, origin).toString();
}

async function navigate(page, path) {
  const response = await page.goto(routeUrl(path), {
    waitUntil: 'domcontentloaded',
    timeout: timeoutMs,
  });

  if (!response) {
    throw new Error(`${path} did not return a navigation response`);
  }

  return response;
}

async function expectOk(page, path) {
  const response = await navigate(page, path);
  if (!response.ok()) {
    throw new Error(`${path} expected HTTP 2xx, got ${response.status()}`);
  }
  return response;
}

async function expectContains(page, path, expectedText) {
  const response = await expectOk(page, path);
  const text = await response.text();
  if (!text.includes(expectedText)) {
    throw new Error(`${path} did not include ${JSON.stringify(expectedText)}`);
  }
}

const browser = await launchProductionBrowser();

try {
  const page = await browser.newPage({ serviceWorkers: 'block' });
  const checks = [
    () => expectOk(page, '/'),
    () => expectContains(page, '/robots.txt', `Sitemap: ${routeUrl('/sitemap.xml')}`),
    () => expectContains(page, '/sitemap.xml', `<loc>${routeUrl('/privacy')}</loc>`),
    () => expectContains(page, '/sitemap.xml', `<loc>${routeUrl('/changelog')}</loc>`),
    () => expectOk(page, '/privacy'),
    () => expectOk(page, '/changelog'),
    () => expectOk(page, '/og-image.svg'),
  ];

  const failures = [];

  for (const check of checks) {
    try {
      await check();
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(failure);
    }
    process.exitCode = 1;
  } else {
    console.log(`Production verification passed for ${origin}`);
  }
} finally {
  await browser.close();
}
