'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRecentToolIds } from '@/hooks/useRecentTools';
import { clearRecentTools } from '@/lib/recent-tools';
import {
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
      className="group flex min-h-40 flex-col justify-between rounded-xl border border-edge bg-surface p-5 transition-colors hover:border-edge-strong hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-subtle text-accent">
          <Icon aria-hidden="true" size={18} strokeWidth={1.75} />
        </span>
        <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
          {tool.badge}
          <ArrowRight
            aria-hidden="true"
            className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5"
          />
        </span>
      </div>
      <div>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-3">
          {TOOL_CATEGORY_NAMES[tool.category]}
        </p>
        <h3 className="text-base font-semibold text-ink transition-colors group-hover:text-accent">
          {tool.name}
        </h3>
        <p className="mt-1 max-w-[44ch] text-sm leading-relaxed text-ink-2">
          {tool.description}
        </p>
      </div>
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

function RecentTools({ tools }: { tools: ToolRegistryItem[] }) {
  return (
    <ul className="grid border-y border-edge sm:grid-cols-2 lg:grid-cols-4">
      {tools.map((tool, index) => (
        <li
          key={tool.id}
          className={`border-edge ${index > 0 ? 'border-t sm:border-t-0' : ''} ${index % 2 === 1 ? 'sm:border-l' : ''} ${index > 1 ? 'sm:border-t lg:border-t-0' : ''} ${index > 0 ? 'lg:border-l' : ''}`}
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
  const recentToolIds = useRecentToolIds();
  const normalizedSearch = search.trim().toLowerCase();

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.isContentEditable ||
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT';
      const usesCommandShortcut =
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        event.key.toLowerCase() === 'k';
      const usesSlashShortcut =
        event.key === '/' &&
        !isTyping &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey;

      if (!usesCommandShortcut && !usesSlashShortcut) return;

      event.preventDefault();
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    };

    window.addEventListener('keydown', focusSearch);
    return () => window.removeEventListener('keydown', focusSearch);
  }, []);

  const filteredTools = TOOL_REGISTRY.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(normalizedSearch) ||
      tool.description.toLowerCase().includes(normalizedSearch);
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const showFeatured = normalizedSearch === '' && activeCategory === 'all';
  const recentTools = showFeatured
    ? recentToolIds.flatMap((toolId) => {
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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <header className="mb-10 grid gap-8 lg:mb-14 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)] lg:items-end">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink-3">
            {TOOL_REGISTRY.length} tools. Free to use. Private by design.
          </p>
          <h1 className="font-display text-5xl leading-none text-ink sm:text-6xl md:text-7xl">
            Web Utilities
          </h1>
          <p className="mt-4 max-w-[48ch] text-base leading-relaxed text-ink-2">
            Fast tools that run entirely in your browser. Your tool content is not uploaded or stored.
          </p>
        </div>

        <div role="search">
          <label
            htmlFor="tool-search"
            className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-ink-3"
          >
            <span>Find a tool</span>
            <span aria-hidden="true" className="hidden items-center gap-1 normal-case tracking-normal text-ink-3 sm:inline-flex">
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
              aria-keyshortcuts="Meta+K Control+K /"
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
        className="mb-10 flex flex-wrap gap-2"
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
          >
            {category.name}
          </Button>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'} shown.
      </p>

      <div id="tool-results" className="space-y-12">
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
                onClick={clearRecentTools}
                className="min-h-11 rounded-md px-2 text-xs font-semibold text-ink-3 transition-colors hover:bg-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] fine-pointer:min-h-9"
              >
                Clear history
              </button>
            </div>
            <RecentTools tools={recentTools} />
          </section>
        ) : null}

        {featuredTools.length > 0 ? (
          <section aria-labelledby="popular-tools-heading">
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h2 id="popular-tools-heading" className="text-lg font-semibold text-ink">
                Popular now
              </h2>
              <span className="text-xs text-ink-3">A quick place to start</span>
            </div>
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
