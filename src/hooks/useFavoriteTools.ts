'use client';

import { useMemo, useSyncExternalStore } from 'react';
import {
  EMPTY_FAVORITE_TOOLS_SNAPSHOT,
  FAVORITE_TOOLS_EVENT,
  parseFavoriteToolIds,
  readFavoriteToolsSnapshot,
} from '@/lib/favorite-tools';

function subscribeToFavoriteTools(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener(FAVORITE_TOOLS_EVENT, onStoreChange);
  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener(FAVORITE_TOOLS_EVENT, onStoreChange);
  };
}

export function useFavoriteToolIds(): string[] {
  const snapshot = useSyncExternalStore(
    subscribeToFavoriteTools,
    readFavoriteToolsSnapshot,
    () => EMPTY_FAVORITE_TOOLS_SNAPSHOT,
  );

  return useMemo(() => parseFavoriteToolIds(snapshot), [snapshot]);
}
