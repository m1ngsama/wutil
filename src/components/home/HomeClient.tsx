'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ComponentType } from 'react';
import { Button } from '@/components/ui/Button';
import { favoriteToolStore, recentToolStore } from '@/lib/tool-store';
import {
  searchTools,
  TOOL_CATEGORY_NAMES,
  TOOL_REGISTRY,
  TOOL_REGISTRY_BY_ID,
  type ToolCategory,
  type ToolRegistryItem,
} from '@/lib/tool-registry';
import {
  ArrowForwardOutline,
  BarcodeOutline,
  CalendarOutline,
  CodeOutline,
  CodeSlashOutline,
  CodeWorkingOutline,
  ColorPaletteOutline,
  DocumentTextOutline,
  DocumentsOutline,
  FingerPrintOutline,
  ImageOutline,
  KeyOutline,
  LinkOutline,
  ResizeOutline,
  SearchOutline,
  TextOutline,
  TimeOutline,
  type IconProps,
} from '@/components/ui/icons';

const toolIcons: Record<string, ComponentType<IconProps>> = {
  'password-generator': KeyOutline,
  'color-converter': ColorPaletteOutline,
  'url-encoder': LinkOutline,
  'text-case': TextOutline,
  'regex-tester': CodeWorkingOutline,
  timestamp: TimeOutline,
  'word-counter': DocumentTextOutline,
  'json-formatter': CodeSlashOutline,
  'base64-converter': CodeOutline,
  'unit-converter': ResizeOutline,
  'hash-generator': FingerPrintOutline,
  'uuid-generator': BarcodeOutline,
  'date-calculator': CalendarOutline,
  'image-converter': ImageOutline,
  'pdf-merge': DocumentsOutline,
};

const categories: ReadonlyArray<{
  id: 'all' | ToolCategory;
  name: string;
}> = [
  { id: 'all', name: 'All tools' },
  ...Object.entries(TOOL_CATEGORY_NAMES).map(([id, name]) => ({
    id: id as ToolCategory,
    name,
  })),
];

