import { useState } from 'react'
import { Flex, Button, Text, Box, TextField, TextArea } from '@radix-ui/themes'
import { Cross2Icon } from '@radix-ui/react-icons'
import type { Recipe } from '@/types/recipe'

interface RecipeFormProps {
  initialData?: Partial<Recipe>
  onSubmit: (data: Omit<Recipe, 'id' | 'dateAdded' | 'timesShown'>) => void
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

  const [errors, setErrors] = useState<{ url?: string; title?: string }>({})

  const isEditing = initialData !== undefined

  function validate(): boolean {
    const newErrors: { url?: string; title?: string } = {}

    if (!url.trim()) {
      newErrors.url = 'URL is required'
    }

    if (!title.trim()) {
      newErrors.title = 'Title is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

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
      ingredientsSource: 'manual',
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="4">
        <Box>
          <Text as="label" size="2" weight="medium" mb="1" htmlFor="recipe-url">
            Recipe URL *
          </Text>
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
            onChange={(e) => setIngredientsText(e.target.value)}
          />
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
