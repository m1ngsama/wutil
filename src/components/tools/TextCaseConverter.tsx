'use client';

import { useState } from 'react';
import { toast } from 'sonner';

function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
}

function toCamelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[A-Z]/, (c) => c.toLowerCase());
}

function toPascalCase(str: string): string {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase();
}

function toKebabCase(str: string): string {
  return toSnakeCase(str).replace(/_/g, '-');
}

function toConstantCase(str: string): string {
  return toSnakeCase(str).toUpperCase();
}

function toSentenceCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function toAlternatingCase(str: string): string {
  return str.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('');
}

const cases = [
  { label: 'UPPER CASE', fn: (s: string) => s.toUpperCase(), example: 'HELLO WORLD' },
  { label: 'lower case', fn: (s: string) => s.toLowerCase(), example: 'hello world' },
  { label: 'Title Case', fn: toTitleCase, example: 'Hello World' },
  { label: 'Sentence case', fn: toSentenceCase, example: 'Hello world' },
  { label: 'camelCase', fn: toCamelCase, example: 'helloWorld' },
  { label: 'PascalCase', fn: toPascalCase, example: 'HelloWorld' },
  { label: 'snake_case', fn: toSnakeCase, example: 'hello_world' },
  { label: 'kebab-case', fn: toKebabCase, example: 'hello-world' },
  { label: 'CONSTANT_CASE', fn: toConstantCase, example: 'HELLO_WORLD' },
  { label: 'aLtErNaTiNg', fn: toAlternatingCase, example: 'hElLo WoRlD' },
];

export default function TextCaseConverter() {
  const [input, setInput] = useState('');

  const convert = (fn: (s: string) => string) => {
    const result = fn(input);
    navigator.clipboard.writeText(result);
    toast.success('Converted & copied!');
    return result;
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Text Case Converter</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Convert text to any case format instantly. Click a format to convert and copy.
        </p>
      </div>

      <div className="mb-6">
        <textarea
          className="w-full h-36 p-4 border border-gray-300 dark:border-gray-700 rounded-xl font-mono text-sm resize-y focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Type or paste your text here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setInput('')}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Clear
          </button>
          <button
            onClick={() => { navigator.clipboard.writeText(input); toast.success('Copied!'); }}
            disabled={!input}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40"
          >
            Copy Input
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cases.map(({ label, fn, example }) => {
          const preview = input ? fn(input) : example;
          const isFromInput = !!input;
          return (
            <button
              key={label}
              onClick={() => convert(fn)}
              disabled={!input}
              className="group flex flex-col text-left p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1.5">
                {label}
              </span>
              <span className={`font-mono text-sm truncate ${isFromInput ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-600'}`}>
                {preview}
              </span>
              <span className="mt-2 text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to convert &amp; copy →
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
