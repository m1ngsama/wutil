import { launchProductionBrowser } from './lib/production-browser.mjs';

const origin = process.env.PRODUCTION_ORIGIN ?? 'https://wutil.m1ng.space';
const timeoutMs = Number(process.env.PRODUCTION_PERF_TIMEOUT_MS ?? 15_000);
const browserSettleMs = Number(process.env.PRODUCTION_PERF_SETTLE_MS ?? 750);
const attempts = Number(process.env.PRODUCTION_PERF_ATTEMPTS ?? 2);
const retryDelayMs = Number(process.env.PRODUCTION_PERF_RETRY_DELAY_MS ?? 1_000);

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
  '/tools/uuid-generator',
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
    const response = await page.goto(routeUrl(route.path), {
      waitUntil: 'domcontentloaded',
      timeout: timeoutMs,
    });
    if (!response) {
      throw new Error(`${route.path} did not return a navigation response`);
    }

    const responseBodyBytes = (await response.body()).byteLength;
    await page.waitForLoadState('load', { timeout: 5_000 }).catch(() => undefined);
    await page.evaluate(() => document.fonts?.ready.then(() => undefined)).catch(() => undefined);
    await page.waitForTimeout(browserSettleMs);

    const metrics = await page.evaluate(() => {
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
        totalMs: navigationEntry?.responseEnd ?? 0,
        ttfbMs: navigationEntry?.responseStart ?? 0,
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

    return {
      route,
      status: response.status(),
      contentType: response.headers()['content-type'] ?? '',
      bytes: responseBodyBytes,
      ...metrics,
    };
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
  } else if (measurement.ttfbMs <= 0) {
    errors.push('missing TTFB measurement');
  }

  if (measurement.totalMs > route.maxTotalMs) {
    errors.push(`total ${formatMs(measurement.totalMs)} exceeds ${formatMs(route.maxTotalMs)}`);
  } else if (measurement.totalMs <= 0) {
    errors.push('missing total response measurement');
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

const browserResults = [];
const failures = [];

let browser;

try {
  browser = await launchProductionBrowser();
  for (const route of routes) {
    let finalMeasurement;
    let finalErrors = [];

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        finalMeasurement = await measureBrowserRoute(browser, route);
        finalErrors = [
          ...validateMeasurement(finalMeasurement),
          ...validateBrowserMeasurement(route, finalMeasurement),
        ];
      } catch (error) {
        finalErrors = [error instanceof Error ? error.message : String(error)];
      }

      if (finalErrors.length === 0) break;
      if (attempt < attempts) {
        console.warn(
          `${route.path} performance sample failed attempt ${attempt}/${attempts}; retrying in ${retryDelayMs}ms`,
        );
        await sleep(retryDelayMs);
      }
    }

    if (finalMeasurement) browserResults.push(finalMeasurement);
    if (finalErrors.length > 0) {
      failures.push({ path: route.path, errors: finalErrors });
    }
  }
} finally {
  await browser?.close();
}

console.table(
  browserResults.map((result) => ({
    path: result.route.path,
    status: result.status,
    htmlBytes: result.bytes,
    ttfb: formatMs(result.ttfbMs),
    total: formatMs(result.totalMs),
  })),
);

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
  process.exitCode = 1;
}
