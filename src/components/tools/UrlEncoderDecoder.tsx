'use client';

import { useState } from 'react';
import { SwapVerticalOutline } from '@/components/ui/icons';
import { ExamplePicker } from '@/components/tools/ExamplePicker';
import { ToolPage } from '@/components/tools/ToolPage';
import { Segmented } from '@/components/ui/Segmented';
import { Button } from '@/components/ui/Button';
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
  const reverseDescription = `Use output as input and switch to ${mode === 'encode' ? 'Decode' : 'Encode'}.`;

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
          ariaLabel="Conversion mode"
          buttonClassName="px-4 text-sm capitalize fine-pointer:min-h-9"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={swap}
          disabled={!result.output}
          title={reverseDescription}
          aria-describedby="url-reverse-description"
        >
          <SwapVerticalOutline size={16} aria-hidden="true" className="shrink-0" />
          Reverse
        </Button>
        <span id="url-reverse-description" className="sr-only">{reverseDescription}</span>
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
            <label htmlFor="url-input" className="text-sm font-medium text-ink-3">
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
            <label htmlFor="url-output" className="text-sm font-medium text-ink-3">
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
