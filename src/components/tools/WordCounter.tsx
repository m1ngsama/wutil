'use client';

import { useMemo } from 'react';
import { useState } from 'react';
import { copyText } from '@/lib/clipboard';

// Sentence splitting that handles common abbreviations and decimals
function countSentences(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  // Split on . ! ? followed by whitespace or end, filter fragments < 2 chars
  const raw = trimmed.split(/(?<=[.!?])\s+(?=[A-Z"'])/);
  return raw.filter((s) => s.trim().length > 1).length || 1;
}

const READING_WPM = 238; // average adult silent reading speed

export default function WordCounterComponent() {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    if (!text.trim()) return null;
    const words      = text.trim().split(/\s+/).filter(Boolean).length;
    const chars      = text.length;
    const charsNoSp  = text.replace(/\s/g, '').length;
    const sentences  = countSentences(text);
    const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim()).length || 1;
    const readSec    = Math.round((words / READING_WPM) * 60);
    const readMin    = Math.floor(readSec / 60);
    const readLabel  = readMin > 0
      ? `${readMin}m ${readSec % 60}s`
      : `${readSec}s`;
    const uniqueWords = new Set(text.toLowerCase().match(/\b[a-z']+\b/g) ?? []).size;

    return { words, chars, charsNoSp, sentences, paragraphs, readLabel, uniqueWords };
  }, [text]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-3 mb-2">Text</p>
        <h1 className="font-display text-4xl sm:text-5xl text-ink leading-none mb-3">Word Counter</h1>
        <p className="text-base text-ink-2 max-w-[48ch]">Paste or type — words, characters, reading time, and more update instantly.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Textarea */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <textarea
            className="h-[28rem] w-full p-4 rounded-xl border border-edge bg-surface text-ink text-sm resize-none placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)] focus:ring-offset-1 transition-colors"
            placeholder="Type or paste your text here…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={() => setText('')}
              disabled={!text}
              className="h-9 px-4 text-sm font-medium border border-edge bg-surface text-ink rounded-md hover:bg-muted disabled:opacity-35 disabled:pointer-events-none transition-colors"
            >
              Clear
            </button>
            <button
              onClick={() => { void copyText(text); }}
              disabled={!text}
              className="h-9 px-4 text-sm font-medium bg-accent text-accent-fg rounded-md hover:bg-accent-hover disabled:opacity-35 disabled:pointer-events-none transition-colors"
            >
              Copy text
            </button>
          </div>
        </div>

        {/* Stats panel */}
        <div className="lg:col-span-1">
          {stats ? (
            <div className="rounded-xl border border-edge bg-surface overflow-hidden">
              {[
                { label: 'Words',            value: stats.words.toLocaleString()      },
                { label: 'Characters',       value: stats.chars.toLocaleString()      },
                { label: 'No spaces',        value: stats.charsNoSp.toLocaleString()  },
                { label: 'Sentences',        value: stats.sentences.toLocaleString()  },
                { label: 'Paragraphs',       value: stats.paragraphs.toLocaleString() },
                { label: 'Unique words',     value: stats.uniqueWords.toLocaleString()},
                { label: 'Reading time',     value: stats.readLabel                   },
              ].map(({ label, value }, i, arr) => (
                <div
                  key={label}
                  className={`flex items-center justify-between px-5 py-3.5 ${i < arr.length - 1 ? 'border-b border-edge' : ''}`}
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-3">{label}</span>
                  <span className="font-display text-xl text-ink leading-none">{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-edge bg-surface p-8 text-center">
              <p className="text-ink-3 text-sm">Stats appear here once you start typing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
