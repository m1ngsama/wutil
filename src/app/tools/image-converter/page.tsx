import { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';
import ImageConverterComponent from '@/components/tools/ImageConverter';
import { createPageMetadata } from '@/lib/seo';
import { getToolStructuredData } from '@/lib/structured-data';

export const metadata: Metadata = createPageMetadata({
  title: "Image Converter & Compressor - JPG, PNG, WebP",
  description: "Free online image converter and compressor. Convert, resize, and compress images entirely in your browser without uploading.",
  keywords: ["image converter", "image compressor", "jpg to png", "webp converter", "resize image", "online image tool"],
  path: '/tools/image-converter',
});

export default function Page() {
  return (
    <>
      <StructuredData data={getToolStructuredData('image-converter')} />
      <ImageConverterComponent />
    </>
  );
}
