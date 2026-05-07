import type { Metadata } from 'next';
import { CHANGELOG_ENTRIES } from '@/lib/changelog';

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'Recent production updates and reliability improvements for wutil.',
};

export default function ChangelogPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-3 mb-2">Changelog</p>
        <h1 className="font-display text-4xl sm:text-5xl text-ink leading-none mb-3">Changelog</h1>
        <p className="text-base text-ink-2 max-w-[56ch]">
          Production updates, quality improvements, and user-facing reliability work.
        </p>
      </header>

      <div className="space-y-8">
        {CHANGELOG_ENTRIES.map((entry) => (
          <article key={entry.date} className="border-l border-edge pl-5">
            <time className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3" dateTime={entry.date}>
              {entry.date}
            </time>
            <h2 className="text-xl font-semibold text-ink mt-2 mb-2">{entry.title}</h2>
            <p className="text-sm leading-7 text-ink-2 mb-3">{entry.summary}</p>
            <ul className="space-y-2 text-sm leading-6 text-ink-2 list-disc pl-5">
              {entry.changes.map((change) => (
                <li key={change}>{change}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
