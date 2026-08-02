'use client';

import { useState, useEffect } from 'react';
import { ToolPage } from '@/components/tools/ToolPage';
import { copyText } from '@/lib/clipboard';

const FORMATS = [
  { label: 'Unix (s)',     fn: (d: Date) => String(Math.floor(d.getTime() / 1000))   },
  { label: 'Unix (ms)',    fn: (d: Date) => String(d.getTime())                       },
  { label: 'ISO 8601',    fn: (d: Date) => d.toISOString()                           },
  { label: 'UTC',         fn: (d: Date) => d.toUTCString()                           },
  { label: 'Local',       fn: (d: Date) => d.toLocaleString()                        },
  { label: 'Date only',   fn: (d: Date) => d.toISOString().split('T')[0]             },
  { label: 'Time (UTC)',  fn: (d: Date) => d.toISOString().split('T')[1].replace('Z','') + ' UTC' },
];

function relativeTime(d: Date, nowMs: number): string {
  const diff = d.getTime() - nowMs;
  const abs  = Math.abs(diff);
  const past = diff < 0;
  const fmt  = (n: number, u: string) => `${n} ${u}${n !== 1 ? 's' : ''} ${past ? 'ago' : 'from now'}`;
  if (abs < 60_000)        return fmt(Math.round(abs / 1_000),         'second');
  if (abs < 3_600_000)     return fmt(Math.round(abs / 60_000),        'minute');
  if (abs < 86_400_000)    return fmt(Math.round(abs / 3_600_000),     'hour');
  if (abs < 2_592_000_000) return fmt(Math.round(abs / 86_400_000),    'day');
  if (abs < 31_536_000_000)return fmt(Math.round(abs / 2_592_000_000), 'month');
  return fmt(Math.round(abs / 31_536_000_000), 'year');
}

function parse(value: string): Date | null {
  if (!value.trim()) return null;
  const num = Number(value);
  if (!isNaN(num)) {
    const ms = num < 1e12 ? num * 1000 : num;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

export default function TimestampConverter() {
  const [input, setInput] = useState('');
  const [date,  setDate]  = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now,   setNow]   = useState<number | null>(null);

  useEffect(() => {
    const updateNow = () => setNow(Math.floor(Date.now() / 1000));
    updateNow();
    const id = setInterval(updateNow, 1000);
    return () => clearInterval(id);
  }, []);

  const handleInput = (value: string) => {
    setInput(value);
    if (!value.trim()) { setDate(null); setError(null); return; }
    const d = parse(value);
    if (d) { setDate(d); setError(null); }
    else   { setDate(null); setError('Cannot parse this value. Try a Unix timestamp or ISO date string.'); }
  };

  const copy = (text: string, label: string) => {
    void copyText(text, `${label} copied`);
  };

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <ToolPage
      toolId="timestamp"
      title="Timestamp Converter"
      description="Convert Unix timestamps to readable dates, or turn any date string back into a timestamp."
      width="medium"
    >

      {/* Live clock */}
      <div
        className="mb-6 flex min-h-[104px] items-center justify-between rounded-xl border border-edge bg-surface px-5 py-4"
        aria-busy={now === null}
      >
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-3">Current Unix timestamp</p>
          <p className="font-mono text-2xl font-bold text-ink">{now ?? '—'}</p>
          <p className="mt-0.5 text-xs text-ink-3">
            {now !== null ? new Date(now * 1000).toUTCString() : 'Loading current time…'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => { if (now !== null) handleInput(String(now)); }}
          disabled={now === null}
          className="h-11 px-4 text-sm font-semibold bg-accent text-accent-fg rounded-lg hover:bg-accent-hover disabled:cursor-wait transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-canvas fine-pointer:h-9"
        >
          Use now
        </button>
      </div>

      {/* Input */}
      <div className="flex flex-col gap-1.5 mb-6">
        <label htmlFor="timestamp-input" className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">Timestamp or date string</label>
        <input
          id="timestamp-input"
          type="text"
          value={input}
          aria-describedby={error ? 'timestamp-error' : undefined}
          aria-invalid={error ? true : undefined}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="e.g. 1700000000 or 2024-01-15T12:00:00Z"
          className={[
            'h-11 w-full px-4 rounded-lg border font-mono text-sm text-ink bg-surface placeholder:text-ink-3',
            'focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)] focus:ring-offset-2 focus:ring-offset-canvas transition-colors',
            error ? 'border-red-500/70' : 'border-edge',
          ].join(' ')}
        />
        {error && (
          <p id="timestamp-error" role="alert" className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded-md px-3 py-2">
            {error}
          </p>
        )}
      </div>

      {/* Outputs */}
      {date && (
        <>
          <div className="rounded-xl border border-edge bg-surface overflow-hidden mb-4">
            {FORMATS.map(({ label, fn }, i) => {
              const value = fn(date);
              return (
                <button
                  type="button"
                  key={label}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-muted transition-colors ${i < FORMATS.length - 1 ? 'border-b border-edge' : ''}`}
                  onClick={() => copy(value, label)}
                  title="Click to copy"
                  aria-label={`Copy ${label} value`}
                >
                  <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-ink-3 w-24">{label}</span>
                  <code className="flex-1 font-mono text-sm text-ink truncate">{value}</code>
                  <span className="shrink-0 text-xs font-semibold text-accent">Copy</span>
                </button>
              );
            })}
          </div>

          <div className="rounded-lg border border-edge bg-muted px-5 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">Relative</p>
              <p className="text-sm font-medium text-ink mt-0.5">
                {now !== null ? relativeTime(date, now * 1000) : 'Calculating...'}
              </p>
            </div>
            <p className="text-xs text-ink-3">Local TZ: {tz}</p>
          </div>
        </>
      )}

      {/* Examples */}
      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3 mb-2">Examples</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'now',             value: now !== null ? String(now) : '' },
            { label: '2024-01-01 UTC',  value: '2024-01-01T00:00:00Z' },
            { label: '1700000000',      value: '1700000000' },
            { label: 'Unix epoch',      value: '0' },
          ].map(({ label, value }) => (
            <button key={label} type="button" onClick={() => handleInput(value)}
              disabled={!value}
              className="min-h-11 px-3 py-1.5 text-xs font-mono border border-edge bg-surface text-ink-2 rounded-md hover:bg-muted disabled:cursor-wait transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] fine-pointer:min-h-9"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </ToolPage>
  );
}
