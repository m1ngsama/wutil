import type { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';
import TimestampConverter from '@/components/tools/TimestampConverter';
import { createPageMetadata } from '@/lib/seo';
import { getToolStructuredData } from '@/lib/structured-data';

export const metadata: Metadata = createPageMetadata({
  title: 'Timestamp Converter',
  description: 'Convert Unix timestamps to human-readable dates and vice versa. Shows current Unix time and converts to ISO 8601, UTC, local time, and more.',
  keywords: ['timestamp converter', 'unix timestamp', 'epoch converter', 'unix time', 'date converter'],
  path: '/tools/timestamp',
});

export default function Page() {
  return (
    <>
      <StructuredData data={getToolStructuredData('timestamp')} />
      <TimestampConverter />
    </>
  );
}
