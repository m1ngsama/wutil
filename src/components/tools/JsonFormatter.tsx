'use client';

import { useState } from 'react';
import { toast } from 'sonner';

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

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast.success('Copied');
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Masthead */}
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-3 mb-2">
          Data &amp; Dev
        </p>
        <h1 className="font-display text-4xl sm:text-5xl text-ink leading-none mb-3">
          JSON Formatter
        </h1>
        <p className="text-base text-ink-2 max-w-[52ch]">
          Beautify, minify, and validate your JSON. Paste it in — errors are caught instantly.
        </p>
      </header>

      {/* Action bar */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <button
          onClick={formatJson}
          className="h-9 px-4 text-sm font-semibold rounded-md bg-accent text-accent-fg hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)]"
        >
          Format
        </button>
        <button
          onClick={minifyJson}
          className="h-9 px-4 text-sm font-medium rounded-md border border-edge bg-surface text-ink hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)]"
        >
          Minify
        </button>
        <button
          onClick={handleCopy}
          disabled={!output}
          className="h-9 px-4 text-sm font-medium rounded-md border border-edge bg-surface text-ink hover:bg-muted transition-colors disabled:opacity-35 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)]"
        >
          Copy output
        </button>
        <button
          onClick={handleClear}
          className="h-9 px-4 text-sm font-medium rounded-md text-ink-3 hover:text-ink hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] ml-auto"
        >
          Clear
        </button>
      </div>

      {/* Editor panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ height: 'calc(100vh - 22rem)', minHeight: '380px' }}>

        {/* Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">
            Input
          </label>
          <textarea
            className={[
              'flex-1 w-full p-4 rounded-lg border font-mono text-sm resize-none bg-surface text-ink',
              'placeholder:text-ink-3 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)] focus:ring-offset-1',
              error ? 'border-red-500/70 dark:border-red-500/50' : 'border-edge',
            ].join(' ')}
            placeholder={'{\n  "paste": "your JSON here"\n}'}
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(null); }}
            spellCheck={false}
          />
          {error && (
            <p className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded-md px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Output */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">
            Output
          </label>
          <textarea
            readOnly
            className="flex-1 w-full p-4 rounded-lg border border-edge font-mono text-sm resize-none bg-muted text-ink placeholder:text-ink-3 focus:outline-none"
            placeholder="Result will appear here…"
            value={output}
            spellCheck={false}
          />
        </div>

      </div>

    </div>
  );
}
