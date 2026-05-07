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
npm run verify:prod
npm run interactions:prod
npm run perf:prod
```

`verify:prod`, `interactions:prod`, and `perf:prod` target `https://wutil.m1ng.space` by default. They can be pointed at another deployment with `PRODUCTION_ORIGIN`.

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
9. `npm run verify:prod`
10. `npm run interactions:prod`
11. `npm run perf:prod`

`.github/workflows/production-monitor.yml` also runs the production verification, browser interaction sweep, and performance budget every six hours, plus on manual dispatch.

Required GitHub Actions secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Cloudflare Pages reads `public/_headers` after static export. It sets security headers for all routes and immutable browser caching for fingerprinted `/_next/static/*` assets.

See [docs/project-review.md](docs/project-review.md) for the current production review, remaining risks, and roadmap.
