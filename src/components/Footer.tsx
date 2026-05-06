import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-edge bg-canvas mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">

          <div className="space-y-1.5">
            <span className="font-display text-2xl text-ink leading-none">wutil</span>
            <p className="text-xs text-ink-3 max-w-[22ch] leading-relaxed">
              Free, private web tools. Everything runs in your browser — nothing is uploaded.
            </p>
          </div>

          <div className="flex items-center gap-5">
            <a
              href="https://github.com/m1ngsama/wutil"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold uppercase tracking-wider text-ink-3 hover:text-ink transition-colors"
            >
              GitHub
            </a>
            <Link
              href="/privacy"
              className="text-xs font-semibold uppercase tracking-wider text-ink-3 hover:text-ink transition-colors"
            >
              Privacy
            </Link>
            <span className="text-xs text-ink-3">
              &copy; {new Date().getFullYear()}
            </span>
          </div>

        </div>
      </div>
    </footer>
  );
}
