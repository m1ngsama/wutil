'use client';

import { useState, useEffect } from 'react';
import { Copy } from 'lucide-react';
import { ToolPage } from '@/components/tools/ToolPage';
import { Segmented } from '@/components/ui/Segmented';
import { copyText } from '@/lib/clipboard';
import { parseTimestampInput, type TimestampUnit } from '@/lib/timestamp-utils';

const FORMATS = [
  { label: 'Unix (s)', fn: (d: Date) => String(Math.floor(d.getTime() / 1000)) },
  { label: 'Unix (ms)', fn: (d: Date) => String(d.getTime()) },
  { label: 'ISO 8601', fn: (d: Date) => d.toISOString() },
  { label: 'UTC', fn: (d: Date) => d.toUTCString() },
  { label: 'Local', fn: (d: Date) => d.toLocaleString() },
  { label: 'Date only', fn: (d: Date) => d.toISOString().split('T')[0] },
  { label: 'Time (UTC)', fn: (d: Date) => d.toISOString().split('T')[1].replace('Z','') + ' UTC' },
];

const RELATIVE_TIME = new Intl.RelativeTimeFormat('en');
const RELATIVE_STEPS = [[60, 'second'], [60, 'minute'], [24, 'hour'], [30, 'day'], [12, 'month']] as const;

function relativeTime(d: Date, nowMs: number): string {
  let value = (d.getTime() - nowMs) / 1000;
  for (const [size, unit] of RELATIVE_STEPS) {
    if (Math.abs(value) < size) return RELATIVE_TIME.format(Math.round(value), unit);
    value /= size;
  }
  return RELATIVE_TIME.format(Math.round(value), 'year');
}

const TIMESTAMP_UNITS: ReadonlyArray<{ value: TimestampUnit; label: string }> = [
  { value: 'auto', label: 'Auto' },
  { value: 'seconds', label: 'Seconds' },
  { value: 'milliseconds', label: 'Milliseconds' },
];

export default function TimestampConverter() {
  const [input, setInput] = useState('');
  const [date,  setDate]  = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now,   setNow]   = useState<number | null>(null);
  const [timestampUnit, setTimestampUnit] = useState<TimestampUnit>('auto');

  useEffect(() => {
    const updateNow = () => setNow(Math.floor(Date.now() / 1000));
    updateNow();
    const id = setInterval(updateNow, 1000);
    return () => clearInterval(id);
  }, []);

  const handleInput = (value: string, unit = timestampUnit) => {
    setInput(value);
    if (!value.trim()) { setDate(null); setError(null); return; }
    const result = parseTimestampInput(value, unit);
    setDate(result.date);
    setError(result.error);
  };

  const copy = (text: string, label: string) => {
    void copyText(text, `${label} copied`);
  };

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <ToolPage
      toolId="timestamp"
      description="Convert Unix timestamps to readable dates, or turn any date string back into a timestamp."
    >

      <div className="flex flex-col gap-1.5 mb-4">
        <label htmlFor="timestamp-input" className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">Timestamp or date string</label>
        <input
          id="timestamp-input"
          type="text"
          value={input}
          aria-describedby={error ? 'timestamp-error' : undefined}
          aria-invalid={error ? true : undefined}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="1700000000 or 2024-01-15"
          className={[
            'h-11 w-full px-4 rounded-lg border font-mono text-sm text-ink bg-surface',
            'transition-colors',
            error ? 'border-red-500/70' : 'border-edge',
          ].join(' ')}
        />
        {error && (
          <p id="timestamp-error" role="alert" className="field-error">
            {error}
          </p>
        )}
      </div>

      <div className="mb-6">
        <p id="timestamp-unit-label" className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">
          Numeric input unit
        </p>
        <Segmented
          options={TIMESTAMP_UNITS}
          value={timestampUnit}
          onChange={(value) => {
            setTimestampUnit(value);
            handleInput(input, value);
          }}
          labelledBy="timestamp-unit-label"
          className="w-fit flex-wrap"
          buttonClassName="px-3 text-sm fine-pointer:min-h-9"
        />
        <p className="mt-2 text-xs leading-relaxed text-ink-3">
          Auto detects common 10-digit seconds and 13-digit milliseconds. Choose a unit for ambiguous values.
        </p>
      </div>

      {date && (
        <div className="mb-6">
          <div className="rounded-xl border border-edge bg-surface overflow-hidden mb-4">
            {FORMATS.map(({ label, fn }, i) => {
              const value = fn(date);
              return (
                <button
                  type="button"
                  key={label}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-muted transition-colors ${i < FORMATS.length - 1 ? 'border-b border-edge' : ''}`}
                  onClick={() => copy(value, label)}
                  title="Copy"
                  aria-label={`Copy ${label} value`}
                >
                  <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-ink-3 w-24">{label}</span>
                  <code className="flex-1 font-mono text-sm text-ink truncate">{value}</code>
                  <span className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                    <Copy aria-hidden="true" className="h-3.5 w-3.5" />
                    Copy
                  </span>
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
        </div>
      )}

      <div
        className="flex min-h-[88px] items-center justify-between gap-4 rounded-xl border border-edge bg-surface px-4 py-3 sm:px-5"
        aria-busy={now === null}
      >
        <div className="min-w-0">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-3">Current Unix timestamp</p>
          <p className="font-mono text-xl font-bold text-ink">{now ?? '—'}</p>
          <p className="mt-0.5 text-xs text-ink-3">
            {now !== null ? new Date(now * 1000).toUTCString() : 'Loading current time…'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (now === null) return;
            setTimestampUnit('seconds');
            handleInput(String(now), 'seconds');
          }}
          disabled={now === null}
          className="h-11 shrink-0 whitespace-nowrap px-4 text-sm font-semibold bg-accent text-accent-fg rounded-lg hover:bg-accent-hover disabled:cursor-wait transition-colors fine-pointer:h-9"
        >
          Use now
        </button>
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3 mb-2">Examples</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'now', value: now !== null ? String(now) : '', unit: 'seconds' as const },
            { label: '2024-01-01 UTC', value: '2024-01-01T00:00:00Z' },
            { label: '1700000000', value: '1700000000', unit: 'seconds' as const },
            { label: 'Unix epoch', value: '0', unit: 'seconds' as const },
          ].map(({ label, value, unit }) => (
            <button key={label} type="button" onClick={() => {
              if (unit) setTimestampUnit(unit);
              handleInput(value, unit ?? timestampUnit);
            }}
              disabled={!value}
              className="min-h-11 px-3 py-1.5 text-xs font-mono border border-edge bg-surface text-ink-2 rounded-md hover:bg-muted disabled:cursor-wait transition-colors fine-pointer:min-h-9"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </ToolPage>
  );
}
