'use client';

import { useMemo, useState } from 'react';
import { ExamplePicker } from '@/components/tools/ExamplePicker';
import { ToolPage } from '@/components/tools/ToolPage';
import { decodeBase64, encodeBase64 } from '@/lib/base64-utils';
import { copyText } from '@/lib/clipboard';

const BASE64_EXAMPLES = [
  { id: 'unicode', label: 'Unicode + emoji', value: '你好，世界 👋' },
  { id: 'url', label: 'URL text', value: 'https://example.com/search?q=hello world' },
  { id: 'json', label: 'JSON snippet', value: '{"private":true,"tool":"base64"}' },
] as const;

export default function Base64ConverterComponent() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [urlSafe, setUrlSafe] = useState(false);

  const result = useMemo(() => {
    if (!input) return { output: '', error: null as string | null };
    try {
      return {
        output: mode === 'encode' ? encodeBase64(input, urlSafe) : decodeBase64(input),
        error: null,
      };
    } catch {
      return {
        output: '',
        error: mode === 'decode' ? 'Invalid Base64. Check your input.' : 'Encoding failed.',
      };
    }
  }, [input, mode, urlSafe]);

  const swap = () => {
    setInput(result.output);
    setMode((m) => (m === 'encode' ? 'decode' : 'encode'));
  };

  return (
    <ToolPage
      toolId="base64-converter"
      title="Base64 Converter"
      description="Encode or decode Base64. Supports Unicode, emoji, and URL-safe format."
      width="wide"
    >

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex rounded-md border border-edge overflow-hidden">
          {(['encode', 'decode'] as const).map((m) => (
            <button
              type="button"
              key={m}
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={`min-h-11 px-4 py-2 text-sm font-medium transition-colors capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--w-ring)] fine-pointer:min-h-9 ${
                mode === m
                  ? 'bg-accent text-accent-fg'
                  : 'bg-surface text-ink hover:bg-muted'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={swap}
          disabled={!result.output}
          className="h-11 px-3 flex items-center gap-2 text-sm border border-edge bg-surface text-ink rounded-md hover:bg-muted disabled:opacity-35 disabled:pointer-events-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-canvas fine-pointer:h-9"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          Swap
        </button>

        {mode === 'encode' && (
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              role="switch"
              aria-checked={urlSafe}
              aria-label="URL-safe Base64"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
              onClick={() => setUrlSafe((v) => !v)}
            >
              <span className={`relative h-5 w-9 rounded-full transition-colors ${urlSafe ? 'bg-accent' : 'bg-edge-strong'}`}>
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-surface shadow transition-transform ${urlSafe ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </span>
            </button>
            <span className="text-sm text-ink-2">URL-safe</span>
          </div>
        )}
      </div>

      <ExamplePicker
        examples={BASE64_EXAMPLES}
        onSelect={(example) => {
          setInput(example.value);
          setMode('encode');
          setUrlSafe(false);
        }}
        className="mb-5"
        mono
      />

      {/* Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="base64-input" className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">
            {mode === 'encode' ? 'Plain text' : 'Base64 input'}
          </label>
          <textarea
            id="base64-input"
            aria-describedby={result.error ? 'base64-error' : undefined}
            aria-invalid={result.error ? true : undefined}
            className={[
              'h-52 w-full p-4 rounded-lg border font-mono text-sm resize-none bg-surface text-ink placeholder:text-ink-3',
              'focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)] focus:ring-offset-1 transition-colors',
              result.error ? 'border-red-500/70' : 'border-edge',
            ].join(' ')}
            placeholder={mode === 'encode' ? 'Type anything, including Unicode and emoji…' : 'Paste Base64 here…'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
          {result.error && (
            <p id="base64-error" role="alert" className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded-md px-3 py-2">
              {result.error}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label htmlFor="base64-output" className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">
              {mode === 'encode' ? 'Base64 output' : 'Decoded text'}
            </label>
            <button
              type="button"
              onClick={() => { void copyText(result.output); }}
              disabled={!result.output}
              className="min-h-11 px-2 text-xs font-semibold text-accent hover:underline underline-offset-4 disabled:opacity-35 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] fine-pointer:min-h-9"
            >
              Copy
            </button>
          </div>
          <textarea
            id="base64-output"
            readOnly
            className="h-52 w-full p-4 rounded-lg border border-edge font-mono text-sm resize-none bg-muted text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)] focus:ring-offset-2 focus:ring-offset-canvas"
            placeholder="Result appears here…"
            value={result.output}
            spellCheck={false}
          />
        </div>
      </div>
    </ToolPage>
  );
}
