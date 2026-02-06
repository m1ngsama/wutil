'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function Base64ConverterComponent() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!input) {
      setOutput('');
      setError(null);
      return;
    }

    try {
      if (mode === 'encode') {
        setOutput(btoa(input));
      } else {
        setOutput(atob(input));
      }
      setError(null);
    } catch {
      setError('Invalid input for decoding');
      setOutput('');
    }
  }, [input, mode]);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast.success('Result copied to clipboard');
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
            Base64 Converter
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Encode and decode Base64 strings instantly.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
           <span className="relative z-0 inline-flex shadow-sm rounded-md">
            <button
              type="button"
              onClick={() => setMode('encode')}
              className={`relative inline-flex items-center px-4 py-2 rounded-l-md border text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                mode === 'encode'
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Encode
            </button>
            <button
              type="button"
              onClick={() => setMode('decode')}
              className={`-ml-px relative inline-flex items-center px-4 py-2 rounded-r-md border text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                mode === 'decode'
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Decode
            </button>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {mode === 'encode' ? 'Text Input' : 'Base64 Input'}
          </label>
          <textarea
            className={`w-full h-40 p-4 border rounded-md font-mono text-sm resize-y focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
               error ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
            }`}
            placeholder={mode === 'encode' ? 'Type text to encode...' : 'Paste Base64 to decode...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
           {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
               {mode === 'encode' ? 'Base64 Output' : 'Text Output'}
            </label>
            <button
               onClick={handleCopy}
               disabled={!output}
               className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
             >
               Copy
             </button>
          </div>
          <textarea
            readOnly
            className="w-full h-40 p-4 border border-gray-300 dark:border-gray-700 rounded-md font-mono text-sm resize-y bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            placeholder="Result..."
            value={output}
          />
        </div>
      </div>
    </div>
  );
}
