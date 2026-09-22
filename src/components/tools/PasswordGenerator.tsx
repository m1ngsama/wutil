'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ToolPage } from '@/components/tools/ToolPage';
import { Button } from '@/components/ui/Button';
import { CopyButton } from '@/components/ui/CopyButton';
import { generatePassword } from '@/lib/password-utils';

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
  if (s <= 2) return { label: 'Weak', pct: 25, color: 'bg-red-500' };
  if (s <= 4) return { label: 'Fair', pct: 50, color: 'bg-yellow-500' };
  if (s <= 5) return { label: 'Good', pct: 75, color: 'bg-blue-500' };
  return         { label: 'Strong', pct: 100, color: 'bg-green-500' };
}

export default function PasswordGenerator() {
  const [length,  setLength]  = useState(16);
  const [options, setOptions] = useState({ uppercase: true, lowercase: true, numbers: true, symbols: false });
  const [password, setPassword] = useState('');

  const generate = useCallback(() => {
    const selectedCharsets = Object.entries(options)
      .filter(([, on]) => on)
      .map(([k]) => CHARS[k as keyof typeof CHARS]);
    if (selectedCharsets.length === 0) { toast.error('Select at least one character type'); return; }
    setPassword(generatePassword(length, selectedCharsets));
  }, [length, options]);

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => generate(), []);

  const strength = getStrength(password);

  const OPTION_LABELS: Record<string, string> = {
    uppercase: 'Uppercase A–Z',
    lowercase: 'Lowercase a–z',
    numbers:   'Numbers 0–9',
    symbols:   'Symbols !@#…',
  };

  return (
    <ToolPage
      toolId="password-generator"
      title="Password Generator"
      description="Cryptographically random passwords, generated entirely in your browser."
      width="narrow"
    >

      <div className="rounded-xl border border-edge bg-surface p-5 space-y-5 mb-5">
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-3">Length</label>
            <span className="text-sm font-bold text-accent">{length}</span>
          </div>
          <input
            type="range" min={4} max={64} value={length}
            aria-label="Password length"
            onChange={(e) => setLength(Number(e.target.value))}
            className="h-11 w-full accent-[var(--w-accent)]"
          />
          <div className="flex justify-between text-xs text-ink-3 mt-1"><span>4</span><span>64</span></div>
        </div>

        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 sm:gap-3">
          {(Object.keys(options) as (keyof typeof options)[]).map((key) => (
            <button
              key={key}
              type="button"
              role="switch"
              aria-checked={options[key]}
              className="flex min-h-11 w-full items-center gap-3 rounded-md px-1 text-left hover:bg-muted"
              onClick={() => setOptions((prev) => ({ ...prev, [key]: !prev[key] }))}
            >
              <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${options[key] ? 'bg-accent' : 'bg-edge-strong'}`}>
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-surface shadow transition-transform ${options[key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </span>
              <span className="text-sm text-ink-2">{OPTION_LABELS[key]}</span>
            </button>
          ))}
        </div>

        <Button size="lg" className="w-full" onClick={generate}>
          Generate Password
        </Button>
      </div>

      <div className="rounded-xl border border-edge bg-surface p-5">
        <div className="field-header">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-3">Password</span>
          <CopyButton value={password} />
        </div>
        <span
          aria-label="Generated password"
          aria-live="polite"
          data-testid="generated-password"
          className="mb-4 block min-h-7 break-all font-mono text-lg tracking-widest text-ink"
        >
          {password}
        </span>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-ink-3 font-semibold uppercase tracking-wider">Strength</span>
          <span className="font-semibold text-ink-2">{strength.label}</span>
        </div>
        <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full w-full origin-left rounded-full transition-transform duration-300 ${strength.color}`}
            style={{ transform: `scaleX(${strength.pct / 100})` }}
          />
        </div>
      </div>
    </ToolPage>
  );
}
