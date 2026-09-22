import StructuredData from '@/components/StructuredData';
import Tool from '@/components/tools/WordCounter';
import { toolMetadata } from '@/lib/seo';
import { getToolStructuredData } from '@/lib/structured-data';

export const metadata = toolMetadata('word-counter');

export default function Page() {
  return (
    <>
      <StructuredData data={getToolStructuredData('word-counter')} />
      <Tool />
    </>
  );
}
