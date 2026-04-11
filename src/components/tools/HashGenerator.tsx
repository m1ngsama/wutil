'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const ALGOS = [
  { name: 'SHA-1',   algo: 'SHA-1'   },
  { name: 'SHA-256', algo: 'SHA-256' },
  { name: 'SHA-384', algo: 'SHA-384' },
  { name: 'SHA-512', algo: 'SHA-512' },
];

export default function HashGeneratorComponent() {
  const [input,  setInput]  = useState('');
  const [hashes, setHashes] = useState<{ name: string; value: string }[]>([]);

  useEffect(() => {
    if (!input) { setHashes([]); return; }
    const generate = async () => {
      const data = new TextEncoder().encode(input);
      const results = await Promise.all(
        ALGOS.map(async ({ name, algo }) => {
          const buf = await crypto.subtle.digest(algo, data);
          const hex = Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
          return { name, value: hex };
        })
      );
      setHashes(results);
    };
    generate();
  }, [input]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-3 mb-2">Security</p>
        <h1 className="font-display text-4xl sm:text-5xl text-ink leading-none mb-3">Hash Generator</h1>
        <p className="text-base text-ink-2 max-w-[50ch]">Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes — all computed locally.</p>
      </header>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">Input</label>
          <textarea
            className="h-32 w-full p-4 rounded-lg border border-edge bg-surface text-ink text-sm font-mono resize-none placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)] focus:ring-offset-1 transition-colors"
            placeholder="Type or paste text to hash…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
        </div>

        {hashes.length > 0 && (
          <div className="rounded-xl border border-edge bg-surface overflow-hidden">
            {hashes.map(({ name, value }, i) => (
              <div
                key={name}
                className={`flex items-center gap-4 px-5 py-4 hover:bg-muted transition-colors cursor-pointer ${i < hashes.length - 1 ? 'border-b border-edge' : ''}`}
                onClick={() => { navigator.clipboard.writeText(value); toast.success(`${name} copied`); }}
                title="Click to copy"
              >
                <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-ink-3 w-16">{name}</span>
                <code className="flex-1 font-mono text-xs text-ink-2 truncate">{value}</code>
                <span className="shrink-0 text-xs font-semibold text-accent">Copy</span>
              </div>
            ))}
          </div>
        )}

        {!input && (
          <p className="text-sm text-ink-3">Hashes update as you type.</p>
        )}
      </div>
    </div>
  );
}
