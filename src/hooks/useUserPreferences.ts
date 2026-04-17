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

  const addOption = useCallback(
    async (category: 'dishTypeOptions' | 'dietOptions' | 'cuisineOptions', option: string) => {
      const current = preferences?.[category] ?? [];
      const normalized = option.trim().toLowerCase();
      if (!normalized || current.includes(normalized)) return;
      await updateUserPreferences({ [category]: [...current, normalized] });
      scheduleSyncAfterMutation();
    },
    [preferences],
  );

  const removeOption = useCallback(
    async (category: 'dishTypeOptions' | 'dietOptions' | 'cuisineOptions', option: string) => {
      const current = preferences?.[category] ?? [];
      await updateUserPreferences({ [category]: current.filter((t) => t !== option) });
      scheduleSyncAfterMutation();
    },
    [preferences],
  );

  return {
    preferences: preferences ?? { id: 'default', menuSize: 4, customTags: [], dishTypeOptions: [], dietOptions: [], cuisineOptions: [], updatedAt: 0, syncStatus: 'pending' as const },
    isLoading: preferences === undefined,
    updatePreferences: update,
    addOption,
    removeOption,
  };
}
