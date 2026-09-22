import type { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';
import UuidGenerator from '@/components/tools/UuidGenerator';
import { createPageMetadata } from '@/lib/seo';
import { getToolStructuredData } from '@/lib/structured-data';

export const metadata: Metadata = createPageMetadata({
  title: 'UUID Generator (v4 & v7)',
  description: 'Generate RFC 9562 UUID v4 and time-sortable UUID v7 identifiers in batches. Choose case and hyphen formatting, copy, or download locally.',
  keywords: ['UUID generator', 'UUID v4 generator', 'UUID v7 generator', 'GUID generator', 'random UUID'],
  path: '/tools/uuid-generator',
});

export default function Page() {
  return (
    <>
      <StructuredData data={getToolStructuredData('uuid-generator')} />
      <UuidGenerator />
    </>
  );
}
