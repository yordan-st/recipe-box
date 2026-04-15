import { useCallback, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { getUserPreferences, updateUserPreferences } from '@/lib/db/operations';
import type { UserPreferences } from '@/types/recipe';

export function useUserPreferences() {
  const preferences = useLiveQuery(() => getUserPreferences());

  // Ensure defaults exist on first load
  useEffect(() => {
    getUserPreferences();
  }, []);

  const update = useCallback(
    async (updates: Partial<Omit<UserPreferences, 'id'>>) => {
      await updateUserPreferences(updates);
    },
    [],
  );

  return {
    preferences: preferences ?? { id: 'default', menuSize: 4, updatedAt: 0, syncStatus: 'pending' as const },
    isLoading: preferences === undefined,
    updatePreferences: update,
  };
}
