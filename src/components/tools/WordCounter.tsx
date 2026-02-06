'use client';

import { useState, useMemo } from 'react';

export default function WordCounter() {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) {
      return { words: 0, chars: 0, charsNoSpaces: 0, sentences: 0, paragraphs: 0 };
    }

    const words = trimmed.split(/\s+/).length;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const sentences = text.split(/[.!?]+/).filter(Boolean).length;
    const paragraphs = text.split(/\n+/).filter(Boolean).length;

    return { words, chars, charsNoSpaces, sentences, paragraphs };
  }, [text]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
            Word Counter
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Count words, characters, and analyze your text.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
            <textarea
              className="w-full h-96 p-4 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-y"
              placeholder="Type or paste your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="mt-4 flex space-x-3">
              <button
                onClick={() => setText('')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(text)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Copy Text
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Statistics
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-1">
                <StatItem label="Words" value={stats.words} />
                <StatItem label="Characters" value={stats.chars} />
                <StatItem label="Characters (no spaces)" value={stats.charsNoSpaces} />
                <StatItem label="Sentences" value={stats.sentences} />
                <StatItem label="Paragraphs" value={stats.paragraphs} />
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 prose dark:prose-invert max-w-none">
        <h3>How to use the Word Counter</h3>
        <p>
          This free online Word Counter tool is designed to provide real-time statistics for your text. 
          Simply type or paste your content into the text area above, and the tool will instantly calculate:
        </p>
        <ul>
          <li><strong>Word Count:</strong> The total number of words in your text.</li>
          <li><strong>Character Count:</strong> The total number of characters, including spaces and punctuation.</li>
          <li><strong>Sentences & Paragraphs:</strong> Useful for checking the structure and readability of your writing.</li>
        </ul>
        <p>
          All processing happens directly in your browser using JavaScript. No text is sent to any server, 
          ensuring 100% privacy and security for your documents.
        </p>
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="px-4 py-5 bg-gray-50 dark:bg-gray-900 shadow rounded-lg overflow-hidden sm:p-6">
      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
        {label}
      </dt>
      <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
        {value}
      </dd>
    </div>
  );
}