function ToolDirectory({ tools }: { tools: ToolRegistryItem[] }) {
  return (
    <ul className="grid grid-cols-1 border-b border-edge sm:grid-cols-2 sm:gap-x-8">
      {tools.map((tool) => {
        const Icon = toolIcons[tool.id];

        return (
          <li key={tool.id} className="border-t border-edge">
            <Link
              href={tool.href}
              className="group -mx-2 grid min-h-24 grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-4 rounded-md px-2 py-5 transition-colors hover:bg-muted"
            >
              <span className="flex h-6 items-center justify-center text-ink-3 transition-colors group-hover:text-ink">
                <Icon aria-hidden="true" size={20} />
              </span>
              <span className="min-w-0">
                <h3 className="text-base font-semibold leading-snug text-ink transition-colors group-hover:text-accent">
                  {tool.name}
                </h3>
                <span className="mt-1 block text-sm leading-relaxed text-ink-2">
                  {tool.description}
                </span>
              </span>
              <ArrowForwardOutline
                aria-hidden="true"
                className="h-4 w-4 text-ink-3 transition-[color,transform] duration-200 ease-out group-hover:translate-x-0.5 group-hover:text-accent"
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function CompactToolList({ tools }: { tools: ToolRegistryItem[] }) {
  return (
    <ul className="grid gap-x-6 sm:grid-cols-2">
      {tools.map((tool) => (
        <li key={tool.id} className="border-b border-edge">
          <Link
            href={tool.href}
            className="group flex min-h-11 items-center justify-between gap-3 py-2 focus-visible:-outline-offset-2 fine-pointer:min-h-9"
          >
            <span className="min-w-0 text-sm font-semibold leading-snug text-ink transition-colors group-hover:text-accent">
              {tool.name}
            </span>
            <ArrowForwardOutline aria-hidden="true" className="h-4 w-4 shrink-0 text-ink-3 transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-accent" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function HomeClient() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | ToolCategory>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const favoriteToolIds = favoriteToolStore.useIds();
  const recentToolIds = recentToolStore.useIds();
  const hasSearch = search.trim() !== '';

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.isContentEditable ||
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT';
      const usesSlashShortcut =
        event.key === '/' &&
        !isTyping &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey;

      if (!usesSlashShortcut) return;

      event.preventDefault();
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    };

    window.addEventListener('keydown', focusSearch);
    return () => window.removeEventListener('keydown', focusSearch);
  }, []);

  const filteredTools = searchTools(search, TOOL_REGISTRY).filter(
    (tool) => activeCategory === 'all' || tool.category === activeCategory,
  );

  const showPersonalTools = !hasSearch && activeCategory === 'all';
  const favoriteTools = showPersonalTools
    ? favoriteToolIds.flatMap((toolId) => {
        const tool = TOOL_REGISTRY_BY_ID.get(toolId);
        return tool ? [tool] : [];
      })
    : [];
  const favoriteToolIdSet = new Set(favoriteToolIds);
  const recentTools = showPersonalTools
    ? recentToolIds.flatMap((toolId) => {
        if (favoriteToolIdSet.has(toolId)) return [];
        const tool = TOOL_REGISTRY_BY_ID.get(toolId);
        return tool ? [tool] : [];
      })
    : [];

  const clearFilters = () => {
    setSearch('');
    setActiveCategory('all');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="mb-8 grid gap-8 sm:mb-10 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)] lg:items-end lg:gap-16">
        <div>
          <h1 className="text-[2.5rem] font-semibold leading-[1.1] tracking-[-0.04em] text-ink sm:text-[3.25rem]">
            Web Utilities
          </h1>
          <p className="mt-4 max-w-[48ch] text-base leading-relaxed text-ink-2">
            Free tools. No uploads.
          </p>
        </div>

        <div role="search" className="w-full max-w-xl">
          <label
            htmlFor="tool-search"
            className="mb-2.5 flex items-center justify-between gap-3 text-sm font-medium text-ink"
          >
            <span>Find a tool</span>
            <span aria-hidden="true" className="hidden items-center gap-1 text-xs font-normal text-ink-3 fine-pointer:inline-flex">
              Press <kbd className="rounded border border-edge bg-muted px-1.5 py-0.5 font-mono text-[10px]">/</kbd>
            </span>
          </label>
          <div className="relative">
            <SearchOutline
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
            />
            <input
              ref={searchInputRef}
              id="tool-search"
              type="search"
              autoComplete="off"
              aria-controls="tool-results"
              aria-keyshortcuts="/ Meta+K Control+K"
              className="flex h-12 w-full rounded-lg border border-edge-strong bg-surface py-2 pl-10 pr-3 text-base text-ink transition-colors placeholder:text-ink-3 hover:border-ink-3"
              placeholder="Search by name or task…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== 'Escape') return;
                if (search) {
                  setSearch('');
                } else {
                  event.currentTarget.blur();
                }
              }}
            />
          </div>
        </div>
      </header>

      <div
        aria-label="Filter tools by category"
        className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:mb-10 sm:flex-wrap sm:overflow-visible sm:px-0"
        role="group"
      >
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            aria-controls="tool-results"
            aria-pressed={activeCategory === category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`min-h-11 shrink-0 rounded-md px-3 text-sm font-medium transition-colors fine-pointer:min-h-9 ${activeCategory === category.id ? 'bg-ink text-canvas' : 'text-ink-2 hover:bg-muted hover:text-ink'}`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'} shown.
      </p>

      <div id="tool-results" className="space-y-8">
        {favoriteTools.length > 0 || recentTools.length > 0 ? (
          <div className={`grid gap-4 ${favoriteTools.length > 0 && recentTools.length > 0 ? 'lg:grid-cols-2 lg:gap-8' : ''}`}>
            {favoriteTools.length > 0 ? (
              <section aria-labelledby="favorite-tools-heading">
                <h2 id="favorite-tools-heading" className="flex min-h-11 items-center text-sm font-medium text-ink fine-pointer:min-h-9">
                  Favorites
                </h2>
                <CompactToolList tools={favoriteTools} />
              </section>
            ) : null}

            {recentTools.length > 0 ? (
              <section aria-labelledby="recent-tools-heading">
                <div className="flex items-center justify-between gap-4">
                  <h2 id="recent-tools-heading" className="text-sm font-medium text-ink">
                    Recently used
                  </h2>
                  <button
                    type="button"
                    onClick={() => recentToolStore.update(() => [])}
                    className="min-h-11 rounded-md px-2 text-sm font-medium text-ink-3 transition-colors hover:bg-muted hover:text-ink fine-pointer:min-h-9"
                  >
                    Clear history
                  </button>
                </div>
                <CompactToolList tools={recentTools} />
              </section>
            ) : null}
          </div>
        ) : null}

        {filteredTools.length > 0 ? (
          <section aria-labelledby="tool-directory-heading">
            <h2 id="tool-directory-heading" className="mb-4 section-title text-ink">
              {hasSearch ? 'Search results' : 'Tools'}
            </h2>
            <ToolDirectory tools={filteredTools} />
          </section>
        ) : null}

        {filteredTools.length === 0 ? (
          <section className="border-y border-edge py-16" aria-labelledby="empty-tools-heading">
            <h2 id="empty-tools-heading" className="text-base font-semibold text-ink">
              No matching tools
            </h2>
            <p className="mt-1 text-sm text-ink-2">
              Try a broader search or clear the current filters.
            </p>
            <Button className="mt-5" variant="outline" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          </section>
        ) : null}
      </div>
    </div>
  );
}
