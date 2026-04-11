'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

const CHARS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

function getStrength(password: string): { label: string; color: string; width: string } {
  if (!password) return { label: '', color: '', width: '0%' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { label: 'Weak', color: 'bg-red-500', width: '25%' };
  if (score <= 4) return { label: 'Fair', color: 'bg-yellow-500', width: '50%' };
  if (score <= 5) return { label: 'Good', color: 'bg-blue-500', width: '75%' };
  return { label: 'Strong', color: 'bg-green-500', width: '100%' };
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false,
  });
  const [password, setPassword] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  const generate = useCallback(() => {
    const charset = Object.entries(options)
      .filter(([, enabled]) => enabled)
      .map(([key]) => CHARS[key as keyof typeof CHARS])
      .join('');

    if (!charset) {
      toast.error('Select at least one character type');
      return;
    }

    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    const pwd = Array.from(array, (n) => charset[n % charset.length]).join('');
    setPassword(pwd);
    setHistory((prev) => [pwd, ...prev].slice(0, 5));
  }, [length, options]);

  const copy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    toast.success('Password copied!');
  };

  const strength = getStrength(password);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Password Generator</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Generate secure, random passwords with cryptographically strong randomness.
        </p>
      </div>

      {/* Password Output */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="flex-1 font-mono text-lg tracking-widest text-gray-900 dark:text-gray-100 break-all min-h-[1.75rem]">
            {password || <span className="text-gray-400 dark:text-gray-600 font-sans text-base tracking-normal">Click Generate...</span>}
          </span>
          <button
            onClick={copy}
            disabled={!password}
            className="shrink-0 px-3 py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40"
          >
            Copy
          </button>
        </div>
        {password && (
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500 dark:text-gray-400">Strength</span>
              <span className={`font-medium ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${strength.color}`}
                style={{ width: strength.width }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5 mb-4">
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Length</label>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{length}</span>
          </div>
          <input
            type="range"
            min={4}
            max={64}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>4</span><span>64</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(options) as (keyof typeof options)[]).map((key) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${options[key] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                onClick={() => setOptions((prev) => ({ ...prev, [key]: !prev[key] }))}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${options[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{key}</span>
              <span className="text-xs text-gray-400 font-mono hidden sm:inline">
                {key === 'uppercase' ? 'A-Z' : key === 'lowercase' ? 'a-z' : key === 'numbers' ? '0-9' : '!@#'}
              </span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={generate}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition-colors"
      >
        Generate Password
      </button>

      {/* History */}
      {history.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recent passwords</h3>
          <div className="space-y-2">
            {history.map((pwd, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2"
              >
                <span className="font-mono text-sm text-gray-700 dark:text-gray-300 truncate flex-1 mr-3">{pwd}</span>
                <button
                  onClick={() => { navigator.clipboard.writeText(pwd); toast.success('Copied!'); }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline shrink-0"
                >
                  Copy
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
