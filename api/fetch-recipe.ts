import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as cheerio from 'cheerio';
import { verifyAuth } from './_lib/verify-auth';

interface RecipeMetadata {
  title: string;
  imageUrl?: string;
  ingredients: string[];
  source: 'json-ld' | 'opengraph' | 'fallback';
}

function resolveUrl(maybeRelative: string | undefined, baseUrl: string): string | undefined {
  if (!maybeRelative) return undefined;
  try {
    return new URL(maybeRelative, baseUrl).href;
  } catch {
    return undefined;
  }
}

function extractImageUrl(img: unknown): string | undefined {
  if (typeof img === 'string') return img;
  if (Array.isArray(img)) {
    for (const item of img) {
      const url = extractImageUrl(item);
      if (url) return url;
    }
    return undefined;
  }
  if (img && typeof img === 'object') {
    const obj = img as Record<string, unknown>;
    if (typeof obj.url === 'string') return obj.url;
    if (typeof obj.contentUrl === 'string') return obj.contentUrl;
  }
  return undefined;
}

function extractJsonLd($: cheerio.CheerioAPI): Partial<RecipeMetadata> | null {
  const scripts = $('script[type="application/ld+json"]');
  const result: Partial<RecipeMetadata> = {};

  scripts.each((_, el) => {
    try {
      const text = $(el).text();
      const data = JSON.parse(text);

      const recipes = findRecipeObjects(data);
      if (recipes.length === 0) return;

      const recipe = recipes[0];
      result.title = (recipe.name as string) || undefined;
      result.imageUrl = extractImageUrl(recipe.image);

      if (recipe.recipeIngredient && Array.isArray(recipe.recipeIngredient)) {
        result.ingredients = recipe.recipeIngredient.map(String);
      }

      result.source = 'json-ld';
    } catch {
      // Invalid JSON-LD, skip
    }
  });

  return result.title ? result : null;
}

function findRecipeObjects(data: unknown): Record<string, unknown>[] {
  const results: Record<string, unknown>[] = [];

  if (Array.isArray(data)) {
    for (const item of data) {
      results.push(...findRecipeObjects(item));
    }
  } else if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const type = obj['@type'];

    if (type === 'Recipe' || (Array.isArray(type) && type.includes('Recipe'))) {
      results.push(obj);
    }

    if (obj['@graph'] && Array.isArray(obj['@graph'])) {
      results.push(...findRecipeObjects(obj['@graph']));
    }
  }

  return results;
}

function extractOpenGraph($: cheerio.CheerioAPI): Partial<RecipeMetadata> | null {
  const title =
    $('meta[property="og:title"]').attr('content') ||
    $('meta[name="og:title"]').attr('content');
  const imageUrl =
    $('meta[property="og:image"]').attr('content') ||
    $('meta[name="og:image"]').attr('content');

  if (!title) return null;

  return {
    title,
    imageUrl: imageUrl || undefined,
    ingredients: [],
    source: 'opengraph',
  };
}

function extractFallback($: cheerio.CheerioAPI): Partial<RecipeMetadata> {
  const title = $('title').text().trim() || $('h1').first().text().trim();
  const imageUrl =
    $('meta[property="og:image"]').attr('content') ||
    $('img').first().attr('src');

  return {
    title: title || 'Untitled Recipe',
    imageUrl: imageUrl || undefined,
    ingredients: [],
    source: 'fallback',
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin ?? '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (!verifyAuth(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required' });
    }

    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL' });
    }
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; RecipeBox/1.0; +https://recipe-box.app)',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'nl,nl-NL;q=0.9,en;q=0.8',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return res.status(502).json({
        error: `Failed to fetch URL: ${response.status}`,
        fallback: true,
      });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Try JSON-LD first (best source)
    const jsonLd = extractJsonLd($);
    if (jsonLd?.title) {
      return res.status(200).json({
        title: jsonLd.title,
        imageUrl: resolveUrl(jsonLd.imageUrl, url),
        ingredients: jsonLd.ingredients ?? [],
        source: jsonLd.source,
      });
    }

    // Try Open Graph
    const og = extractOpenGraph($);
    if (og?.title) {
      return res.status(200).json({
        title: og.title,
        imageUrl: resolveUrl(og.imageUrl, url),
        ingredients: [],
        source: og.source,
      });
    }

    // Fallback
    const fallback = extractFallback($);
    return res.status(200).json({
      title: fallback.title,
      imageUrl: resolveUrl(fallback.imageUrl, url),
      ingredients: [],
      source: fallback.source,
    });
  } catch (err) {
    console.error('Fetch-recipe error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({
      error: `Failed to scrape: ${message}`,
      fallback: true,
    });
  }
}
