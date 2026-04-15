import Dexie, { type Table } from 'dexie';
import type { Recipe, WeeklyMenu } from '@/types/recipe';

export class RecipeBoxDB extends Dexie {
  recipes!: Table<Recipe, string>;
  weeklyMenus!: Table<WeeklyMenu, string>;

  constructor() {
    super('recipe-box');

    this.version(1).stores({
      recipes: 'id, url, dateAdded, lastShown',
      weeklyMenus: 'id, weekStart',
    });

    this.version(2).stores({
      recipes: 'id, &url, dateAdded, lastShown',  // & = unique index on url
      weeklyMenus: 'id, weekStart',
    });
  }
}

export const db = new RecipeBoxDB();
