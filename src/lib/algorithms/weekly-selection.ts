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
 * Tag diversity: after each pick, penalize remaining recipes that share tags.
 */
export function selectWeeklyMenu(
  recipes: Recipe[],
  count: number = 4,
  tagDiversityPenalty: number = 0.3,
  excludeIds: string[] = [],
): Recipe[] {
  const available = recipes.filter((r) => !excludeIds.includes(r.id));

  if (available.length <= count) {
    return available;
  }

  const now = Date.now();
  const totalRecipes = available.length;

  const weights = available.map((recipe) => {
    if (recipe.lastShown === undefined) {
      return 1000;
    }
    const daysSinceLastShown =
      (now - recipe.lastShown) / (1000 * 60 * 60 * 24);
    const weight = daysSinceLastShown * (totalRecipes / 10);
    return Math.max(weight, 1);
  });

  // Weighted random sampling without replacement
  const selected: Recipe[] = [];
  const remaining = available.map((recipe, i) => ({ recipe, weight: weights[i] }));

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

    const chosen = remaining[chosenIndex];
    selected.push(chosen.recipe);
    remaining.splice(chosenIndex, 1);

    // Apply typed tag diversity penalty — stacks per shared category
    for (const item of remaining) {
      const shared =
        (chosen.recipe.dishType && item.recipe.dishType === chosen.recipe.dishType ? 1 : 0) +
        (chosen.recipe.diet && item.recipe.diet === chosen.recipe.diet ? 1 : 0) +
        (chosen.recipe.cuisine && item.recipe.cuisine === chosen.recipe.cuisine ? 1 : 0);
      if (shared > 0) {
        item.weight *= Math.pow(tagDiversityPenalty, shared);
      }
    }
  }

  return selected;
}
