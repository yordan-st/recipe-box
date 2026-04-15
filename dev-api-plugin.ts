import type { Plugin } from 'vite';
import * as cheerio from 'cheerio';

function findRecipeObjects(data: unknown): Record<string, unknown>[] {
  const results: Record<string, unknown>[] = [];
  if (Array.isArray(data)) {
    for (const item of data) results.push(...findRecipeObjects(item));
  } else if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const type = obj['@type'];
    if (type === 'Recipe' || (Array.isArray(type) && type.includes('Recipe')))
      results.push(obj);
    if (obj['@graph'] && Array.isArray(obj['@graph']))
      results.push(...findRecipeObjects(obj['@graph']));
  }
  return results;
}

export function devApiPlugin(): Plugin {
  return {
    name: 'dev-api',
    configureServer(server) {
      server.middlewares.use('/api/fetch-recipe', async (req, res) => {
        if (req.method === 'OPTIONS') {
          res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          });
          res.end();
          return;
        }

        if (req.method !== 'POST') {
          res.writeHead(405, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        for await (const chunk of req) body += chunk;

        let url: string;
        try {
          const parsed = JSON.parse(body);
          url = parsed.url;
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON body' }));
          return;
        }

        if (!url || typeof url !== 'string') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'URL is required' }));
          return;
        }

        try {
          new URL(url);
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid URL' }));
          return;
        }

        try {
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; RecipeBox/1.0)',
              Accept: 'text/html,application/xhtml+xml',
            },
            signal: AbortSignal.timeout(10000),
          });

          if (!response.ok) {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `Failed to fetch: ${response.status}`, fallback: true }));
            return;
          }

          const html = await response.text();
          const $ = cheerio.load(html);

          // JSON-LD
          let result: { title?: string; imageUrl?: string; ingredients?: string[]; source?: string } = {};
          $('script[type="application/ld+json"]').each((_, el) => {
            try {
              const data = JSON.parse($(el).text());
              const recipes = findRecipeObjects(data);
              if (recipes.length > 0) {
                const recipe = recipes[0];
                result.title = recipe.name as string;
                const img = recipe.image;
                result.imageUrl = Array.isArray(img) ? String(img[0]) : typeof img === 'string' ? img : undefined;
                if (Array.isArray(recipe.recipeIngredient)) {
                  result.ingredients = recipe.recipeIngredient.map(String);
                }
                result.source = 'json-ld';
              }
            } catch { /* skip */ }
          });

          if (!result.title) {
            result.title = $('meta[property="og:title"]').attr('content') || $('title').text().trim() || 'Untitled';
            result.imageUrl = $('meta[property="og:image"]').attr('content') || undefined;
            result.source = $('meta[property="og:title"]').attr('content') ? 'opengraph' : 'fallback';
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            title: result.title,
            imageUrl: result.imageUrl,
            ingredients: result.ingredients ?? [],
            source: result.source,
          }));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: `Scrape failed: ${err instanceof Error ? err.message : 'Unknown'}`,
            fallback: true,
          }));
        }
      });
    },
  };
}
