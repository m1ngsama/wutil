import StructuredData from '@/components/StructuredData';
import Tool from '@/components/tools/UuidGenerator';
import { toolMetadata } from '@/lib/seo';
import { getToolStructuredData } from '@/lib/structured-data';

export const metadata = toolMetadata('uuid-generator');

export default function Page() {
  return (
    <>
      <StructuredData data={getToolStructuredData('uuid-generator')} />
      <Tool />
    </>
  );
}
