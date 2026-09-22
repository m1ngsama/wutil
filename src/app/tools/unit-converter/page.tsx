import StructuredData from '@/components/StructuredData';
import Tool from '@/components/tools/UnitConverter';
import { toolMetadata } from '@/lib/seo';
import { getToolStructuredData } from '@/lib/structured-data';

export const metadata = toolMetadata('unit-converter');

export default function Page() {
  return (
    <>
      <StructuredData data={getToolStructuredData('unit-converter')} />
      <Tool />
    </>
  );
}
