import Link from 'next/link';
import { ChevronLeft, ShieldCheck } from 'lucide-react';

export default function ToolsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <nav aria-label="Tool navigation" className="border-b border-edge bg-muted">
        <div className="mx-auto flex min-h-11 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-sm font-semibold text-ink-2 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-muted"
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
            All tools
          </Link>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-3">
            <ShieldCheck aria-hidden="true" className="h-4 w-4 text-accent" strokeWidth={1.75} />
            <span className="sr-only">Runs locally in your browser</span>
            <span aria-hidden="true" className="sm:hidden">Local</span>
            <span aria-hidden="true" className="hidden sm:inline">Runs locally in your browser</span>
          </span>
        </div>
      </nav>
      {children}
    </>
  );
}
