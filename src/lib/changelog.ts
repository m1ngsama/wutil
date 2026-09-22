export interface ChangelogEntry {
  date: string;
  title: string;
  summary: string;
  changes: string[];
}

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    date: '2026-09-22',
    title: 'Better on phones, and a few new tools',
    summary: 'Tools now start closer to the top of the screen and behave the same way everywhere.',
    changes: [
      'Added a UUID generator for v4 and time-sortable v7 identifiers.',
      'The hash generator can now hash and verify files without uploading them.',
      'Search for any tool from every page, and star tools to keep them at the top of the home page.',
      'wutil can be installed as an app, and pages you have opened keep working offline.',
      'Tool pages use a compact header, so the tool itself is visible on the first screen of a phone.',
      'Copy buttons, examples, and input and output boxes now look and sit the same in every tool.',
      'Password and UUID generators show a result as soon as they open.',
      'Keyboard and drag-and-drop hints only appear on devices that can use them.',
    ],
  },
  {
    date: '2026-08-02',
    title: 'Faster repeat workflows',
    summary: 'Made tools easier to revisit and more consistent to use.',
    changes: [
      'Added a shared tool page structure with curated related-tool navigation.',
      'Added a local recently used list with clear history controls. Tool inputs remain unstored.',
      'Added safe, runnable examples to JSON, Base64, URL, and regex tools.',
      'Unified long-task progress and cancellation feedback for image conversion and PDF merging.',
      'Kept touch targets comfortable across phones and tablets, improved short-landscape layouts, and added safer image limits.',
      'Updated framework and build dependencies to current security fixes.',
    ],
  },
  {
    date: '2026-05-10',
    title: 'Production SEO monitoring',
    summary: 'Added automated production checks for canonical and social metadata.',
    changes: [
      'Added a production SEO metadata check that reads sitemap routes and validates canonical, Open Graph, and Twitter metadata.',
      'Added the SEO check to deploy and scheduled production monitoring workflows.',
      'Documented how to run SEO checks against production or preview deployments.',
    ],
  },
  {
    date: '2026-05-09',
    title: 'Search metadata and analytics planning',
    summary: 'Standardized page-level sharing metadata and documented the analytics setup path.',
    changes: [
      'Added canonical, Open Graph, and Twitter metadata helpers for public tool and static pages.',
      'Documented Cloudflare Web Analytics setup, search console setup, UTM campaign conventions, and ads.txt guidance.',
      'Added tests that keep page metadata URLs aligned with the production site.',
    ],
  },
  {
    date: '2026-05-08',
    title: 'Privacy notes by tool category',
    summary: 'Expanded the public privacy page with clearer tool-level data handling notes.',
    changes: [
      'Added file-tool privacy notes for image conversion and PDF merging.',
      'Added sensitive text handling notes for text, encoding, hashing, regex, and formatting tools.',
      'Added tests that keep privacy notes aligned with registered tools.',
    ],
  },
  {
    date: '2026-05-07',
    title: 'Production hardening and discoverability',
    summary: 'Strengthened production checks, monitoring, and search metadata for the public site.',
    changes: [
      'Added scheduled production monitoring every six hours through GitHub Actions.',
      'Added production browser interaction checks for representative workflows, validation states, file re-selection, console errors, and mobile overflow.',
      'Expanded production performance budgets to include FCP, LCP, CLS, and transferred resource sizes.',
      'Added JSON-LD structured data for the homepage and every public tool page.',
      'Fixed file input re-selection flows for image conversion and PDF merging.',
      'Hardened regex worker timing, unit converter mobile layout, RGB color normalization, and analytics CSP settings.',
    ],
  },
  {
    date: '2026-05-06',
    title: 'Production baseline',
    summary: 'Established the first production-ready baseline for the browser-only utility catalog.',
    changes: [
      'Published 14 client-side tools covering text, data, calculation, security, image, and PDF workflows.',
      'Added Cloudflare Pages deployment through GitHub Actions.',
      'Added sitemap, robots, privacy page, Open Graph image, PWA manifest, and production security headers.',
      'Added unit tests, browser E2E coverage, accessibility smoke scans, and keyboard-flow smoke coverage.',
    ],
  },
];
