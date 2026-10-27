'use client';

import { useState } from 'react';
import { SwapVerticalOutline } from '@/components/ui/icons';
import { ExamplePicker } from '@/components/tools/ExamplePicker';
import { ToolPage } from '@/components/tools/ToolPage';
import { Segmented } from '@/components/ui/Segmented';
import { Button } from '@/components/ui/Button';
import { CopyButton } from '@/components/ui/CopyButton';
import { decodeBase64, encodeBase64 } from '@/lib/base64-utils';

const BASE64_EXAMPLES = [
  { id: 'unicode', label: 'Unicode + emoji', value: '你好，世界 👋' },
  { id: 'url', label: 'URL text', value: 'https://example.com/search?q=hello world' },
  { id: 'json', label: 'JSON snippet', value: '{"private":true,"tool":"base64"}' },
] as const;

function convert(input: string, mode: 'encode' | 'decode', urlSafe: boolean) {
  if (!input) return { output: '', error: null };
  try {
    return { output: mode === 'encode' ? encodeBase64(input, urlSafe) : decodeBase64(input), error: null };
  } catch {
    return { output: '', error: mode === 'decode' ? 'Invalid Base64. Check your input.' : 'Encoding failed.' };
  }
}

export default function Base64ConverterComponent() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [urlSafe, setUrlSafe] = useState(false);

  const result = convert(input, mode, urlSafe);
  const reverseDescription = `Use output as input and switch to ${mode === 'encode' ? 'Decode' : 'Encode'}.`;

  const swap = () => {
    setInput(result.output);
    setMode((m) => (m === 'encode' ? 'decode' : 'encode'));
  };

  return (
    <ToolPage
      toolId="base64-converter"
      description="Encode or decode Base64. Supports Unicode, emoji, and URL-safe format."
      width="wide"
    >

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-5">
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
          aria-describedby="base64-reverse-description"
        >
          <SwapVerticalOutline size={16} aria-hidden="true" className="shrink-0" />
          Reverse
        </Button>
        <span id="base64-reverse-description" className="sr-only">{reverseDescription}</span>

        {mode === 'encode' && (
          <button
            type="button"
            role="switch"
            aria-checked={urlSafe}
            aria-label="URL-safe Base64"
            className="flex min-h-11 shrink-0 items-center gap-2 rounded-md px-1 text-sm text-ink-2 fine-pointer:min-h-9"
            onClick={() => setUrlSafe((v) => !v)}
          >
            <span className={`relative h-5 w-9 rounded-full transition-colors ${urlSafe ? 'bg-accent' : 'bg-edge-strong'}`}>
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-surface shadow transition-transform ${urlSafe ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </span>
            URL-safe
          </button>
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
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <div className="field-header">
            <label htmlFor="base64-input" className="text-sm font-medium text-ink-3">
              {mode === 'encode' ? 'Plain text' : 'Base64 input'}
            </label>
          </div>
          <textarea
            id="base64-input"
            aria-describedby={result.error ? 'base64-error' : undefined}
            aria-invalid={result.error ? true : undefined}
            className={[
              'h-32 lg:h-52 w-full p-4 rounded-lg border font-mono text-sm resize-none bg-surface text-ink placeholder:text-ink-3',
              'transition-colors',
              result.error ? 'border-red-500/70' : 'border-edge',
            ].join(' ')}
            placeholder={mode === 'encode' ? 'Type or paste text…' : 'Paste Base64…'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
          {result.error && (
            <p id="base64-error" role="alert" className="mt-2 field-error">
              {result.error}
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <div className="field-header">
            <label htmlFor="base64-output" className="text-sm font-medium text-ink-3">
              {mode === 'encode' ? 'Base64 output' : 'Decoded text'}
            </label>
            <CopyButton value={result.output} />
          </div>
          <textarea
            id="base64-output"
            readOnly
            className="h-32 lg:h-52 w-full p-4 rounded-lg border border-edge font-mono text-sm resize-none bg-muted text-ink placeholder:text-ink-3"
            placeholder="Result appears here…"
            value={result.output}
            spellCheck={false}
          />
        </div>
      </div>
    </ToolPage>
  );
}
