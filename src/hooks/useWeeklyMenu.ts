import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/schema';
import type { Recipe, WeeklyMenu } from '@/types/recipe';
import {
  saveWeeklyMenu,
  getCurrentWeeklyMenu,
  markRecipesShown,
  getAllRecipes,
} from '@/lib/db/operations';
import {
  selectWeeklyMenu,
  getWeekStartTimestamp,
} from '@/lib/algorithms/weekly-selection';
import { useCallback } from 'react';

export function useWeeklyMenu() {
  const weekStart = getWeekStartTimestamp();

  const currentWeekMenu = useLiveQuery(async () => {
    const menu = await getCurrentWeeklyMenu();
    if (menu && menu.weekStart === weekStart) {
      return menu;
    }
    return null;
  }, [weekStart]) as WeeklyMenu | null | undefined;

  const menu = useLiveQuery(async () => {
    if (!currentWeekMenu || currentWeekMenu === undefined) {
      return null;
    }
    const recipes = await Promise.all(
      currentWeekMenu.recipeIds.map((id) => db.recipes.get(id)),
    );
    return recipes.filter((r): r is Recipe => r !== undefined);
  }, [currentWeekMenu]) as Recipe[] | null | undefined;

  const generateMenu = useCallback(async () => {
    const allRecipes = await getAllRecipes();
    const selected = selectWeeklyMenu(allRecipes);
    const recipeIds = selected.map((r) => r.id);

    await saveWeeklyMenu({
      weekStart,
      recipeIds,
      generatedAt: Date.now(),
    });

    await markRecipesShown(recipeIds);
  }, [weekStart]);

  const isLoading = currentWeekMenu === undefined || menu === undefined;

  return {
    menu: menu ?? null,
    isLoading,
    generateMenu,
    currentWeekMenu: currentWeekMenu ?? null,
  };
}
