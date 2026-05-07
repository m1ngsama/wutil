const origin = process.env.PRODUCTION_ORIGIN ?? 'https://wutil.m1ng.space';
const timeoutMs = Number(process.env.PRODUCTION_VERIFY_TIMEOUT_MS ?? 10_000);

function routeUrl(path) {
  return new URL(path, origin).toString();
}

async function fetchWithTimeout(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(routeUrl(path), {
      ...options,
      headers: {
        'user-agent': 'wutil-production-verification/1.0',
        ...options.headers,
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function expectOk(path, options = {}) {
  const response = await fetchWithTimeout(path, options);
  if (!response.ok) {
    throw new Error(`${path} expected HTTP 2xx, got ${response.status}`);
  }
  return response;
}

async function expectContains(path, expectedText) {
  const response = await expectOk(path);
  const text = await response.text();
  if (!text.includes(expectedText)) {
    throw new Error(`${path} did not include ${JSON.stringify(expectedText)}`);
  }
}

const checks = [
  () => expectOk('/', { method: 'HEAD' }),
  () => expectContains('/robots.txt', `Sitemap: ${routeUrl('/sitemap.xml')}`),
  () => expectContains('/sitemap.xml', `<loc>${routeUrl('/privacy')}</loc>`),
  () => expectContains('/sitemap.xml', `<loc>${routeUrl('/changelog')}</loc>`),
  () => expectOk('/privacy', { method: 'HEAD' }),
  () => expectOk('/changelog', { method: 'HEAD' }),
  () => expectOk('/og-image.svg', { method: 'HEAD' }),
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
  process.exit(1);
}

console.log(`Production verification passed for ${origin}`);
