import { TOOL_REGISTRY_BY_ID } from './tool-registry';

export const FAVORITE_TOOLS_STORAGE_KEY = 'wutil:favorite-tools:v1';
export const FAVORITE_TOOLS_EVENT = 'wutil:favorite-tools-change';
export const EMPTY_FAVORITE_TOOLS_SNAPSHOT = '[]';
export const MAX_FAVORITE_TOOLS = 24;

export function parseFavoriteToolIds(snapshot: string | null): string[] {
  if (!snapshot) return [];

  try {
    const parsed: unknown = JSON.parse(snapshot);
    if (!Array.isArray(parsed)) return [];

    const seen = new Set<string>();
    const validIds: string[] = [];
    for (const value of parsed) {
      if (typeof value !== 'string' || seen.has(value) || !TOOL_REGISTRY_BY_ID.has(value)) continue;
      seen.add(value);
      validIds.push(value);
      if (validIds.length === MAX_FAVORITE_TOOLS) break;
    }
    return validIds;
  } catch {
    return [];
  }
}

export function toggleFavoriteToolId(currentIds: readonly string[], toolId: string): string[] {
  const validCurrentIds = parseFavoriteToolIds(JSON.stringify(currentIds));
  if (!TOOL_REGISTRY_BY_ID.has(toolId)) return validCurrentIds;
  if (validCurrentIds.includes(toolId)) {
    return validCurrentIds.filter((id) => id !== toolId);
  }
  return [toolId, ...validCurrentIds].slice(0, MAX_FAVORITE_TOOLS);
}

export function readFavoriteToolsSnapshot(): string {
  if (typeof window === 'undefined') return EMPTY_FAVORITE_TOOLS_SNAPSHOT;
  try {
    return window.localStorage.getItem(FAVORITE_TOOLS_STORAGE_KEY) ?? EMPTY_FAVORITE_TOOLS_SNAPSHOT;
  } catch {
    return EMPTY_FAVORITE_TOOLS_SNAPSHOT;
  }
}

export function toggleFavoriteTool(toolId: string): void {
  if (typeof window === 'undefined' || !TOOL_REGISTRY_BY_ID.has(toolId)) return;
  try {
    const currentSnapshot = readFavoriteToolsSnapshot();
    const nextSnapshot = JSON.stringify(
      toggleFavoriteToolId(parseFavoriteToolIds(currentSnapshot), toolId),
    );
    if (nextSnapshot === currentSnapshot) return;
    window.localStorage.setItem(FAVORITE_TOOLS_STORAGE_KEY, nextSnapshot);
    window.dispatchEvent(new Event(FAVORITE_TOOLS_EVENT));
  } catch {
    // Favorites are a progressive enhancement. Storage may be unavailable.
  }
}
