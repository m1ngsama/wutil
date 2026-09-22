import Link from 'next/link';
import { GlobalToolSearch } from './GlobalToolSearch';
import { ThemeToggle } from './ThemeToggle';

export default function Navbar() {
  return (
    <nav aria-label="Primary navigation" className="site-navbar sticky top-0 z-50 w-full border-b border-edge bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">

          <Link
            href="/"
            className="group flex min-h-11 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          >
            <span className="font-display text-[1.6rem] leading-none text-ink">
              wutil
            </span>
            <span className="hidden sm:block text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3 mt-0.5">
              Web Utilities
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <GlobalToolSearch />
            <Link
              href="https://github.com/m1ngsama/wutil"
              target="_blank"
              rel="noreferrer"
              className="hidden h-11 w-11 touch-manipulation items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-canvas sm:flex fine-pointer:h-9 fine-pointer:w-9"
              aria-label="View wutil on GitHub"
            >
              <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" className="h-4 w-4">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </Link>
            <ThemeToggle />
          </div>

        </div>
      </div>
    </nav>
  );
}
