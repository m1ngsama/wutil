'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  KeyRound,
  Palette,
  Link2,
  CaseSensitive,
  Regex,
  Clock,
  AlignLeft,
  Braces,
  Binary,
  Ruler,
  Hash,
  CalendarDays,
  ImageIcon,
  FilePlus2,
  type LucideIcon,
} from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  category: 'text' | 'data' | 'media' | 'calc' | 'security';
  badge?: string;
}

const tools: Tool[] = [
  { id: 'password-generator', name: 'Password Generator',    description: 'Generate secure, cryptographically random passwords.',      href: '/tools/password-generator', icon: KeyRound,     category: 'security', badge: 'Popular' },
  { id: 'color-converter',    name: 'Color Converter',       description: 'Convert between HEX, RGB, and HSL color formats.',           href: '/tools/color-converter',    icon: Palette,      category: 'data',     badge: 'Popular' },
  { id: 'url-encoder',        name: 'URL Encoder / Decoder', description: 'Encode special characters for URLs or decode them.',          href: '/tools/url-encoder',        icon: Link2,        category: 'data'    },
  { id: 'text-case',          name: 'Text Case Converter',   description: 'Convert to camelCase, snake_case, UPPER, Title, and more.',   href: '/tools/text-case',          icon: CaseSensitive,category: 'text'    },
  { id: 'regex-tester',       name: 'Regex Tester',          description: 'Test regular expressions with real-time match highlighting.',  href: '/tools/regex-tester',       icon: Regex,        category: 'data'    },
  { id: 'timestamp',          name: 'Timestamp Converter',   description: 'Convert Unix timestamps to readable dates and back.',          href: '/tools/timestamp',          icon: Clock,        category: 'calc'    },
  { id: 'word-counter',       name: 'Word Counter',          description: 'Count words, characters, and sentences.',                     href: '/tools/word-counter',       icon: AlignLeft,    category: 'text'    },
  { id: 'json-formatter',     name: 'JSON Formatter',        description: 'Format, validate, and minify JSON.',                          href: '/tools/json-formatter',     icon: Braces,       category: 'data'    },
  { id: 'base64-converter',   name: 'Base64 Converter',      description: 'Encode and decode Base64 strings.',                           href: '/tools/base64-converter',   icon: Binary,       category: 'text'    },
  { id: 'unit-converter',     name: 'Unit Converter',        description: 'Convert common units of measurement.',                        href: '/tools/unit-converter',     icon: Ruler,        category: 'calc'    },
  { id: 'hash-generator',     name: 'Hash Generator',        description: 'Generate SHA-1, SHA-256 hashes.',                            href: '/tools/hash-generator',     icon: Hash,         category: 'security'},
  { id: 'date-calculator',    name: 'Date Calculator',       description: 'Calculate duration between dates.',                           href: '/tools/date-calculator',    icon: CalendarDays, category: 'calc'    },
  { id: 'image-converter',    name: 'Image Converter',       description: 'Convert, resize, and compress images.',                       href: '/tools/image-converter',    icon: ImageIcon,    category: 'media'   },
  { id: 'pdf-merge',          name: 'PDF Merger',            description: 'Combine multiple PDF files into one.',                        href: '/tools/pdf-merge',          icon: FilePlus2,    category: 'media'   },
];

const categories = [
  { id: 'all',      name: 'All Tools'    },
  { id: 'text',     name: 'Text'         },
  { id: 'data',     name: 'Data & Dev'   },
  { id: 'media',    name: 'Images & PDF' },
  { id: 'calc',     name: 'Calculators'  },
  { id: 'security', name: 'Security'     },
];

export default function HomeClient() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredTools = tools.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">

      {/* Hero */}
      <header className="mb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-3 mb-3">
          {tools.length} tools — all free, all private
        </p>
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl text-ink leading-none mb-4">
          Web Utilities
        </h1>
        <p className="text-base text-ink-2 max-w-[48ch] leading-relaxed mb-8">
          Fast tools that run entirely in your browser.
          Nothing is uploaded. Nothing is stored.
        </p>

        <div className="relative max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <Input
            type="text"
            className="pl-9 h-10"
            placeholder="Search tools…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Tool grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.id}
                href={tool.href}
                className="group flex flex-col bg-surface border border-edge rounded-xl p-5 hover:border-edge-strong hover:bg-muted transition-colors"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-muted border border-edge text-ink-2 group-hover:text-accent group-hover:border-accent group-hover:bg-accent-subtle transition-colors">
                    <Icon size={17} strokeWidth={1.75} />
                  </div>
                  {tool.badge && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-accent-subtle text-accent rounded">
                      {tool.badge}
                    </span>
                  )}
                </div>
                <h2 className="text-sm font-semibold text-ink group-hover:text-accent transition-colors mb-1">
                  {tool.name}
                </h2>
                <p className="text-xs text-ink-2 leading-relaxed line-clamp-2">
                  {tool.description}
                </p>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="py-20">
          <p className="text-ink-3 text-sm mb-3">
            No tools found for &ldquo;{search}&rdquo;
          </p>
          <button
            onClick={() => { setSearch(''); setActiveCategory('all'); }}
            className="text-xs font-semibold uppercase tracking-wider text-accent hover:underline underline-offset-4"
          >
            Clear filters
          </button>
        </div>
      )}

    </div>
  );
}
