import { appendFileSync } from 'node:fs';

const apiToken = process.env.CLOUDFLARE_ANALYTICS_API_TOKEN ?? process.env.CLOUDFLARE_API_TOKEN;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const host = process.env.CLOUDFLARE_ANALYTICS_HOST ?? 'wutil.m1ng.space';
const days = Number(process.env.CLOUDFLARE_ANALYTICS_DAYS ?? 7);
const end = new Date(process.env.CLOUDFLARE_ANALYTICS_END ?? Date.now());
const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);

function requireEnv(name, value) {
  if (!value) {
    throw new Error(`${name} is required to query Cloudflare analytics.`);
  }
}

requireEnv('CLOUDFLARE_ANALYTICS_API_TOKEN or CLOUDFLARE_API_TOKEN', apiToken);
requireEnv('CLOUDFLARE_ACCOUNT_ID', accountId);

function valueOrZero(value) {
  return Number(value ?? 0);
}

function firstGroup(groups) {
  return Array.isArray(groups) && groups.length > 0 ? groups[0] : { count: 0, sum: {}, quantiles: {} };
}

function percent(part, total) {
  if (!total) return '0.0%';
  return `${((part / total) * 100).toFixed(1)}%`;
}

function microsecondsToMs(value) {
  const numericValue = Number(value ?? 0);
  if (!numericValue) return 'n/a';
  return `${Math.round(numericValue / 1000)}ms`;
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(valueOrZero(value));
}

function markdownTable(headers, rows) {
  if (rows.length === 0) return '_No data._';
  const header = `| ${headers.join(' |')} |`;
  const separator = `| ${headers.map(() => '---').join(' |')} |`;
  const body = rows.map((row) => `| ${row.join(' |')} |`).join('\n');
  return `${header}\n${separator}\n${body}`;
}

function pageloadRows(groups, dimensionName, labelFallback = '(direct)') {
  return groups
    .map((group) => {
      const label = group.dimensions?.[dimensionName] || labelFallback;
      return {
        label,
        pageViews: valueOrZero(group.count),
        visits: valueOrZero(group.sum?.visits),
      };
    })
    .filter((row) => row.label !== host)
    .map((row) => [row.label, formatNumber(row.pageViews), formatNumber(row.visits)]);
}

function dailyRows(groups) {
  return groups.map((group) => [
    group.dimensions?.date ?? 'unknown',
    formatNumber(group.count),
    formatNumber(group.sum?.visits),
  ]);
}

function vitalsRows(vitals) {
  const summary = firstGroup(vitals);
  const sum = summary.sum ?? {};
  const quantiles = summary.quantiles ?? {};

  return [
    [
      'LCP',
      microsecondsToMs(quantiles.largestContentfulPaintP75),
      `${formatNumber(sum.lcpGood)} / ${formatNumber(sum.lcpTotal)} (${percent(sum.lcpGood, sum.lcpTotal)})`,
    ],
    [
      'INP',
      microsecondsToMs(quantiles.interactionToNextPaintP75),
      `${formatNumber(sum.inpGood)} / ${formatNumber(sum.inpTotal)} (${percent(sum.inpGood, sum.inpTotal)})`,
    ],
    [
      'CLS',
      quantiles.cumulativeLayoutShiftP75 == null ? 'n/a' : Number(quantiles.cumulativeLayoutShiftP75).toFixed(3),
      `${formatNumber(sum.clsGood)} / ${formatNumber(sum.clsTotal)} (${percent(sum.clsGood, sum.clsTotal)})`,
    ],
    [
      'FCP',
      microsecondsToMs(quantiles.firstContentfulPaintP75),
      `${formatNumber(sum.fcpGood)} / ${formatNumber(sum.fcpTotal)} (${percent(sum.fcpGood, sum.fcpTotal)})`,
    ],
    [
      'TTFB',
      microsecondsToMs(quantiles.timeToFirstByteP75),
      `${formatNumber(sum.ttfbGood)} / ${formatNumber(sum.ttfbTotal)} (${percent(sum.ttfbGood, sum.ttfbTotal)})`,
    ],
  ];
}

