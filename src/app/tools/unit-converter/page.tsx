import { Metadata } from 'next';
import UnitConverterComponent from '@/components/tools/UnitConverter';

export const metadata: Metadata = {
  title: "Unit Converter - Length, Weight, Temperature",
  description: "Free online unit converter for length, weight, mass, and temperature. Convert between metric and imperial units.",
  keywords: ["unit converter", "length converter", "weight converter", "temperature converter", "metric conversion"],
};

export default function Page() {
  return <UnitConverterComponent />;
}
