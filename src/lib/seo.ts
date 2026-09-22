import type { Metadata } from 'next';
import { absoluteUrl, SITE_NAME } from './site-config.ts';

const OG_IMAGE = { url: '/og-image.png', width: 1200, height: 630, alt: 'wutil - Web Utilities' };

const TOOL_SEO: Record<string, [title: string, description: string]> = {
  'password-generator': ['Password Generator', 'Generate strong, secure, random passwords with customizable options. Uses cryptographically secure randomness and runs privately in your browser.'],
  'color-converter': ['Color Converter', 'Convert colors between HEX, RGB, and HSL formats instantly. Includes a color picker and quick preset colors.'],
  'url-encoder': ['URL Encoder / Decoder', 'Encode and decode URLs instantly. Safely encode special characters for use in URLs, or decode percent-encoded strings back to readable text.'],
  'text-case': ['Text Case Converter', 'Convert text to UPPER CASE, lower case, Title Case, camelCase, PascalCase, snake_case, kebab-case, and more instantly.'],
  'regex-tester': ['Regex Tester', 'Test and debug regular expressions with real-time match highlighting. Supports all JavaScript regex flags and shows match groups.'],
  'timestamp': ['Timestamp Converter', 'Convert Unix timestamps to human-readable dates and vice versa. Shows current Unix time and converts to ISO 8601, UTC, local time, and more.'],
  'word-counter': ['Word Counter - Character & Sentence Count', 'Free online word counter, character counter, and sentence counter. Real-time statistics for your text.'],
  'json-formatter': ['JSON Formatter & Validator - Beautify JSON Online', 'Free online JSON formatter, validator, and minifier. Beautify your JSON code instantly.'],
  'base64-converter': ['Base64 Converter - Encode & Decode Online', 'Free online Base64 encoder and decoder. Convert text to Base64 and vice versa instantly.'],
  'unit-converter': ['Unit Converter - Length, Weight, Temperature', 'Free online unit converter for length, weight, mass, and temperature. Convert between metric and imperial units.'],
  'hash-generator': ['Hash Generator - SHA1, SHA256, SHA384, SHA512 Online', 'Free online hash generator. Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes securely in your browser.'],
  'uuid-generator': ['UUID Generator (v4 & v7)', 'Generate RFC 9562 UUID v4 and time-sortable UUID v7 identifiers in batches. Choose case and hyphen formatting, copy, or download locally.'],
  'date-calculator': ['Date Calculator - Days Between Dates', 'Free online date calculator. Calculate the duration between two dates in days, weeks, months, and years.'],
  'image-converter': ['Image Converter & Compressor - JPG, PNG, WebP', 'Free online image converter and compressor. Convert, resize, and compress images entirely in your browser without uploading.'],
  'pdf-merge': ['PDF Merger - Combine PDFs Online Free', 'Free online PDF merger. Combine multiple PDF files into one document securely in your browser, up to 10 MB per file.'],
};

export function createPageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: '' | `/${string}`;
}): Metadata {
  const canonicalPath = path || '/';
  const socialTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: 'website',
      url: absoluteUrl(canonicalPath),
      siteName: SITE_NAME,
      title: socialTitle,
      description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      images: [OG_IMAGE],
    },
  };
}

export function toolMetadata(id: string): Metadata {
  const [title, description] = TOOL_SEO[id];
  return createPageMetadata({ title, description, path: `/tools/${id}` });
}
