import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/schema';
import type { Recipe, WeeklyMenu } from '@/types/recipe';
import {
  replaceWeeklyMenu,
  getCurrentWeeklyMenu,
  markRecipesShown,
  getAllRecipes,
} from '@/lib/db/operations';
import {
  selectWeeklyMenu,
  getWeekStartTimestamp,
} from '@/lib/algorithms/weekly-selection';
import { useCallback } from 'react';
import { useUserPreferences } from '@/hooks/useUserPreferences';

export function useWeeklyMenu() {
  const weekStart = getWeekStartTimestamp();
  const { preferences } = useUserPreferences();

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
    return recipes.map((r) => (r && !r.deletedAt ? r : undefined));
  }, [currentWeekMenu]) as (Recipe | undefined)[] | null | undefined;

  const generateMenu = useCallback(async () => {
    const allRecipes = await getAllRecipes();
    const selected = selectWeeklyMenu(allRecipes, preferences.menuSize);
    const recipeIds = selected.map((r) => r.id);

    await replaceWeeklyMenu({
      weekStart,
      recipeIds,
      manualSlots: {},
      generatedAt: Date.now(),
    });

    await markRecipesShown(recipeIds);
  }, [weekStart, preferences.menuSize]);

  const setMenuSlot = useCallback(async (slotIndex: number, recipeId: string) => {
    if (!currentWeekMenu) {
      // No menu yet — create one with just this slot
      const recipeIds = Array.from({ length: preferences.menuSize }, (_, i) =>
        i === slotIndex ? recipeId : '',
      );
      const manualSlots: Record<number, string> = { [slotIndex]: recipeId };
      await replaceWeeklyMenu({
        weekStart,
        recipeIds,
        manualSlots,
        generatedAt: Date.now(),
      });
      await markRecipesShown([recipeId]);
      return;
    }

    const newRecipeIds = [...currentWeekMenu.recipeIds];
    // Pad array if needed
    while (newRecipeIds.length < preferences.menuSize) {
      newRecipeIds.push('');
    }
    newRecipeIds[slotIndex] = recipeId;

    const newManualSlots = { ...(currentWeekMenu.manualSlots ?? {}), [slotIndex]: recipeId };

    await replaceWeeklyMenu({
      weekStart: currentWeekMenu.weekStart,
      recipeIds: newRecipeIds,
      manualSlots: newManualSlots,
      generatedAt: currentWeekMenu.generatedAt,
    });

    await markRecipesShown([recipeId]);
  }, [currentWeekMenu, weekStart, preferences.menuSize]);

  const fillRemainingSlots = useCallback(async () => {
    const allRecipes = await getAllRecipes();
    const currentIds = currentWeekMenu?.recipeIds ?? [];
    const manualSlots = currentWeekMenu?.manualSlots ?? {};

    // Collect IDs already placed (manual + existing non-empty)
    const placedIds = currentIds.filter((id) => id !== '');

    // Find empty slot indices (not in manualSlots and empty)
    const emptySlotIndices: number[] = [];
    for (let i = 0; i < preferences.menuSize; i++) {
      if (!currentIds[i] || currentIds[i] === '') {
        emptySlotIndices.push(i);
      }
    }

    if (emptySlotIndices.length === 0) return;

    const autoSelected = selectWeeklyMenu(
      allRecipes,
      emptySlotIndices.length,
      0.3,
      placedIds,
    );

    const newRecipeIds = [...currentIds];
    while (newRecipeIds.length < preferences.menuSize) {
      newRecipeIds.push('');
    }

    autoSelected.forEach((recipe, i) => {
      if (emptySlotIndices[i] !== undefined) {
        newRecipeIds[emptySlotIndices[i]] = recipe.id;
      }
    });

    await replaceWeeklyMenu({
      weekStart,
      recipeIds: newRecipeIds,
      manualSlots,
      generatedAt: currentWeekMenu?.generatedAt ?? Date.now(),
    });

    await markRecipesShown(autoSelected.map((r) => r.id));
  }, [currentWeekMenu, weekStart, preferences.menuSize]);

  const isLoading = currentWeekMenu === undefined || menu === undefined;

  // Pad menu to menuSize for slot rendering
  const paddedMenu = menu
    ? Array.from({ length: preferences.menuSize }, (_, i) => menu[i])
    : null;

  return {
    menu: paddedMenu,
    isLoading,
    generateMenu,
    setMenuSlot,
    fillRemainingSlots,
    currentWeekMenu: currentWeekMenu ?? null,
    menuSize: preferences.menuSize,
  };
}
