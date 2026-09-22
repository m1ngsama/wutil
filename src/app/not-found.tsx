import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { TOOL_REGISTRY } from '@/lib/tool-registry';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink-3">
        404 · Page not found
      </p>
      <h1 className="font-display text-4xl leading-none text-ink sm:text-5xl">
        That tool is not here.
      </h1>
      <p className="mt-4 max-w-[50ch] text-base leading-relaxed text-ink-2">
        The address may have changed. Pick one of the tools below instead.
      </p>

      <ul className="mt-8 grid border-b border-edge sm:grid-cols-2 sm:gap-x-8">
        {TOOL_REGISTRY.map((tool) => (
          <li key={tool.id} className="border-t border-edge">
            <Link
              href={tool.href}
              className="group -mx-2 flex min-h-12 items-center justify-between gap-3 rounded-md px-2 py-2 text-sm font-semibold text-ink transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
            >
              {tool.name}
              <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-ink-3 transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-accent" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
