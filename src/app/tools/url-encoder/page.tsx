import type { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';
import UrlEncoderDecoder from '@/components/tools/UrlEncoderDecoder';
import { createPageMetadata } from '@/lib/seo';
import { getToolStructuredData } from '@/lib/structured-data';

export const metadata: Metadata = createPageMetadata({
  title: 'URL Encoder / Decoder',
  description: 'Encode and decode URLs instantly. Safely encode special characters for use in URLs, or decode percent-encoded strings back to readable text.',
  keywords: ['url encoder', 'url decoder', 'percent encoding', 'urlencode', 'urldecode'],
  path: '/tools/url-encoder',
});

export default function Page() {
  return (
    <>
      <StructuredData data={getToolStructuredData('url-encoder')} />
      <UrlEncoderDecoder />
    </>
  );
}
