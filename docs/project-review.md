# wutil Project Review

Review baseline: 2026-05-06

## Current State

wutil is a privacy-focused, client-side utility site built with Next.js static export and deployed to Cloudflare Pages at `https://wutil.m1ng.space`.

The project is in a production-usable state:

- The app has a registry-backed tool catalog, sitemap, robots route, privacy page, Open Graph image, PWA manifest, and Cloudflare Pages security headers.
- Tool logic that carries correctness risk is split into small utility modules under `src/lib`, with unit coverage for dates, units, Base64, passwords, regex handling, PDF validation, and registry/page consistency.
- Browser smoke coverage exercises homepage search/navigation, Base64 Unicode conversion, Regex copy flow, Image conversion, and actual PDF merge output.
- Production deploys run through GitHub Actions and Cloudflare Pages, with production URL verification after deployment.

## Production Pipeline

The current CI/CD flow for `main` is:

1. Install dependencies with `npm ci`.
2. Run production dependency audit at high severity or above.
3. Run lint, typecheck, and unit tests.
4. Install Chromium for Playwright.
5. Run browser E2E smoke tests.
6. Build the static export.
7. Deploy `out` to Cloudflare Pages.
8. Verify `https://wutil.m1ng.space` plus `robots.txt`, `sitemap.xml`, `/privacy`, and `/og-image.svg`.

This is a solid baseline for a static, client-side app. The highest-value next step is to keep broadening browser coverage until every public tool has at least one realistic happy-path test and one validation/error-path test.

## Remaining Risks

- The app processes user files in-browser. Large images and PDFs can still create memory pressure even with file size validation.
- E2E coverage is intentionally smoke-level. Several tools still rely mostly on unit tests or manual confidence.
- Production has response checks, but no real user monitoring, uptime alerting, or Core Web Vitals budget yet.
- `npm audit --omit=dev --audit-level=high` passes, but Next currently carries a moderate PostCSS advisory upstream. Do not use `npm audit fix --force` because it proposes a breaking downgrade.
- `cloudflare/wrangler-action@v3` still emits a Node.js 20 deprecation annotation, even though the workflow forces JavaScript actions to Node 24.
- Most tools expose state only inside the page. There are no shareable URLs for tool inputs or settings.

## Development Plan

### Phase 1: Production Hardening

- Expand Playwright tests to cover every public tool.
- Add accessibility checks for keyboard-only flows and screen-reader names on interactive controls.
- Add performance checks for homepage and the heavier file tools.
- Replace or upgrade the Wrangler action once Cloudflare publishes an action that targets Node 24 natively.
- Add lightweight uptime monitoring for `https://wutil.m1ng.space`.

### Phase 2: Product Depth

- Add shareable URLs for deterministic text tools, while keeping file tools local-only.
- Add tool examples and presets that speed up common workflows.
- Add recent tools or favorites stored locally in the browser.
- Improve offline/PWA behavior so common text tools remain usable without network access.

### Phase 3: Tool Expansion

Prioritize tools that are high-utility, privacy-compatible, and easy to test client-side:

- JWT inspector
- QR code generator/reader
- CSV to JSON converter
- Text diff viewer
- Markdown preview
- UUID generator
- Cron expression helper

### Phase 4: Trust And Discoverability

- Add per-tool privacy notes where files or sensitive text are involved.
- Add structured data for software application/tool pages.
- Maintain a short changelog for visible product improvements.
- Add documentation for local development, release process, and rollback steps.

## Target Outcome

wutil should become a fast, dependable, privacy-first toolbox for everyday web work. The practical success target is not a large feature count alone; it is a catalog where each tool is easy to find, works fully client-side, is covered by automated checks, and can be deployed to production without manual guesswork.
