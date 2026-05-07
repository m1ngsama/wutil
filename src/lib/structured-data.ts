import { SITE_NAME, SITE_URL } from './site-config';
import { TOOL_REGISTRY } from './tool-registry';

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

function publisher() {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
  };
}

function graph(items: Record<string, unknown>[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': items,
  };
}

export function getHomeStructuredData() {
  return graph([
    publisher(),
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      name: SITE_NAME,
      url: SITE_URL,
      description: 'Fast, private, client-side web utilities.',
      publisher: { '@id': ORGANIZATION_ID },
    },
    {
      '@type': 'ItemList',
      name: `${SITE_NAME} tools`,
      itemListElement: TOOL_REGISTRY.map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: tool.name,
        url: absoluteUrl(tool.href),
      })),
    },
  ]);
}

export function getToolStructuredData(toolId: string) {
  const tool = TOOL_REGISTRY.find((item) => item.id === toolId);
  if (!tool) {
    throw new Error(`Unknown tool id: ${toolId}`);
  }

  return graph([
    publisher(),
    {
      '@type': 'SoftwareApplication',
      '@id': `${absoluteUrl(tool.href)}#software`,
      name: tool.name,
      description: tool.description,
      url: absoluteUrl(tool.href),
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      isAccessibleForFree: true,
      browserRequirements: 'Requires JavaScript and a modern web browser.',
      publisher: { '@id': ORGANIZATION_ID },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
  ]);
}
