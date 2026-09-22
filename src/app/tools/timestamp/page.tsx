import StructuredData from '@/components/StructuredData';
import Tool from '@/components/tools/TimestampConverter';
import { toolMetadata } from '@/lib/seo';
import { getToolStructuredData } from '@/lib/structured-data';

export const metadata = toolMetadata('timestamp');

export default function Page() {
  return (
    <>
      <StructuredData data={getToolStructuredData('timestamp')} />
      <Tool />
    </>
  );
}
