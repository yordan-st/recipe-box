import { db } from '@/lib/db/schema';
import {
  getPendingRecipes,
  markRecipesSynced,
  upsertRecipeFromServer,
  upsertPreferencesFromServer,
  upsertWeeklyMenuFromServer,
  getSyncMeta,
  updateSyncMeta,
  getUserPreferences,
  getCurrentWeeklyMenus,
} from '@/lib/db/operations';
import type { Recipe, UserPreferences, WeeklyMenu } from '@/types/recipe';

interface PullResponse {
  recipes: Array<Omit<Recipe, 'syncStatus'>>;
  preferences?: { id: string; menuSize: number; updatedAt: number };
  weeklyMenus: Array<WeeklyMenu>;
  serverTime: number;
}

interface PushResponse {
  success: boolean;
  recipesUpserted: number;
  menusUpserted: number;
  serverTime: number;
}

export type SyncState = 'idle' | 'syncing' | 'error' | 'offline';

type SyncListener = (state: SyncState, detail?: string) => void;

const listeners = new Set<SyncListener>();

let currentState: SyncState = 'idle';
let lastError: string | undefined;
let pendingCount = 0;

export function getSyncState() {
  return { state: currentState, lastError, pendingCount };
}

export function onSyncStateChange(fn: SyncListener) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

function setState(state: SyncState, detail?: string) {
  currentState = state;
  if (state === 'error') lastError = detail;
  listeners.forEach((fn) => fn(state, detail));
}

export async function pushChanges(): Promise<void> {
  const pendingRecipes = await getPendingRecipes();
  const prefs = await getUserPreferences();
  const menus = await getCurrentWeeklyMenus();

  if (pendingRecipes.length === 0 && prefs.syncStatus !== 'pending') return;

  const body: Record<string, unknown> = {};

  if (pendingRecipes.length > 0) {
    body.recipes = pendingRecipes.map(({ syncStatus: _, ...r }) => r);
  }

  if (prefs.syncStatus === 'pending') {
    const { syncStatus: _, ...p } = prefs;
    body.preferences = p;
  }

  if (menus.length > 0) {
    body.weeklyMenus = menus;
  }

  const res = await fetch('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Push failed: ${res.status}`);

  const data: PushResponse = await res.json();

  // Mark local records as synced
  if (pendingRecipes.length > 0) {
    await markRecipesSynced(pendingRecipes.map((r) => r.id));
  }

  if (prefs.syncStatus === 'pending') {
    await db.userPreferences.update('default', { syncStatus: 'synced' as const });
  }

  await updateSyncMeta(data.serverTime);
}

export async function pullChanges(): Promise<void> {
  const { lastSyncedAt } = await getSyncMeta();

  const res = await fetch(`/api/sync?since=${lastSyncedAt}`);
  if (!res.ok) throw new Error(`Pull failed: ${res.status}`);

  const data: PullResponse = await res.json();

  for (const recipe of data.recipes) {
    await upsertRecipeFromServer({ ...recipe, syncStatus: 'synced' });
  }

  if (data.preferences) {
    await upsertPreferencesFromServer({
      ...data.preferences,
      syncStatus: 'synced',
    } as UserPreferences);
  }

  for (const menu of data.weeklyMenus) {
    await upsertWeeklyMenuFromServer(menu);
  }

  await updateSyncMeta(data.serverTime);
}

export async function fullSync(): Promise<void> {
  if (!navigator.onLine) {
    setState('offline');
    return;
  }

  setState('syncing');

  try {
    // Pull first so we get server state before push advances the timestamp
    await pullChanges();
    await pushChanges();

    // Update pending count
    const pending = await getPendingRecipes();
    pendingCount = pending.length;

    setState('idle');
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown sync error';
    console.error('Sync failed:', msg);
    setState('error', msg);
  }
}
