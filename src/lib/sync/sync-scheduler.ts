import { fullSync } from './sync-engine';

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let started = false;

function handleOnline() {
  fullSync();
}

function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    fullSync();
  }
}

export function scheduleSyncAfterMutation() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fullSync();
    debounceTimer = null;
  }, 2000);
}

export function startSyncScheduler() {
  if (started) return;
  started = true;

  // Sync on app load
  fullSync();

  // Sync when coming back online
  window.addEventListener('online', handleOnline);

  // Sync when tab becomes visible
  document.addEventListener('visibilitychange', handleVisibilityChange);
}

export function stopSyncScheduler() {
  if (!started) return;
  started = false;

  window.removeEventListener('online', handleOnline);
  document.removeEventListener('visibilitychange', handleVisibilityChange);

  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}
