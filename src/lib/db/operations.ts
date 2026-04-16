import { db } from './schema';
import type { Recipe, WeeklyMenu, UserPreferences, GroceryChecklist } from '@/types/recipe';

export async function addRecipe(recipe: Omit<Recipe, 'id' | 'dateAdded' | 'timesShown' | 'updatedAt' | 'syncStatus'>): Promise<string> {
  const existing = await db.recipes.where('url').equals(recipe.url).first();
  if (existing && !existing.deletedAt) {
    throw new Error('Een recept met deze URL bestaat al');
  }
  const now = Date.now();
  if (existing && existing.deletedAt) {
    await db.recipes.update(existing.id, {
      ...recipe,
      tags: recipe.tags ?? [],
      updatedAt: now,
      timesShown: 0,
      deletedAt: undefined,
      syncStatus: 'pending' as const,
    });
    return existing.id;
  }
  const id = crypto.randomUUID();
  await db.recipes.add({
    ...recipe,
    id,
    tags: recipe.tags ?? [],
    dateAdded: now,
    updatedAt: now,
    timesShown: 0,
    syncStatus: 'pending',
  });
  return id;
}

export async function getAllRecipes(): Promise<Recipe[]> {
  return db.recipes
    .filter((r) => !r.deletedAt)
    .reverse()
    .sortBy('dateAdded');
}

export async function getRecipe(id: string): Promise<Recipe | undefined> {
  const recipe = await db.recipes.get(id);
  if (recipe?.deletedAt) return undefined;
  return recipe;
}

export async function updateRecipe(id: string, updates: Partial<Recipe>): Promise<void> {
  await db.recipes.update(id, {
    ...updates,
    updatedAt: Date.now(),
    syncStatus: 'pending' as const,
  });
}

export async function deleteRecipe(id: string): Promise<void> {
  const now = Date.now();
  await db.recipes.update(id, {
    deletedAt: now,
    updatedAt: now,
    syncStatus: 'pending' as const,
  });
}

export async function getRecipeCount(): Promise<number> {
  return db.recipes.filter((r) => !r.deletedAt).count();
}

export async function markRecipesShown(ids: string[]): Promise<void> {
  const now = Date.now();
  await db.transaction('rw', db.recipes, async () => {
    for (const id of ids) {
      const recipe = await db.recipes.get(id);
      if (recipe) {
        await db.recipes.update(id, {
          lastShown: now,
          timesShown: recipe.timesShown + 1,
          updatedAt: now,
          syncStatus: 'pending' as const,
        });
      }
    }
  });
}

export async function saveWeeklyMenu(menu: Omit<WeeklyMenu, 'id' | 'updatedAt' | 'syncStatus'>): Promise<string> {
  const id = crypto.randomUUID();
  await db.weeklyMenus.add({ ...menu, id, updatedAt: Date.now(), syncStatus: 'pending' });
  return id;
}

export async function replaceWeeklyMenu(menu: Omit<WeeklyMenu, 'id' | 'updatedAt' | 'syncStatus'>): Promise<string> {
  const id = crypto.randomUUID();
  const now = Date.now();
  await db.transaction('rw', db.weeklyMenus, async () => {
    await db.weeklyMenus.where('weekStart').equals(menu.weekStart).delete();
    await db.weeklyMenus.add({
      ...menu,
      manualSlots: menu.manualSlots ?? {},
      id,
      updatedAt: now,
      syncStatus: 'pending',
    });
  });
  return id;
}

export async function getRecipeByUrl(url: string): Promise<Recipe | undefined> {
  const recipe = await db.recipes.where('url').equals(url).first();
  if (recipe?.deletedAt) return undefined;
  return recipe;
}

export async function getCurrentWeeklyMenu(): Promise<WeeklyMenu | undefined> {
  return db.weeklyMenus.orderBy('weekStart').reverse().first();
}

// User preferences

const DEFAULT_PREFERENCES: UserPreferences = {
  id: 'default',
  menuSize: 4,
  updatedAt: Date.now(),
  syncStatus: 'pending',
};

export async function getUserPreferences(): Promise<UserPreferences> {
  const prefs = await db.userPreferences.get('default');
  if (prefs) return prefs;
  await db.userPreferences.add(DEFAULT_PREFERENCES);
  return DEFAULT_PREFERENCES;
}

// ── Sync operations ──

