'use client';

import { useState } from 'react';
import { ToolPage } from '@/components/tools/ToolPage';
import { Button } from '@/components/ui/Button';
import { CopyButton } from '@/components/ui/CopyButton';
import { calculateWordStats } from '@/lib/word-stats';

export default function WordCounterComponent() {
  const [text, setText] = useState('');

  const stats = calculateWordStats(text);

  return (
    <ToolPage
      toolId="word-counter"
      description="Paste or type. Words, characters, reading time, and more update instantly."
      width="wide"
    >

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-3 md:col-span-2">
          <p
            aria-hidden="true"
            className="sticky top-14 z-10 -mx-4 bg-canvas/95 px-4 py-2 sm:-mx-6 sm:px-6 text-sm text-ink-2 backdrop-blur md:hidden"
          >
            <span className="font-semibold tabular-nums text-ink">{(stats?.words ?? 0).toLocaleString()}</span> words ·{' '}
            <span className="font-semibold tabular-nums text-ink">{(stats?.chars ?? 0).toLocaleString()}</span> characters ·{' '}
            <span className="font-semibold tabular-nums text-ink">{(stats?.sentences ?? 0).toLocaleString()}</span> sentences
          </p>
          <div className="field-header">
            <label htmlFor="word-counter-input" className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">
              Text to analyze
            </label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={!text} onClick={() => setText('')}>
                Clear
              </Button>
              <CopyButton value={text} />
            </div>
          </div>
          <textarea
            id="word-counter-input"
            className="h-[28rem] w-full p-4 rounded-xl border border-edge bg-surface text-ink text-sm resize-none placeholder:text-ink-3 transition-colors"
            placeholder="Type or paste your text here…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="flex min-h-11 items-center text-xs font-semibold uppercase tracking-[0.14em] text-ink-3 fine-pointer:min-h-8">
            Statistics
          </h2>
          {stats ? (
            <div className="rounded-xl border border-edge bg-surface overflow-hidden">
              {[
                { label: 'Words', value: stats.words.toLocaleString() },
                { label: 'Characters', value: stats.chars.toLocaleString() },
                { label: 'No spaces', value: stats.charsNoSpaces.toLocaleString() },
                { label: 'Sentences', value: stats.sentences.toLocaleString() },
                { label: 'Paragraphs', value: stats.paragraphs.toLocaleString() },
                { label: 'Unique words', value: stats.uniqueWords.toLocaleString()},
                { label: 'Reading time', value: stats.readLabel },
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
