import { Metadata } from 'next';
import ImageConverterComponent from '@/components/tools/ImageConverter';

export const metadata: Metadata = {
  title: "Image Converter & Compressor - JPG, PNG, WebP",
  description: "Free online image converter and compressor. Convert, resize, and compress images entirely in your browser without uploading.",
  keywords: ["image converter", "image compressor", "jpg to png", "webp converter", "resize image", "online image tool"],
};

export default function Page() {
  return <ImageConverterComponent />;
}
