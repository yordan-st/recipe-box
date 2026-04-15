import { useState } from 'react'
import { Box, Flex, Text, Heading, Checkbox } from '@radix-ui/themes'
import type { Recipe } from '@/types/recipe'
import {
  classifyIngredient,
  DEPARTMENT_ORDER,
  type Department,
} from '@/lib/algorithms/department-classifier'

interface GroceryListProps {
  recipes: Recipe[]
}

interface GroceryItem {
  text: string
  recipeTitles: string[]
  department: Department
}

function aggregateIngredients(recipes: Recipe[]): GroceryItem[] {
  const map = new Map<string, { recipeTitles: string[]; original: string }>()

  for (const recipe of recipes) {
    for (const ingredient of recipe.ingredients) {
      const key = ingredient.toLowerCase().trim()
      if (!key) continue
      const existing = map.get(key)
      if (existing) {
        if (!existing.recipeTitles.includes(recipe.title)) {
          existing.recipeTitles.push(recipe.title)
        }
      } else {
        map.set(key, { recipeTitles: [recipe.title], original: ingredient.trim() })
      }
    }
  }

  return Array.from(map.entries()).map(([, { recipeTitles, original }]) => ({
    text: original,
    recipeTitles,
    department: classifyIngredient(original),
  }))
}

function groupByDepartment(items: GroceryItem[]): Map<Department, GroceryItem[]> {
  const groups = new Map<Department, GroceryItem[]>()
  for (const item of items) {
    const existing = groups.get(item.department)
    if (existing) {
      existing.push(item)
    } else {
      groups.set(item.department, [item])
    }
  }
  return groups
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
  const grouped = groupByDepartment(items)

  return (
    <Box>
      <Flex justify="between" align="center" mb="3">
        <Heading size="4">Grocery List</Heading>
        <Text size="2" color="gray">
          {remaining} of {items.length} remaining
        </Text>
      </Flex>

      <Flex direction="column" gap="4">
        {DEPARTMENT_ORDER.filter((dept) => grouped.has(dept)).map((dept) => {
          const deptItems = grouped.get(dept)!
          const allChecked = deptItems.every((item) => checked.has(item.text.toLowerCase()))

          return (
            <Box key={dept}>
              <Heading
                size="3"
                mb="2"
                style={{ opacity: allChecked ? 0.4 : 1 }}
              >
                {dept}
              </Heading>
              <Flex direction="column" gap="1">
                {deptItems.map((item) => {
                  const key = item.text.toLowerCase()
                  const isChecked = checked.has(key)
                  return (
                    <Flex
                      key={key}
                      align="start"
                      gap="2"
                      p="2"
                      style={{
                        borderRadius: 'var(--radius-2)',
                        backgroundColor: isChecked ? 'var(--gray-2)' : 'transparent',
                        cursor: 'pointer',
                      }}
                      onClick={() => toggle(key)}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggle(key)}
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
                          <Box>
                            <Text size="1" color="gray">Used in:</Text>
                            <ul style={{ margin: '2px 0 0 16px', padding: 0 }}>
                              {item.recipeTitles.map((title) => (
                                <li key={title}>
                                  <Text size="1" color="gray">{title}</Text>
                                </li>
                              ))}
                            </ul>
                          </Box>
                        )}
                      </Flex>
                    </Flex>
                  )
                })}
              </Flex>
            </Box>
          )
        })}
      </Flex>
    </Box>
  )
}
