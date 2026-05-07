import type { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';
import PasswordGenerator from '@/components/tools/PasswordGenerator';
import { getToolStructuredData } from '@/lib/structured-data';

export const metadata: Metadata = {
  title: 'Password Generator',
  description: 'Generate strong, secure, random passwords with customizable options. Uses cryptographically secure randomness. 100% private — runs in your browser.',
  keywords: ['password generator', 'secure password', 'random password', 'strong password'],
};

export default function Page() {
  return (
    <>
      <StructuredData data={getToolStructuredData('password-generator')} />
      <PasswordGenerator />
    </>
  );
}
