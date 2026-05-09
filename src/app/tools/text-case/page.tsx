import type { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';
import TextCaseConverter from '@/components/tools/TextCaseConverter';
import { createPageMetadata } from '@/lib/seo';
import { getToolStructuredData } from '@/lib/structured-data';

export const metadata: Metadata = createPageMetadata({
  title: 'Text Case Converter',
  description: 'Convert text to UPPER CASE, lower case, Title Case, camelCase, PascalCase, snake_case, kebab-case, and more instantly.',
  keywords: ['text case converter', 'camelcase', 'snake_case', 'kebab-case', 'uppercase', 'lowercase'],
  path: '/tools/text-case',
});

export default function Page() {
  return (
    <>
      <StructuredData data={getToolStructuredData('text-case')} />
      <TextCaseConverter />
    </>
  );
}
