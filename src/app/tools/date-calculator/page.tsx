import StructuredData from '@/components/StructuredData';
import Tool from '@/components/tools/DateCalculator';
import { toolMetadata } from '@/lib/seo';
import { getToolStructuredData } from '@/lib/structured-data';

export const metadata = toolMetadata('date-calculator');

export default function Page() {
  return (
    <>
      <StructuredData data={getToolStructuredData('date-calculator')} />
      <Tool />
    </>
  );
}
