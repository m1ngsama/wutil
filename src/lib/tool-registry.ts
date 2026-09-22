export type ToolCategory = 'text' | 'data' | 'media' | 'calc' | 'security';

export interface ToolRegistryItem {
  id: string;
  name: string;
  description: string;
  href: `/tools/${string}`;
  category: ToolCategory;
  keywords: readonly string[];
  aliases?: readonly string[];
  badge?: string;
  relatedIds: readonly string[];
}

export const TOOL_CATEGORY_NAMES: Record<ToolCategory, string> = {
  text: 'Text',
  data: 'Data & Dev',
  media: 'Images & PDF',
  calc: 'Calculators',
  security: 'Security',
};

export const TOOL_REGISTRY: ToolRegistryItem[] = [
  { id: 'password-generator', name: 'Password Generator', description: 'Generate secure, cryptographically random passwords.', href: '/tools/password-generator', category: 'security', keywords: ['password', 'passphrase', 'random', 'secure', 'credentials'], aliases: ['random password', 'secure password'], badge: 'Popular', relatedIds: ['hash-generator', 'base64-converter'] },
  { id: 'color-converter', name: 'Color Converter', description: 'Convert between HEX, RGB, and HSL color formats.', href: '/tools/color-converter', category: 'data', keywords: ['color', 'colour', 'hex', 'rgb', 'hsl', 'picker'], aliases: ['colour converter', 'color picker', 'hex converter'], badge: 'Popular', relatedIds: ['image-converter', 'unit-converter'] },
  { id: 'url-encoder', name: 'URL Encoder / Decoder', description: 'Encode special characters for URLs or decode them.', href: '/tools/url-encoder', category: 'data', keywords: ['url', 'uri', 'percent', 'escape', 'unescape', 'encode', 'decode'], aliases: ['percent encoder', 'uri encoder'], relatedIds: ['base64-converter', 'json-formatter', 'regex-tester'] },
  { id: 'text-case', name: 'Text Case Converter', description: 'Convert to camelCase, snake_case, UPPER, Title, and more.', href: '/tools/text-case', category: 'text', keywords: ['uppercase', 'lowercase', 'title', 'sentence', 'camel', 'pascal', 'snake', 'kebab'], aliases: ['change text case', 'capitalization converter'], relatedIds: ['word-counter', 'base64-converter'] },
  { id: 'regex-tester', name: 'Regex Tester', description: 'Test regular expressions with real-time match highlighting.', href: '/tools/regex-tester', category: 'data', keywords: ['regex', 'regexp', 'pattern', 'matches', 'capture groups'], aliases: ['regular expression tester', 'pattern matcher'], relatedIds: ['json-formatter', 'url-encoder', 'text-case'] },
  { id: 'timestamp', name: 'Timestamp Converter', description: 'Convert Unix timestamps to readable dates and back.', href: '/tools/timestamp', category: 'calc', keywords: ['timestamp', 'unix', 'epoch', 'iso', 'utc', 'date', 'time'], aliases: ['unix time converter', 'epoch converter', 'date to timestamp'], relatedIds: ['date-calculator', 'unit-converter'] },
  { id: 'word-counter', name: 'Word Counter', description: 'Count words, characters, and sentences.', href: '/tools/word-counter', category: 'text', keywords: ['words', 'characters', 'letters', 'sentences', 'paragraphs', 'reading time', 'text length'], aliases: ['character counter', 'letter count', 'text counter'], relatedIds: ['text-case', 'base64-converter'] },
  { id: 'json-formatter', name: 'JSON Formatter', description: 'Format, validate, and minify JSON.', href: '/tools/json-formatter', category: 'data', keywords: ['json', 'format', 'validate', 'minify', 'beautify', 'prettify', 'code'], aliases: ['json beautifier', 'json validator', 'format json'], relatedIds: ['regex-tester', 'base64-converter', 'url-encoder'] },
  { id: 'base64-converter', name: 'Base64 Converter', description: 'Encode and decode Base64 strings.', href: '/tools/base64-converter', category: 'text', keywords: ['base64', 'b64', 'encode', 'decode', 'unicode', 'binary'], aliases: ['base 64 encoder', 'base 64 decoder'], relatedIds: ['url-encoder', 'json-formatter', 'hash-generator'] },
  { id: 'unit-converter', name: 'Unit Converter', description: 'Convert common units of measurement.', href: '/tools/unit-converter', category: 'calc', keywords: ['units', 'measurement', 'length', 'weight', 'mass', 'temperature', 'metric', 'imperial'], aliases: ['measurement converter', 'metric converter'], relatedIds: ['date-calculator', 'timestamp'] },
  { id: 'hash-generator', name: 'Hash Generator', description: 'Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes.', href: '/tools/hash-generator', category: 'security', keywords: ['hash', 'checksum', 'digest', 'sha1', 'sha256', 'sha384', 'sha512'], aliases: ['sha generator', 'checksum generator'], relatedIds: ['password-generator', 'base64-converter'] },
  { id: 'date-calculator', name: 'Date Calculator', description: 'Calculate duration between dates.', href: '/tools/date-calculator', category: 'calc', keywords: ['date', 'days', 'duration', 'difference', 'add', 'subtract', 'calendar'], aliases: ['days between dates', 'add days', 'subtract days'], relatedIds: ['timestamp', 'unit-converter'] },
  { id: 'image-converter', name: 'Image Converter', description: 'Convert, resize, and compress images.', href: '/tools/image-converter', category: 'media', keywords: ['image', 'picture', 'photo', 'resize', 'compress', 'jpeg', 'jpg', 'png', 'webp'], aliases: ['picture converter', 'photo converter', 'image compressor'], relatedIds: ['color-converter', 'pdf-merge'] },
  { id: 'pdf-merge', name: 'PDF Merger', description: 'Combine multiple PDF files into one.', href: '/tools/pdf-merge', category: 'media', keywords: ['pdf', 'merge', 'combine', 'join', 'files', 'documents'], aliases: ['merge files', 'combine pdfs', 'join pdf files', 'pdf combiner'], relatedIds: ['image-converter'] },
];

