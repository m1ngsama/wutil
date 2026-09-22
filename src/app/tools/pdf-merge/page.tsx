import StructuredData from '@/components/StructuredData';
import Tool from '@/components/tools/PdfMerge';
import { toolMetadata } from '@/lib/seo';
import { getToolStructuredData } from '@/lib/structured-data';

export const metadata = toolMetadata('pdf-merge');

export default function Page() {
  return (
    <>
      <StructuredData data={getToolStructuredData('pdf-merge')} />
      <Tool />
    </>
  );
}
