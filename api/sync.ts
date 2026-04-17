import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import { createHmac } from 'node:crypto';

function verifyAuth(req: VercelRequest): boolean {
  const password = process.env.AUTH_PASSWORD;
  if (!password) return true;
  const cookie = req.headers.cookie ?? '';
  const match = cookie.match(/(?:^|;\s*)auth_token=([^;]*)/);
  if (!match) return false;
  const expected = createHmac('sha256', password).update(password).digest('hex');
  return match[1] === expected;
}

interface SyncRecipe {
  id: string;
  url: string;
  title: string;
  imageUrl?: string;
  ingredients: string[];
  ingredientsSource: 'auto' | 'manual';
  tags: string[];
  dishType?: string;
  diet?: string;
  cuisine?: string;
  dateAdded: number;
  updatedAt: number;
  lastShown?: number;
  timesShown: number;
  deletedAt?: number;
}

interface SyncPreferences {
  id: string;
  menuSize: number;
  customTags?: string[];
  dishTypeOptions?: string[];
  dietOptions?: string[];
  cuisineOptions?: string[];
  updatedAt: number;
}

interface SyncWeeklyMenu {
  id: string;
  weekStart: number;
  recipeIds: string[];
  manualSlots: Record<number, string>;
  generatedAt: number;
  updatedAt: number;
}

interface SyncGroceryChecklist {
  id: string;
  weekStart: number;
  checkedItems: string[];
  updatedAt: number;
}

interface PushPayload {
  recipes?: SyncRecipe[];
  preferences?: SyncPreferences;
  weeklyMenus?: SyncWeeklyMenu[];
  groceryChecklists?: SyncGroceryChecklist[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin ?? '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') return res.status(200).end();

