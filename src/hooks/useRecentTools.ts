'use client';

import { useMemo, useSyncExternalStore } from 'react';
import {
  EMPTY_RECENT_TOOLS_SNAPSHOT,
  parseRecentToolIds,
  readRecentToolsSnapshot,
  RECENT_TOOLS_EVENT,
} from '@/lib/recent-tools';

function subscribeToRecentTools(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener(RECENT_TOOLS_EVENT, onStoreChange);
  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener(RECENT_TOOLS_EVENT, onStoreChange);
  };
}

export function useRecentToolIds(): string[] {
  const snapshot = useSyncExternalStore(
    subscribeToRecentTools,
    readRecentToolsSnapshot,
    () => EMPTY_RECENT_TOOLS_SNAPSHOT,
  );

  return useMemo(() => parseRecentToolIds(snapshot), [snapshot]);
}
