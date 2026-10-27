'use client';

import { useRef, useState } from 'react';
import { ExamplePicker } from '@/components/tools/ExamplePicker';
import { ToolPage } from '@/components/tools/ToolPage';
import { Button } from '@/components/ui/Button';
import { CopyButton } from '@/components/ui/CopyButton';
import { transformJson, type JsonOutputMode } from '@/lib/json-utils';

const JSON_EXAMPLES = [
  {
    id: 'object',
    label: 'Simple object',
    value: '{"name":"wutil","private":true,"tools":15}',
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
  const [mode, setMode] = useState<JsonOutputMode>('format');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasInput = Boolean(input.trim());

  const run = (source: string, nextMode: JsonOutputMode) => {
    if (!source.trim()) return;
    try {
      setOutput(transformJson(source, nextMode));
      setMode(nextMode);
      setError(null);
    } catch (cause) {
      setOutput('');
      setError(cause instanceof SyntaxError
        ? `Invalid JSON. ${cause.message}`
        : cause instanceof Error ? cause.message : 'Could not process this JSON.');
    }
  };

  const clear = () => {
    setInput('');
    setOutput('');
    setError(null);
    inputRef.current?.focus();
  };

  return (
    <ToolPage
      toolId="json-formatter"
      description="Format or minify JSON. Numbers and key order stay unchanged."
      width="wide"
    >
      <div className="json-tool-workspace flex flex-col gap-4">
        <div className="tool-workspace overflow-hidden rounded-lg border border-edge bg-surface">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-edge px-3 py-3 sm:px-5">
            <div role="group" aria-label="JSON actions" className="json-tool-actions flex min-w-0 max-w-full flex-wrap items-center gap-2">
              <Button size="sm" onClick={() => run(input, 'format')} disabled={!hasInput} title="Format (⌘ / Ctrl + Enter)">Format</Button>
              <Button size="sm" variant="outline" onClick={() => run(input, 'minify')} disabled={!hasInput}>Minify</Button>
              <button
                type="button"
                onClick={clear}
                disabled={!input && !output}
                className="min-h-11 rounded-md px-3 text-sm font-medium text-ink-3 transition-colors hover:bg-muted hover:text-ink fine-pointer:min-h-9"
              >
                Clear
              </button>
            </div>
            <ExamplePicker
              label="Examples"
              examples={JSON_EXAMPLES}
              onSelect={(example) => {
                setInput(example.value);
                run(example.value, 'format');
              }}
              className="json-tool-examples flex-[1_1_24rem]"
            />
          </div>

          <div className="json-tool-editors grid min-w-0 grid-cols-1 lg:grid-cols-2">
            <div className="min-w-0 border-b border-edge lg:border-b-0 lg:border-r">
              <div className="flex min-h-14 flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-3 sm:px-5">
                <label htmlFor="json-input" className="text-sm font-medium text-ink">Input</label>
                <p id="json-input-note" className="text-xs text-ink-3">Input limit: 1,000,000 characters.</p>
              </div>
              {error && <p id="json-error" role="alert" className="field-error mx-4 mb-3 sm:mx-5">{error}</p>}
              <textarea
                ref={inputRef}
                id="json-input"
                aria-describedby={error ? 'json-error json-input-note' : 'json-input-note'}
                aria-invalid={error ? true : undefined}
                aria-keyshortcuts="Meta+Enter Control+Enter"
                className="workspace-editor block w-full resize-y border-0 bg-surface px-4 pb-5 pt-1 font-mono text-sm leading-relaxed text-ink focus-visible:-outline-offset-2 sm:px-5"
                placeholder="Paste JSON here…"
                name="json-input"
                autoComplete="off"
                autoCapitalize="off"
                value={input}
                onChange={(event) => {
                  setInput(event.target.value);
                  setOutput('');
                  setError(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey) && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    run(input, 'format');
                  }
                }}
                spellCheck={false}
              />
            </div>
            <div className="min-w-0 bg-muted">
              <div className="flex min-h-14 items-center justify-between gap-3 px-4 sm:px-5">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <label htmlFor="json-output" className="text-sm font-medium text-ink">Output</label>
                  <p role="status" className="text-xs text-ink-3">{output ? mode === 'format' ? 'Formatted' : 'Minified' : ''}</p>
                </div>
                <CopyButton value={output} />
              </div>
              <textarea
                id="json-output"
                readOnly
                className="workspace-editor block w-full resize-y border-0 bg-muted px-4 pb-5 pt-1 font-mono text-sm leading-relaxed text-ink focus-visible:-outline-offset-2 sm:px-5"
                value={output}
                spellCheck={false}
              />
            </div>
          </div>
        </div>
      </div>
    </ToolPage>
  );
}
