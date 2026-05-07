import { performance } from 'node:perf_hooks';

const origin = process.env.PRODUCTION_ORIGIN ?? 'https://wutil.m1ng.space';
const timeoutMs = Number(process.env.PRODUCTION_PERF_TIMEOUT_MS ?? 10_000);

const routes = [
  { path: '/', maxHtmlBytes: 150_000, maxTtfbMs: 3_000, maxTotalMs: 6_000 },
  { path: '/tools/image-converter', maxHtmlBytes: 120_000, maxTtfbMs: 3_000, maxTotalMs: 6_000 },
  { path: '/tools/pdf-merge', maxHtmlBytes: 120_000, maxTtfbMs: 3_000, maxTotalMs: 6_000 },
];

function formatMs(value) {
  return `${Math.round(value)}ms`;
}

function routeUrl(path) {
  return new URL(path, origin).toString();
}

async function measureRoute(route) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = performance.now();
  let firstByteAt;
  let bytes = 0;

  try {
    const response = await fetch(routeUrl(route.path), {
      headers: {
        accept: 'text/html,application/xhtml+xml',
        'user-agent': 'wutil-production-performance-check/1.0',
      },
      signal: controller.signal,
    });

    firstByteAt = performance.now();

    if (response.body) {
      const reader = response.body.getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
      }
    } else {
      bytes = Buffer.byteLength(await response.text());
    }

    const totalMs = performance.now() - startedAt;
    return {
      route,
      status: response.status,
      contentType: response.headers.get('content-type') ?? '',
      bytes,
      ttfbMs: firstByteAt - startedAt,
      totalMs,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function validateMeasurement(measurement) {
  const { route } = measurement;
  const errors = [];

  if (measurement.status !== 200) {
    errors.push(`expected HTTP 200, got ${measurement.status}`);
  }

  if (!measurement.contentType.includes('text/html')) {
    errors.push(`expected text/html, got ${measurement.contentType || 'missing content-type'}`);
  }

  if (measurement.bytes > route.maxHtmlBytes) {
    errors.push(`HTML size ${measurement.bytes}B exceeds ${route.maxHtmlBytes}B`);
  }

  if (measurement.ttfbMs > route.maxTtfbMs) {
    errors.push(`TTFB ${formatMs(measurement.ttfbMs)} exceeds ${formatMs(route.maxTtfbMs)}`);
  }

  if (measurement.totalMs > route.maxTotalMs) {
    errors.push(`total ${formatMs(measurement.totalMs)} exceeds ${formatMs(route.maxTotalMs)}`);
  }

  return errors;
}

const results = [];
const failures = [];

for (const route of routes) {
  try {
    const measurement = await measureRoute(route);
    const errors = validateMeasurement(measurement);
    results.push(measurement);
    if (errors.length > 0) {
      failures.push({ path: route.path, errors });
    }
  } catch (error) {
    failures.push({
      path: route.path,
      errors: [error instanceof Error ? error.message : String(error)],
    });
  }
}

console.table(
  results.map((result) => ({
    path: result.route.path,
    status: result.status,
    htmlBytes: result.bytes,
    ttfb: formatMs(result.ttfbMs),
    total: formatMs(result.totalMs),
  })),
);

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`${failure.path}: ${failure.errors.join('; ')}`);
  }
  process.exit(1);
}

