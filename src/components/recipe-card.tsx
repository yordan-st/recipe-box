import { Card, Flex, Text, Heading, Badge, Box, Button, IconButton } from '@radix-ui/themes'
import { TrashIcon, Pencil1Icon, ExternalLinkIcon } from '@radix-ui/react-icons'
import type { Recipe } from '@/types/recipe'

interface RecipeCardProps {
  recipe: Recipe
  onDelete?: (id: string) => void
  onEdit?: (recipe: Recipe) => void
  compact?: boolean
}

function RecipeInitials({ title }: { title: string }) {
  const initials = title
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')

  return (
    <Flex
      align="center"
      justify="center"
      style={{
        width: '100%',
        aspectRatio: '16 / 9',
        backgroundColor: 'var(--accent-3)',
        borderRadius: 'var(--radius-2) var(--radius-2) 0 0',
      }}
    >
      <Text size="6" weight="bold" style={{ color: 'var(--accent-9)' }}>
        {initials}
      </Text>
    </Flex>
  )
}

export function RecipeCard({ recipe, onDelete, onEdit, compact = false }: RecipeCardProps) {
  if (compact) {
    return (
      <Card size="1">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            style={{
              width: '100%',
              aspectRatio: '16 / 9',
              objectFit: 'cover',
              borderRadius: 'var(--radius-2) var(--radius-2) 0 0',
              display: 'block',
            }}
          />
        ) : (
          <RecipeInitials title={recipe.title} />
        )}
        <Box p="2">
          <Flex align="center" justify="between" gap="2">
            <Heading size="2" truncate>
              {recipe.title}
            </Heading>
            <IconButton
              size="1"
              variant="ghost"
              asChild
            >
              <a href={recipe.url} target="_blank" rel="noopener noreferrer">
                <ExternalLinkIcon />
              </a>
            </IconButton>
          </Flex>
        </Box>
      </Card>
    )
  }

  return (
    <Card size="2">
      {recipe.imageUrl ? (
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          style={{
            width: '100%',
            aspectRatio: '16 / 9',
            objectFit: 'cover',
            borderRadius: 'var(--radius-2) var(--radius-2) 0 0',
            display: 'block',
          }}
        />
      ) : (
        <RecipeInitials title={recipe.title} />
      )}
      <Box p="3">
        <Flex direction="column" gap="2">
          <Flex align="center" justify="between" gap="2">
            <Heading size="3" truncate>
              {recipe.title}
            </Heading>
            <Badge
              color={recipe.ingredientsSource === 'auto' ? 'green' : 'blue'}
              variant="soft"
            >
              {recipe.ingredientsSource}
            </Badge>
          </Flex>

          <Text size="2" color="gray">
            {recipe.ingredients.length} ingredient{recipe.ingredients.length !== 1 ? 's' : ''}
          </Text>

          <Flex gap="2" mt="2" align="center">
            <Button variant="soft" size="2" asChild>
              <a href={recipe.url} target="_blank" rel="noopener noreferrer">
                <ExternalLinkIcon />
                Open Recipe
              </a>
            </Button>

            <Flex gap="1" ml="auto">
              {onEdit && (
                <IconButton
                  size="2"
                  variant="ghost"
                  onClick={() => onEdit(recipe)}
                >
                  <Pencil1Icon />
                </IconButton>
              )}
              {onDelete && (
                <IconButton
                  size="2"
                  variant="ghost"
                  color="red"
                  onClick={() => onDelete(recipe.id)}
                >
                  <TrashIcon />
                </IconButton>
              )}
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </Card>
  )
}
