import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/schema';
import {
  addRecipe as addRecipeOp,
  updateRecipe as updateRecipeOp,
  deleteRecipe as deleteRecipeOp,
} from '@/lib/db/operations';
import { scheduleSyncAfterMutation } from '@/lib/sync/sync-scheduler';
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

  const addRecipe = useCallback(async (...args: Parameters<typeof addRecipeOp>) => {
    const result = await addRecipeOp(...args);
    scheduleSyncAfterMutation();
    return result;
  }, []);

  const updateRecipe = useCallback(async (...args: Parameters<typeof updateRecipeOp>) => {
    await updateRecipeOp(...args);
    scheduleSyncAfterMutation();
  }, []);

  const deleteRecipe = useCallback(async (...args: Parameters<typeof deleteRecipeOp>) => {
    await deleteRecipeOp(...args);
    scheduleSyncAfterMutation();
  }, []);

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
