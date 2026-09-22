import StructuredData from '@/components/StructuredData';
import Tool from '@/components/tools/HashGenerator';
import { toolMetadata } from '@/lib/seo';
import { getToolStructuredData } from '@/lib/structured-data';

export const metadata = toolMetadata('hash-generator');

export default function Page() {
  return (
    <>
      <StructuredData data={getToolStructuredData('hash-generator')} />
      <Tool />
    </>
  );
}
