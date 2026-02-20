'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';

export default function Base64Converter() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const { output, error } = (() => {
    if (!input) return { output: '', error: null };
    try {
      if (mode === 'encode') {
        return { output: btoa(input), error: null };
      } else {
        return { output: atob(input), error: null };
      }
    } catch {
      return { output: '', error: 'Invalid input for decoding' };
    }
  })();

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast.success('Result copied to clipboard');
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Base64 Converter
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Encode text to Base64 or decode Base64 strings to text instantly.
        </p>
      </div>

      <Card className="shadow-lg border-t-4 border-t-blue-600 dark:border-t-blue-500">
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 pb-6 border-b dark:border-gray-800">
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg inline-flex">
            <button
              onClick={() => setMode('encode')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                mode === 'encode'
                  ? 'bg-white dark:bg-gray-900 text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Encode
            </button>
            <button
              onClick={() => setMode('decode')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                mode === 'decode'
                  ? 'bg-white dark:bg-gray-900 text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Decode
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setInput('')}>
            Clear Input
          </Button>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-base">
                {mode === 'encode' ? 'Text Input' : 'Base64 Input'}
              </Label>
              <div className="relative">
                <Textarea
                  placeholder={mode === 'encode' ? 'Type or paste text to encode...' : 'Paste Base64 string to decode...'}
                  className={`min-h-[300px] font-mono text-sm resize-none p-4 transition-colors ${
                    error ? 'border-red-500 focus-visible:ring-red-500' : ''
                  }`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                {error && (
                  <div className="absolute bottom-4 left-4 text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                    {error}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center h-6">
                <Label className="text-base">
                  {mode === 'encode' ? 'Base64 Output' : 'Text Output'}
                </Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCopy} 
                  disabled={!output}
                  className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  Copy Result
                </Button>
              </div>
              <Textarea
                readOnly
                className="min-h-[300px] font-mono text-sm resize-none bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-300"
                value={output}
                placeholder="Result will appear here..."
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
