import { launchProductionBrowser } from './lib/production-browser.mjs';

const origin = process.env.PRODUCTION_ORIGIN ?? 'https://wutil.m1ng.space';
const timeoutMs = Number(process.env.PRODUCTION_SEO_TIMEOUT_MS ?? 10_000);

function routeUrl(path) {
  return new URL(path, origin).toString();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

function normalizeComparableUrl(value) {
  const parsed = new URL(decodeHtml(value), origin);
  const pathname = parsed.pathname === '/' ? '/' : parsed.pathname.replace(/\/$/, '');
  return `${parsed.origin}${pathname}${parsed.search}${parsed.hash}`;
}

function expectedUrlForPath(path) {
  return normalizeComparableUrl(routeUrl(path));
}

async function fetchText(page, pathOrUrl, accept = 'text/html,application/xhtml+xml') {
  await page.setExtraHTTPHeaders({ accept });
  const response = await page.goto(new URL(pathOrUrl, origin).toString(), {
    waitUntil: 'domcontentloaded',
    timeout: timeoutMs,
  });

  if (!response) {
    throw new Error(`${pathOrUrl} did not return a navigation response`);
  }

  const text = await response.text();
  if (!response.ok()) {
    throw new Error(`${pathOrUrl} expected HTTP 2xx, got ${response.status()}`);
  }

  return {
    contentType: response.headers()['content-type'] ?? '',
    text,
  };
}

function parseAttributes(tag) {
  const attributes = {};
  const pattern = /([A-Za-z_:][-A-Za-z0-9_:.]*)\s*=\s*("[^"]*"|'[^']*')/g;
  for (const match of tag.matchAll(pattern)) {
    attributes[match[1].toLowerCase()] = decodeHtml(match[2].slice(1, -1));
  }
  return attributes;
}

function tags(html, tagName) {
  return [...html.matchAll(new RegExp(`<${escapeRegExp(tagName)}\\b[^>]*>`, 'gi'))].map((match) =>
    parseAttributes(match[0]),
  );
}

function titleText(html) {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? decodeHtml(match[1]).trim() : '';
}

function metaContent(metaTags, kind, value) {
  const tag = metaTags.find((attributes) => attributes[kind] === value);
  return tag?.content?.trim() ?? '';
}

function canonicalHref(linkTags) {
  const canonicalTags = linkTags.filter((attributes) =>
    attributes.rel?.split(/\s+/).some((rel) => rel.toLowerCase() === 'canonical'),
  );

  if (canonicalTags.length !== 1) {
    throw new Error(`expected exactly one canonical link, found ${canonicalTags.length}`);
  }

  return canonicalTags[0].href?.trim() ?? '';
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

function validateRoute(path, html) {
  const errors = [];
  const expectedUrl = expectedUrlForPath(path);
  const metaTags = tags(html, 'meta');
  const linkTags = tags(html, 'link');
  const title = titleText(html);

  try {
    const canonical = canonicalHref(linkTags);
    if (normalizeComparableUrl(canonical) !== expectedUrl) {
      errors.push(`canonical ${canonical} did not match ${expectedUrl}`);
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }

  const requiredMeta = [
    ['property', 'og:title'],
    ['property', 'og:description'],
    ['property', 'og:url'],
    ['property', 'og:image'],
    ['property', 'og:type'],
    ['name', 'twitter:card'],
    ['name', 'twitter:title'],
    ['name', 'twitter:description'],
    ['name', 'twitter:image'],
  ];

  for (const [kind, value] of requiredMeta) {
    if (!metaContent(metaTags, kind, value)) {
      errors.push(`missing ${kind}="${value}"`);
    }
  }

  const ogUrl = metaContent(metaTags, 'property', 'og:url');
  if (ogUrl && normalizeComparableUrl(ogUrl) !== expectedUrl) {
    errors.push(`og:url ${ogUrl} did not match ${expectedUrl}`);
  }

  const ogImage = metaContent(metaTags, 'property', 'og:image');
  const twitterImage = metaContent(metaTags, 'name', 'twitter:image');
  const expectedImage = expectedUrlForPath('/og-image.svg');
  if (ogImage && normalizeComparableUrl(ogImage) !== expectedImage) {
    errors.push(`og:image ${ogImage} did not match ${expectedImage}`);
  }
  if (twitterImage && normalizeComparableUrl(twitterImage) !== expectedImage) {
    errors.push(`twitter:image ${twitterImage} did not match ${expectedImage}`);
  }

  if (metaContent(metaTags, 'name', 'twitter:card') !== 'summary_large_image') {
    errors.push('twitter:card must be summary_large_image');
  }

  if (!title.includes('wutil')) {
    errors.push(`title ${JSON.stringify(title)} did not include wutil`);
  }

  return errors;
}

const browser = await launchProductionBrowser();

try {
  const page = await browser.newPage({ serviceWorkers: 'block' });
  const failures = [];
  const { text: sitemapXml } = await fetchText(
    page,
    '/sitemap.xml',
    'application/xml,text/xml',
  );
  const routes = parseSitemapRoutes(sitemapXml);

  if (routes.length === 0) {
    failures.push('sitemap.xml did not contain any same-origin routes');
  }

  for (const path of routes) {
    try {
      const { contentType, text } = await fetchText(page, path);
      if (!contentType.includes('text/html')) {
        failures.push(`${path} expected text/html, got ${contentType || 'missing content-type'}`);
        continue;
      }

      const routeErrors = validateRoute(path, text);
      for (const error of routeErrors) {
        failures.push(`${path}: ${error}`);
      }
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
    console.log(`Production SEO metadata check passed for ${routes.length} routes on ${origin}`);
  }
} finally {
  await browser.close();
}
