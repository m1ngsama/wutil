'use client';

import { useMemo, useState } from 'react';
import { ToolPage } from '@/components/tools/ToolPage';
import { copyText } from '@/lib/clipboard';
import { calculateWordStats } from '@/lib/word-stats';

export default function WordCounterComponent() {
  const [text, setText] = useState('');

  const stats = useMemo(() => calculateWordStats(text), [text]);

  return (
    <ToolPage
      toolId="word-counter"
      title="Word Counter"
      description="Paste or type. Words, characters, reading time, and more update instantly."
      width="full"
    >

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Textarea */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <label htmlFor="word-counter-input" className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">
            Text to analyze
          </label>
          <textarea
            id="word-counter-input"
            className="h-[28rem] w-full p-4 rounded-xl border border-edge bg-surface text-ink text-sm resize-none placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)] focus:ring-offset-1 transition-colors"
            placeholder="Type or paste your text here…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setText('')}
              disabled={!text}
              className="h-11 px-4 text-sm font-medium border border-edge bg-surface text-ink rounded-md hover:bg-muted disabled:opacity-35 disabled:pointer-events-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-canvas fine-pointer:h-9"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => { void copyText(text); }}
              disabled={!text}
              className="h-11 px-4 text-sm font-medium bg-accent text-accent-fg rounded-md hover:bg-accent-hover disabled:opacity-35 disabled:pointer-events-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-canvas fine-pointer:h-9"
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
                { label: 'No spaces',        value: stats.charsNoSpaces.toLocaleString()  },
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
    </ToolPage>
  );
}
