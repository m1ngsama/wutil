'use client';

import Link from 'next/link';
import { useEffect, type ReactNode } from 'react';
import { ArrowForwardOutline, ChevronBackOutline, ShieldCheckmarkOutline, Star, StarOutline } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { addRecentToolId, favoriteToolStore, recentToolStore, toggleFavoriteToolId } from '@/lib/tool-store';
import { getRelatedTools, TOOL_REGISTRY_BY_ID } from '@/lib/tool-registry';

interface ToolPageProps {
  toolId: string;
  description: string;
  width?: 'narrow' | 'wide';
  children: ReactNode;
}

export function ToolPage({
  toolId,
  description,
  width = 'narrow',
  children,
}: ToolPageProps) {
  const tool = TOOL_REGISTRY_BY_ID.get(toolId)!;
  const relatedTools = getRelatedTools(toolId);
  const favoriteToolIds = favoriteToolStore.useIds();
  const isFavorite = favoriteToolIds.includes(toolId);

  useEffect(() => {
    recentToolStore.update((ids) => addRecentToolId(ids, toolId));
  }, [toolId]);

  return (
    <div className={cn('tool-page-shell mx-auto px-4 py-6 sm:px-6 sm:py-10 lg:px-8', width === 'wide' ? 'max-w-6xl' : 'max-w-3xl')}>
      <header className="tool-page-header mb-6 sm:mb-8">
        <div className="mb-2 flex min-h-11 flex-wrap items-center justify-between gap-2 fine-pointer:min-h-9">
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm text-ink-3">
            <Link
              href="/"
              className="-ml-2 inline-flex min-h-11 shrink-0 items-center gap-1 rounded-md px-2 font-medium text-ink-2 transition-colors hover:text-ink fine-pointer:min-h-9"
            >
              <ChevronBackOutline aria-hidden="true" className="h-4 w-4" />
              All tools
            </Link>
          </nav>
          <div className="flex shrink-0 items-center gap-1">
            <span className="inline-flex min-h-11 items-center gap-1.5 px-2 text-xs font-medium text-ink-3 fine-pointer:min-h-9" title="Runs locally in your browser">
              <ShieldCheckmarkOutline aria-hidden="true" className="h-4 w-4 text-accent" />
              <span className="sr-only sm:not-sr-only">Runs locally</span>
            </span>
            <button
              type="button"
              aria-pressed={isFavorite}
              aria-label={isFavorite ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`}
              title={isFavorite ? 'Remove from favorites on this device' : 'Save to favorites on this device'}
              onClick={() => favoriteToolStore.update((ids) => toggleFavoriteToolId(ids, toolId))}
              className={cn(
                'inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md border text-xs font-semibold transition-colors sm:px-3 fine-pointer:min-h-9 fine-pointer:min-w-9',
                isFavorite
                  ? 'border-accent bg-accent-subtle text-accent'
                  : 'border-edge bg-surface text-ink-2 hover:border-edge-strong hover:bg-muted',
              )}
            >
              {isFavorite ? <Star aria-hidden="true" className="h-4 w-4" /> : <StarOutline aria-hidden="true" className="h-4 w-4" />}
              <span aria-hidden="true" className="hidden sm:inline">{isFavorite ? 'Favorited' : 'Favorite'}</span>
            </button>
          </div>
        </div>
        <h1 className="page-title tool-page-title mb-3 text-ink">
          {tool.name}
        </h1>
        <p className="tool-page-description max-w-[64ch] text-sm leading-relaxed text-ink-2 sm:text-base">
          {description}
        </p>
      </header>

      {children}

      {relatedTools.length > 0 ? (
        <section className="mt-16 border-t border-edge pt-8" aria-labelledby={`${toolId}-related-heading`}>
          <h2 id={`${toolId}-related-heading`} className="mb-3 text-base font-semibold text-ink">
            Related tools
          </h2>
          <ul className="border-b border-edge">
            {relatedTools.map((relatedTool) => (
              <li key={relatedTool.id} className="border-t border-edge">
                <Link
                  href={relatedTool.href}
                  className="group -mx-2 grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-md px-2 py-3"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink transition-colors group-hover:text-accent">
                      {relatedTool.name}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-ink-3">
                      {relatedTool.description}
                    </span>
                  </span>
                  <ArrowForwardOutline aria-hidden="true" className="h-4 w-4 text-ink-3 transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-accent" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
