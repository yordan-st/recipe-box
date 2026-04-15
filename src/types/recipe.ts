export interface Recipe {
  id: string;
  url: string;
  title: string;
  imageUrl?: string;
  ingredients: string[];
  ingredientsSource: 'auto' | 'manual';
  dateAdded: number;
  lastShown?: number;
  timesShown: number;
}

export interface WeeklyMenu {
  id: string;
  weekStart: number;
  recipeIds: string[];
  generatedAt: number;
}
