'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

const CHARS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers:   '0123456789',
  symbols:   '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

function getStrength(pw: string): { label: string; pct: number; color: string } {
  if (!pw) return { label: '', pct: 0, color: '' };
  let s = 0;
  if (pw.length >= 8)  s++;
  if (pw.length >= 12) s++;
  if (pw.length >= 16) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[a-z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 2) return { label: 'Weak',   pct: 25,  color: 'bg-red-500'   };
  if (s <= 4) return { label: 'Fair',   pct: 50,  color: 'bg-yellow-500' };
  if (s <= 5) return { label: 'Good',   pct: 75,  color: 'bg-blue-500'  };
  return         { label: 'Strong', pct: 100, color: 'bg-green-500'  };
}

export default function PasswordGenerator() {
  const [length,  setLength]  = useState(16);
  const [options, setOptions] = useState({ uppercase: true, lowercase: true, numbers: true, symbols: false });
  const [password, setPassword] = useState('');

  const generate = useCallback(() => {
    const charset = Object.entries(options)
      .filter(([, on]) => on)
      .map(([k]) => CHARS[k as keyof typeof CHARS])
      .join('');
    if (!charset) { toast.error('Select at least one character type'); return; }
    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    setPassword(Array.from(arr, (n) => charset[n % charset.length]).join(''));
  }, [length, options]);

  const strength = getStrength(password);

  const OPTION_LABELS: Record<string, string> = {
    uppercase: 'Uppercase A–Z',
    lowercase: 'Lowercase a–z',
    numbers:   'Numbers 0–9',
    symbols:   'Symbols !@#…',
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-3 mb-2">Security</p>
        <h1 className="font-display text-4xl sm:text-5xl text-ink leading-none mb-3">Password Generator</h1>
        <p className="text-base text-ink-2 max-w-[46ch]">Cryptographically random passwords, generated entirely in your browser.</p>
      </header>

      {/* Output */}
      <div className="rounded-xl border border-edge bg-surface p-5 mb-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="flex-1 font-mono text-lg tracking-widest text-ink break-all min-h-[1.75rem]">
            {password || <span className="text-ink-3 font-sans text-sm tracking-normal">Click Generate…</span>}
          </span>
          <button
            onClick={() => { if (!password) return; navigator.clipboard.writeText(password); toast.success('Copied'); }}
            disabled={!password}
            className="shrink-0 h-9 px-3 text-sm font-medium rounded-md border border-edge bg-muted text-ink hover:bg-[var(--w-edge)] disabled:opacity-35 disabled:pointer-events-none transition-colors"
          >
            Copy
          </button>
        </div>
        {password && (
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-ink-3 font-semibold uppercase tracking-wider">Strength</span>
              <span className="font-semibold text-ink-2">{strength.label}</span>
            </div>
            <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                style={{ width: `${strength.pct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="rounded-xl border border-edge bg-surface p-5 space-y-5 mb-4">
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-3">Length</label>
            <span className="text-sm font-bold text-accent">{length}</span>
          </div>
          <input
            type="range" min={4} max={64} value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-[var(--w-accent)]"
          />
          <div className="flex justify-between text-xs text-ink-3 mt-1"><span>4</span><span>64</span></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(options) as (keyof typeof options)[]).map((key) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <div
                className={`relative shrink-0 w-9 h-5 rounded-full transition-colors ${options[key] ? 'bg-accent' : 'bg-edge-strong'}`}
                onClick={() => setOptions((prev) => ({ ...prev, [key]: !prev[key] }))}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${options[key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm text-ink-2">{OPTION_LABELS[key]}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={generate}
        className="w-full h-11 bg-accent text-accent-fg font-semibold rounded-xl hover:bg-accent-hover transition-colors"
      >
        Generate Password
      </button>
    </div>
  );
}
