import { Metadata } from 'next';
import JsonFormatterComponent from '@/components/tools/JsonFormatter';

export const metadata: Metadata = {
  title: "JSON Formatter & Validator - Beautify JSON Online",
  description: "Free online JSON formatter, validator, and minifier. Beautify your JSON code instantly.",
  keywords: ["json formatter", "json validator", "json minifier", "beautify json", "online json tool"],
};

export default function Page() {
  return <JsonFormatterComponent />;
}