export const TOOL_REGISTRY_BY_ID = new Map(TOOL_REGISTRY.map((tool) => [tool.id, tool]));

const SEARCH_SYNONYM_GROUPS: readonly (readonly string[])[] = [
  ['color', 'colour'],
  ['image', 'picture', 'pictures', 'photo', 'photos'],
  ['merge', 'combine', 'join'],
  ['format', 'beautify', 'prettify'],
  ['regex', 'regexp'],
  ['timestamp', 'epoch'],
  ['hash', 'checksum', 'digest'],
  ['characters', 'character', 'chars', 'letters'],
  ['url', 'uri'],
];

function normalizeToolSearch(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function getSearchTokenVariants(token: string): readonly string[] {
  return SEARCH_SYNONYM_GROUPS.find((group) => group.includes(token)) ?? [token];
}

function getToolSearchTokens(tool: ToolRegistryItem): string[] {
  return normalizeToolSearch([
    tool.name,
    tool.description,
    TOOL_CATEGORY_NAMES[tool.category],
    ...tool.keywords,
    ...(tool.aliases ?? []),
  ].join(' ')).split(' ').filter(Boolean);
}

export function matchesToolSearch(tool: ToolRegistryItem, query: string): boolean {
  const queryTokens = normalizeToolSearch(query).split(' ').filter(Boolean);
  if (queryTokens.length === 0) return true;

  const toolTokens = getToolSearchTokens(tool);
  return queryTokens.every((queryToken) => {
    if (toolTokens.some((toolToken) => toolToken.includes(queryToken))) return true;
    return getSearchTokenVariants(queryToken).some(
      (variant) => variant !== queryToken && toolTokens.includes(variant),
    );
  });
}

function getToolSearchScore(tool: ToolRegistryItem, query: string): number {
  const normalizedQuery = normalizeToolSearch(query);
  if (!normalizedQuery) return 5;

  const normalizedName = normalizeToolSearch(tool.name);
  const normalizedAliases = (tool.aliases ?? []).map(normalizeToolSearch);
  const normalizedKeywords = tool.keywords.map(normalizeToolSearch);

  if (normalizedName === normalizedQuery) return 0;
  if (normalizedName.startsWith(normalizedQuery)) return 1;
  if (normalizedName.includes(normalizedQuery)) return 2;
  if (normalizedAliases.some((alias) => alias === normalizedQuery)) return 3;
  if (normalizedAliases.some((alias) => alias.includes(normalizedQuery))) return 4;
  if (normalizedKeywords.some((keyword) => keyword.includes(normalizedQuery))) return 5;
  return 6;
}

export function searchTools(
  query: string,
  tools: readonly ToolRegistryItem[] = TOOL_REGISTRY,
): ToolRegistryItem[] {
  return tools
    .map((tool, index) => ({ tool, index, score: getToolSearchScore(tool, query) }))
    .filter(({ tool }) => matchesToolSearch(tool, query))
    .sort((left, right) => left.score - right.score || left.index - right.index)
    .map(({ tool }) => tool);
}

export function getRelatedTools(toolId: string): ToolRegistryItem[] {
  const tool = TOOL_REGISTRY_BY_ID.get(toolId);
  if (!tool) return [];
  return tool.relatedIds.flatMap((relatedId) => {
    const relatedTool = TOOL_REGISTRY_BY_ID.get(relatedId);
    return relatedTool ? [relatedTool] : [];
  });
}

export const STATIC_ROUTES = ['', '/privacy', '/changelog'] as const;
export const TOOL_ROUTES = TOOL_REGISTRY.map((tool) => tool.href);
export const SITEMAP_ROUTES = [...STATIC_ROUTES, ...TOOL_ROUTES];
