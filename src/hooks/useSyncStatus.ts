import { useState, useEffect } from 'react';
import { onSyncStateChange, getSyncState, type SyncState } from '@/lib/sync/sync-engine';

export function useSyncStatus() {
  const [state, setState] = useState<SyncState>(() => getSyncState().state);
  const [lastError, setLastError] = useState<string | undefined>(() => getSyncState().lastError);

  useEffect(() => {
    return onSyncStateChange((newState, detail) => {
      setState(newState);
      if (detail) setLastError(detail);
    });
  }, []);

  return { state, lastError };
}
