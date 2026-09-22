import StructuredData from '@/components/StructuredData';
import Tool from '@/components/tools/PasswordGenerator';
import { toolMetadata } from '@/lib/seo';
import { getToolStructuredData } from '@/lib/structured-data';

export const metadata = toolMetadata('password-generator');

export default function Page() {
  return (
    <>
      <StructuredData data={getToolStructuredData('password-generator')} />
      <Tool />
    </>
  );
}
