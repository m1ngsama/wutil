# wutil

Lightweight, privacy-focused web tools that run entirely in the browser.

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
- UUID Generator
- Date Calculator
- Image Converter
- PDF Merger

## Privacy

Tool inputs are processed in the browser and never uploaded to a wutil server. There are no accounts. Cloudflare Pages serves the site, so standard hosting logs may exist at the platform level.

## Development

```bash
npm install
npm run dev
npm run check     # lint, typecheck, unit tests
npm run test:e2e  # build, then Playwright against the static export
```

Product and visual guidance live in [PRODUCT.md](PRODUCT.md) and [DESIGN.md](DESIGN.md).

## Deployment

Every push to `main` runs [`deploy.yml`](.github/workflows/deploy.yml): checks, static export, end-to-end tests, a Cloudflare Pages deploy of `out/`, and a cache purge for `wutil.m1ng.space`. Headers and caching rules live in [`public/_headers`](public/_headers).

Required GitHub Actions secrets are `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. An optional `CLOUDFLARE_CACHE_PURGE_API_TOKEN` scopes the purge step.

## License

[MIT](LICENSE)
