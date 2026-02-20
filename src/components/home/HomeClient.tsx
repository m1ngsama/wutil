'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

// ... (keep interfaces and data)
interface Tool {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: string;
  category: 'text' | 'data' | 'media' | 'calc';
}

const tools: Tool[] = [
  { id: 'word-counter', name: 'Word Counter', description: 'Count words, characters, and sentences.', href: '/tools/word-counter', icon: '📝', category: 'text' },
  { id: 'json-formatter', name: 'JSON Formatter', description: 'Format, validate, and minify JSON.', href: '/tools/json-formatter', icon: '{}', category: 'data' },
  { id: 'base64-converter', name: 'Base64 Converter', description: 'Encode and decode Base64 strings.', href: '/tools/base64-converter', icon: '🔤', category: 'text' },
  { id: 'unit-converter', name: 'Unit Converter', description: 'Convert common units of measurement.', href: '/tools/unit-converter', icon: '⚖️', category: 'calc' },
  { id: 'hash-generator', name: 'Hash Generator', description: 'Generate SHA-1, SHA-256 hashes.', href: '/tools/hash-generator', icon: '#️⃣', category: 'text' },
  { id: 'date-calculator', name: 'Date Calculator', description: 'Calculate duration between dates.', href: '/tools/date-calculator', icon: '📅', category: 'calc' },
  { id: 'image-converter', name: 'Image Converter', description: 'Convert, resize, and compress images.', href: '/tools/image-converter', icon: '🖼️', category: 'media' },
  { id: 'pdf-merge', name: 'PDF Merger', description: 'Combine multiple PDF files into one.', href: '/tools/pdf-merge', icon: '📄', category: 'media' },
];

const categories = [
  { id: 'all', name: 'All Tools' },
  { id: 'text', name: 'Text' },
  { id: 'media', name: 'Media' },
  { id: 'data', name: 'Dev' },
  { id: 'calc', name: 'Calc' },
];

export default function HomeClient() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredTools = tools.filter((tool) => {
    const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) || 
                          tool.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center mb-16 space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
          <span className="block">Developer Utilities</span>
          <span className="block text-blue-600 dark:text-blue-500">for the Modern Web</span>
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
          Fast, privacy-focused tools running entirely in your browser. <br className="hidden sm:inline" />
          No server uploads, no data collection. Open source.
        </p>
        
        {/* Search */}
        <div className="max-w-md mx-auto relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <Input
            type="text"
            className="pl-10 h-12 text-lg rounded-full shadow-sm border-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(cat.id)}
            className="rounded-full"
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredTools.length > 0 ? (
          filteredTools.map((tool) => (
            <Link key={tool.id} href={tool.href} className="block h-full">
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 dark:hover:border-blue-500/50">
                <CardHeader>
                  <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform">{tool.icon}</div>
                  <CardTitle>{tool.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{tool.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No tools found matching &quot;{search}&quot;</p>
            <Button 
              variant="link"
              onClick={() => { setSearch(''); setActiveCategory('all'); }}
              className="mt-2 text-blue-600"
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
