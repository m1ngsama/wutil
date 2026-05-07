import type { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';
import ColorConverter from '@/components/tools/ColorConverter';
import { getToolStructuredData } from '@/lib/structured-data';

export const metadata: Metadata = {
  title: 'Color Converter',
  description: 'Convert colors between HEX, RGB, and HSL formats instantly. Includes a color picker and quick preset colors.',
  keywords: ['color converter', 'hex to rgb', 'rgb to hsl', 'color picker', 'css colors'],
};

export default function Page() {
  return (
    <>
      <StructuredData data={getToolStructuredData('color-converter')} />
      <ColorConverter />
    </>
  );
}
