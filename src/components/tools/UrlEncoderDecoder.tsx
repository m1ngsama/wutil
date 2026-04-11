'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const EXAMPLES = [
  'https://example.com/search?q=hello world&lang=en',
  'user@example.com',
  'price: $50 & discount 20%',
];

export default function UrlEncoderDecoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!input.trim()) { setOutput(''); setError(null); return; }
    try {
      setOutput(mode === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input));
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-3 mb-2">Data & Dev</p>
        <h1 className="font-display text-4xl sm:text-5xl text-ink leading-none mb-3">URL Encoder / Decoder</h1>
        <p className="text-base text-ink-2 max-w-[52ch]">Encode special characters for safe URLs, or decode them back to readable text.</p>
      </header>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex rounded-md border border-edge overflow-hidden">
          {(['encode', 'decode'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 text-sm font-medium transition-colors capitalize ${
                mode === m ? 'bg-accent text-accent-fg' : 'bg-surface text-ink hover:bg-muted'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <button
          onClick={swap} disabled={!output}
          className="h-9 px-3 flex items-center gap-2 text-sm border border-edge bg-surface text-ink rounded-md hover:bg-muted disabled:opacity-35 disabled:pointer-events-none transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          Swap
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">
            {mode === 'encode' ? 'Plain text / URL' : 'Encoded URL'}
          </label>
          <textarea
            className={[
              'h-48 w-full p-4 rounded-lg border font-mono text-sm resize-none bg-surface text-ink placeholder:text-ink-3',
              'focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)] focus:ring-offset-1 transition-colors',
              error ? 'border-red-500/70' : 'border-edge',
            ].join(' ')}
            placeholder={mode === 'encode' ? 'https://example.com/path?q=hello world' : 'https%3A%2F%2Fexample.com%2F…'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
          {error && (
            <p className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded-md px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">
              {mode === 'encode' ? 'Encoded URL' : 'Decoded text'}
            </label>
            <button
              onClick={() => { navigator.clipboard.writeText(output); toast.success('Copied'); }}
              disabled={!output}
              className="text-xs font-semibold text-accent hover:underline underline-offset-4 disabled:opacity-35 disabled:pointer-events-none"
            >
              Copy
            </button>
          </div>
          <textarea
            readOnly
            className="h-48 w-full p-4 rounded-lg border border-edge font-mono text-sm resize-none bg-muted text-ink placeholder:text-ink-3 focus:outline-none"
            placeholder="Result appears here…"
            value={output}
            spellCheck={false}
          />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3 mb-2">Try an example</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => { setInput(ex); setMode('encode'); }}
              className="px-3 py-1.5 text-xs font-mono border border-edge bg-surface text-ink-2 rounded-md hover:bg-muted truncate max-w-xs transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
