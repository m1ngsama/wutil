import { Metadata } from 'next';
import Base64ConverterComponent from '@/components/tools/Base64Converter';

export const metadata: Metadata = {
  title: "Base64 Converter - Encode & Decode Online",
  description: "Free online Base64 encoder and decoder. Convert text to Base64 and vice versa instantly.",
  keywords: ["base64 converter", "base64 encoder", "base64 decoder", "online base64 tool"],
};

export default function Page() {
  return <Base64ConverterComponent />;
}
