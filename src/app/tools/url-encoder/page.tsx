import type { Metadata } from 'next';
import UrlEncoderDecoder from '@/components/tools/UrlEncoderDecoder';

export const metadata: Metadata = {
  title: 'URL Encoder / Decoder',
  description: 'Encode and decode URLs instantly. Safely encode special characters for use in URLs, or decode percent-encoded strings back to readable text.',
  keywords: ['url encoder', 'url decoder', 'percent encoding', 'urlencode', 'urldecode'],
};

export default function Page() {
  return <UrlEncoderDecoder />;
}
