import { TOOL_REGISTRY_BY_ID } from './tool-registry.ts';

export const RECENT_TOOLS_STORAGE_KEY = 'wutil:recent-tools:v1';
export const RECENT_TOOLS_EVENT = 'wutil:recent-tools-change';
export const EMPTY_RECENT_TOOLS_SNAPSHOT = '[]';
export const MAX_RECENT_TOOLS = 4;

export function parseRecentToolIds(snapshot: string | null): string[] {
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
      if (validIds.length === MAX_RECENT_TOOLS) break;
    }
    return validIds;
  } catch {
    return [];
  }
}

export function addRecentToolId(currentIds: readonly string[], toolId: string): string[] {
  if (!TOOL_REGISTRY_BY_ID.has(toolId)) return parseRecentToolIds(JSON.stringify(currentIds));
  return [toolId, ...currentIds.filter((id) => id !== toolId)].slice(0, MAX_RECENT_TOOLS);
}

export function readRecentToolsSnapshot(): string {
  if (typeof window === 'undefined') return EMPTY_RECENT_TOOLS_SNAPSHOT;
  try {
    return window.localStorage.getItem(RECENT_TOOLS_STORAGE_KEY) ?? EMPTY_RECENT_TOOLS_SNAPSHOT;
  } catch {
    return EMPTY_RECENT_TOOLS_SNAPSHOT;
  }
}

export function recordRecentTool(toolId: string): void {
  if (typeof window === 'undefined' || !TOOL_REGISTRY_BY_ID.has(toolId)) return;
  try {
    const currentSnapshot = readRecentToolsSnapshot();
    const nextSnapshot = JSON.stringify(addRecentToolId(parseRecentToolIds(currentSnapshot), toolId));
    if (nextSnapshot === currentSnapshot) return;
    window.localStorage.setItem(RECENT_TOOLS_STORAGE_KEY, nextSnapshot);
    window.dispatchEvent(new Event(RECENT_TOOLS_EVENT));
  } catch {
    // Recent tools are a progressive enhancement. Storage may be unavailable.
  }
}

export function clearRecentTools(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(RECENT_TOOLS_STORAGE_KEY);
    window.dispatchEvent(new Event(RECENT_TOOLS_EVENT));
  } catch {
    // Keep the rest of the tool usable when storage is unavailable.
  }
}
