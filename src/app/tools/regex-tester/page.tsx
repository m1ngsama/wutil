import StructuredData from '@/components/StructuredData';
import Tool from '@/components/tools/RegexTester';
import { toolMetadata } from '@/lib/seo';
import { getToolStructuredData } from '@/lib/structured-data';

export const metadata = toolMetadata('regex-tester');

export default function Page() {
  return (
    <>
      <StructuredData data={getToolStructuredData('regex-tester')} />
      <Tool />
    </>
  );
}