    if (!verifyAuth(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') return await handlePull(req, res);
    if (req.method === 'POST') return await handlePush(req, res);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Sync error:', error);
    return res.status(500).json({ error: 'Sync failed', details: String(error) });
  }
}

async function handlePull(req: VercelRequest, res: VercelResponse) {
  const since = Number(req.query.since) || 0;

  const { rows: recipeRows } = await sql`
    SELECT id, url, title, image_url, ingredients, ingredients_source,
           tags, dish_type, diet, cuisine,
           date_added, updated_at, last_shown, times_shown, deleted_at
    FROM recipes WHERE updated_at > ${since}
  `;

  const recipes: SyncRecipe[] = recipeRows.map((r) => ({
    id: r.id,
    url: r.url,
    title: r.title,
    imageUrl: r.image_url || undefined,
    ingredients: r.ingredients,
    ingredientsSource: r.ingredients_source,
    tags: r.tags,
    dishType: r.dish_type || undefined,
    diet: r.diet || undefined,
    cuisine: r.cuisine || undefined,
    dateAdded: Number(r.date_added),
    updatedAt: Number(r.updated_at),
    lastShown: r.last_shown ? Number(r.last_shown) : undefined,
    timesShown: r.times_shown,
    deletedAt: r.deleted_at ? Number(r.deleted_at) : undefined,
  }));

  const { rows: prefRows } = await sql`
    SELECT id, menu_size, custom_tags, dish_type_options, diet_options, cuisine_options, updated_at
    FROM user_preferences WHERE updated_at > ${since}
  `;

  const preferences: SyncPreferences | undefined = prefRows[0]
    ? {
        id: prefRows[0].id,
        menuSize: prefRows[0].menu_size,
        customTags: prefRows[0].custom_tags ?? [],
        dishTypeOptions: prefRows[0].dish_type_options ?? [],
        dietOptions: prefRows[0].diet_options ?? [],
        cuisineOptions: prefRows[0].cuisine_options ?? [],
        updatedAt: Number(prefRows[0].updated_at),
      }
    : undefined;

  const { rows: menuRows } = await sql`
    SELECT id, week_start, recipe_ids, manual_slots, generated_at, updated_at
    FROM weekly_menus WHERE updated_at > ${since}
    ORDER BY week_start DESC LIMIT 4
  `;

  const weeklyMenus: SyncWeeklyMenu[] = menuRows.map((m) => ({
    id: m.id,
    weekStart: Number(m.week_start),
    recipeIds: m.recipe_ids,
    manualSlots: m.manual_slots,
    generatedAt: Number(m.generated_at),
    updatedAt: Number(m.updated_at),
  }));

  const { rows: checklistRows } = await sql`
    SELECT id, week_start, checked_items, updated_at
    FROM grocery_checklists WHERE updated_at > ${since}
  `;

  const groceryChecklists: SyncGroceryChecklist[] = checklistRows.map((c) => ({
    id: c.id,
    weekStart: Number(c.week_start),
    checkedItems: c.checked_items,
    updatedAt: Number(c.updated_at),
  }));

  return res.status(200).json({
    recipes,
    preferences,
    weeklyMenus,
    groceryChecklists,
    serverTime: Date.now(),
  });
}

async function handlePush(req: VercelRequest, res: VercelResponse) {
  const { recipes, preferences, weeklyMenus, groceryChecklists } = req.body as PushPayload;
  let recipesUpserted = 0;
  let menusUpserted = 0;
  let checklistsUpserted = 0;

  if (recipes && recipes.length > 0) {
    for (const r of recipes) {
      // Last-write-wins: only upsert if incoming updatedAt is newer
      const { rows: existing } = await sql`
        SELECT updated_at FROM recipes WHERE id = ${r.id}
      `;

      if (existing.length === 0 || Number(existing[0].updated_at) < r.updatedAt) {
        await sql`
          INSERT INTO recipes (id, url, title, image_url, ingredients, ingredients_source,
                               tags, dish_type, diet, cuisine,
                               date_added, updated_at, last_shown, times_shown, deleted_at)
          VALUES (${r.id}, ${r.url}, ${r.title}, ${r.imageUrl ?? null},
                  ${JSON.stringify(r.ingredients)}, ${r.ingredientsSource},
                  ${JSON.stringify(r.tags)}, ${r.dishType ?? null}, ${r.diet ?? null}, ${r.cuisine ?? null},
                  ${r.dateAdded}, ${r.updatedAt},
                  ${r.lastShown ?? null}, ${r.timesShown}, ${r.deletedAt ?? null})
          ON CONFLICT (id) DO UPDATE SET
            url = EXCLUDED.url,
            title = EXCLUDED.title,
            image_url = EXCLUDED.image_url,
            ingredients = EXCLUDED.ingredients,
            ingredients_source = EXCLUDED.ingredients_source,
            tags = EXCLUDED.tags,
            dish_type = EXCLUDED.dish_type,
            diet = EXCLUDED.diet,
            cuisine = EXCLUDED.cuisine,
            date_added = EXCLUDED.date_added,
            updated_at = EXCLUDED.updated_at,
            last_shown = EXCLUDED.last_shown,
            times_shown = EXCLUDED.times_shown,
            deleted_at = EXCLUDED.deleted_at
        `;
        recipesUpserted++;
      }
    }
  }

  if (preferences) {
    const { rows: existing } = await sql`
      SELECT updated_at FROM user_preferences WHERE id = ${preferences.id}
    `;

    if (existing.length === 0 || Number(existing[0].updated_at) < preferences.updatedAt) {
      await sql`
        INSERT INTO user_preferences (id, menu_size, custom_tags, dish_type_options, diet_options, cuisine_options, updated_at)
        VALUES (${preferences.id}, ${preferences.menuSize}, ${JSON.stringify(preferences.customTags ?? [])},
                ${JSON.stringify(preferences.dishTypeOptions ?? [])}, ${JSON.stringify(preferences.dietOptions ?? [])},
                ${JSON.stringify(preferences.cuisineOptions ?? [])}, ${preferences.updatedAt})
        ON CONFLICT (id) DO UPDATE SET
          menu_size = EXCLUDED.menu_size,
          custom_tags = EXCLUDED.custom_tags,
          dish_type_options = EXCLUDED.dish_type_options,
          diet_options = EXCLUDED.diet_options,
          cuisine_options = EXCLUDED.cuisine_options,
          updated_at = EXCLUDED.updated_at
      `;
    }
  }

  if (weeklyMenus && weeklyMenus.length > 0) {
    for (const m of weeklyMenus) {
      const { rows: existing } = await sql`
        SELECT updated_at FROM weekly_menus WHERE id = ${m.id}
      `;

      if (existing.length === 0 || Number(existing[0].updated_at) < m.updatedAt) {
        await sql`
          INSERT INTO weekly_menus (id, week_start, recipe_ids, manual_slots, generated_at, updated_at)
          VALUES (${m.id}, ${m.weekStart}, ${JSON.stringify(m.recipeIds)},
                  ${JSON.stringify(m.manualSlots)}, ${m.generatedAt}, ${m.updatedAt})
          ON CONFLICT (id) DO UPDATE SET
            week_start = EXCLUDED.week_start,
            recipe_ids = EXCLUDED.recipe_ids,
            manual_slots = EXCLUDED.manual_slots,
            generated_at = EXCLUDED.generated_at,
            updated_at = EXCLUDED.updated_at
        `;
        menusUpserted++;
      }
    }
  }

  if (groceryChecklists && groceryChecklists.length > 0) {
    for (const c of groceryChecklists) {
      const { rows: existing } = await sql`
        SELECT updated_at FROM grocery_checklists WHERE id = ${c.id}
      `;

      if (existing.length === 0 || Number(existing[0].updated_at) < c.updatedAt) {
        await sql`
          INSERT INTO grocery_checklists (id, week_start, checked_items, updated_at)
          VALUES (${c.id}, ${c.weekStart}, ${JSON.stringify(c.checkedItems)}, ${c.updatedAt})
          ON CONFLICT (id) DO UPDATE SET
            week_start = EXCLUDED.week_start,
            checked_items = EXCLUDED.checked_items,
            updated_at = EXCLUDED.updated_at
        `;
        checklistsUpserted++;
      }
    }
  }

  return res.status(200).json({
    success: true,
    recipesUpserted,
    menusUpserted,
    checklistsUpserted,
    serverTime: Date.now(),
  });
}
