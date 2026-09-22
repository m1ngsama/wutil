import StructuredData from '@/components/StructuredData';
import Tool from '@/components/tools/ImageConverter';
import { toolMetadata } from '@/lib/seo';
import { getToolStructuredData } from '@/lib/structured-data';

export const metadata = toolMetadata('image-converter');

export default function Page() {
  return (
    <>
      <StructuredData data={getToolStructuredData('image-converter')} />
      <Tool />
    </>
  );
}
