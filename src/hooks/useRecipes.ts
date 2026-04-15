import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/schema';
import {
  addRecipe,
  updateRecipe,
  deleteRecipe,
} from '@/lib/db/operations';
import type { Recipe } from '@/types/recipe';

export function useRecipes() {
  const recipes = useLiveQuery(async () => {
    const all = await db.recipes.orderBy('dateAdded').reverse().toArray();
    return all.filter((r) => !r.deletedAt);
  });

  const recipeCount = useLiveQuery(async () => {
    const all = await db.recipes.toArray();
    return all.filter((r) => !r.deletedAt).length;
  });

  return {
    recipes: recipes ?? [],
    recipeCount: recipeCount ?? 0,
    isLoading: recipes === undefined,
    addRecipe,
    updateRecipe,
    deleteRecipe,
  };
}

export function useRecipe(id: string | undefined) {
  const recipe = useLiveQuery(
    () => (id ? db.recipes.get(id) : undefined),
    [id]
  );

  return {
    recipe: recipe as Recipe | undefined,
    isLoading: id !== undefined && recipe === undefined,
  };
}
