import { Metadata } from 'next';
import WordCounterComponent from '@/components/tools/WordCounter';

export const metadata: Metadata = {
  title: "Word Counter - Character & Sentence Count",
  description: "Free online word counter, character counter, and sentence counter. Real-time statistics for your text.",
  keywords: ["word counter", "character count", "sentence counter", "text statistics", "online tool"],
};

export default function Page() {
  return <WordCounterComponent />;
}
