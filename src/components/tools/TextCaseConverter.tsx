'use client';

import { useState } from 'react';
import { copyText } from '@/lib/clipboard';

function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
}
function toCamelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[A-Z]/, (c) => c.toLowerCase());
}
function toPascalCase(str: string): string {
  const c = toCamelCase(str);
  return c.charAt(0).toUpperCase() + c.slice(1);
}
function toSnakeCase(str: string): string {
  return str.replace(/([A-Z])/g, '_$1').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '').toLowerCase();
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

const cases = [
  { label: 'UPPER CASE',    fn: (s: string) => s.toUpperCase(),  example: 'HELLO WORLD'  },
  { label: 'lower case',    fn: (s: string) => s.toLowerCase(),  example: 'hello world'  },
  { label: 'Title Case',    fn: toTitleCase,                     example: 'Hello World'  },
  { label: 'Sentence case', fn: toSentenceCase,                  example: 'Hello world'  },
  { label: 'camelCase',     fn: toCamelCase,                     example: 'helloWorld'   },
  { label: 'PascalCase',    fn: toPascalCase,                    example: 'HelloWorld'   },
  { label: 'snake_case',    fn: toSnakeCase,                     example: 'hello_world'  },
  { label: 'kebab-case',    fn: toKebabCase,                     example: 'hello-world'  },
  { label: 'CONSTANT_CASE', fn: toConstantCase,                  example: 'HELLO_WORLD'  },
];

export default function TextCaseConverter() {
  const [input, setInput]       = useState('');
  const [selected, setSelected] = useState<number | null>(null);

  const activeCase  = selected !== null ? cases[selected] : null;
  const outputText  = activeCase && input ? activeCase.fn(input) : '';

  const handleSelect = (i: number) => {
    setSelected(i);
  };

  const handleCopy = () => {
    if (!outputText) return;
    void copyText(outputText);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-3 mb-2">Text</p>
        <h1 className="font-display text-4xl sm:text-5xl text-ink leading-none mb-3">Text Case Converter</h1>
        <p className="text-base text-ink-2 max-w-[50ch]">Paste text, pick a format — see the result before copying.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: input + format picker */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">Input</label>
            <textarea
              className="h-40 w-full p-4 rounded-lg border border-edge bg-surface text-ink text-sm font-mono resize-none placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)] focus:ring-offset-1 transition-colors"
              placeholder="Type or paste your text here…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
            />
            {input && (
              <button
                onClick={() => { setInput(''); setSelected(null); }}
                className="self-start text-xs font-semibold text-ink-3 hover:text-ink transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Case selector grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {cases.map(({ label, fn, example }, i) => {
              const preview = input ? fn(input) : example;
              const active = selected === i;
              return (
                <button
                  key={label}
                  onClick={() => handleSelect(i)}
                  disabled={!input}
                  className={[
                    'flex flex-col text-left px-4 py-3 rounded-lg border transition-colors',
                    'disabled:opacity-40 disabled:pointer-events-none',
                    active
                      ? 'border-accent bg-accent-subtle'
                      : 'border-edge bg-surface hover:border-edge-strong hover:bg-muted',
                  ].join(' ')}
                >
                  <span className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${active ? 'text-accent' : 'text-ink-3'}`}>
                    {label}
                  </span>
                  <span className={`font-mono text-xs truncate ${active ? 'text-accent' : 'text-ink-2'}`}>
                    {preview}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: output */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">
              {activeCase ? activeCase.label : 'Output'}
            </label>
            <button
              onClick={handleCopy}
              disabled={!outputText}
              className="text-xs font-semibold text-accent hover:underline underline-offset-4 disabled:opacity-35 disabled:pointer-events-none"
            >
              Copy
            </button>
          </div>
          <textarea
            readOnly
            className="flex-1 min-h-[20rem] w-full p-4 rounded-lg border border-edge bg-muted text-ink text-sm font-mono resize-none placeholder:text-ink-3 focus:outline-none"
            placeholder={activeCase ? 'Select text and a format to see output…' : 'Pick a format on the left…'}
            value={outputText}
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
