import { useState, useCallback } from 'react'
import { Flex, Button, Text, Box, TextField, TextArea } from '@radix-ui/themes'
import { toast } from 'sonner'
import { Cross2Icon, MagicWandIcon, UpdateIcon } from '@radix-ui/react-icons'
import { TagInput } from '@/components/tag-input'
import type { RecipeFormData } from '@/types/recipe'
import { t } from '@/lib/i18n'

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
      newErrors.url = t.urlRequired
    } else {
      try {
        new URL(url.trim())
      } catch {
        newErrors.url = t.validUrl
      }
    }
    if (!title.trim()) newErrors.title = t.titleRequired
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const fetchMetadata = useCallback(async () => {
    if (!url.trim()) {
      setErrors({ url: t.enterUrlFirst })
      return
    }

    try {
      new URL(url.trim())
    } catch {
      setErrors({ url: t.enterValidUrl })
      return
    }

    setIsFetching(true)
    setErrors({})

    try {
      const response = await fetch('/api/fetch-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ url: url.trim() }),
      })

      if (!response.ok) {
        const data = await response.json()
        toast.error(data.error || t.fetchFailed)
        return
      }

      const data: FetchResult = await response.json()

      if (data.title) setTitle(data.title)
      if (data.imageUrl) setImageUrl(data.imageUrl)

      if (data.ingredients && data.ingredients.length > 0) {
        setIngredientsText(data.ingredients.join('\n'))
        setIngredientsSource('auto')
        toast.success(t.fetchSuccess(data.ingredients.length, data.source))
      } else {
        setIngredientsSource('manual')
        toast.success(t.fetchPartial(data.source))
      }
    } catch {
      toast.error(t.fetchOffline)
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
            {t.labelUrl}
          </Text>
          <Flex gap="2" align="start">
            <Box flexGrow="1">
              <TextField.Root
                id="recipe-url"
                placeholder={t.placeholderUrl}
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
                {isFetching ? t.fetching : t.autoFill}
              </Button>
            )}
          </Flex>
        </Box>

        <Box>
          <Text as="label" size="2" weight="medium" mb="1" htmlFor="recipe-title">
            {t.labelTitle}
          </Text>
          <TextField.Root
            id="recipe-title"
            placeholder={t.placeholderTitle}
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
            {t.labelImageUrl}
          </Text>
          <TextField.Root
            id="recipe-image-url"
            placeholder={t.placeholderImageUrl}
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
            {t.labelIngredients}
          </Text>
          <TextArea
            id="recipe-ingredients"
            placeholder={t.placeholderIngredients}
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
            {t.labelTags}
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
              {t.cancel}
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? t.saving
              : isEditing
                ? t.saveChanges
                : t.addRecipe}
          </Button>
        </Flex>
      </Flex>
    </form>
  )
}
