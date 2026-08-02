# wutil

A collection of lightweight, privacy-focused web tools that run in the browser.

Production: <https://wutil.m1ng.space>

## Tools

- Password Generator
- Color Converter
- URL Encoder / Decoder
- Text Case Converter
- Regex Tester
- Timestamp Converter
- Word Counter
- JSON Formatter
- Base64 Converter
- Unit Converter
- Hash Generator
- Date Calculator
- Image Converter
- PDF Merger

## Privacy

wutil is designed for client-side processing. Tool inputs are processed in the browser and are not uploaded to a wutil server. The app does not require accounts, and tool content is not intentionally stored by wutil.

The deployed site may be served by Cloudflare Pages, so standard hosting logs may exist at the platform level.

## Changelog

Recent production updates are tracked at <https://wutil.m1ng.space/changelog>.

## Growth And Analytics

SEO, analytics setup, paid campaign tracking, and advertising notes are documented in [docs/growth-and-analytics.md](docs/growth-and-analytics.md).

## Design Context

Product and visual design guidance live in [PRODUCT.md](PRODUCT.md) and [DESIGN.md](DESIGN.md). The project includes the Impeccable Codex skill under `.agents/skills/impeccable` for frontend design critique, polish, and iteration.

## Development

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run check
npm run test:e2e
npm run build
npm run audit:prod
npm run analytics:cf
npm run verify:prod
npm run seo:prod
npm run interactions:prod
npm run perf:prod
```

`verify:prod`, `seo:prod`, `interactions:prod`, and `perf:prod` target `https://wutil.m1ng.space` by default. They can be pointed at another deployment with `PRODUCTION_ORIGIN`; set `PRODUCTION_CANONICAL_ORIGIN` separately when checking a Pages deployment URL whose metadata should still reference the public production hostname.

## Deployment

The app uses Next.js static export and deploys the generated `out` directory to Cloudflare Pages.

Production deploys run through GitHub Actions on pushes to `main`:

1. `npm ci`
2. `npm run audit:prod`
3. `npm run lint`
4. `npm run typecheck`
5. `npm run test`
6. `npm run test:e2e`
7. `npm run build`
8. `wrangler pages deploy out --project-name=wutil --branch=main`
9. `npm run purge:cf`
10. Warm every sitemap route on the exact Pages deployment URL returned by Wrangler.
11. Run response and canonical-host verification against that deployed artifact.
12. Check SEO metadata for every sitemap route on that deployed artifact.
13. Run the production interaction sweep on that deployed artifact.
14. Check its synthetic performance budgets.

`.github/workflows/production-monitor.yml` can also run production verification, SEO metadata checks, browser interaction sweeps, and performance budgets on manual dispatch. It checks the stable `wutil.pages.dev` production artifact while requiring canonical metadata to point to `wutil.m1ng.space`.

`.github/workflows/analytics-report.yml` runs a daily Cloudflare Web Analytics report and writes visits, page views, top pages, referrers, device/browser mix, country mix, and real-user Web Vitals to the GitHub Actions step summary.

Required GitHub Actions secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- Optional: `CLOUDFLARE_CACHE_PURGE_API_TOKEN` with Cloudflare `Cache Purge` permission. If omitted, deploys reuse `CLOUDFLARE_API_TOKEN` for cache purge.
- Optional: `CLOUDFLARE_ANALYTICS_API_TOKEN` with Cloudflare Analytics Read permission. If omitted, analytics reports reuse `CLOUDFLARE_API_TOKEN`.

Cloudflare Pages reads `public/_headers` after static export. It sets security headers for all routes, immutable browser caching for fingerprinted `/_next/static/*` assets, and short browser / longer edge caching for static HTML. Production deploys purge the `wutil.m1ng.space` cache, then exercise every sitemap route on Wrangler's immutable deployment URL. This avoids custom-host traffic protection blocking GitHub Runner checks while still validating that robots, sitemap, canonical, and social metadata point to the public production hostname. Running `npm run warm:prod` locally still targets and warms `wutil.m1ng.space` by default.

See [docs/project-review.md](docs/project-review.md) for the current production review, remaining risks, and roadmap.
