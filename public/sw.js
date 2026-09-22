const CACHE_VERSION = '__BUILD_ID__';
const CACHE_PREFIX = 'wutil-';
const SHELL_CACHE = `${CACHE_PREFIX}shell-${CACHE_VERSION}`;
const PAGE_CACHE = `${CACHE_PREFIX}pages-${CACHE_VERSION}`;
const ASSET_CACHE = `${CACHE_PREFIX}assets-${CACHE_VERSION}`;
// Cloudflare Pages 308-redirects /offline.html, and redirected responses cannot answer navigations.
const OFFLINE_PAGE = '/offline';
const CORE_RESOURCES = [
  '/',
  OFFLINE_PAGE,
  '/manifest.json',
  '/icon.svg',
  '/icon-maskable.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
];

function canStore(response) {
  return response && response.ok && (response.type === 'basic' || response.type === 'default');
}

async function fetchAndStore(cache, request) {
  const response = await fetch(request, { cache: 'reload' });
  if (canStore(response)) await cache.put(request, response.clone());
  return response;
}

async function precacheShell() {
  const cache = await caches.open(SHELL_CACHE);
  const results = await Promise.allSettled(
    CORE_RESOURCES.map((resource) => fetchAndStore(cache, resource)),
  );
  const homeResult = results[0];
  if (homeResult.status !== 'fulfilled' || !homeResult.value.ok) return;

  const html = await homeResult.value.clone().text();
  const discovered = new Set();
  for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
    try {
      const url = new URL(match[1], self.location.origin);
      if (url.origin !== self.location.origin) continue;
      if (url.pathname.startsWith('/_next/static/')) discovered.add(url.pathname);
    } catch {
      // Ignore malformed or non-URL attributes.
    }
  }

  await Promise.allSettled(
    [...discovered].map((resource) => fetchAndStore(cache, resource)),
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(precacheShell().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((name) => name.startsWith(CACHE_PREFIX) && ![SHELL_CACHE, PAGE_CACHE, ASSET_CACHE].includes(name))
        .map((name) => caches.delete(name)),
    );
    await self.clients.claim();
  })());
});

async function networkFirst(request, cacheName, fallback) {
  try {
    const response = await fetch(request);
    if (canStore(response)) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    if (fallback) {
      const shell = await caches.open(SHELL_CACHE);
      const fallbackResponse = await shell.match(fallback);
      if (fallbackResponse) return fallbackResponse;
    }
    return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request, { ignoreSearch: true });
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (canStore(response)) {
      const cache = await caches.open(ASSET_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 504 });
  }
}

async function refreshAsset(request) {
  const response = await fetch(request);
  if (canStore(response)) {
    const cache = await caches.open(ASSET_CACHE);
    await cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname === '/sw.js' || url.pathname.startsWith('/cdn-cgi/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, PAGE_CACHE, OFFLINE_PAGE));
    return;
  }

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (url.pathname.endsWith('.txt')) {
    event.respondWith(networkFirst(request, PAGE_CACHE));
    return;
  }

  if (['font', 'image', 'script', 'style'].includes(request.destination)) {
    event.respondWith((async () => {
      const cached = await caches.match(request, { ignoreSearch: true });
      const refresh = refreshAsset(request).catch(() => null);
      if (cached) {
        event.waitUntil(refresh);
        return cached;
      }
      return (await refresh) || new Response('', { status: 504 });
    })());
  }
});
