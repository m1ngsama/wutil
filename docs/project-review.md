# wutil Project Review

Review baseline: 2026-05-11

## Current State

wutil is a privacy-focused, client-side utility site built with Next.js static export and deployed to Cloudflare Pages at `https://wutil.m1ng.space`.

The project is in a production-usable state:

- The app has a registry-backed tool catalog, sitemap, robots route, privacy page with tool-category data handling notes, changelog, Open Graph image, PWA manifest, and Cloudflare Pages security headers.
- The homepage and every tool page include JSON-LD structured data for search engines, including a site-level tool list and per-tool software application metadata.
- Tool logic that carries correctness risk is split into small utility modules under `src/lib`, with unit coverage for dates, units, Base64, passwords, regex handling, PDF validation, and registry/page consistency.
- Browser smoke coverage exercises homepage search/navigation and all 14 public tools, including text transformations, conversions, hashing, date math, image conversion, and actual PDF merge output. The suite also includes basic axe WCAG A/AA scans for the homepage and every public tool page in both light and dark themes. Keyboard-flow smoke tests cover representative homepage, switch, segmented-control, and copy interactions.
- Production deploys run through GitHub Actions and Cloudflare Pages when changes land on `main`, with cache purge and warmup after deployment, production URL verification, SEO metadata checks, a browser-level production interaction sweep, and production performance budgets covering HTML response timing, FCP/LCP/CLS, and transferred resources. The workflow can also be run manually when needed.
- SEO and growth operations are tracked in [growth-and-analytics.md](growth-and-analytics.md). Cloudflare Pages Web Analytics is enabled for the `wutil` project, and the analytics report workflow can be run manually to summarize visits, page views, top pages, referrers, device/browser mix, country mix, and real-user Web Vitals.

## Production Pipeline

The CI/CD flow for `main` is:

1. Install dependencies with `npm ci`.
2. Run production dependency audit at high severity or above.
3. Run lint, typecheck, and unit tests.
4. Install Chromium for Playwright.
5. Run browser E2E smoke tests.
6. Build the static export.
7. Deploy `out` to Cloudflare Pages.
8. Purge the Cloudflare cache for `wutil.m1ng.space`.
9. Warm production HTML routes from the sitemap.
10. Verify `https://wutil.m1ng.space` plus `robots.txt`, `sitemap.xml`, `/privacy`, and `/og-image.svg`.
11. Check production SEO metadata for every route in `sitemap.xml`, including canonical links, `og:url`, OG image, and Twitter card metadata.
12. Run a browser-level production interaction sweep against representative happy paths, validation/error paths, file-tool re-selection flows, console errors, and mobile horizontal overflow.
13. Check production performance budgets for the homepage and heavier file-tool routes, including HTML response timing, FCP/LCP/CLS, and transferred resources.

This is a solid baseline for a static, client-side app. The highest-value next step is to continue deepening browser coverage around high-risk file and conversion paths, then add external monitoring or RUM if operational requirements grow.

## Remaining Risks

- The app processes user files in-browser. Large images and PDFs can still create memory pressure even with file size validation.
- E2E coverage now spans every public tool and includes full-catalog light/dark axe scans plus representative keyboard-flow checks. CI also runs a production browser interaction sweep, but coverage remains representative rather than exhaustive for file memory pressure, unusual encodings, and very large inputs.
- Production has response checks, a manual browser-level interaction sweep, synthetic browser performance budgets, and Cloudflare Web Analytics. It still has no external multi-region uptime monitor.
- Web Analytics has only recently been enabled, so traffic and Web Vitals samples are still too small for confident product or acquisition decisions.
- `npm audit --omit=dev --audit-level=high` passes, but Next currently carries a moderate PostCSS advisory upstream. Do not use `npm audit fix --force` because it proposes a breaking downgrade.
- `cloudflare/wrangler-action@v3` still emits a Node.js 20 deprecation annotation, even though the workflow forces JavaScript actions to Node 24.
- Most tools expose state only inside the page. There are no shareable URLs for tool inputs or settings.

## Development Plan

### Phase 1: Production Hardening

- Expand Playwright tests from smoke coverage into deeper validation, error-path, and large-input coverage.
- Expand keyboard-flow coverage beyond the current representative interactions.
- Keep tightening production performance budgets as the tool catalog grows.
- Replace or upgrade the Wrangler action once Cloudflare publishes an action that targets Node 24 natively.
- Add external multi-region uptime monitoring for `https://wutil.m1ng.space` if deploy-time GitHub Actions checks are not enough.

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

- Keep privacy notes current as tools are added or data handling behavior changes.
- Keep structured data aligned with the tool registry as new tools launch.
- Use Cloudflare Web Analytics plus Search Console/Bing Webmaster Tools for search performance data.
- Keep the public changelog current with visible product and reliability improvements.
- Add documentation for local development, release process, and rollback steps.

## Target Outcome

wutil should become a fast, dependable, privacy-first toolbox for everyday web work. The practical success target is not a large feature count alone; it is a catalog where each tool is easy to find, works fully client-side, is covered by automated checks, and can be deployed to production without manual guesswork.
