import StructuredData from '@/components/StructuredData';
import Tool from '@/components/tools/TextCaseConverter';
import { toolMetadata } from '@/lib/seo';
import { getToolStructuredData } from '@/lib/structured-data';

export const metadata = toolMetadata('text-case');

export default function Page() {
  return (
    <>
      <StructuredData data={getToolStructuredData('text-case')} />
      <Tool />
    </>
  );
}
