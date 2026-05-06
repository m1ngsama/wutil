import { Metadata } from 'next';
import HashGeneratorComponent from '@/components/tools/HashGenerator';

export const metadata: Metadata = {
  title: "Hash Generator - SHA1, SHA256, SHA384, SHA512 Online",
  description: "Free online hash generator. Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes securely in your browser.",
  keywords: ["hash generator", "sha256 generator", "sha1 generator", "sha384 generator", "sha512 generator", "online hash tool", "cryptography"],
};

export default function Page() {
  return <HashGeneratorComponent />;
}
