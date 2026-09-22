import Link from 'next/link';

const GITHUB_ISSUE_URL = 'https://github.com/m1ngsama/wutil/issues/new';
const SUGGEST_TOOL_URL = `${GITHUB_ISSUE_URL}?title=${encodeURIComponent('Tool request: ')}&body=${encodeURIComponent('What should the tool do?\n\nExample input and expected output:\n\nWhy is browser-only processing useful here?\n')}`;
const REPORT_BUG_URL = `${GITHUB_ISSUE_URL}?title=${encodeURIComponent('Bug: ')}&body=${encodeURIComponent('What happened?\n\nSteps to reproduce:\n1. \n2. \n\nExpected result:\n\nBrowser and device:\n')}`;

const FOOTER_LINKS = [
  ['Suggest a tool', SUGGEST_TOOL_URL],
  ['Report a bug', REPORT_BUG_URL],
  ['GitHub', 'https://github.com/m1ngsama/wutil'],
  ['Privacy', '/privacy'],
  ['Changelog', '/changelog'],
];

export default function Footer() {
  return (
    <footer className="border-t border-edge bg-canvas mt-auto">
      <div className="site-footer-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">

          <div className="space-y-1.5">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center rounded-md font-display text-2xl leading-none text-ink fine-pointer:min-h-0"
            >
              wutil
            </Link>
            <p className="max-w-[34ch] text-xs leading-relaxed text-ink-3">
              Free, private web tools. Everything runs in your browser, and nothing is uploaded.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 sm:gap-5">
            {FOOTER_LINKS.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                {...(href.startsWith('https:') && { target: '_blank', rel: 'noreferrer' })}
                className="inline-flex min-h-11 items-center rounded-sm text-xs font-semibold uppercase tracking-wider text-ink-3 transition-colors hover:text-ink fine-pointer:min-h-0"
              >
                {label}
              </Link>
            ))}
            <span className="text-xs text-ink-3">
              &copy; {new Date().getFullYear()}
            </span>
          </div>

        </div>
      </div>
    </footer>
  );
}
