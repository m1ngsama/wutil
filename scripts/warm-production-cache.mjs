const origin = process.env.PRODUCTION_ORIGIN ?? 'https://wutil.m1ng.space';
const timeoutMs = Number(process.env.PRODUCTION_WARM_TIMEOUT_MS ?? 10_000);
const concurrency = Number(process.env.PRODUCTION_WARM_CONCURRENCY ?? 4);
const verifyPasses = Number(process.env.PRODUCTION_WARM_VERIFY_PASSES ?? 1);
const retryAttempts = Number(process.env.PRODUCTION_WARM_RETRY_ATTEMPTS ?? 4);
const retryDelayMs = Number(process.env.PRODUCTION_WARM_RETRY_DELAY_MS ?? 1_000);

function routeUrl(path) {
  return new URL(path, origin).toString();
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function shouldRetry(status) {
  return status === 403 || status === 408 || status === 425 || status === 429 || status >= 500;
}

function retryDelay(attempt) {
  return retryDelayMs * 2 ** (attempt - 1);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestOnce(path, headers) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(routeUrl(path), {
      headers,
      signal: controller.signal,
    });
    const text = await response.text();
    return { response, text };
  } finally {
    clearTimeout(timeout);
  }
}

async function requestWithRetry(path, headers) {
  for (let attempt = 1; attempt <= retryAttempts; attempt += 1) {
    try {
      const result = await requestOnce(path, headers);
      if (
        result.response.ok ||
        !shouldRetry(result.response.status) ||
        attempt === retryAttempts
      ) {
        return result;
      }

      const ray = result.response.headers.get('cf-ray');
      const delay = retryDelay(attempt);
      console.warn(
        `${path} returned ${result.response.status}${ray ? ` (cf-ray ${ray})` : ''}; retrying in ${delay}ms`,
      );
      await sleep(delay);
    } catch (error) {
      if (attempt === retryAttempts) throw error;

      const delay = retryDelay(attempt);
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`${path} request failed (${message}); retrying in ${delay}ms`);
      await sleep(delay);
    }
  }

  throw new Error(`${path} exhausted ${retryAttempts} warm-up attempts`);
}

function parseSitemapRoutes(sitemapXml) {
  const originUrl = new URL(origin);
  const routes = [];

  for (const match of sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const parsed = new URL(decodeHtml(match[1]));
    if (parsed.origin !== originUrl.origin) continue;
    routes.push(parsed.pathname === '/' ? '/' : parsed.pathname.replace(/\/$/, ''));
  }

  return [...new Set(routes)].sort((a, b) => a.localeCompare(b));
}

async function fetchWithTimeout(path, headers = {}) {
  const { response } = await requestWithRetry(path, {
    accept: 'text/html,application/xhtml+xml',
    'user-agent': 'wutil-production-cache-warmer/1.0',
    ...headers,
  });
  return response;
}

async function fetchText(path, headers = {}) {
  const { response, text } = await requestWithRetry(path, {
    accept: 'application/xml,text/xml,text/plain',
    'user-agent': 'wutil-production-cache-warmer/1.0',
    ...headers,
  });

  if (!response.ok) {
    const ray = response.headers.get('cf-ray');
    throw new Error(
      `${path} expected HTTP 2xx, got ${response.status}${ray ? ` (cf-ray ${ray})` : ''}`,
    );
  }

  return text;
}

async function mapWithConcurrency(items, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    for (;;) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= items.length) return;
      results[index] = await mapper(items[index], index);
    }
  }

  const workerCount = Math.max(1, Math.min(concurrency, items.length));
  await Promise.all(Array.from({ length: workerCount }, worker));
  return results;
}

async function warmRoute(path, pass) {
  const response = await fetchWithTimeout(path);
  const contentType = response.headers.get('content-type') ?? '';

  return {
    pass,
    path,
    status: response.status,
    contentType,
    cacheStatus: response.headers.get('cf-cache-status') ?? 'missing',
    age: response.headers.get('age') ?? '',
  };
}

const sitemapXml = await fetchText('/sitemap.xml');
const routes = parseSitemapRoutes(sitemapXml);

if (routes.length === 0) {
  throw new Error('sitemap.xml did not contain any same-origin routes to warm');
}

const allResults = [];

for (let pass = 1; pass <= verifyPasses + 1; pass += 1) {
  const results = await mapWithConcurrency(routes, (path) => warmRoute(path, pass));
  allResults.push(...results);
}

const failures = [];
for (const result of allResults) {
  if (result.status < 200 || result.status >= 300) {
    failures.push(`${result.path} pass ${result.pass} expected HTTP 2xx, got ${result.status}`);
    continue;
  }

  if (!result.contentType.includes('text/html')) {
    failures.push(
      `${result.path} pass ${result.pass} expected text/html, got ${result.contentType || 'missing content-type'}`,
    );
  }
}

console.table(
  allResults.map((result) => ({
    pass: result.pass,
    path: result.path,
    status: result.status,
    cache: result.cacheStatus,
    age: result.age,
  })),
);

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(failure);
  }
  process.exit(1);
}

console.log(`Warmed ${routes.length} production HTML routes on ${origin}`);
