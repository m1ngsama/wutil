import StructuredData from '@/components/StructuredData';
import Tool from '@/components/tools/ColorConverter';
import { toolMetadata } from '@/lib/seo';
import { getToolStructuredData } from '@/lib/structured-data';

export const metadata = toolMetadata('color-converter');

export default function Page() {
  return (
    <>
      <StructuredData data={getToolStructuredData('color-converter')} />
      <Tool />
    </>
  );
}
