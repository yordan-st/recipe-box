export interface Recipe {
  id: string;
  url: string;
  title: string;
  imageUrl?: string;
  ingredients: string[];
  ingredientsSource: 'auto' | 'manual';
  tags: string[];
  dateAdded: number;
  updatedAt: number;
  lastShown?: number;
  timesShown: number;
  deletedAt?: number;
  syncStatus: 'pending' | 'synced';
}

export interface WeeklyMenu {
  id: string;
  weekStart: number;
  recipeIds: string[];
  manualSlots: Record<number, string>;
  generatedAt: number;
  updatedAt: number;
  syncStatus: 'pending' | 'synced';
}

export interface UserPreferences {
  id: string;
  menuSize: number;
  customTags?: string[];
  updatedAt: number;
  syncStatus: 'pending' | 'synced';
}

export interface GroceryChecklist {
  id: string;
  weekStart: number;
  checkedItems: string[];
  updatedAt: number;
  syncStatus: 'pending' | 'synced';
}

export interface SyncMeta {
  id: string;
  lastSyncedAt: number;
}

/** Fields submitted by the recipe form (excludes auto-managed fields) */
export type RecipeFormData = Omit<Recipe, 'id' | 'dateAdded' | 'timesShown' | 'updatedAt' | 'syncStatus' | 'deletedAt'>;
