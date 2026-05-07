# wutil Project Review

Review baseline: 2026-05-06

## Current State

wutil is a privacy-focused, client-side utility site built with Next.js static export and deployed to Cloudflare Pages at `https://wutil.m1ng.space`.

The project is in a production-usable state:

- The app has a registry-backed tool catalog, sitemap, robots route, privacy page, Open Graph image, PWA manifest, and Cloudflare Pages security headers.
- Tool logic that carries correctness risk is split into small utility modules under `src/lib`, with unit coverage for dates, units, Base64, passwords, regex handling, PDF validation, and registry/page consistency.
- Browser smoke coverage exercises homepage search/navigation and all 14 public tools, including text transformations, conversions, hashing, date math, image conversion, and actual PDF merge output. The suite also includes basic axe WCAG A/AA scans for the homepage and every public tool page in both light and dark themes. Keyboard-flow smoke tests cover representative homepage, switch, segmented-control, and copy interactions.
- Production deploys run through GitHub Actions and Cloudflare Pages, with production URL verification and a lightweight production performance budget after deployment.

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
9. Check a lightweight production performance budget for the homepage and heavier file-tool routes.

This is a solid baseline for a static, client-side app. The highest-value next step is to deepen browser coverage with more validation and error-path checks, then add richer production performance signals.

## Remaining Risks

- The app processes user files in-browser. Large images and PDFs can still create memory pressure even with file size validation.
- E2E coverage now spans every public tool and includes full-catalog light/dark axe scans plus representative keyboard-flow checks, but remains smoke-level for several tools. Validation and error-path coverage should continue expanding, and keyboard coverage should grow beyond the current representative flows.
- Production has response checks and a lightweight HTML response performance budget, but no real user monitoring, uptime alerting, or Core Web Vitals budget yet.
- `npm audit --omit=dev --audit-level=high` passes, but Next currently carries a moderate PostCSS advisory upstream. Do not use `npm audit fix --force` because it proposes a breaking downgrade.
- `cloudflare/wrangler-action@v3` still emits a Node.js 20 deprecation annotation, even though the workflow forces JavaScript actions to Node 24.
- Most tools expose state only inside the page. There are no shareable URLs for tool inputs or settings.

## Development Plan

### Phase 1: Production Hardening

- Expand Playwright tests from smoke coverage into deeper validation and error-path coverage.
- Expand keyboard-flow coverage beyond the current representative interactions.
- Upgrade production performance checks from response budgets to Core Web Vitals and asset budgets.
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
