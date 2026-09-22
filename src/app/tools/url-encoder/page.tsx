import StructuredData from '@/components/StructuredData';
import Tool from '@/components/tools/UrlEncoderDecoder';
import { toolMetadata } from '@/lib/seo';
import { getToolStructuredData } from '@/lib/structured-data';

export const metadata = toolMetadata('url-encoder');

export default function Page() {
  return (
    <>
      <StructuredData data={getToolStructuredData('url-encoder')} />
      <Tool />
    </>
  );
}
