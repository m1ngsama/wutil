import StructuredData from '@/components/StructuredData';
import Tool from '@/components/tools/JsonFormatter';
import { toolMetadata } from '@/lib/seo';
import { getToolStructuredData } from '@/lib/structured-data';

export const metadata = toolMetadata('json-formatter');

export default function Page() {
  return (
    <>
      <StructuredData data={getToolStructuredData('json-formatter')} />
      <Tool />
    </>
  );
}
