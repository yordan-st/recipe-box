import { Card, Flex, Text, Box, IconButton, Heading } from '@radix-ui/themes'
import { ShuffleIcon, ExternalLinkIcon, PlusIcon, Cross1Icon } from '@radix-ui/react-icons'
import type { Recipe } from '@/types/recipe'

interface MenuSlotProps {
  recipe?: Recipe
  slotIndex: number
  onSwap: (slotIndex: number) => void
  onRemove?: (slotIndex: number) => void
}

export function MenuSlot({ recipe, slotIndex, onSwap, onRemove }: MenuSlotProps) {
  if (!recipe) {
    return (
      <Card
        size="1"
        style={{ cursor: 'pointer', border: '2px dashed var(--gray-6)' }}
        onClick={() => onSwap(slotIndex)}
      >
        <Flex
          align="center"
          justify="center"
          direction="column"
          gap="2"
          style={{ aspectRatio: '16 / 9' }}
        >
          <PlusIcon width={24} height={24} style={{ color: 'var(--gray-8)' }} />
          <Text size="2" color="gray">Pick a recipe</Text>
        </Flex>
      </Card>
    )
  }

  return (
    <Card size="1" style={{ position: 'relative' }}>
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
            {recipe.title
              .split(/\s+/)
              .slice(0, 2)
              .map((w) => w.charAt(0).toUpperCase())
              .join('')}
          </Text>
        </Flex>
      )}
      <Box p="2">
        <Flex align="center" justify="between" gap="2">
          <Heading size="2" truncate>
            {recipe.title}
          </Heading>
          <Flex gap="1">
            <IconButton
              size="1"
              variant="ghost"
              onClick={() => onSwap(slotIndex)}
              aria-label="Swap recipe"
            >
              <ShuffleIcon />
            </IconButton>
            <IconButton size="1" variant="ghost" asChild>
              <a href={recipe.url} target="_blank" rel="noopener noreferrer" aria-label="Open recipe">
                <ExternalLinkIcon />
              </a>
            </IconButton>
            {onRemove && (
              <IconButton
                size="1"
                variant="ghost"
                color="red"
                onClick={() => onRemove(slotIndex)}
                aria-label="Remove recipe"
              >
                <Cross1Icon />
              </IconButton>
            )}
          </Flex>
        </Flex>
      </Box>
    </Card>
  )
}
