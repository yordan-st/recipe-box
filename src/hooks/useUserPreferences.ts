import { useCallback, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { getUserPreferences, updateUserPreferences, ensureDefaultPreferences } from '@/lib/db/operations';
import { scheduleSyncAfterMutation } from '@/lib/sync/sync-scheduler';
import type { UserPreferences } from '@/types/recipe';

export function useUserPreferences() {
  const preferences = useLiveQuery(() => getUserPreferences());

  // Create default prefs row outside liveQuery (avoids ReadOnlyError)
  useEffect(() => {
    ensureDefaultPreferences();
  }, []);

  const update = useCallback(
    async (updates: Partial<Omit<UserPreferences, 'id'>>) => {
      await updateUserPreferences(updates);
      scheduleSyncAfterMutation();
    },
    [],
  );

  const addCustomTag = useCallback(
    async (tag: string) => {
      const current = preferences?.customTags ?? [];
      const normalized = tag.trim().toLowerCase();
      if (!normalized || current.includes(normalized)) return;
      await updateUserPreferences({ customTags: [...current, normalized] });
      scheduleSyncAfterMutation();
    },
    [preferences?.customTags],
  );

  const removeCustomTag = useCallback(
    async (tag: string) => {
      const current = preferences?.customTags ?? [];
      await updateUserPreferences({ customTags: current.filter((t) => t !== tag) });
      scheduleSyncAfterMutation();
    },
    [preferences?.customTags],
  );

  return {
    preferences: preferences ?? { id: 'default', menuSize: 4, customTags: [], updatedAt: 0, syncStatus: 'pending' as const },
    isLoading: preferences === undefined,
    updatePreferences: update,
    addCustomTag,
    removeCustomTag,
  };
}
