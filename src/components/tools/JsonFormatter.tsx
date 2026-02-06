'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export default function JsonFormatterComponent() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const formatJson = () => {
    try {
      if (!input.trim()) return;
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError(null);
      toast.success('JSON formatted successfully');
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
      toast.error('Invalid JSON');
    }
  };

  const minifyJson = () => {
    try {
      if (!input.trim()) return;
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError(null);
      toast.success('JSON minified successfully');
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
      toast.error('Invalid JSON');
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
            JSON Formatter & Validator
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Beautify, minify, and validate your JSON data.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-16rem)]">
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Input</label>
          <textarea
            className={`flex-1 w-full p-4 border rounded-md font-mono text-sm resize-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
              error ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
            }`}
            placeholder="Paste your JSON here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>

        <div className="flex flex-col">
           <div className="flex justify-between items-center mb-2">
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Output</label>
             <div className="space-x-2">
               <button
                 onClick={formatJson}
                 className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
               >
                 Format
               </button>
               <button
                 onClick={minifyJson}
                 className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
               >
                 Minify
               </button>
               <button
                 onClick={handleCopy}
                 disabled={!output}
                 className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
               >
                 Copy
               </button>
             </div>
           </div>
          <textarea
            readOnly
            className="flex-1 w-full p-4 border border-gray-300 dark:border-gray-700 rounded-md font-mono text-sm resize-none bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            placeholder="Result will appear here..."
            value={output}
          />
        </div>
      </div>
    </div>
  );
}
