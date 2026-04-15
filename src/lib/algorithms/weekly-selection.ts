import type { Recipe } from '@/types/recipe';

/**
 * Returns Monday 00:00:00 of the current week as a timestamp.
 */
export function getWeekStartTimestamp(): number {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, ...
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday.getTime();
}

/**
 * Select `count` recipes weighted by how long since last shown.
 * Never-shown recipes get highest priority.
 * More recipes in collection = less frequent repeats.
 */
export function selectWeeklyMenu(
  recipes: Recipe[],
  count: number = 4,
): Recipe[] {
  if (recipes.length <= count) {
    return recipes;
  }

  const now = Date.now();
  const totalRecipes = recipes.length;

  const weights = recipes.map((recipe) => {
    if (recipe.lastShown === undefined) {
      return 1000;
    }
    const daysSinceLastShown =
      (now - recipe.lastShown) / (1000 * 60 * 60 * 24);
    const weight = daysSinceLastShown * (totalRecipes / 10);
    return Math.max(weight, 1);
  });

  // Weighted random sampling without replacement (Fisher-Yates-like)
  const selected: Recipe[] = [];
  const remaining = recipes.map((recipe, i) => ({ recipe, weight: weights[i] }));

  for (let i = 0; i < count; i++) {
    const totalWeight = remaining.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    let chosenIndex = 0;
    for (let j = 0; j < remaining.length; j++) {
      random -= remaining[j].weight;
      if (random <= 0) {
        chosenIndex = j;
        break;
      }
    }

    selected.push(remaining[chosenIndex].recipe);
    remaining.splice(chosenIndex, 1);
  }

  return selected;
}
