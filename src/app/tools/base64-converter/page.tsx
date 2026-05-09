import { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';
import Base64ConverterComponent from '@/components/tools/Base64Converter';
import { createPageMetadata } from '@/lib/seo';
import { getToolStructuredData } from '@/lib/structured-data';

export const metadata: Metadata = createPageMetadata({
  title: "Base64 Converter - Encode & Decode Online",
  description: "Free online Base64 encoder and decoder. Convert text to Base64 and vice versa instantly.",
  keywords: ["base64 converter", "base64 encoder", "base64 decoder", "online base64 tool"],
  path: '/tools/base64-converter',
});

export default function Page() {
  return (
    <>
      <StructuredData data={getToolStructuredData('base64-converter')} />
      <Base64ConverterComponent />
    </>
  );
}
