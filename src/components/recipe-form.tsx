import { useState, useCallback } from 'react'
import { Flex, Button, Text, Box, TextField, TextArea } from '@radix-ui/themes'
import { toast } from 'sonner'
import { Cross2Icon, MagicWandIcon, UpdateIcon } from '@radix-ui/react-icons'
import { TagInput } from '@/components/tag-input'
import type { RecipeFormData } from '@/types/recipe'

interface FetchResult {
  title: string
  imageUrl?: string
  ingredients: string[]
  source: 'json-ld' | 'opengraph' | 'fallback'
}

interface RecipeFormProps {
  initialData?: Partial<RecipeFormData>
  onSubmit: (data: RecipeFormData) => void
  onCancel?: () => void
  isLoading?: boolean
}

export function RecipeForm({ initialData, onSubmit, onCancel, isLoading = false }: RecipeFormProps) {
  const [url, setUrl] = useState(initialData?.url ?? '')
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? '')
  const [ingredientsText, setIngredientsText] = useState(
    initialData?.ingredients?.join('\n') ?? ''
  )
  const [ingredientsSource, setIngredientsSource] = useState<'auto' | 'manual'>(
    initialData?.ingredientsSource ?? 'manual'
  )
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? [])

  const [errors, setErrors] = useState<{ url?: string; title?: string }>({})
  const [isFetching, setIsFetching] = useState(false)

  const isEditing = initialData !== undefined

  function validate(): boolean {
    const newErrors: { url?: string; title?: string } = {}
    if (!url.trim()) {
      newErrors.url = 'URL is required'
    } else {
      try {
        new URL(url.trim())
      } catch {
        newErrors.url = 'Please enter a valid URL'
      }
    }
    if (!title.trim()) newErrors.title = 'Title is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const fetchMetadata = useCallback(async () => {
    if (!url.trim()) {
      setErrors({ url: 'Enter a URL first' })
      return
    }

    try {
      new URL(url.trim())
    } catch {
      setErrors({ url: 'Enter a valid URL' })
      return
    }

    setIsFetching(true)
    setErrors({})

    try {
      const apiUrl = import.meta.env.DEV
        ? '/api/fetch-recipe'
        : '/api/fetch-recipe'

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })

      if (!response.ok) {
        const data = await response.json()
        toast.error(data.error || 'Failed to fetch recipe data. Fill in details manually.')
        return
      }

      const data: FetchResult = await response.json()

      if (data.title) setTitle(data.title)
      if (data.imageUrl) setImageUrl(data.imageUrl)

      if (data.ingredients && data.ingredients.length > 0) {
        setIngredientsText(data.ingredients.join('\n'))
        setIngredientsSource('auto')
        toast.success(`Fetched ${data.ingredients.length} ingredients via ${data.source}`)
      } else {
        setIngredientsSource('manual')
        toast.success(`Fetched title and image via ${data.source}. No ingredients found — enter them manually.`)
      }
    } catch {
      toast.error('Could not reach the server. Fill in details manually.')
    } finally {
      setIsFetching(false)
    }
  }, [url])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const ingredients = ingredientsText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    onSubmit({
      url: url.trim(),
      title: title.trim(),
      imageUrl: imageUrl.trim() || undefined,
      ingredients,
      ingredientsSource: ingredients.length > 0 ? ingredientsSource : 'manual',
      tags,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="4">
        <Box>
          <Text as="label" size="2" weight="medium" mb="1" htmlFor="recipe-url">
            Recipe URL *
          </Text>
          <Flex gap="2" align="start">
            <Box flexGrow="1">
              <TextField.Root
                id="recipe-url"
                placeholder="https://example.com/recipe"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              {errors.url && (
                <Text size="1" color="red" mt="1">
                  {errors.url}
                </Text>
              )}
            </Box>
            {!isEditing && (
              <Button
                type="button"
                variant="soft"
                onClick={fetchMetadata}
                disabled={isFetching}
              >
                {isFetching ? <UpdateIcon /> : <MagicWandIcon />}
                {isFetching ? 'Fetching...' : 'Auto-fill'}
              </Button>
            )}
          </Flex>
        </Box>

        <Box>
          <Text as="label" size="2" weight="medium" mb="1" htmlFor="recipe-title">
            Title *
          </Text>
          <TextField.Root
            id="recipe-title"
            placeholder="Recipe title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {errors.title && (
            <Text size="1" color="red" mt="1">
              {errors.title}
            </Text>
          )}
        </Box>

        <Box>
          <Text as="label" size="2" weight="medium" mb="1" htmlFor="recipe-image-url">
            Image URL
          </Text>
          <TextField.Root
            id="recipe-image-url"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          {imageUrl && (
            <Box mt="2" style={{ maxWidth: 200 }}>
              <img
                src={imageUrl}
                alt="Preview"
                style={{
                  width: '100%',
                  borderRadius: 'var(--radius-2)',
                  objectFit: 'cover',
                  aspectRatio: '16 / 9',
                }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            </Box>
          )}
        </Box>

        <Box>
          <Text as="label" size="2" weight="medium" mb="1" htmlFor="recipe-ingredients">
            Ingredients (one per line)
          </Text>
          <TextArea
            id="recipe-ingredients"
            placeholder={"2 cups flour\n1 tsp salt\n3 eggs"}
            rows={6}
            value={ingredientsText}
            onChange={(e) => {
              setIngredientsText(e.target.value)
              setIngredientsSource('manual')
            }}
          />
        </Box>

        <Box>
          <Text as="label" size="2" weight="medium" mb="1">
            Tags
          </Text>
          <TagInput tags={tags} onChange={setTags} />
        </Box>

        <Flex gap="3" mt="2" justify="end">
          {onCancel && (
            <Button
              type="button"
              variant="soft"
              color="gray"
              onClick={onCancel}
            >
              <Cross2Icon />
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? 'Saving...'
              : isEditing
                ? 'Save Changes'
                : 'Add Recipe'}
          </Button>
        </Flex>
      </Flex>
    </form>
  )
}
