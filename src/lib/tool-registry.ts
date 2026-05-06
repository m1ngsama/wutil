export type ToolCategory = 'text' | 'data' | 'media' | 'calc' | 'security';

export interface ToolRegistryItem {
  id: string;
  name: string;
  description: string;
  href: `/tools/${string}`;
  category: ToolCategory;
  badge?: string;
}

export const TOOL_REGISTRY: ToolRegistryItem[] = [
  { id: 'password-generator', name: 'Password Generator', description: 'Generate secure, cryptographically random passwords.', href: '/tools/password-generator', category: 'security', badge: 'Popular' },
  { id: 'color-converter', name: 'Color Converter', description: 'Convert between HEX, RGB, and HSL color formats.', href: '/tools/color-converter', category: 'data', badge: 'Popular' },
  { id: 'url-encoder', name: 'URL Encoder / Decoder', description: 'Encode special characters for URLs or decode them.', href: '/tools/url-encoder', category: 'data' },
  { id: 'text-case', name: 'Text Case Converter', description: 'Convert to camelCase, snake_case, UPPER, Title, and more.', href: '/tools/text-case', category: 'text' },
  { id: 'regex-tester', name: 'Regex Tester', description: 'Test regular expressions with real-time match highlighting.', href: '/tools/regex-tester', category: 'data' },
  { id: 'timestamp', name: 'Timestamp Converter', description: 'Convert Unix timestamps to readable dates and back.', href: '/tools/timestamp', category: 'calc' },
  { id: 'word-counter', name: 'Word Counter', description: 'Count words, characters, and sentences.', href: '/tools/word-counter', category: 'text' },
  { id: 'json-formatter', name: 'JSON Formatter', description: 'Format, validate, and minify JSON.', href: '/tools/json-formatter', category: 'data' },
  { id: 'base64-converter', name: 'Base64 Converter', description: 'Encode and decode Base64 strings.', href: '/tools/base64-converter', category: 'text' },
  { id: 'unit-converter', name: 'Unit Converter', description: 'Convert common units of measurement.', href: '/tools/unit-converter', category: 'calc' },
  { id: 'hash-generator', name: 'Hash Generator', description: 'Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes.', href: '/tools/hash-generator', category: 'security' },
  { id: 'date-calculator', name: 'Date Calculator', description: 'Calculate duration between dates.', href: '/tools/date-calculator', category: 'calc' },
  { id: 'image-converter', name: 'Image Converter', description: 'Convert, resize, and compress images.', href: '/tools/image-converter', category: 'media' },
  { id: 'pdf-merge', name: 'PDF Merger', description: 'Combine multiple PDF files into one.', href: '/tools/pdf-merge', category: 'media' },
];

export const STATIC_ROUTES = ['', '/privacy'] as const;
export const TOOL_ROUTES = TOOL_REGISTRY.map((tool) => tool.href);
export const SITEMAP_ROUTES = [...STATIC_ROUTES, ...TOOL_ROUTES];
