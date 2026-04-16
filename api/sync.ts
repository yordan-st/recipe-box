import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

interface SyncRecipe {
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
}

interface SyncPreferences {
  id: string;
  menuSize: number;
  updatedAt: number;
}

interface SyncWeeklyMenu {
  id: string;
  weekStart: number;
  recipeIds: string[];
  manualSlots: Record<number, string>;
  generatedAt: number;
}

interface PushPayload {
  recipes?: SyncRecipe[];
  preferences?: SyncPreferences;
  weeklyMenus?: SyncWeeklyMenu[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
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
           tags, date_added, updated_at, last_shown, times_shown, deleted_at
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
    dateAdded: Number(r.date_added),
    updatedAt: Number(r.updated_at),
    lastShown: r.last_shown ? Number(r.last_shown) : undefined,
    timesShown: r.times_shown,
    deletedAt: r.deleted_at ? Number(r.deleted_at) : undefined,
  }));

  const { rows: prefRows } = await sql`
    SELECT id, menu_size, updated_at
    FROM user_preferences WHERE updated_at > ${since}
  `;

  const preferences: SyncPreferences | undefined = prefRows[0]
    ? {
        id: prefRows[0].id,
        menuSize: prefRows[0].menu_size,
        updatedAt: Number(prefRows[0].updated_at),
      }
    : undefined;

  const { rows: menuRows } = await sql`
    SELECT id, week_start, recipe_ids, manual_slots, generated_at
    FROM weekly_menus WHERE generated_at > ${since}
    ORDER BY week_start DESC LIMIT 4
  `;

  const weeklyMenus: SyncWeeklyMenu[] = menuRows.map((m) => ({
    id: m.id,
    weekStart: Number(m.week_start),
    recipeIds: m.recipe_ids,
    manualSlots: m.manual_slots,
    generatedAt: Number(m.generated_at),
  }));

  return res.status(200).json({
    recipes,
    preferences,
    weeklyMenus,
    serverTime: Date.now(),
  });
}

async function handlePush(req: VercelRequest, res: VercelResponse) {
  const { recipes, preferences, weeklyMenus } = req.body as PushPayload;
  let recipesUpserted = 0;
  let menusUpserted = 0;

  if (recipes && recipes.length > 0) {
    for (const r of recipes) {
      // Last-write-wins: only upsert if incoming updatedAt is newer
      const { rows: existing } = await sql`
        SELECT updated_at FROM recipes WHERE id = ${r.id}
      `;

      if (existing.length === 0 || Number(existing[0].updated_at) < r.updatedAt) {
        await sql`
          INSERT INTO recipes (id, url, title, image_url, ingredients, ingredients_source,
                               tags, date_added, updated_at, last_shown, times_shown, deleted_at)
          VALUES (${r.id}, ${r.url}, ${r.title}, ${r.imageUrl ?? null},
                  ${JSON.stringify(r.ingredients)}, ${r.ingredientsSource},
                  ${JSON.stringify(r.tags)}, ${r.dateAdded}, ${r.updatedAt},
                  ${r.lastShown ?? null}, ${r.timesShown}, ${r.deletedAt ?? null})
          ON CONFLICT (id) DO UPDATE SET
            url = EXCLUDED.url,
            title = EXCLUDED.title,
            image_url = EXCLUDED.image_url,
            ingredients = EXCLUDED.ingredients,
            ingredients_source = EXCLUDED.ingredients_source,
            tags = EXCLUDED.tags,
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
        INSERT INTO user_preferences (id, menu_size, updated_at)
        VALUES (${preferences.id}, ${preferences.menuSize}, ${preferences.updatedAt})
        ON CONFLICT (id) DO UPDATE SET
          menu_size = EXCLUDED.menu_size,
          updated_at = EXCLUDED.updated_at
      `;
    }
  }

  if (weeklyMenus && weeklyMenus.length > 0) {
    for (const m of weeklyMenus) {
      await sql`
        INSERT INTO weekly_menus (id, week_start, recipe_ids, manual_slots, generated_at)
        VALUES (${m.id}, ${m.weekStart}, ${JSON.stringify(m.recipeIds)},
                ${JSON.stringify(m.manualSlots)}, ${m.generatedAt})
        ON CONFLICT (id) DO UPDATE SET
          week_start = EXCLUDED.week_start,
          recipe_ids = EXCLUDED.recipe_ids,
          manual_slots = EXCLUDED.manual_slots,
          generated_at = EXCLUDED.generated_at
      `;
      menusUpserted++;
    }
  }

  return res.status(200).json({
    success: true,
    recipesUpserted,
    menusUpserted,
    serverTime: Date.now(),
  });
}
