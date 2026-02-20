'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function HashGeneratorComponent() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<{ name: string; value: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    let active = true;

    const generateHashes = async () => {
      if (!input) {
        if (active) setHashes([]);
        return;
      }

      setIsGenerating(true);
      
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(input);

        const algos = [
          { name: 'SHA-1', algo: 'SHA-1' },
          { name: 'SHA-256', algo: 'SHA-256' },
          { name: 'SHA-384', algo: 'SHA-384' },
          { name: 'SHA-512', algo: 'SHA-512' },
        ];

        const results = await Promise.all(
          algos.map(async ({ name, algo }) => {
            const hashBuffer = await crypto.subtle.digest(algo, data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
            return { name, value: hashHex };
          })
        );
        
        if (active) setHashes(results);
      } catch (error) {
        console.error("Hashing failed", error);
      } finally {
        if (active) setIsGenerating(false);
      }
    };

    generateHashes();

    return () => {
      active = false;
    };
  }, [input]);

  const copyToClipboard = (text: string, name: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${name} hash copied!`);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
            Hash Generator
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes securely in your browser.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Input Text</label>
          <textarea
            className="w-full h-32 p-4 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-y"
            placeholder="Type text here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          {hashes.map((hash) => (
            <div key={hash.name} className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{hash.name}</label>
              <div className="flex rounded-md shadow-sm">
                <input
                  type="text"
                  readOnly
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 sm:text-sm font-mono"
                  value={hash.value}
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(hash.value, hash.name)}
                  className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-r-md text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <span>Copy</span>
                </button>
              </div>
            </div>
          ))}
          {isGenerating && input && (
             <p className="text-gray-500">Generating...</p>
          )}
          {!input && (
            <p className="text-gray-500 italic">Enter text above to generate hashes.</p>
          )}
        </div>
      </div>
    </div>
  );
}
