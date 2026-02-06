import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://wutil.pages.dev';
  
  // Base routes
  const routes = [
    '',
    '/tools/word-counter',
    '/tools/json-formatter',
    '/tools/base64-converter',
    '/tools/unit-converter',
    '/tools/hash-generator',
    '/tools/date-calculator',
    '/tools/image-converter',
    '/tools/pdf-merge',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));
}
