import { useState } from 'react'
import { Box, Flex, Text, Heading, Checkbox } from '@radix-ui/themes'
import type { Recipe } from '@/types/recipe'

interface GroceryListProps {
  recipes: Recipe[]
}

interface GroceryItem {
  text: string
  recipeTitles: string[]
}

function aggregateIngredients(recipes: Recipe[]): GroceryItem[] {
  const map = new Map<string, string[]>()

  for (const recipe of recipes) {
    for (const ingredient of recipe.ingredients) {
      const key = ingredient.toLowerCase().trim()
      if (!key) continue
      const existing = map.get(key)
      if (existing) {
        if (!existing.includes(recipe.title)) {
          existing.push(recipe.title)
        }
      } else {
        map.set(key, [recipe.title])
      }
    }
  }

  return Array.from(map.entries()).map(([text, recipeTitles]) => ({
    text,
    recipeTitles,
  }))
}

export function GroceryList({ recipes }: GroceryListProps) {
  const items = aggregateIngredients(recipes)
  const [checked, setChecked] = useState<Set<string>>(new Set())

  if (items.length === 0) {
    return (
      <Box>
        <Heading size="4" mb="2">Grocery List</Heading>
        <Text size="2" color="gray">
          No ingredients found. Add ingredients to your recipes to see them here.
        </Text>
      </Box>
    )
  }

  const toggle = (key: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const remaining = items.length - checked.size

  return (
    <Box>
      <Flex justify="between" align="center" mb="3">
        <Heading size="4">Grocery List</Heading>
        <Text size="2" color="gray">
          {remaining} of {items.length} remaining
        </Text>
      </Flex>

      <Flex direction="column" gap="2">
        {items.map((item) => {
          const isChecked = checked.has(item.text)
          return (
            <Flex
              key={item.text}
              align="start"
              gap="2"
              p="2"
              style={{
                borderRadius: 'var(--radius-2)',
                backgroundColor: isChecked ? 'var(--gray-2)' : 'transparent',
                cursor: 'pointer',
              }}
              onClick={() => toggle(item.text)}
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={() => toggle(item.text)}
                mt="1"
              />
              <Flex direction="column" gap="1">
                <Text
                  size="2"
                  style={{
                    textDecoration: isChecked ? 'line-through' : 'none',
                    opacity: isChecked ? 0.5 : 1,
                  }}
                >
                  {item.text}
                </Text>
                {item.recipeTitles.length > 1 && (
                  <Text size="1" color="gray">
                    Used in: {item.recipeTitles.join(', ')}
                  </Text>
                )}
              </Flex>
            </Flex>
          )
        })}
      </Flex>
    </Box>
  )
}
