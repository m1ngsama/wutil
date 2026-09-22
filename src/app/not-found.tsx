import Link from 'next/link';
import { ArrowRight, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-3xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full border-y border-edge py-12 sm:py-16">
        <SearchX aria-hidden="true" className="mb-6 h-8 w-8 text-accent" strokeWidth={1.5} />
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink-3">
          404 · Page not found
        </p>
        <h1 className="font-display text-4xl leading-none text-ink sm:text-5xl">
          That tool is not here.
        </h1>
        <p className="mt-4 max-w-[50ch] text-base leading-relaxed text-ink-2">
          The address may have changed, or the tool may not exist yet. Return to the directory and search by name or task.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        >
          Browse all tools
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
