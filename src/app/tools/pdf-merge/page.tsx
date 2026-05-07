import { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';
import PdfMergeComponent from '@/components/tools/PdfMerge';
import { getToolStructuredData } from '@/lib/structured-data';

export const metadata: Metadata = {
  title: "PDF Merger - Combine PDFs Online Free",
  description: "Free online PDF merger. Combine multiple PDF files into one document securely in your browser, up to 10 MB per file.",
  keywords: ["pdf merger", "combine pdf", "merge pdf online", "free pdf tool", "client-side pdf"],
};

export default function Page() {
  return (
    <>
      <StructuredData data={getToolStructuredData('pdf-merge')} />
      <PdfMergeComponent />
    </>
  );
}
