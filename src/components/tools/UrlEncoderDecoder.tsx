'use client';

import { useState } from 'react';
import { ExamplePicker } from '@/components/tools/ExamplePicker';
import { ToolPage } from '@/components/tools/ToolPage';
import { Segmented } from '@/components/ui/Segmented';
import { CopyButton } from '@/components/ui/CopyButton';

const URL_EXAMPLES = [
  { id: 'search-url', label: 'Search URL', value: 'https://example.com/search?q=hello world&lang=en' },
  { id: 'email', label: 'Email address', value: 'user@example.com' },
  { id: 'price', label: 'Price text', value: 'price: $50 & discount 20%' },
] as const;

function convert(input: string, mode: 'encode' | 'decode') {
  if (!input.trim()) return { output: '', error: null };
  try {
    return { output: mode === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input), error: null };
  } catch {
    return { output: '', error: 'Invalid encoded string' };
  }
}

export default function UrlEncoderDecoder() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const result = convert(input, mode);

  const swap = () => {
    setInput(result.output);
    setMode((m) => (m === 'encode' ? 'decode' : 'encode'));
  };

  return (
    <ToolPage
      toolId="url-encoder"
      description="Encode special characters for safe URLs, or decode them back to readable text."
      width="wide"
    >

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Segmented
          options={[{ value: 'encode', label: 'encode' }, { value: 'decode', label: 'decode' }]}
          value={mode}
          onChange={setMode}
          buttonClassName="px-4 text-sm capitalize fine-pointer:min-h-9"
        />
        <button
          type="button"
          onClick={swap} disabled={!result.output}
          className="h-11 px-3 flex items-center gap-2 text-sm border border-edge bg-surface text-ink rounded-md hover:bg-muted disabled:pointer-events-none transition-colors fine-pointer:h-9"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          Swap
        </button>
      </div>

      <ExamplePicker
        examples={URL_EXAMPLES}
        onSelect={(example) => {
          setInput(example.value);
          setMode('encode');
        }}
        className="mb-6"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <div className="field-header">
            <label htmlFor="url-input" className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">
              {mode === 'encode' ? 'Plain text / URL' : 'Encoded URL'}
            </label>
          </div>
          <textarea
            id="url-input"
            aria-describedby={result.error ? 'url-input-error' : undefined}
            aria-invalid={result.error ? true : undefined}
            className={[
              'h-32 lg:h-48 w-full p-4 rounded-lg border font-mono text-sm resize-none bg-surface text-ink placeholder:text-ink-3',
              'transition-colors',
              result.error ? 'border-red-500/70' : 'border-edge',
            ].join(' ')}
            placeholder={mode === 'encode' ? 'Type or paste text…' : 'Paste encoded text…'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
          {result.error && (
            <p id="url-input-error" role="alert" className="mt-2 field-error">
              {result.error}
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <div className="field-header">
            <label htmlFor="url-output" className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">
              {mode === 'encode' ? 'Encoded URL' : 'Decoded text'}
            </label>
            <CopyButton value={result.output} />
          </div>
          <textarea
            id="url-output"
            readOnly
            className="h-32 lg:h-48 w-full p-4 rounded-lg border border-edge font-mono text-sm resize-none bg-muted text-ink placeholder:text-ink-3"
            placeholder="Result appears here…"
            value={result.output}
            spellCheck={false}
          />
        </div>
      </div>
    </ToolPage>
  );
}
