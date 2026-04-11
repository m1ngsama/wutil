'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function UrlEncoderDecoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!input.trim()) {
      setOutput('');
      setError(null);
      return;
    }
    try {
      if (mode === 'encode') {
        setOutput(encodeURIComponent(input));
      } else {
        setOutput(decodeURIComponent(input));
      }
      setError(null);
    } catch {
      setError('Invalid encoded string');
      setOutput('');
    }
  }, [input, mode]);

  const swap = () => {
    setInput(output);
    setMode((m) => (m === 'encode' ? 'decode' : 'encode'));
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">URL Encoder / Decoder</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Encode special characters for safe URLs, or decode encoded URLs back to readable text.
        </p>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <span className="relative z-0 inline-flex shadow-sm rounded-md">
          {(['encode', 'decode'] as const).map((m, i) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                i === 0 ? 'rounded-l-md' : '-ml-px rounded-r-md'
              } ${
                mode === m
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </span>

        <button
          onClick={swap}
          disabled={!output}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          Swap
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {mode === 'encode' ? 'Plain Text / URL' : 'Encoded URL'}
          </label>
          <textarea
            className={`flex-1 min-h-[200px] w-full p-4 border rounded-xl font-mono text-sm resize-y focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
              error ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
            }`}
            placeholder={mode === 'encode' ? 'https://example.com/path?name=hello world&tag=foo&bar' : 'https%3A%2F%2Fexample.com%2Fpath%3Fname%3Dhello%20world'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>

        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {mode === 'encode' ? 'Encoded URL' : 'Decoded Text'}
            </label>
            <button
              onClick={() => { navigator.clipboard.writeText(output); toast.success('Copied!'); }}
              disabled={!output}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-40"
            >
              Copy
            </button>
          </div>
          <textarea
            readOnly
            className="flex-1 min-h-[200px] w-full p-4 border border-gray-300 dark:border-gray-700 rounded-xl font-mono text-sm resize-y bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            placeholder="Result appears here..."
            value={output}
          />
        </div>
      </div>

      {/* Common examples */}
      <div className="mt-8">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Try these examples</p>
        <div className="flex flex-wrap gap-2">
          {[
            'https://example.com/search?q=hello world&lang=en',
            'user@example.com',
            'price: $50 & discount 20%',
          ].map((example) => (
            <button
              key={example}
              onClick={() => { setInput(example); setMode('encode'); }}
              className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 font-mono truncate max-w-[200px]"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
