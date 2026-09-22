import StructuredData from '@/components/StructuredData';
import Tool from '@/components/tools/Base64Converter';
import { toolMetadata } from '@/lib/seo';
import { getToolStructuredData } from '@/lib/structured-data';

export const metadata = toolMetadata('base64-converter');

export default function Page() {
  return (
    <>
      <StructuredData data={getToolStructuredData('base64-converter')} />
      <Tool />
    </>
  );
}
