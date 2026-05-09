# Growth And Analytics

Baseline checked: 2026-05-09

## Current State

- Production site: `https://wutil.m1ng.space`
- SEO files are present: `robots.txt`, `sitemap.xml`, metadata, Open Graph image, Twitter card metadata, and JSON-LD structured data.
- Cloudflare Pages project `wutil` is deployed successfully, but Pages Web Analytics is not enabled yet. The current project config has `build_config.web_analytics_tag` and `build_config.web_analytics_token` set to `null`.
- No ad network integration is configured in this repository. `ads.txt` should stay absent until an ad platform provides the exact publisher line.
- No paid acquisition campaign tracking convention was documented before this file.

## How To Measure Traffic

Use these sources together because they answer different questions:

- Cloudflare Web Analytics: real user page views, visits, referrers, browser/device data, and Web Vitals. This is the primary privacy-preserving traffic source for the site.
- Cloudflare zone Analytics: edge-level request volume, bandwidth, cache behavior, threats, and status codes. This can show request frequency even before Web Analytics is enabled, but it is not a product analytics tool.
- Google Search Console: organic search impressions, clicks, query terms, page indexing, and sitemap submission state.
- Bing Webmaster Tools: Bing search performance, crawl/index diagnostics, and sitemap submission state.
- GitHub Actions production monitor: synthetic availability, interaction, and performance checks. This validates uptime and behavior, not real visitor frequency.
- Ad platform dashboards: spend, impressions, CPC, CTR, and conversion data for paid campaigns.

## Enable Cloudflare Web Analytics

Cloudflare's documented Pages setup is dashboard-based:

1. Open Cloudflare Dashboard -> Workers & Pages.
2. Select the `wutil` Pages project.
3. Open Metrics.
4. Select Enable under Web Analytics.
5. Trigger a new production deployment after enabling it.

Cloudflare will inject the beacon on the next Pages deployment. For the proxied `wutil.m1ng.space` hostname, automatic setup should report to the site's own `/cdn-cgi/rum` endpoint. If a manual snippet is ever used instead, update `public/_headers` because the manual beacon reports to `cloudflareinsights.com/cdn-cgi/rum`.

Verification after enabling:

- View-source or inspect the production page and confirm the Cloudflare beacon is present.
- In browser DevTools Network, confirm a beacon request is sent after page load.
- In Cloudflare Dashboard -> Web Analytics, confirm the associated Pages analytics site starts receiving visits.

Docs:

- <https://developers.cloudflare.com/pages/how-to/web-analytics/>
- <https://developers.cloudflare.com/web-analytics/get-started/>

## Search Console Setup

1. Create or open a Google Search Console property for `https://wutil.m1ng.space`.
2. Prefer domain verification if DNS access is available; otherwise use URL-prefix verification.
3. Submit `https://wutil.m1ng.space/sitemap.xml`.
4. Check Coverage/Indexing, Pages, Queries, CTR, and average position weekly.
5. Repeat the sitemap submission in Bing Webmaster Tools.

## Campaign Tracking

Use UTM parameters for every non-organic link:

```text
https://wutil.m1ng.space/?utm_source=github&utm_medium=profile&utm_campaign=launch
https://wutil.m1ng.space/tools/json-formatter?utm_source=reddit&utm_medium=social&utm_campaign=json_tools&utm_content=post_1
https://wutil.m1ng.space/tools/pdf-merge?utm_source=google&utm_medium=cpc&utm_campaign=pdf_tools&utm_content=merge_ad_a
```

Recommended fields:

- `utm_source`: platform or referrer, such as `github`, `producthunt`, `reddit`, `google`, `bing`.
- `utm_medium`: channel type, such as `social`, `referral`, `cpc`, `email`.
- `utm_campaign`: campaign name, such as `launch`, `json_tools`, `pdf_tools`.
- `utm_content`: creative, placement, or variant, such as `post_1`, `ad_a`, `sidebar`.

Keep campaign names lowercase with underscores so filtering stays reliable.

## Advertising State

Do not add `public/ads.txt` until a monetization or ad platform gives the exact authorized seller record. An incorrect `ads.txt` can block ad serving or misrepresent inventory ownership.

Before paid ads:

- Pick one landing route per campaign, usually the most relevant tool page.
- Add UTM parameters to every destination URL.
- Confirm Web Analytics is receiving visits.
- Record baseline traffic and performance before launch.
- Compare paid traffic against organic search and referral traffic after at least one full week.

## Weekly Review

Track this small set first:

- Total visits and page views.
- Top landing pages and top exit pages.
- Referrers and UTM campaign sources.
- Search impressions, clicks, CTR, and average position.
- Top queries that map to existing tool pages.
- Pages with high impressions but low CTR, which usually need title/description tuning.
- Production monitor failures and performance regressions.
