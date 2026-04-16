import Dexie, { type Table } from 'dexie';
import type { Recipe, WeeklyMenu, UserPreferences, GroceryChecklist, SyncMeta } from '@/types/recipe';

export class RecipeBoxDB extends Dexie {
  recipes!: Table<Recipe, string>;
  weeklyMenus!: Table<WeeklyMenu, string>;
  userPreferences!: Table<UserPreferences, string>;
  groceryChecklists!: Table<GroceryChecklist, string>;
  syncMeta!: Table<SyncMeta, string>;

  constructor() {
    super('recipe-box');

    this.version(1).stores({
      recipes: 'id, url, dateAdded, lastShown',
      weeklyMenus: 'id, weekStart',
    });

    this.version(2).stores({
      recipes: 'id, &url, dateAdded, lastShown',
      weeklyMenus: 'id, weekStart',
    });

    this.version(3).stores({
      recipes: 'id, &url, dateAdded, lastShown, updatedAt, syncStatus',
      weeklyMenus: 'id, weekStart',
      userPreferences: 'id',
      syncMeta: 'id',
    }).upgrade(tx => {
      return tx.table('recipes').toCollection().modify(recipe => {
        recipe.tags = recipe.tags ?? [];
        recipe.updatedAt = recipe.updatedAt ?? recipe.dateAdded;
        recipe.syncStatus = recipe.syncStatus ?? 'pending';
      });
    });

    this.version(4).stores({
      recipes: 'id, url, dateAdded, lastShown, updatedAt, syncStatus',
      weeklyMenus: 'id, weekStart, updatedAt, syncStatus',
      userPreferences: 'id',
      syncMeta: 'id',
    }).upgrade(tx => {
      return tx.table('weeklyMenus').toCollection().modify(menu => {
        menu.updatedAt = menu.updatedAt ?? menu.generatedAt;
        menu.syncStatus = menu.syncStatus ?? 'pending';
      });
    });

    this.version(5).stores({
      recipes: 'id, url, dateAdded, lastShown, updatedAt, syncStatus',
      weeklyMenus: 'id, weekStart, updatedAt, syncStatus',
      userPreferences: 'id',
      groceryChecklists: 'id, weekStart, syncStatus',
      syncMeta: 'id',
    });
  }
}

export const db = new RecipeBoxDB();
