import { db } from './schema';
import type { Recipe, WeeklyMenu, UserPreferences } from '@/types/recipe';

export async function addRecipe(recipe: Omit<Recipe, 'id' | 'dateAdded' | 'timesShown' | 'updatedAt' | 'syncStatus'>): Promise<string> {
  const existing = await db.recipes.where('url').equals(recipe.url).first();
  if (existing) {
    throw new Error('A recipe with this URL already exists');
  }
  const id = crypto.randomUUID();
  const now = Date.now();
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

export async function saveWeeklyMenu(menu: Omit<WeeklyMenu, 'id'>): Promise<string> {
  const id = crypto.randomUUID();
  await db.weeklyMenus.add({ ...menu, id });
  return id;
}

export async function replaceWeeklyMenu(menu: Omit<WeeklyMenu, 'id'>): Promise<string> {
  const id = crypto.randomUUID();
  await db.transaction('rw', db.weeklyMenus, async () => {
    await db.weeklyMenus.where('weekStart').equals(menu.weekStart).delete();
    await db.weeklyMenus.add({
      ...menu,
      manualSlots: menu.manualSlots ?? {},
      id,
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
