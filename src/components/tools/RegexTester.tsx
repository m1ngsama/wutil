'use client';

import { useState, useMemo } from 'react';
import { toast } from 'sonner';

const FLAG_OPTIONS = [
  { flag: 'g', label: 'Global'     },
  { flag: 'i', label: 'Ignore case'},
  { flag: 'm', label: 'Multiline'  },
  { flag: 's', label: 'Dot all'    },
];

const EXAMPLES = [
  { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'g',
    test: 'Contact us at hello@example.com or support@wutil.dev' },
  { name: 'URL',   pattern: 'https?://[^\\s]+', flags: 'g',
    test: 'Visit https://wutil.pages.dev or http://example.com for more.' },
  { name: 'IPv4',  pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: 'g',
    test: 'Server IPs: 192.168.1.1 and 10.0.0.255' },
  { name: 'Phone', pattern: '\\+?[1-9]\\d{1,14}', flags: 'g',
    test: 'Call us at +1234567890 or 0987654321' },
];

export default function RegexTester() {
  const [pattern,    setPattern]    = useState('');
  const [flags,      setFlags]      = useState('g');
  const [testString, setTestString] = useState('');

  const toggleFlag = (flag: string) =>
    setFlags((prev) => prev.includes(flag) ? prev.replace(flag, '') : prev + flag);

  type Result =
    | { valid: true;  matchCount: number; matches: RegExpMatchArray[]; parts: { text: string; isMatch: boolean }[] }
    | { valid: false; error: string };

  const result = useMemo((): Result | null => {
    if (!pattern || !testString) return null;
    try {
      new RegExp(pattern, flags); // validate first
      const ef = flags.includes('g') ? flags : flags + 'g';
      const allMatches = [...testString.matchAll(new RegExp(pattern, ef))];
      const globalRx = new RegExp(pattern, ef);
      const parts: { text: string; isMatch: boolean }[] = [];
      let lastIndex = 0, match;
      globalRx.lastIndex = 0;
      while ((match = globalRx.exec(testString)) !== null) {
        if (match.index > lastIndex) parts.push({ text: testString.slice(lastIndex, match.index), isMatch: false });
        parts.push({ text: match[0], isMatch: true });
        lastIndex = match.index + match[0].length;
        if (match[0].length === 0) globalRx.lastIndex++;
      }
      if (lastIndex < testString.length) parts.push({ text: testString.slice(lastIndex), isMatch: false });
      return { valid: true, matchCount: allMatches.length, matches: allMatches.slice(0, 20), parts };
    } catch (e) {
      return { valid: false, error: (e as Error).message };
    }
  }, [pattern, flags, testString]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-3 mb-2">Data & Dev</p>
        <h1 className="font-display text-4xl sm:text-5xl text-ink leading-none mb-3">Regex Tester</h1>
        <p className="text-base text-ink-2 max-w-[50ch]">Test regular expressions with real-time match highlighting and capture group details.</p>
      </header>

      {/* Examples */}
      <div className="flex flex-wrap gap-2 mb-6">
        {EXAMPLES.map((ex) => (
          <button key={ex.name} onClick={() => { setPattern(ex.pattern); setFlags(ex.flags); setTestString(ex.test); }}
            className="px-3 py-1.5 text-xs font-medium border border-edge bg-surface text-ink rounded-md hover:bg-muted transition-colors"
          >
            {ex.name}
          </button>
        ))}
      </div>

      {/* Pattern */}
      <div className="rounded-xl border border-edge bg-surface p-4 mb-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-ink-3 mb-2">Pattern</label>
        <div className="flex items-center gap-2">
          <span className="text-ink-3 text-lg font-mono">/</span>
          <input
            type="text" value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter regex…"
            className="flex-1 font-mono text-ink bg-transparent border-0 outline-none text-sm placeholder:text-ink-3"
            spellCheck={false}
          />
          <span className="text-ink-3 text-lg font-mono">/{flags || ''}</span>
        </div>
        {result?.valid === false && (
          <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded-md px-3 py-2">
            {result.error}
          </p>
        )}
      </div>

      {/* Flags */}
      <div className="flex flex-wrap gap-4 mb-4">
        {FLAG_OPTIONS.map(({ flag, label }) => (
          <label key={flag} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={flags.includes(flag)}
              onChange={() => toggleFlag(flag)}
              className="w-4 h-4 rounded border-edge accent-[var(--w-accent)]"
            />
            <span className="text-sm text-ink-2">
              <code className="text-xs bg-muted border border-edge px-1 rounded font-mono">{flag}</code>{' '}
              {label}
            </span>
          </label>
        ))}
      </div>

      {/* Test string */}
      <div className="flex flex-col gap-1.5 mb-4">
        <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">Test string</label>
        <textarea
          className="h-28 w-full p-4 rounded-lg border border-edge bg-surface text-ink text-sm font-mono resize-none placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)] focus:ring-offset-1 transition-colors"
          placeholder="Enter text to test against…"
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          spellCheck={false}
        />
      </div>

      {/* Highlighted matches */}
      {result?.valid && testString && (
        <div className="rounded-xl border border-edge bg-surface p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-3">Highlighted</span>
            <span className={`text-sm font-semibold ${result.matchCount > 0 ? 'text-green-600 dark:text-green-400' : 'text-ink-3'}`}>
              {result.matchCount} match{result.matchCount !== 1 ? 'es' : ''}
            </span>
          </div>
          <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap break-all text-ink-2">
            {result.parts.map((part, i) =>
              part.isMatch ? (
                <mark key={i} className="bg-yellow-200 dark:bg-yellow-800/60 text-yellow-900 dark:text-yellow-200 rounded px-0.5 not-italic">
                  {part.text}
                </mark>
              ) : (
                <span key={i}>{part.text}</span>
              )
            )}
          </div>
        </div>
      )}

      {/* Match list */}
      {result?.valid && result.matches.length > 0 && (
        <div className="rounded-xl border border-edge bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-3 mb-3">
            Match details {result.matches.length === 20 && '(first 20)'}
          </p>
          <div className="space-y-2">
            {result.matches.map((match, i) => (
              <div
                key={i}
                className="flex items-start gap-3 text-sm cursor-pointer hover:bg-muted rounded-md px-2 py-1.5 transition-colors"
                onClick={() => { navigator.clipboard.writeText(match[0]); toast.success('Match copied'); }}
              >
                <span className="shrink-0 w-5 h-5 flex items-center justify-center bg-muted border border-edge text-ink-3 rounded text-xs font-bold">
                  {i + 1}
                </span>
                <code className="font-mono text-xs text-ink bg-muted border border-edge px-1.5 py-0.5 rounded">{match[0]}</code>
                <span className="text-xs text-ink-3 mt-0.5">idx {match.index}</span>
                {match.length > 1 && (
                  <span className="text-xs text-ink-3 mt-0.5">
                    groups: {match.slice(1).map((g, gi) => (
                      <code key={gi} className="ml-1 font-mono bg-muted border border-edge px-1 rounded">{g ?? 'undefined'}</code>
                    ))}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
