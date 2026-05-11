const apiToken = process.env.CLOUDFLARE_API_TOKEN;
const zoneId = process.env.CLOUDFLARE_ZONE_ID;
const host = process.env.CLOUDFLARE_PURGE_HOST ?? "wutil.m1ng.space";
const dryRun = process.env.CLOUDFLARE_PURGE_DRY_RUN === "1";

function requireEnv(name, value) {
  if (!value) {
    throw new Error(`${name} is required to purge Cloudflare cache.`);
  }
}

requireEnv("CLOUDFLARE_API_TOKEN", apiToken);
requireEnv("CLOUDFLARE_ZONE_ID", zoneId);

const payload = { hosts: [host] };
const endpoint = `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`;

if (dryRun) {
  console.log(`Would purge Cloudflare cache for host: ${host}`);
  process.exit(0);
}

const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

const body = await response.json().catch(() => null);

if (!response.ok || body?.success !== true) {
  const errors = Array.isArray(body?.errors)
    ? body.errors.map((error) => `${error.code}: ${error.message}`).join("\n")
    : response.statusText;

  console.error("Cloudflare cache purge failed.");
  console.error(`Status: ${response.status}`);
  console.error(errors);
  process.exit(1);
}

console.log(`Purged Cloudflare cache for host: ${host}`);
