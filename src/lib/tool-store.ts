import { useSyncExternalStore } from 'react';
import { TOOL_REGISTRY_BY_ID } from './tool-registry.ts';

export const MAX_RECENT_TOOLS = 4;
export const MAX_FAVORITE_TOOLS = 24;

export function parseToolIds(snapshot: string | null, max: number): string[] {
  try {
    const parsed: unknown = JSON.parse(snapshot ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed)]
      .filter((id): id is string => typeof id === 'string' && TOOL_REGISTRY_BY_ID.has(id))
      .slice(0, max);
  } catch {
    return [];
  }
}

export function addRecentToolId(ids: readonly string[], toolId: string): string[] {
  if (!TOOL_REGISTRY_BY_ID.has(toolId)) return [...ids];
  return [toolId, ...ids.filter((id) => id !== toolId)].slice(0, MAX_RECENT_TOOLS);
}

export function toggleFavoriteToolId(ids: readonly string[], toolId: string): string[] {
  if (!TOOL_REGISTRY_BY_ID.has(toolId)) return [...ids];
  if (ids.includes(toolId)) return ids.filter((id) => id !== toolId);
  return [toolId, ...ids].slice(0, MAX_FAVORITE_TOOLS);
}

function createToolIdStore(key: string, max: number) {
  const event = `${key}:change`;

  const read = () => {
    try {
      return localStorage.getItem(key) ?? '[]';
    } catch {
      return '[]';
    }
  };

  const subscribe = (onChange: () => void) => {
    addEventListener('storage', onChange);
    addEventListener(event, onChange);
    return () => {
      removeEventListener('storage', onChange);
      removeEventListener(event, onChange);
    };
  };

  return {
    update(change: (ids: string[]) => string[]) {
      try {
        const current = read();
        const next = JSON.stringify(change(parseToolIds(current, max)));
        if (next === current) return;
        localStorage.setItem(key, next);
        dispatchEvent(new Event(event));
      } catch {}
    },
    useIds() {
      return parseToolIds(useSyncExternalStore(subscribe, read, () => '[]'), max);
    },
  };
}

export const recentToolStore = createToolIdStore('wutil:recent-tools:v1', MAX_RECENT_TOOLS);
export const favoriteToolStore = createToolIdStore('wutil:favorite-tools:v1', MAX_FAVORITE_TOOLS);
