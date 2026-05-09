import type { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';
import ColorConverter from '@/components/tools/ColorConverter';
import { createPageMetadata } from '@/lib/seo';
import { getToolStructuredData } from '@/lib/structured-data';

export const metadata: Metadata = createPageMetadata({
  title: 'Color Converter',
  description: 'Convert colors between HEX, RGB, and HSL formats instantly. Includes a color picker and quick preset colors.',
  keywords: ['color converter', 'hex to rgb', 'rgb to hsl', 'color picker', 'css colors'],
  path: '/tools/color-converter',
});

export default function Page() {
  return (
    <>
      <StructuredData data={getToolStructuredData('color-converter')} />
      <ColorConverter />
    </>
  );
}