export async function getPendingRecipes(): Promise<Recipe[]> {
  return db.recipes.where('syncStatus').equals('pending').toArray();
}

export async function markRecipesSynced(ids: string[]): Promise<void> {
  await db.transaction('rw', db.recipes, async () => {
    for (const id of ids) {
      await db.recipes.update(id, { syncStatus: 'synced' as const });
    }
  });
}

export async function upsertRecipeFromServer(recipe: Recipe): Promise<void> {
  const local = await db.recipes.get(recipe.id);
  if (!local || local.updatedAt < recipe.updatedAt) {
    await db.recipes.put({ ...recipe, syncStatus: 'synced' });
  }
}

export async function upsertPreferencesFromServer(prefs: UserPreferences): Promise<void> {
  const local = await db.userPreferences.get(prefs.id);
  if (!local || local.updatedAt < prefs.updatedAt) {
    await db.userPreferences.put({ ...prefs, syncStatus: 'synced' });
  }
}

export async function upsertWeeklyMenuFromServer(menu: WeeklyMenu): Promise<void> {
  const local = await db.weeklyMenus.get(menu.id);
  if (!local || local.updatedAt < menu.updatedAt) {
    await db.weeklyMenus.put({ ...menu, syncStatus: 'synced' });
  }
}

export async function getPendingMenus(): Promise<WeeklyMenu[]> {
  return db.weeklyMenus.where('syncStatus').equals('pending').toArray();
}

export async function markMenusSynced(ids: string[]): Promise<void> {
  await db.transaction('rw', db.weeklyMenus, async () => {
    for (const id of ids) {
      await db.weeklyMenus.update(id, { syncStatus: 'synced' as const });
    }
  });
}

export async function getSyncMeta(): Promise<{ lastSyncedAt: number }> {
  const meta = await db.syncMeta.get('default');
  return { lastSyncedAt: meta?.lastSyncedAt ?? 0 };
}

export async function updateSyncMeta(lastSyncedAt: number): Promise<void> {
  await db.syncMeta.put({ id: 'default', lastSyncedAt });
}

export async function getCurrentWeeklyMenus(): Promise<WeeklyMenu[]> {
  return db.weeklyMenus.orderBy('weekStart').reverse().limit(4).toArray();
}

// ── User preferences ──

export async function updateUserPreferences(updates: Partial<Omit<UserPreferences, 'id'>>): Promise<void> {
  const existing = await db.userPreferences.get('default');
  if (existing) {
    await db.userPreferences.update('default', {
      ...updates,
      updatedAt: Date.now(),
      syncStatus: 'pending' as const,
    });
  } else {
    await db.userPreferences.add({
      ...DEFAULT_PREFERENCES,
      ...updates,
      updatedAt: Date.now(),
      syncStatus: 'pending' as const,
    });
  }
}

// ── Grocery checklists ──

export async function getGroceryChecklist(weekStart: number): Promise<GroceryChecklist | undefined> {
  return db.groceryChecklists.where('weekStart').equals(weekStart).first();
}

export async function updateGroceryChecklist(weekStart: number, checkedItems: string[]): Promise<void> {
  const existing = await db.groceryChecklists.where('weekStart').equals(weekStart).first();
  const now = Date.now();
  if (existing) {
    await db.groceryChecklists.update(existing.id, {
      checkedItems,
      updatedAt: now,
      syncStatus: 'pending' as const,
    });
  } else {
    await db.groceryChecklists.add({
      id: crypto.randomUUID(),
      weekStart,
      checkedItems,
      updatedAt: now,
      syncStatus: 'pending',
    });
  }
}

export async function getPendingGroceryChecklists(): Promise<GroceryChecklist[]> {
  return db.groceryChecklists.where('syncStatus').equals('pending').toArray();
}

export async function markGroceryChecklistsSynced(ids: string[]): Promise<void> {
  await db.transaction('rw', db.groceryChecklists, async () => {
    for (const id of ids) {
      await db.groceryChecklists.update(id, { syncStatus: 'synced' as const });
    }
  });
}

export async function upsertGroceryChecklistFromServer(checklist: GroceryChecklist): Promise<void> {
  const local = await db.groceryChecklists.get(checklist.id);
  if (!local || local.updatedAt < checklist.updatedAt) {
    await db.groceryChecklists.put({ ...checklist, syncStatus: 'synced' });
  }
}
