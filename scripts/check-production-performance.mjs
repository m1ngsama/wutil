import { performance } from 'node:perf_hooks';
import { chromium } from '@playwright/test';

const origin = process.env.PRODUCTION_ORIGIN ?? 'https://wutil.m1ng.space';
const timeoutMs = Number(process.env.PRODUCTION_PERF_TIMEOUT_MS ?? 10_000);
const browserSettleMs = Number(process.env.PRODUCTION_PERF_SETTLE_MS ?? 750);

const defaultRouteBudget = {
  maxHtmlBytes: 120_000,
  maxTtfbMs: 3_000,
  maxTotalMs: 6_000,
  maxFcpMs: 4_500,
  maxLcpMs: 5_500,
  maxCls: 0.02,
  maxTotalTransferBytes: 900_000,
  maxScriptTransferBytes: 650_000,
};

const toolPaths = [
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
  '/tools/date-calculator',
  '/tools/image-converter',
  '/tools/pdf-merge',
];

const routes = [
  {
    path: '/',
    ...defaultRouteBudget,
    maxHtmlBytes: 150_000,
    maxFcpMs: 4_000,
    maxLcpMs: 5_000,
  },
  { path: '/privacy', ...defaultRouteBudget },
  { path: '/changelog', ...defaultRouteBudget },
  ...toolPaths.map((path) => ({ path, ...defaultRouteBudget })),
];

function formatMs(value) {
  return `${Math.round(value)}ms`;
}

function routeUrl(path) {
  return new URL(path, origin).toString();
}

async function measureHttpRoute(route) {
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

function formatBytes(value) {
  if (value >= 1024 * 1024) return `${(value / 1024 / 1024).toFixed(2)}MiB`;
  if (value >= 1024) return `${Math.round(value / 1024)}KiB`;
  return `${value}B`;
}

async function withVitalsObserver(context) {
  await context.addInitScript(() => {
    window.__wutilVitals = { lcpMs: 0, cls: 0 };

    if (!('PerformanceObserver' in window)) return;

    try {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          window.__wutilVitals.lcpMs = entry.startTime;
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {
      // Older browsers may not support this observer type.
    }

    try {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) window.__wutilVitals.cls += entry.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch {
      // Older browsers may not support this observer type.
    }
  });
}

async function measureBrowserRoute(browser, route) {
  const context = await browser.newContext({
    serviceWorkers: 'block',
    viewport: { width: 1280, height: 900 },
  });
  await withVitalsObserver(context);

  try {
    const page = await context.newPage();
    await page.goto(routeUrl(route.path), { waitUntil: 'load', timeout: timeoutMs });
    await page.evaluate(() => document.fonts?.ready.then(() => undefined)).catch(() => undefined);
    await page.waitForTimeout(browserSettleMs);

    return await page.evaluate(() => {
      const navigationEntry = performance.getEntriesByType('navigation')[0];
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find((entry) => entry.name === 'first-contentful-paint')?.startTime ?? 0;
      const vitals = window.__wutilVitals ?? { lcpMs: 0, cls: 0 };
      const resourceEntries = [
        ...performance.getEntriesByType('navigation'),
        ...performance.getEntriesByType('resource'),
      ];
      const summary = {
        fcpMs: fcp,
        lcpMs: vitals.lcpMs,
        cls: vitals.cls,
        totalTransferBytes: 0,
        scriptTransferBytes: 0,
        styleTransferBytes: 0,
        imageTransferBytes: 0,
        resourceCount: resourceEntries.length,
        domContentLoadedMs: navigationEntry?.domContentLoadedEventEnd ?? 0,
        loadEventMs: navigationEntry?.loadEventEnd ?? 0,
      };

      for (const entry of resourceEntries) {
        const timing = entry;
        const bytes = Math.max(timing.transferSize ?? 0, timing.encodedBodySize ?? 0);
        if (bytes <= 0) continue;

        summary.totalTransferBytes += bytes;
        if (timing.initiatorType === 'script' || timing.name.includes('/_next/static/chunks/')) {
          summary.scriptTransferBytes += bytes;
        } else if (timing.initiatorType === 'link' || timing.name.includes('/_next/static/css/')) {
          summary.styleTransferBytes += bytes;
        } else if (timing.initiatorType === 'img' || /\.(avif|gif|jpe?g|png|svg|webp)(\?|$)/i.test(timing.name)) {
          summary.imageTransferBytes += bytes;
        }
      }

      return summary;
    });
  } finally {
    await context.close();
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

function validateBrowserMeasurement(route, measurement) {
  const errors = [];

  if (measurement.fcpMs <= 0) {
    errors.push('missing First Contentful Paint measurement');
  } else if (measurement.fcpMs > route.maxFcpMs) {
    errors.push(`FCP ${formatMs(measurement.fcpMs)} exceeds ${formatMs(route.maxFcpMs)}`);
  }

  if (measurement.lcpMs <= 0) {
    errors.push('missing Largest Contentful Paint measurement');
  } else if (measurement.lcpMs > route.maxLcpMs) {
    errors.push(`LCP ${formatMs(measurement.lcpMs)} exceeds ${formatMs(route.maxLcpMs)}`);
  }

  if (measurement.cls > route.maxCls) {
    errors.push(`CLS ${measurement.cls.toFixed(3)} exceeds ${route.maxCls}`);
  }

  if (measurement.totalTransferBytes > route.maxTotalTransferBytes) {
    errors.push(
      `total transfer ${formatBytes(measurement.totalTransferBytes)} exceeds ${formatBytes(route.maxTotalTransferBytes)}`,
    );
  }

  if (measurement.scriptTransferBytes > route.maxScriptTransferBytes) {
    errors.push(
      `script transfer ${formatBytes(measurement.scriptTransferBytes)} exceeds ${formatBytes(route.maxScriptTransferBytes)}`,
    );
  }

  return errors;
}

const httpResults = [];
const browserResults = [];
const failures = [];

for (const route of routes) {
  try {
    const measurement = await measureHttpRoute(route);
    const errors = validateMeasurement(measurement);
    httpResults.push(measurement);
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
  httpResults.map((result) => ({
    path: result.route.path,
    status: result.status,
    htmlBytes: result.bytes,
    ttfb: formatMs(result.ttfbMs),
    total: formatMs(result.totalMs),
  })),
);

let browser;

try {
  browser = await chromium.launch({ headless: true });
  for (const route of routes) {
    try {
      const measurement = await measureBrowserRoute(browser, route);
      const errors = validateBrowserMeasurement(route, measurement);
      browserResults.push({ route, ...measurement });
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
} finally {
  await browser?.close();
}

console.table(
  browserResults.map((result) => ({
    path: result.route.path,
    fcp: formatMs(result.fcpMs),
    lcp: formatMs(result.lcpMs),
    cls: result.cls.toFixed(3),
    totalTransfer: formatBytes(result.totalTransferBytes),
    scriptTransfer: formatBytes(result.scriptTransferBytes),
    resources: result.resourceCount,
  })),
);

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`${failure.path}: ${failure.errors.join('; ')}`);
  }
  process.exit(1);
}
