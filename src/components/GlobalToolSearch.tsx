'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { searchTools, TOOL_CATEGORY_NAMES } from '@/lib/tool-registry';

export function GlobalToolSearch() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const onHome = usePathname() === '/';
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const results = searchTools(query);
  const activeTool = results[activeIndex] ?? null;

  const closeDialog = () => {
    dialogRef.current?.close();
  };

  const openDialog = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    setQuery('');
    setActiveIndex(0);
    if (!dialog.open) dialog.showModal();
    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  };

  const handleShortcut = useEffectEvent((event: KeyboardEvent) => {
    const usesCommandShortcut =
      (event.metaKey || event.ctrlKey) &&
      !event.altKey &&
      event.key.toLowerCase() === 'k';
    if (!usesCommandShortcut) return;
    event.preventDefault();
    const homeSearch = onHome ? document.getElementById('tool-search') : null;
    if (homeSearch) homeSearch.focus();
    else openDialog();
  });

  useEffect(() => {
    const listener = (event: KeyboardEvent) => handleShortcut(event);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);

  const moveActiveResult = (direction: 1 | -1) => {
    if (results.length === 0) return;
    setActiveIndex((currentIndex) => {
      const nextIndex = (currentIndex + direction + results.length) % results.length;
      window.requestAnimationFrame(() => {
        document.getElementById(`global-tool-result-${results[nextIndex].id}`)?.scrollIntoView({
          block: 'nearest',
        });
      });
      return nextIndex;
    });
  };

  const openActiveTool = () => {
    if (!activeTool) return;
    closeDialog();
    router.push(activeTool.href);
  };

  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveActiveResult(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveActiveResult(-1);
    } else if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
      event.preventDefault();
      openActiveTool();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeDialog();
    }
  };

  const handleBackdropClick = (event: ReactMouseEvent<HTMLDialogElement>) => {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const clickedOutside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;
    if (clickedOutside) closeDialog();
  };

  return (
    <>
      {onHome ? null : (
      <button
        type="button"
        onClick={openDialog}
        aria-haspopup="dialog"
        aria-keyshortcuts="Meta+K Control+K"
        className="inline-flex h-11 w-11 items-center justify-center gap-2 rounded-md text-ink-3 transition-colors hover:bg-muted hover:text-ink md:w-auto md:px-3 fine-pointer:h-9 fine-pointer:w-9 md:fine-pointer:w-auto"
      >
        <Search aria-hidden="true" className="h-4 w-4" strokeWidth={1.75} />
        <span className="hidden text-xs font-semibold md:inline">Find a tool</span>
        <span className="sr-only">Open tool search</span>
      </button>
      )}

      <dialog
        ref={dialogRef}
        aria-labelledby="global-tool-search-title"
        onCancel={(event) => {
          event.preventDefault();
          closeDialog();
        }}
        onClick={handleBackdropClick}
        className="fixed inset-0 m-auto max-h-[min(44rem,calc(100dvh-2rem))] w-[calc(100%-2rem)] max-w-2xl overflow-hidden rounded-xl border border-edge bg-canvas p-0 text-ink backdrop:bg-stone-950/45 dark:backdrop:bg-stone-950/70"
      >
        <div className="flex max-h-[min(44rem,calc(100dvh-2rem))] flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-edge px-4 py-3 sm:px-5">
            <div>
              <h2 id="global-tool-search-title" className="text-base font-semibold text-ink">
                Find a tool
              </h2>
              <p className="mt-0.5 text-xs text-ink-3">Search by name or describe the task.</p>
            </div>
            <div className="flex items-center gap-2">
              <kbd aria-hidden="true" className="hidden rounded border border-edge bg-muted px-2 py-1 font-mono text-[10px] text-ink-3 fine-pointer:block">
                Esc
              </kbd>
              <button
                type="button"
                onClick={closeDialog}
                aria-label="Close tool search"
                className="flex h-11 w-11 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-muted hover:text-ink fine-pointer:h-9 fine-pointer:w-9"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="border-b border-edge p-4 sm:p-5">
            <label htmlFor="global-tool-search-input" className="sr-only">Search tools</label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
                strokeWidth={1.75}
              />
              <input
                ref={inputRef}
                id="global-tool-search-input"
                type="search"
                autoComplete="off"
                aria-controls="global-tool-search-results"
                aria-describedby="global-tool-search-help"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleInputKeyDown}
                placeholder="Try “merge files” or “format JSON”…"
                className="h-11 w-full rounded-md border border-edge bg-surface pl-10 pr-3 text-base text-ink placeholder:text-ink-3 transition-colors hover:border-edge-strong"
              />
            </div>
            <p id="global-tool-search-help" className="mt-2 hidden text-xs text-ink-3 fine-pointer:block">
              Use ↑ and ↓ to choose, Enter to open, or Tab through results.
            </p>
          </div>

          <div className="min-h-0 overflow-y-auto px-2 py-2 sm:px-3">
            <p className="px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-3" aria-live="polite">
              {results.length} {results.length === 1 ? 'tool' : 'tools'} found
            </p>
            <p className="sr-only" aria-live="polite" aria-atomic="true">
              {activeTool ? `${activeTool.name} selected` : 'No tool selected'}
            </p>

            {results.length > 0 ? (
              <ul id="global-tool-search-results" className="border-b border-edge">
                {results.map((tool, index) => {
                  const active = index === activeIndex;
                  return (
                    <li key={tool.id} className="border-t border-edge">
                      <Link
                        id={`global-tool-result-${tool.id}`}
                        href={tool.href}
                        onClick={closeDialog}
                        onFocus={() => setActiveIndex(index)}
                        onMouseEnter={() => setActiveIndex(index)}
                        className={`group grid min-h-16 items-center gap-x-4 gap-y-1 rounded-md sm:grid-cols-[minmax(0,1fr)_auto] px-3 py-3 transition-colors focus-visible:-outline-offset-2 ${active ? 'bg-accent-subtle' : 'hover:bg-muted'}`}
                      >
                        <span className="min-w-0">
                          <span className={`block text-sm font-semibold ${active ? 'text-accent' : 'text-ink'}`}>
                            {tool.name}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-ink-3">
                            {tool.description}
                          </span>
                        </span>
                        <span className="-order-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3 sm:order-none">
                          {TOOL_CATEGORY_NAMES[tool.category]}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="border-y border-edge px-3 py-10">
                <p className="text-sm font-semibold text-ink">No matching tool</p>
                <p className="mt-1 text-sm text-ink-2">
                  Try fewer words, a file type, or a task such as “resize image”.
                </p>
              </div>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
