import type { Metadata } from 'next';
import TimestampConverter from '@/components/tools/TimestampConverter';

export const metadata: Metadata = {
  title: 'Timestamp Converter',
  description: 'Convert Unix timestamps to human-readable dates and vice versa. Shows current Unix time and converts to ISO 8601, UTC, local time, and more.',
  keywords: ['timestamp converter', 'unix timestamp', 'epoch converter', 'unix time', 'date converter'],
};

export default function Page() {
  return <TimestampConverter />;
}
