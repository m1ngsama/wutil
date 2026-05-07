import { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';
import JsonFormatterComponent from '@/components/tools/JsonFormatter';
import { getToolStructuredData } from '@/lib/structured-data';

export const metadata: Metadata = {
  title: "JSON Formatter & Validator - Beautify JSON Online",
  description: "Free online JSON formatter, validator, and minifier. Beautify your JSON code instantly.",
  keywords: ["json formatter", "json validator", "json minifier", "beautify json", "online json tool"],
};

export default function Page() {
  return (
    <>
      <StructuredData data={getToolStructuredData('json-formatter')} />
      <JsonFormatterComponent />
    </>
  );
}
