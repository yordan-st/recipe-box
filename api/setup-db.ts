import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS recipes (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        title TEXT NOT NULL,
        image_url TEXT,
        ingredients JSONB NOT NULL DEFAULT '[]',
        ingredients_source TEXT NOT NULL DEFAULT 'auto',
        tags JSONB NOT NULL DEFAULT '[]',
        date_added BIGINT NOT NULL,
        updated_at BIGINT NOT NULL,
        last_shown BIGINT,
        times_shown INTEGER NOT NULL DEFAULT 0,
        deleted_at BIGINT,
        sync_status TEXT NOT NULL DEFAULT 'synced'
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS weekly_menus (
        id TEXT PRIMARY KEY,
        week_start BIGINT NOT NULL,
        recipe_ids JSONB NOT NULL DEFAULT '[]',
        manual_slots JSONB NOT NULL DEFAULT '{}',
        generated_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL DEFAULT 0
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id TEXT PRIMARY KEY,
        menu_size INTEGER NOT NULL DEFAULT 4,
        updated_at BIGINT NOT NULL,
        sync_status TEXT NOT NULL DEFAULT 'synced'
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS grocery_checklists (
        id TEXT PRIMARY KEY,
        week_start BIGINT NOT NULL,
        checked_items JSONB NOT NULL DEFAULT '[]',
        updated_at BIGINT NOT NULL
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_grocery_checklists_week_start ON grocery_checklists(week_start)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_grocery_checklists_updated_at ON grocery_checklists(updated_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_recipes_updated_at ON recipes(updated_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_weekly_menus_week_start ON weekly_menus(week_start)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_weekly_menus_updated_at ON weekly_menus(updated_at)`;

    // Migration: add updated_at column to existing weekly_menus table
    await sql`ALTER TABLE weekly_menus ADD COLUMN IF NOT EXISTS updated_at BIGINT NOT NULL DEFAULT 0`;
    await sql`UPDATE weekly_menus SET updated_at = generated_at WHERE updated_at = 0`;

    return res.status(200).json({ success: true, message: 'Database tables created' });
  } catch (error) {
    console.error('Setup DB error:', error);
    return res.status(500).json({ error: 'Failed to set up database', details: String(error) });
  }
}
