import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import { verifyAuth } from './auth';

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
  customTags?: string[];
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
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin ?? '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!verifyAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

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
    SELECT id, menu_size, custom_tags, updated_at
    FROM user_preferences WHERE updated_at > ${since}
  `;

  const preferences: SyncPreferences | undefined = prefRows[0]
    ? {
        id: prefRows[0].id,
        menuSize: prefRows[0].menu_size,
        customTags: prefRows[0].custom_tags ?? [],
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
        INSERT INTO user_preferences (id, menu_size, custom_tags, updated_at)
        VALUES (${preferences.id}, ${preferences.menuSize}, ${JSON.stringify(preferences.customTags ?? [])}, ${preferences.updatedAt})
        ON CONFLICT (id) DO UPDATE SET
          menu_size = EXCLUDED.menu_size,
          custom_tags = EXCLUDED.custom_tags,
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
