import type { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';
import RegexTester from '@/components/tools/RegexTester';
import { createPageMetadata } from '@/lib/seo';
import { getToolStructuredData } from '@/lib/structured-data';

export const metadata: Metadata = createPageMetadata({
  title: 'Regex Tester',
  description: 'Test and debug regular expressions with real-time match highlighting. Supports all JavaScript regex flags and shows match groups.',
  keywords: ['regex tester', 'regular expression', 'regex debugger', 'regex match', 'javascript regex'],
  path: '/tools/regex-tester',
});

export default function Page() {
  return (
    <>
      <StructuredData data={getToolStructuredData('regex-tester')} />
      <RegexTester />
    </>
  );
}
