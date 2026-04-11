import type { Metadata } from 'next';
import RegexTester from '@/components/tools/RegexTester';

export const metadata: Metadata = {
  title: 'Regex Tester',
  description: 'Test and debug regular expressions with real-time match highlighting. Supports all JavaScript regex flags and shows match groups.',
  keywords: ['regex tester', 'regular expression', 'regex debugger', 'regex match', 'javascript regex'],
};

export default function Page() {
  return <RegexTester />;
}