async function queryCloudflareAnalytics() {
  const query = `query WutilAnalytics($accountTag: string!, $start: Time!, $end: Time!, $host: string!) {
    viewer {
      accounts(filter: { accountTag: $accountTag }) {
        summary: rumPageloadEventsAdaptiveGroups(
          limit: 1
          filter: { datetime_geq: $start, datetime_leq: $end, requestHost: $host, bot: 0 }
        ) {
          count
          sum { visits }
        }
        daily: rumPageloadEventsAdaptiveGroups(
          limit: 31
          orderBy: [date_ASC]
          filter: { datetime_geq: $start, datetime_leq: $end, requestHost: $host, bot: 0 }
        ) {
          count
          sum { visits }
          dimensions { date }
        }
        topPages: rumPageloadEventsAdaptiveGroups(
          limit: 10
          orderBy: [count_DESC]
          filter: { datetime_geq: $start, datetime_leq: $end, requestHost: $host, bot: 0 }
        ) {
          count
          sum { visits }
          dimensions { requestPath }
        }
        referrers: rumPageloadEventsAdaptiveGroups(
          limit: 10
          orderBy: [count_DESC]
          filter: { datetime_geq: $start, datetime_leq: $end, requestHost: $host, bot: 0, refererHost_neq: "" }
        ) {
          count
          sum { visits }
          dimensions { refererHost }
        }
        devices: rumPageloadEventsAdaptiveGroups(
          limit: 10
          orderBy: [count_DESC]
          filter: { datetime_geq: $start, datetime_leq: $end, requestHost: $host, bot: 0 }
        ) {
          count
          sum { visits }
          dimensions { deviceType }
        }
        browsers: rumPageloadEventsAdaptiveGroups(
          limit: 10
          orderBy: [count_DESC]
          filter: { datetime_geq: $start, datetime_leq: $end, requestHost: $host, bot: 0 }
        ) {
          count
          sum { visits }
          dimensions { userAgentBrowser }
        }
        countries: rumPageloadEventsAdaptiveGroups(
          limit: 10
          orderBy: [count_DESC]
          filter: { datetime_geq: $start, datetime_leq: $end, requestHost: $host, bot: 0 }
        ) {
          count
          sum { visits }
          dimensions { countryName }
        }
        vitals: rumWebVitalsEventsAdaptiveGroups(
          limit: 1
          filter: { datetime_geq: $start, datetime_leq: $end, requestHost: $host, bot: 0 }
        ) {
          count
          quantiles {
            cumulativeLayoutShiftP75
            firstContentfulPaintP75
            interactionToNextPaintP75
            largestContentfulPaintP75
            timeToFirstByteP75
          }
          sum {
            clsGood
            clsTotal
            fcpGood
            fcpTotal
            inpGood
            inpTotal
            lcpGood
            lcpTotal
            ttfbGood
            ttfbTotal
          }
        }
      }
    }
  }`;

  const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: {
        accountTag: accountId,
        start: start.toISOString(),
        end: end.toISOString(),
        host,
      },
    }),
  });

  const payload = await response.json();
  if (!response.ok || payload.errors?.length) {
    const errors = payload.errors?.map((error) => error.message).join('\n') || response.statusText;
    throw new Error(`Cloudflare analytics query failed (${response.status}):\n${errors}`);
  }

  return payload.data.viewer.accounts[0];
}

const analytics = await queryCloudflareAnalytics();
const summary = firstGroup(analytics.summary);
const pageViews = valueOrZero(summary.count);
const visits = valueOrZero(summary.sum?.visits);
const viewsPerVisit = visits > 0 ? (pageViews / visits).toFixed(2) : 'n/a';

const report = [
  `# Cloudflare Analytics Report`,
  ``,
  `Host: ${host}`,
  `Window: ${start.toISOString()} to ${end.toISOString()}`,
  ``,
  `## Summary`,
  ``,
  markdownTable(
    ['Page views', 'Visits', 'Views / visit'],
    [[formatNumber(pageViews), formatNumber(visits), viewsPerVisit]],
  ),
  ``,
  `## Daily Traffic`,
  ``,
  markdownTable(['Date', 'Page views', 'Visits'], dailyRows(analytics.daily)),
  ``,
  `## Top Pages`,
  ``,
  markdownTable(['Path', 'Page views', 'Visits'], pageloadRows(analytics.topPages, 'requestPath', '/')),
  ``,
  `## Referrers`,
  ``,
  markdownTable(['Host', 'Page views', 'Visits'], pageloadRows(analytics.referrers, 'refererHost')),
  ``,
  `## Devices`,
  ``,
  markdownTable(['Device', 'Page views', 'Visits'], pageloadRows(analytics.devices, 'deviceType', 'unknown')),
  ``,
  `## Browsers`,
  ``,
  markdownTable(['Browser', 'Page views', 'Visits'], pageloadRows(analytics.browsers, 'userAgentBrowser', 'unknown')),
  ``,
  `## Countries`,
  ``,
  markdownTable(['Country', 'Page views', 'Visits'], pageloadRows(analytics.countries, 'countryName', 'unknown')),
  ``,
  `## Real User Web Vitals`,
  ``,
  markdownTable(['Metric', 'P75', 'Good samples'], vitalsRows(analytics.vitals)),
  ``,
].join('\n');

console.log(report);

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${report}\n`);
}
