'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { ToolPage } from '@/components/tools/ToolPage';
import { copyText } from '@/lib/clipboard';

const ALGOS = [
  { name: 'SHA-1',   algo: 'SHA-1'   },
  { name: 'SHA-256', algo: 'SHA-256' },
  { name: 'SHA-384', algo: 'SHA-384' },
  { name: 'SHA-512', algo: 'SHA-512' },
];

async function generateHashes(input: string) {
  const data = new TextEncoder().encode(input);
  return Promise.all(
    ALGOS.map(async ({ name, algo }) => {
      const buf = await crypto.subtle.digest(algo, data);
      const hex = Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
      return { name, value: hex };
    })
  );
}

export default function HashGeneratorComponent() {
  const [input,  setInput]  = useState('');
  const [hashes, setHashes] = useState<{ name: string; value: string }[]>([]);
  const requestId = useRef(0);

  const handleInput = (value: string) => {
    setInput(value);
    const currentRequest = ++requestId.current;
    if (!value) {
      setHashes([]);
      return;
    }
    generateHashes(value)
      .then((results) => {
        if (requestId.current === currentRequest) setHashes(results);
      })
      .catch(() => {
        if (requestId.current === currentRequest) setHashes([]);
        toast.error('Hashing failed');
      });
  };

  return (
    <ToolPage
      toolId="hash-generator"
      title="Hash Generator"
      description="Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes. Everything is computed locally."
      width="wide"
    >

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="hash-input" className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">Input</label>
          <textarea
            id="hash-input"
            className="h-32 w-full p-4 rounded-lg border border-edge bg-surface text-ink text-sm font-mono resize-none placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)] focus:ring-offset-2 focus:ring-offset-canvas transition-colors"
            placeholder="Type or paste text to hash…"
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            spellCheck={false}
          />
        </div>

        {hashes.length > 0 && (
          <div className="rounded-xl border border-edge bg-surface overflow-hidden">
            {hashes.map(({ name, value }, i) => (
              <button
                type="button"
                key={name}
                className={`w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-muted transition-colors ${i < hashes.length - 1 ? 'border-b border-edge' : ''}`}
                onClick={() => { void copyText(value, `${name} copied`); }}
                title="Click to copy"
                aria-label={`Copy ${name} hash`}
              >
                <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-ink-3 w-16">{name}</span>
                <code className="flex-1 font-mono text-xs text-ink-2 truncate">{value}</code>
                <span className="shrink-0 text-xs font-semibold text-accent">Copy</span>
              </button>
            ))}
          </div>
        )}

        {!input && (
          <p className="text-sm text-ink-3">Hashes update as you type.</p>
        )}
      </div>
    </ToolPage>
  );
}
