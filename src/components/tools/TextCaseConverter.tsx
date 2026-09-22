'use client';

import { useState } from 'react';
import { ToolPage } from '@/components/tools/ToolPage';
import { CopyButton } from '@/components/ui/CopyButton';

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
  const [selected, setSelected] = useState(0);

  const activeCase  = cases[selected];
  const outputText  = input ? activeCase.fn(input) : '';

  return (
    <ToolPage
      toolId="text-case"
      title="Text Case Converter"
      description="Paste text, pick a format, and preview the result before copying."
      width="wide"
    >

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-x-6">
          <div className="flex flex-col lg:col-start-1">
            <div className="field-header">
              <label htmlFor="text-case-input" className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">Input</label>
              {input && (
                <button
                  type="button"
                  onClick={() => setInput('')}
                  className="min-h-11 rounded-sm px-2 text-xs font-semibold text-ink-3 hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] fine-pointer:min-h-8"
                >
                  Clear
                </button>
              )}
            </div>
            <textarea
              id="text-case-input"
              className="h-40 w-full p-4 rounded-lg border border-edge bg-surface text-ink text-sm font-mono resize-none placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)] focus:ring-offset-1 transition-colors"
              placeholder="Type or paste your text here…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
            />
          </div>

          <div className="order-last grid grid-cols-1 gap-2 sm:grid-cols-2 lg:order-none lg:col-start-1">
            {cases.map(({ label, fn, example }, i) => {
              const preview = input ? fn(input) : example;
              const active = selected === i;
              return (
                <button
                  type="button"
                  key={label}
                  onClick={() => setSelected(i)}
                  aria-pressed={active}
                  className={[
                    'flex flex-col text-left px-4 py-3 rounded-lg border transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)]',
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

        <div className="flex flex-col lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div className="field-header">
            <label htmlFor="text-case-output" className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">
              {activeCase.label}
            </label>
            <CopyButton value={outputText} />
          </div>
          <textarea
            id="text-case-output"
            readOnly
            className="h-32 w-full flex-1 p-4 rounded-lg border border-edge bg-muted lg:h-auto lg:min-h-[20rem] text-ink text-sm font-mono resize-none placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)] focus:ring-offset-2 focus:ring-offset-canvas"
            placeholder="Enter text to see the result…"
            value={outputText}
            spellCheck={false}
          />
        </div>
      </div>
    </ToolPage>
  );
}
