'use client';

import Link from 'next/link';
import { useEffect, type ReactNode } from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { useFavoriteToolIds } from '@/hooks/useFavoriteTools';
import { toggleFavoriteTool } from '@/lib/favorite-tools';
import { cn } from '@/lib/utils';
import { recordRecentTool } from '@/lib/recent-tools';
import { getRelatedTools, TOOL_CATEGORY_NAMES, TOOL_REGISTRY_BY_ID } from '@/lib/tool-registry';

type ToolPageWidth = 'compact' | 'narrow' | 'medium' | 'wide' | 'xwide' | 'full';

const WIDTH_CLASSES: Record<ToolPageWidth, string> = {
  compact: 'max-w-xl',
  narrow: 'max-w-2xl',
  medium: 'max-w-3xl',
  wide: 'max-w-4xl',
  xwide: 'max-w-5xl',
  full: 'max-w-7xl',
};

interface ToolPageProps {
  toolId: string;
  title: string;
  description: string;
  eyebrow?: string;
  width?: ToolPageWidth;
  children: ReactNode;
}

export function ToolPage({
  toolId,
  title,
  description,
  eyebrow,
  width = 'wide',
  children,
}: ToolPageProps) {
  const tool = TOOL_REGISTRY_BY_ID.get(toolId);
  const relatedTools = getRelatedTools(toolId);
  const categoryLabel = eyebrow ?? (tool ? TOOL_CATEGORY_NAMES[tool.category] : 'Tool');
  const favoriteToolIds = useFavoriteToolIds();
  const isFavorite = favoriteToolIds.includes(toolId);

  useEffect(() => {
    recordRecentTool(toolId);
  }, [toolId]);

  return (
    <div className={cn('tool-page-shell mx-auto px-4 py-10 sm:px-6 lg:px-8', WIDTH_CLASSES[width])}>
      <header className="tool-page-header mb-8">
        <div className="mb-2 flex min-h-11 items-center justify-between gap-4 fine-pointer:min-h-9">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-3">
            {categoryLabel}
          </p>
          {tool ? (
            <button
              type="button"
              aria-pressed={isFavorite}
              aria-label={isFavorite ? `Remove ${title} from favorites` : `Add ${title} to favorites`}
              title={isFavorite ? 'Remove from favorites on this device' : 'Save to favorites on this device'}
              onClick={() => toggleFavoriteTool(toolId)}
              className={cn(
                'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md border px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-canvas fine-pointer:min-h-9',
                isFavorite
                  ? 'border-accent bg-accent-subtle text-accent'
                  : 'border-edge bg-surface text-ink-2 hover:border-edge-strong hover:bg-muted',
              )}
            >
              <Star aria-hidden="true" className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={1.75} />
              {isFavorite ? 'Favorited' : 'Favorite'}
            </button>
          ) : null}
        </div>
        <h1 className="tool-page-title mb-3 font-display text-4xl leading-none text-ink sm:text-5xl">
          {title}
        </h1>
        <p className="tool-page-description max-w-[52ch] text-base leading-relaxed text-ink-2">
          {description}
        </p>
      </header>

      {children}

      {relatedTools.length > 0 ? (
        <section className="mt-16 border-t border-edge pt-8" aria-labelledby={`${toolId}-related-heading`}>
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <h2 id={`${toolId}-related-heading`} className="text-base font-semibold text-ink">
              Related tools
            </h2>
            <span className="text-xs text-ink-3">Keep working</span>
          </div>
          <ul className="border-b border-edge">
            {relatedTools.map((relatedTool) => (
              <li key={relatedTool.id} className="border-t border-edge">
                <Link
                  href={relatedTool.href}
                  className="group -mx-2 grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-md px-2 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink transition-colors group-hover:text-accent">
                      {relatedTool.name}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-ink-3">
                      {relatedTool.description}
                    </span>
                  </span>
                  <ArrowRight aria-hidden="true" className="h-4 w-4 text-ink-3 transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-accent" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
