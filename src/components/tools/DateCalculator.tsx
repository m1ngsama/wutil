'use client';

import { useState, useMemo } from 'react';
import { copyText } from '@/lib/clipboard';
import { addCalendarDays, daysBetween, toDateInputValue } from '@/lib/date-utils';

const todayStr = () => toDateInputValue(new Date());

export default function DateCalculator() {
  const [tab, setTab] = useState<'diff' | 'add'>('diff');

  // Diff tab
  const [start, setStart] = useState(todayStr);
  const [end, setEnd]     = useState(todayStr);

  // Add tab
  const [base, setBase]     = useState(todayStr);
  const [delta, setDelta]   = useState<string>('7');
  const [direction, setDir] = useState<'+' | '-'>('+');

  // --- Diff result ---
  const diff = useMemo(() => {
    if (!start || !end) return null;
    const s = new Date(start + 'T00:00:00');
    const e = new Date(end   + 'T00:00:00');
    const days = daysBetween(s, e);
    return {
      days,
      absDays: Math.abs(days),
      weeks:   (Math.abs(days) / 7).toFixed(1),
      months:  (Math.abs(days) / 30.4375).toFixed(1),
      years:   (Math.abs(days) / 365.25).toFixed(2),
      label:   days < 0 ? 'before' : days > 0 ? 'after' : 'same day',
    };
  }, [start, end]);

  // --- Add result ---
  const addResult = useMemo(() => {
    if (!base || !delta || isNaN(Number(delta))) return null;
    const d = new Date(base + 'T00:00:00');
    const n = direction === '+' ? Number(delta) : -Number(delta);
    return toDateInputValue(addCalendarDays(d, n));
  }, [base, delta, direction]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-3 mb-2">Calculators</p>
        <h1 className="font-display text-4xl sm:text-5xl text-ink leading-none mb-3">Date Calculator</h1>
        <p className="text-base text-ink-2 max-w-[48ch]">Find the difference between two dates, or add and subtract days.</p>
      </header>

      {/* Tab switcher */}
      <div className="flex rounded-md border border-edge overflow-hidden mb-8 w-fit">
        {([['diff', 'Date difference'], ['add', 'Add / subtract days']] as const).map(([id, label]) => (
          <button
            type="button"
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === id ? 'bg-accent text-accent-fg' : 'bg-surface text-ink hover:bg-muted'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Diff tab ── */}
      {tab === 'diff' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Start date', value: start, set: setStart },
              { label: 'End date',   value: end,   set: setEnd   },
            ].map(({ label, value, set }) => (
              <div key={label} className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">{label}</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    className="flex-1 h-10 px-3 rounded-md border border-edge bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)] focus:ring-offset-1"
                  />
                  <button
                    type="button"
                    onClick={() => set(todayStr())}
                    className="h-10 px-3 rounded-md border border-edge bg-surface text-xs font-semibold text-ink-2 hover:bg-muted transition-colors"
                  >
                    Today
                  </button>
                </div>
              </div>
            ))}
          </div>

          {diff && (
            <div className="rounded-xl border border-edge bg-surface p-5">
              {diff.absDays === 0 ? (
                <p className="text-ink-2 text-sm">Same day.</p>
              ) : (
                <>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3 mb-4">
                    End is {diff.label} start
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Days',   value: diff.absDays.toString() },
                      { label: 'Weeks',  value: diff.weeks  },
                      { label: 'Months', value: `~${diff.months}` },
                      { label: 'Years',  value: `~${diff.years}` },
                    ].map(({ label, value }) => (
                      <button
                        type="button"
                        key={label}
                        className="flex flex-col items-center justify-center rounded-lg bg-muted border border-edge p-4 hover:border-edge-strong transition-colors"
                        onClick={() => { void copyText(value.replace('~', ''), `${label} copied`); }}
                        title="Click to copy"
                        aria-label={`Copy ${label.toLowerCase()} value ${value.replace('~', '')}`}
                      >
                        <span className="font-display text-2xl text-ink leading-none mb-1">{value}</span>
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-3">{label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Add tab ── */}
      {tab === 'add' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">Starting date</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={base}
                onChange={(e) => setBase(e.target.value)}
                className="flex-1 h-10 px-3 rounded-md border border-edge bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)] focus:ring-offset-1"
              />
              <button
                type="button"
                onClick={() => setBase(todayStr())}
                className="h-10 px-3 rounded-md border border-edge bg-surface text-xs font-semibold text-ink-2 hover:bg-muted transition-colors"
              >
                Today
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">Days to add / subtract</label>
            <div className="flex gap-2">
              <div className="flex rounded-md border border-edge overflow-hidden">
                {(['+', '-'] as const).map((d) => (
                  <button
                    type="button"
                    key={d}
                    onClick={() => setDir(d)}
                    className={`w-10 font-mono text-base font-bold transition-colors ${
                      direction === d ? 'bg-accent text-accent-fg' : 'bg-surface text-ink hover:bg-muted'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={0}
                value={delta}
                onChange={(e) => setDelta(e.target.value)}
                className="w-28 h-10 px-3 rounded-md border border-edge bg-surface text-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)] focus:ring-offset-1"
              />
              <span className="flex items-center text-sm text-ink-3">days</span>
            </div>
          </div>

          {addResult && (
            <button
              type="button"
              className="w-full rounded-xl border border-edge bg-surface p-5 text-left hover:border-edge-strong transition-colors"
              onClick={() => { void copyText(addResult, 'Date copied'); }}
              title="Click to copy"
              aria-label={`Copy result date ${addResult}`}
            >
              <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-ink-3 mb-2">Result</span>
              <span className="block font-display text-3xl text-ink">{addResult}</span>
              <span className="block text-xs text-ink-3 mt-1">
                {new Date(addResult + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </button>
          )}

          {/* Quick presets */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3 mb-2">Quick presets</p>
            <div className="flex flex-wrap gap-2">
              {[7, 14, 30, 90, 180, 365].map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => { setDelta(String(n)); setDir('+'); }}
                  className="px-3 py-1.5 text-xs font-medium border border-edge bg-surface text-ink rounded-md hover:bg-muted transition-colors"
                >
                  +{n}d
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
