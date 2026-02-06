'use client';

import Link from 'next/link';
import { useState } from 'react';

interface Tool {
  name: string;
  description: string;
  href: string;
  icon: string;
  category: 'text' | 'data' | 'media' | 'calc';
}

const tools: Tool[] = [
  { name: 'Word Counter', description: 'Count words, characters, and sentences.', href: '/tools/word-counter', icon: '📝', category: 'text' },
  { name: 'JSON Formatter', description: 'Format, validate, and minify JSON.', href: '/tools/json-formatter', icon: '{}', category: 'data' },
  { name: 'Base64 Converter', description: 'Encode and decode Base64 strings.', href: '/tools/base64-converter', icon: '🔤', category: 'text' },
  { name: 'Unit Converter', description: 'Convert common units of measurement.', href: '/tools/unit-converter', icon: '⚖️', category: 'calc' },
  { name: 'Hash Generator', description: 'Generate SHA-1, SHA-256 hashes.', href: '/tools/hash-generator', icon: '#️⃣', category: 'text' },
  { name: 'Date Calculator', description: 'Calculate duration between dates.', href: '/tools/date-calculator', icon: '📅', category: 'calc' },
  { name: 'Image Converter', description: 'Convert, resize, and compress images.', href: '/tools/image-converter', icon: '🖼️', category: 'media' },
  { name: 'PDF Merger', description: 'Combine multiple PDF files into one.', href: '/tools/pdf-merge', icon: '📄', category: 'media' },
];

const categories = [
  { id: 'all', name: 'All Tools' },
  { id: 'text', name: 'Text & Strings' },
  { id: 'media', name: 'Images & PDF' },
  { id: 'data', name: 'Data & Dev' },
  { id: 'calc', name: 'Calculators' },
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
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl mb-4">
          All-in-One <span className="text-blue-600 dark:text-blue-500">Web Utilities</span>
        </h1>
        <p className="max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-400 mb-8">
          Fast, privacy-focused tools running entirely in your browser. <br/>
          No server uploads, no data collection.
        </p>
        
        {/* Search */}
        <div className="max-w-md mx-auto relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-4 border border-gray-300 dark:border-gray-700 rounded-full leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-lg shadow-sm"
            placeholder="Search tools (e.g., pdf, json, image)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredTools.length > 0 ? (
          filteredTools.map((tool) => (
            <Link
              key={tool.name}
              href={tool.href}
              className="group block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl group-hover:scale-110 transition-transform duration-200">{tool.icon}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {tool.name}
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {tool.description}
              </p>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No tools found matching "{search}"</p>
            <button 
              onClick={() => { setSearch(''); setActiveCategory('all'); }}
              className="mt-4 text-blue-600 hover:text-blue-500 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
