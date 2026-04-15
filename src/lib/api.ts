export interface FetchRecipeResponse {
  title: string;
  imageUrl?: string;
  ingredients: string[];
  source: 'json-ld' | 'opengraph' | 'fallback';
}

export interface FetchRecipeError {
  error: string;
  fallback?: boolean;
}

export async function fetchRecipeMetadata(
  url: string
): Promise<FetchRecipeResponse> {
  const response = await fetch('/api/fetch-recipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const data: FetchRecipeError = await response.json();
    throw new Error(data.error || 'Failed to fetch recipe metadata');
  }

  return response.json();
}
