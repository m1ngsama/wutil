'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// Unicode-safe encode: UTF-8 bytes → base64
function encodeBase64(str: string, urlSafe: boolean): string {
  const bytes = new TextEncoder().encode(str);
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
  let b64 = btoa(binary);
  if (urlSafe) b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return b64;
}

// Unicode-safe decode
function decodeBase64(str: string): string {
  // Normalize URL-safe chars back to standard base64
  const normalized = str.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(normalized);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export default function Base64ConverterComponent() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [urlSafe, setUrlSafe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!input) { setOutput(''); setError(null); return; }
    try {
      if (mode === 'encode') {
        setOutput(encodeBase64(input, urlSafe));
      } else {
        setOutput(decodeBase64(input));
      }
      setError(null);
    } catch {
      setError(mode === 'decode' ? 'Invalid Base64 — check your input.' : 'Encoding failed.');
      setOutput('');
    }
  }, [input, mode, urlSafe]);

  const swap = () => {
    setInput(output);
    setMode((m) => (m === 'encode' ? 'decode' : 'encode'));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-3 mb-2">Text</p>
        <h1 className="font-display text-4xl sm:text-5xl text-ink leading-none mb-3">Base64 Converter</h1>
        <p className="text-base text-ink-2 max-w-[50ch]">Encode or decode Base64. Supports Unicode, emoji, and URL-safe format.</p>
      </header>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex rounded-md border border-edge overflow-hidden">
          {(['encode', 'decode'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 text-sm font-medium transition-colors capitalize ${
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
          onClick={swap}
          disabled={!output}
          className="h-9 px-3 flex items-center gap-2 text-sm border border-edge bg-surface text-ink rounded-md hover:bg-muted disabled:opacity-35 disabled:pointer-events-none transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          Swap
        </button>

        {mode === 'encode' && (
          <label className="flex items-center gap-2 cursor-pointer ml-auto">
            <div
              className={`relative w-9 h-5 rounded-full transition-colors ${urlSafe ? 'bg-accent' : 'bg-edge-strong'}`}
              onClick={() => setUrlSafe((v) => !v)}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${urlSafe ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm text-ink-2">URL-safe</span>
          </label>
        )}
      </div>

      {/* Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">
            {mode === 'encode' ? 'Plain text' : 'Base64 input'}
          </label>
          <textarea
            className={[
              'h-52 w-full p-4 rounded-lg border font-mono text-sm resize-none bg-surface text-ink placeholder:text-ink-3',
              'focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)] focus:ring-offset-1 transition-colors',
              error ? 'border-red-500/70' : 'border-edge',
            ].join(' ')}
            placeholder={mode === 'encode' ? 'Type anything — including Unicode, emoji…' : 'Paste Base64 here…'}
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

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">
              {mode === 'encode' ? 'Base64 output' : 'Decoded text'}
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
            className="h-52 w-full p-4 rounded-lg border border-edge font-mono text-sm resize-none bg-muted text-ink placeholder:text-ink-3 focus:outline-none"
            placeholder="Result appears here…"
            value={output}
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
