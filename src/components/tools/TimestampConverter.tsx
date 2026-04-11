'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const FORMATS = [
  { label: 'ISO 8601', fn: (d: Date) => d.toISOString() },
  { label: 'UTC String', fn: (d: Date) => d.toUTCString() },
  { label: 'Local String', fn: (d: Date) => d.toLocaleString() },
  { label: 'Date only', fn: (d: Date) => d.toISOString().split('T')[0] },
  { label: 'Time only', fn: (d: Date) => d.toISOString().split('T')[1].split('.')[0] + ' UTC' },
  { label: 'Unix (ms)', fn: (d: Date) => String(d.getTime()) },
];

export default function TimestampConverter() {
  const [timestamp, setTimestamp] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null);

  // Client-only: current time
  useEffect(() => {
    setNow(Math.floor(Date.now() / 1000));
    const interval = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);

  const parse = (value: string) => {
    setTimestamp(value);
    if (!value.trim()) {
      setDate(null);
      setError(null);
      return;
    }
    // Try as unix timestamp (seconds or ms)
    const num = Number(value);
    if (!isNaN(num)) {
      // If it looks like seconds (< 1e12) vs ms
      const ms = num < 1e12 ? num * 1000 : num;
      const d = new Date(ms);
      if (isNaN(d.getTime())) {
        setError('Invalid timestamp');
        setDate(null);
      } else {
        setDate(d);
        setError(null);
      }
      return;
    }
    // Try as date string
    const d = new Date(value);
    if (isNaN(d.getTime())) {
      setError('Cannot parse. Try a Unix timestamp (e.g. 1700000000) or ISO date.');
      setDate(null);
    } else {
      setDate(d);
      setError(null);
    }
  };

  const useNow = () => {
    const ts = String(Math.floor(Date.now() / 1000));
    parse(ts);
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Timestamp Converter</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Convert Unix timestamps to human-readable dates and vice versa.
        </p>
      </div>

      {/* Current Time Banner */}
      {now !== null && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">Current Unix Timestamp</p>
            <p className="font-mono text-2xl font-bold text-blue-700 dark:text-blue-300">{now}</p>
            <p className="text-xs text-blue-500 dark:text-blue-400 mt-0.5">{new Date(now * 1000).toUTCString()}</p>
          </div>
          <button
            onClick={useNow}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Use Now
          </button>
        </div>
      )}

      {/* Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Enter Timestamp or Date String
        </label>
        <input
          type="text"
          value={timestamp}
          onChange={(e) => parse(e.target.value)}
          placeholder="e.g. 1700000000 or 2024-01-15T12:00:00Z"
          className={`w-full px-4 py-3 border rounded-xl font-mono text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
            error ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
          }`}
        />
        {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>

      {/* Output Formats */}
      {date && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Converted Formats</p>
          {FORMATS.map(({ label, fn }) => {
            const value = fn(date);
            return (
              <div key={label} className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span className="shrink-0 text-xs font-semibold text-gray-500 dark:text-gray-400 w-28">{label}</span>
                  <code className="font-mono text-sm text-gray-900 dark:text-gray-100 truncate">{value}</code>
                </div>
                <button
                  onClick={() => copy(value)}
                  className="shrink-0 ml-3 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Copy
                </button>
              </div>
            );
          })}

          {/* Relative time */}
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Relative to now</span>
            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
              {(() => {
                const diffMs = date.getTime() - Date.now();
                const abs = Math.abs(diffMs);
                const past = diffMs < 0;
                if (abs < 60000) return `${Math.round(abs / 1000)} seconds ${past ? 'ago' : 'from now'}`;
                if (abs < 3600000) return `${Math.round(abs / 60000)} minutes ${past ? 'ago' : 'from now'}`;
                if (abs < 86400000) return `${Math.round(abs / 3600000)} hours ${past ? 'ago' : 'from now'}`;
                if (abs < 2592000000) return `${Math.round(abs / 86400000)} days ${past ? 'ago' : 'from now'}`;
                if (abs < 31536000000) return `${Math.round(abs / 2592000000)} months ${past ? 'ago' : 'from now'}`;
                return `${Math.round(abs / 31536000000)} years ${past ? 'ago' : 'from now'}`;
              })()}
            </p>
          </div>
        </div>
      )}

      {/* Examples */}
      <div className="mt-8">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Try an example</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: '2024-01-01', value: '2024-01-01T00:00:00Z' },
            { label: '1700000000', value: '1700000000' },
            { label: '0 (epoch)', value: '0' },
          ].map(({ label, value }) => (
            <button
              key={label}
              onClick={() => parse(value)}
              className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 font-mono"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
