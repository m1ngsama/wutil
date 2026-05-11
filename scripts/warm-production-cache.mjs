const origin = process.env.PRODUCTION_ORIGIN ?? 'https://wutil.m1ng.space';
const timeoutMs = Number(process.env.PRODUCTION_WARM_TIMEOUT_MS ?? 10_000);
const concurrency = Number(process.env.PRODUCTION_WARM_CONCURRENCY ?? 4);
const verifyPasses = Number(process.env.PRODUCTION_WARM_VERIFY_PASSES ?? 1);

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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(routeUrl(path), {
      headers: {
        accept: 'text/html,application/xhtml+xml',
        'user-agent': 'wutil-production-cache-warmer/1.0',
        ...headers,
      },
      signal: controller.signal,
    });

    await response.arrayBuffer();
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchText(path, headers = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(routeUrl(path), {
      headers: {
        accept: 'application/xml,text/xml,text/plain',
        'user-agent': 'wutil-production-cache-warmer/1.0',
        ...headers,
      },
      signal: controller.signal,
    });

    const text = await response.text();

    if (!response.ok) {
      throw new Error(`${path} expected HTTP 2xx, got ${response.status}`);
    }

    return text;
  } finally {
    clearTimeout(timeout);
  }
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
