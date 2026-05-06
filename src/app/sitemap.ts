import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-config';
import { SITEMAP_ROUTES } from '@/lib/tool-registry';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return SITEMAP_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));
}
