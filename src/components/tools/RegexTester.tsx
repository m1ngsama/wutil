'use client';

import { useState, useMemo } from 'react';
import { toast } from 'sonner';

const FLAG_OPTIONS = [
  { flag: 'g', label: 'Global', description: 'Find all matches' },
  { flag: 'i', label: 'Case insensitive', description: 'Ignore case' },
  { flag: 'm', label: 'Multiline', description: '^ and $ match line start/end' },
  { flag: 's', label: 'Dot all', description: '. matches newlines' },
];

const EXAMPLES = [
  { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'g', test: 'Contact us at hello@example.com or support@wutil.dev' },
  { name: 'URL', pattern: 'https?://[^\\s]+', flags: 'g', test: 'Visit https://wutil.pages.dev or http://example.com for more.' },
  { name: 'IPv4', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: 'g', test: 'Server IPs: 192.168.1.1 and 10.0.0.255' },
  { name: 'Phone', pattern: '\\+?[1-9]\\d{1,14}', flags: 'g', test: 'Call us at +1234567890 or 0987654321' },
];

export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');

  type RegexResult =
    | { valid: true; matchCount: number; matches: RegExpMatchArray[]; parts: { text: string; isMatch: boolean }[] }
    | { valid: false; error: string };

  const result = useMemo((): RegexResult | null => {
    if (!pattern || !testString) return null;
    try {
      new RegExp(pattern, flags); // validate
      // Use the same effective flags for both count and highlighting so they stay in sync
      const effectiveFlags = flags.includes('g') ? flags : flags + 'g';
      const allMatches = [...testString.matchAll(new RegExp(pattern, effectiveFlags))];

      const globalRegex = new RegExp(pattern, effectiveFlags);
      let match;
      const parts: { text: string; isMatch: boolean }[] = [];
      let lastIndex = 0;

      globalRegex.lastIndex = 0;
      while ((match = globalRegex.exec(testString)) !== null) {
        if (match.index > lastIndex) {
          parts.push({ text: testString.slice(lastIndex, match.index), isMatch: false });
        }
        parts.push({ text: match[0], isMatch: true });
        lastIndex = match.index + match[0].length;
        // Advance past zero-length matches to prevent infinite loop (e.g. .* a* ^)
        if (match[0].length === 0) {
          globalRegex.lastIndex++;
        }
      }
      if (lastIndex < testString.length) {
        parts.push({ text: testString.slice(lastIndex), isMatch: false });
      }

      return { valid: true, matchCount: allMatches.length, matches: allMatches.slice(0, 20), parts };
    } catch (e) {
      return { valid: false, error: (e as Error).message };
    }
  }, [pattern, flags, testString]);

  const toggleFlag = (flag: string) => {
    setFlags((prev) => prev.includes(flag) ? prev.replace(flag, '') : prev + flag);
  };

  const loadExample = (ex: typeof EXAMPLES[0]) => {
    setPattern(ex.pattern);
    setFlags(ex.flags);
    setTestString(ex.test);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Regex Tester</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Test and debug regular expressions with real-time match highlighting.
        </p>
      </div>

      {/* Quick Examples */}
      <div className="flex flex-wrap gap-2 mb-6">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.name}
            onClick={() => loadExample(ex)}
            className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
          >
            {ex.name}
          </button>
        ))}
      </div>

      {/* Pattern Input */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Pattern</label>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-lg font-mono">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter regex pattern..."
            className="flex-1 font-mono text-gray-900 dark:text-gray-100 bg-transparent border-0 outline-none text-sm"
          />
          <span className="text-gray-400 text-lg font-mono">/{flags}</span>
        </div>
        {result !== null && !result.valid && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{result.error}</p>
        )}
      </div>

      {/* Flags */}
      <div className="flex flex-wrap gap-3 mb-4">
        {FLAG_OPTIONS.map(({ flag, label }) => (
          <label key={flag} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={flags.includes(flag)}
              onChange={() => toggleFlag(flag)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded">{flag}</code> {label}
            </span>
          </label>
        ))}
      </div>

      {/* Test String */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Test String</label>
        <textarea
          className="w-full h-32 p-4 border border-gray-300 dark:border-gray-700 rounded-xl font-mono text-sm resize-y focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Enter text to test against..."
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
        />
      </div>

      {/* Match Highlighting */}
      {result !== null && result.valid && testString && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Matches</span>
            <span className={`text-sm font-semibold ${result.matchCount > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
              {result.matchCount} match{result.matchCount !== 1 ? 'es' : ''}
            </span>
          </div>
          <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap break-all">
            {result.parts.map((part, i) =>
              part.isMatch ? (
                <mark key={i} className="bg-yellow-200 dark:bg-yellow-800/60 text-yellow-900 dark:text-yellow-200 rounded px-0.5">
                  {part.text}
                </mark>
              ) : (
                <span key={i} className="text-gray-700 dark:text-gray-300">{part.text}</span>
              )
            )}
          </div>
        </div>
      )}

      {/* Match List */}
      {result !== null && result.valid && result.matches.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
            Match Details (showing up to 20)
          </p>
          <div className="space-y-2">
            {result.matches.map((match, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-bold">
                  {i + 1}
                </span>
                <div>
                  <code className="text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">{match[0]}</code>
                  <span className="ml-2 text-xs text-gray-500">at index {match.index}</span>
                  {match.length > 1 && (
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Groups: {match.slice(1).map((g, gi) => (
                        <code key={gi} className="ml-1 bg-gray-100 dark:bg-gray-700 px-1 rounded">{g ?? 'undefined'}</code>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
