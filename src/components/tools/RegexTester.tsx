'use client';

import { useEffect, useState } from 'react';
import { ExamplePicker } from '@/components/tools/ExamplePicker';
import { ToolPage } from '@/components/tools/ToolPage';
import { copyText } from '@/lib/clipboard';
import { MAX_REGEX_MATCH_DETAILS, REGEX_TEST_TIMEOUT_MS, type RegexResult } from '@/lib/regex-utils';

const FLAG_OPTIONS = [
  { flag: 'g', label: 'Global'     },
  { flag: 'i', label: 'Ignore case'},
  { flag: 'm', label: 'Multiline'  },
  { flag: 's', label: 'Dot all'    },
];

const EXAMPLES = [
  { id: 'email', label: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'g',
    test: 'Contact us at hello@example.com or support@wutil.dev' },
  { id: 'url', label: 'URL', pattern: 'https?://[^\\s]+', flags: 'g',
    test: 'Visit https://wutil.m1ng.space or http://example.com for more.' },
  { id: 'ipv4', label: 'IPv4', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: 'g',
    test: 'Server IPs: 192.168.1.1 and 10.0.0.255' },
  { id: 'phone', label: 'Phone', pattern: '\\+?[1-9]\\d{1,14}', flags: 'g',
    test: 'Call us at +1234567890 or 0987654321' },
] as const;

export default function RegexTester() {
  const [pattern,    setPattern]    = useState('');
  const [flags,      setFlags]      = useState('g');
  const [testString, setTestString] = useState('');
  const [resultState, setResultState] = useState<{
    status: 'idle' | 'pending' | 'done';
    result: RegexResult | null;
  }>({ status: 'idle', result: null });

  const toggleFlag = (flag: string) =>
    setFlags((prev) => prev.includes(flag) ? prev.replace(flag, '') : prev + flag);

  const hasInput = Boolean(pattern && testString);

  useEffect(() => {
    if (!hasInput) return;

    let worker: Worker | null = null;
    let timeoutId: number | null = null;
    const debounceId = window.setTimeout(() => {
      setResultState({ status: 'pending', result: null });
      worker = new Worker(new URL('./regex.worker.ts', import.meta.url), { type: 'module' });

      timeoutId = window.setTimeout(() => {
        worker?.terminate();
        worker = null;
        setResultState({
          status: 'done',
          result: { valid: false, error: `Regex timed out after ${REGEX_TEST_TIMEOUT_MS}ms.` },
        });
      }, REGEX_TEST_TIMEOUT_MS);

      worker.onmessage = (event: MessageEvent<{ result: RegexResult }>) => {
        if (timeoutId !== null) window.clearTimeout(timeoutId);
        worker?.terminate();
        worker = null;
        setResultState({ status: 'done', result: event.data.result });
      };

      worker.onerror = () => {
        if (timeoutId !== null) window.clearTimeout(timeoutId);
        worker?.terminate();
        worker = null;
        setResultState({ status: 'done', result: { valid: false, error: 'Regex worker failed.' } });
      };

      worker.postMessage({ pattern, flags, testString });
    }, 120);

    return () => {
      window.clearTimeout(debounceId);
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      worker?.terminate();
    };
  }, [pattern, flags, testString, hasInput]);

  const result = hasInput ? resultState.result : null;
  const isTesting = hasInput && resultState.status === 'pending';

  return (
    <ToolPage
      toolId="regex-tester"
      title="Regex Tester"
      description="Test regular expressions with real-time match highlighting and capture group details."
      width="wide"
    >

      <ExamplePicker
        examples={EXAMPLES}
        onSelect={(example) => {
          setPattern(example.pattern);
          setFlags(example.flags);
          setTestString(example.test);
        }}
        className="mb-6"
      />

      {/* Pattern */}
      <div className="rounded-xl border border-edge bg-surface p-4 mb-4 focus-within:ring-2 focus-within:ring-[var(--w-ring)] focus-within:ring-offset-2 focus-within:ring-offset-canvas">
        <label htmlFor="regex-pattern" className="block text-xs font-semibold uppercase tracking-wider text-ink-3 mb-2">Pattern</label>
        <div className="flex items-center gap-2">
          <span className="text-ink-3 text-lg font-mono">/</span>
          <input
            id="regex-pattern"
            type="text" value={pattern}
            aria-describedby={result?.valid === false ? 'regex-error' : undefined}
            aria-invalid={result?.valid === false ? true : undefined}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter regex…"
            className="h-11 flex-1 font-mono text-ink bg-transparent border-0 outline-none text-sm placeholder:text-ink-3"
            spellCheck={false}
          />
          <span className="text-ink-3 text-lg font-mono">/{flags || ''}</span>
        </div>
        {result?.valid === false && (
          <p id="regex-error" role="alert" className="mt-2 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded-md px-3 py-2">
            {result.error}
          </p>
        )}
        {isTesting && (
          <p role="status" aria-live="polite" className="mt-2 text-xs font-medium text-ink-3 bg-muted rounded-md px-3 py-2">
            Testing regex…
          </p>
        )}
      </div>

      {/* Flags */}
      <div className="flex flex-wrap gap-4 mb-4">
        {FLAG_OPTIONS.map(({ flag, label }) => (
          <label key={flag} className="flex min-h-11 cursor-pointer items-center gap-2 fine-pointer:min-h-9">
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
        <label htmlFor="regex-test-string" className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">Test string</label>
        <textarea
          id="regex-test-string"
          className="h-28 w-full p-4 rounded-lg border border-edge bg-surface text-ink text-sm font-mono resize-none placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)] focus:ring-offset-2 focus:ring-offset-canvas transition-colors"
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
            Match details {result.matches.length === MAX_REGEX_MATCH_DETAILS && `(first ${MAX_REGEX_MATCH_DETAILS})`}
          </p>
          <div className="space-y-2">
            {result.matches.map((match, i) => (
              <button
                type="button"
                key={i}
                className="w-full min-h-11 flex items-start gap-3 text-left text-sm hover:bg-muted rounded-md px-2 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)]"
                onClick={() => { void copyText(match.text, 'Match copied'); }}
                aria-label={`Copy match ${i + 1}`}
              >
                <span className="shrink-0 w-5 h-5 flex items-center justify-center bg-muted border border-edge text-ink-3 rounded text-xs font-bold">
                  {i + 1}
                </span>
                <code className="font-mono text-xs text-ink bg-muted border border-edge px-1.5 py-0.5 rounded">{match.text}</code>
                <span className="text-xs text-ink-3 mt-0.5">idx {match.index}</span>
                {match.groups.length > 0 && (
                  <span className="text-xs text-ink-3 mt-0.5">
                    groups: {match.groups.map((g, gi) => (
                      <code key={gi} className="ml-1 font-mono bg-muted border border-edge px-1 rounded">{g ?? 'undefined'}</code>
                    ))}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </ToolPage>
  );
}
