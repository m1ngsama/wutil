'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
  AlignLeft,
  ArrowRight,
  Binary,
  Braces,
  CalendarDays,
  CaseSensitive,
  Clock,
  Fingerprint,
  FilePlus2,
  Hash,
  ImageIcon,
  KeyRound,
  Link2,
  Palette,
  Regex,
  Ruler,
  Search,
  type LucideIcon,
} from 'lucide-react';

const toolIcons: Record<string, LucideIcon> = {
  'password-generator': KeyRound,
  'color-converter': Palette,
  'url-encoder': Link2,
  'text-case': CaseSensitive,
  'regex-tester': Regex,
  timestamp: Clock,
  'word-counter': AlignLeft,
  'json-formatter': Braces,
  'base64-converter': Binary,
  'unit-converter': Ruler,
  'hash-generator': Hash,
  'uuid-generator': Fingerprint,
  'date-calculator': CalendarDays,
  'image-converter': ImageIcon,
  'pdf-merge': FilePlus2,
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

function FeaturedTool({ tool }: { tool: ToolRegistryItem }) {
  const Icon = toolIcons[tool.id];

  return (
    <Link
      href={tool.href}
      className="group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-edge bg-surface p-4 transition-colors hover:border-edge-strong hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-canvas sm:p-5"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-subtle text-accent">
        <Icon aria-hidden="true" size={18} strokeWidth={1.75} />
      </span>
      <span className="min-w-0">
        <h3 className="text-base font-semibold text-ink transition-colors group-hover:text-accent">
          {tool.name}
        </h3>
        <span className="mt-0.5 block text-sm leading-relaxed text-ink-2">
          {tool.description}
        </span>
      </span>
      <ArrowRight
        aria-hidden="true"
        className="h-4 w-4 text-accent transition-transform duration-200 ease-out group-hover:translate-x-0.5"
      />
    </Link>
  );
}

function ToolDirectory({ tools }: { tools: ToolRegistryItem[] }) {
  return (
    <ul className="grid grid-cols-1 border-b border-edge sm:grid-cols-2 sm:gap-x-8">
      {tools.map((tool) => {
        const Icon = toolIcons[tool.id];

        return (
          <li key={tool.id} className="border-t border-edge">
            <Link
              href={tool.href}
              className="group -mx-2 grid min-h-24 grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-2 py-4 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-ink-2 transition-colors group-hover:bg-accent-subtle group-hover:text-accent">
                <Icon aria-hidden="true" size={18} strokeWidth={1.75} />
              </span>
              <span className="min-w-0">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-3">
                  {TOOL_CATEGORY_NAMES[tool.category]}
                </span>
                <span className="flex items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-ink transition-colors group-hover:text-accent">
                    {tool.name}
                  </h3>
                  {tool.badge ? (
                    <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wider text-accent">
                      {tool.badge}
                    </span>
                  ) : null}
                </span>
                <span className="mt-1 block line-clamp-2 text-xs leading-relaxed text-ink-2">
                  {tool.description}
                </span>
              </span>
              <ArrowRight
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
    <ul className="grid border-t border-edge sm:grid-cols-2 lg:grid-cols-4">
      {tools.map((tool, index) => (
        <li
          key={tool.id}
          className={`border-b border-edge ${index % 2 === 1 ? 'sm:border-l' : ''} ${index % 4 === 0 ? 'lg:border-l-0' : 'lg:border-l'}`}
        >
          <Link
            href={tool.href}
            className="group flex min-h-16 items-center justify-between gap-3 px-3 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--w-ring)]"
          >
            <span className="min-w-0">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
                {TOOL_CATEGORY_NAMES[tool.category]}
              </span>
              <span className="mt-0.5 block truncate text-sm font-semibold text-ink transition-colors group-hover:text-accent">
                {tool.name}
              </span>
            </span>
            <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-ink-3 transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-accent" />
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

  const showFeatured = !hasSearch && activeCategory === 'all';
  const favoriteTools = showFeatured
    ? favoriteToolIds.flatMap((toolId) => {
        const tool = TOOL_REGISTRY_BY_ID.get(toolId);
        return tool ? [tool] : [];
      })
    : [];
  const favoriteToolIdSet = new Set(favoriteToolIds);
  const recentTools = showFeatured
    ? recentToolIds.flatMap((toolId) => {
        if (favoriteToolIdSet.has(toolId)) return [];
        const tool = TOOL_REGISTRY_BY_ID.get(toolId);
        return tool ? [tool] : [];
      })
    : [];
  const featuredTools = showFeatured
    ? filteredTools.filter((tool) => tool.badge)
    : [];
  const directoryTools = showFeatured
    ? filteredTools.filter((tool) => !tool.badge)
    : filteredTools;

  const clearFilters = () => {
    setSearch('');
    setActiveCategory('all');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-14 lg:px-8">
      <header className="mb-6 grid gap-5 sm:mb-10 sm:gap-8 lg:mb-12">
        <div>
          <p className="mb-3 hidden text-xs font-semibold uppercase tracking-[0.18em] text-ink-3 sm:block">
            {TOOL_REGISTRY.length} tools. Free to use. Private by design.
          </p>
          <h1 className="font-display text-[2.5rem] leading-none text-ink sm:text-6xl md:text-7xl">
            Web Utilities
          </h1>
          <p className="mt-3 max-w-[48ch] text-sm leading-relaxed text-ink-2 sm:mt-4 sm:text-base">
            Fast tools that run entirely in your browser. Your tool content is not uploaded or stored.
          </p>
        </div>

        <div role="search" className="max-w-xl">
          <label
            htmlFor="tool-search"
            className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-ink-3"
          >
            <span>Find a tool</span>
            <span aria-hidden="true" className="hidden items-center gap-1 normal-case tracking-normal text-ink-3 fine-pointer:inline-flex">
              Press <kbd className="rounded border border-edge bg-muted px-1.5 py-0.5 font-mono text-[10px]">/</kbd>
            </span>
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
              strokeWidth={1.75}
            />
            <Input
              ref={searchInputRef}
              id="tool-search"
              type="search"
              autoComplete="off"
              aria-controls="tool-results"
              aria-keyshortcuts="/ Meta+K Control+K"
              className="pl-10"
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
          <Button
            key={category.id}
            variant={activeCategory === category.id ? 'default' : 'outline'}
            size="sm"
            aria-controls="tool-results"
            aria-pressed={activeCategory === category.id}
            onClick={() => setActiveCategory(category.id)}
            className="shrink-0"
          >
            {category.name}
          </Button>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'} shown.
      </p>

      <div id="tool-results" className="space-y-12">
        {favoriteTools.length > 0 ? (
          <section aria-labelledby="favorite-tools-heading">
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <h2 id="favorite-tools-heading" className="text-lg font-semibold text-ink">
                  Favorites
                </h2>
                <p className="mt-0.5 text-xs text-ink-3">Saved only on this device</p>
              </div>
              <span className="text-xs text-ink-3">Manage from each tool</span>
            </div>
            <CompactToolList tools={favoriteTools} />
          </section>
        ) : null}

        {recentTools.length > 0 ? (
          <section aria-labelledby="recent-tools-heading">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <h2 id="recent-tools-heading" className="text-lg font-semibold text-ink">
                  Recently used
                </h2>
                <p className="mt-0.5 text-xs text-ink-3">Stored only on this device</p>
              </div>
              <button
                type="button"
                onClick={() => recentToolStore.update(() => [])}
                className="min-h-11 rounded-md px-2 text-xs font-semibold text-ink-3 transition-colors hover:bg-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] fine-pointer:min-h-9"
              >
                Clear history
              </button>
            </div>
            <CompactToolList tools={recentTools} />
          </section>
        ) : null}

        {featuredTools.length > 0 ? (
          <section aria-labelledby="popular-tools-heading">
            <h2 id="popular-tools-heading" className="mb-4 text-lg font-semibold text-ink">
              Popular now
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {featuredTools.map((tool) => (
                <FeaturedTool key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        ) : null}

        {directoryTools.length > 0 ? (
          <section aria-labelledby="tool-directory-heading">
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h2 id="tool-directory-heading" className="text-lg font-semibold text-ink">
                {showFeatured ? 'More tools' : 'Matching tools'}
              </h2>
              <span className="text-xs tabular-nums text-ink-3">
                {directoryTools.length} {directoryTools.length === 1 ? 'tool' : 'tools'}
              </span>
            </div>
            <ToolDirectory tools={directoryTools} />
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
