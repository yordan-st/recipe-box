import { db } from './schema';
import type { Recipe, WeeklyMenu } from '@/types/recipe';

export async function addRecipe(recipe: Omit<Recipe, 'id' | 'dateAdded' | 'timesShown'>): Promise<string> {
  const id = crypto.randomUUID();
  await db.recipes.add({
    ...recipe,
    id,
    dateAdded: Date.now(),
    timesShown: 0,
  });
  return id;
}

export async function getAllRecipes(): Promise<Recipe[]> {
  return db.recipes.orderBy('dateAdded').reverse().toArray();
}

export async function getRecipe(id: string): Promise<Recipe | undefined> {
  return db.recipes.get(id);
}

export async function updateRecipe(id: string, updates: Partial<Recipe>): Promise<void> {
  await db.recipes.update(id, updates);
}

export async function deleteRecipe(id: string): Promise<void> {
  await db.recipes.delete(id);
}

export async function getRecipeCount(): Promise<number> {
  return db.recipes.count();
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

export async function getCurrentWeeklyMenu(): Promise<WeeklyMenu | undefined> {
  return db.weeklyMenus.orderBy('weekStart').reverse().first();
}
