import type { Metadata } from 'next';
import TextCaseConverter from '@/components/tools/TextCaseConverter';

export const metadata: Metadata = {
  title: 'Text Case Converter',
  description: 'Convert text to UPPER CASE, lower case, Title Case, camelCase, PascalCase, snake_case, kebab-case, and more instantly.',
  keywords: ['text case converter', 'camelcase', 'snake_case', 'kebab-case', 'uppercase', 'lowercase'],
};

export default function Page() {
  return <TextCaseConverter />;
}
