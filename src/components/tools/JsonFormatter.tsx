'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ExamplePicker } from '@/components/tools/ExamplePicker';
import { ToolPage } from '@/components/tools/ToolPage';
import { CopyButton } from '@/components/ui/CopyButton';

const JSON_EXAMPLES = [
  {
    id: 'object',
    label: 'Simple object',
    value: '{"name":"wutil","private":true,"tools":14}',
  },
  {
    id: 'nested',
    label: 'Nested data',
    value: '{"project":"wutil","release":{"stable":true,"tools":["json","regex","base64"]},"stats":{"users":1200}}',
  },
  {
    id: 'unicode',
    label: 'Unicode',
    value: '{"message":"你好，世界 👋","language":"zh-CN"}',
  },
] as const;

export default function JsonFormatterComponent() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const formatJson = () => {
    try {
      if (!input.trim()) return;
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError(null);
      toast.success('Formatted');
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
      toast.error('Invalid JSON');
    }
  };

  const minifyJson = () => {
    try {
      if (!input.trim()) return;
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError(null);
      toast.success('Minified');
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
      toast.error('Invalid JSON');
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  const loadExample = (example: (typeof JSON_EXAMPLES)[number]) => {
    setInput(example.value);
    setOutput(JSON.stringify(JSON.parse(example.value), null, 2));
    setError(null);
  };

  return (
    <ToolPage
      toolId="json-formatter"
      title="JSON Formatter"
      description="Beautify, minify, and validate your JSON. Paste it in, and errors are caught instantly."
      width="wide"
    >
      <div className="json-tool-workspace flex flex-col">

      <div className="json-tool-actions mb-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={formatJson}
          className="h-11 rounded-md bg-accent px-4 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-canvas fine-pointer:h-9"
        >
          Format
        </button>
        <button
          type="button"
          onClick={minifyJson}
          className="h-11 rounded-md border border-edge bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-canvas fine-pointer:h-9"
        >
          Minify
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="h-11 rounded-md px-3 text-sm font-medium text-ink-3 transition-colors hover:bg-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-canvas fine-pointer:h-9"
        >
          Clear
        </button>
      </div>

      <ExamplePicker
        examples={JSON_EXAMPLES}
        onSelect={loadExample}
        className="json-tool-examples mb-5"
      />

      {/* Editor panes */}
      <div className="json-tool-editors grid h-[calc(100dvh-25rem)] min-h-[380px] grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Input */}
        <div className="flex flex-col">
          <div className="field-header">
            <label htmlFor="json-input" className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">
              Input
            </label>
          </div>
          <textarea
            id="json-input"
            aria-describedby={error ? 'json-error' : undefined}
            aria-invalid={error ? true : undefined}
            className={[
              'flex-1 w-full p-4 rounded-lg border font-mono text-sm resize-none bg-surface text-ink',
              'placeholder:text-ink-3 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)] focus:ring-offset-1',
              error ? 'border-red-500/70 dark:border-red-500/50' : 'border-edge',
            ].join(' ')}
            placeholder="Paste JSON here…"
            name="json-input"
            autoComplete="off"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(null); }}
            spellCheck={false}
          />
          {error && (
            <p id="json-error" role="alert" className="mt-2 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded-md px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Output */}
        <div className="flex flex-col">
          <div className="field-header">
            <label htmlFor="json-output" className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">
              Output
            </label>
            <CopyButton value={output} />
          </div>
          <textarea
            id="json-output"
            readOnly
            className="flex-1 w-full p-4 rounded-lg border border-edge font-mono text-sm resize-none bg-muted text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)] focus:ring-offset-2 focus:ring-offset-canvas"
            placeholder="Result will appear here…"
            value={output}
            spellCheck={false}
          />
        </div>

      </div>
      </div>

    </ToolPage>
  );
}
