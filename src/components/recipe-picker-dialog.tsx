import { useState } from 'react'
import { Dialog, Box, Flex, Text, TextField, Button, ScrollArea } from '@radix-ui/themes'
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db/schema'
import type { Recipe } from '@/types/recipe'
import { t } from '@/lib/i18n'

interface RecipePickerDialogProps {
  open: boolean
  onClose: () => void
  onSelect: (recipe: Recipe) => void
  excludeIds?: string[]
  title?: string
}

export function RecipePickerDialog({
  open,
  onClose,
  onSelect,
  excludeIds = [],
  title = t.pickARecipe,
}: RecipePickerDialogProps) {
  const [search, setSearch] = useState('')

  const recipes = useLiveQuery(async () => {
    const all = await db.recipes.orderBy('dateAdded').reverse().toArray()
    return all.filter((r) => !r.deletedAt)
  })

  const filtered = (recipes ?? []).filter((r) => {
    if (excludeIds.includes(r.id)) return false
    if (!search.trim()) return true
    const q = search.trim().toLowerCase()
    return (
      r.title.toLowerCase().includes(q) ||
      r.tags?.some((tag) => tag.toLowerCase().includes(q))
    )
  })

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <Dialog.Content maxWidth="500px" onOpenAutoFocus={(e) => e.preventDefault()}>
        <Dialog.Title>{title}</Dialog.Title>

        <Box mb="3">
          <TextField.Root
            placeholder={t.searchByTitleOrTag}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="2"
          >
            <TextField.Slot>
              <MagnifyingGlassIcon height="16" width="16" />
            </TextField.Slot>
          </TextField.Root>
        </Box>

        <ScrollArea style={{ maxHeight: 400 }}>
          <Flex direction="column" gap="2">
            {filtered.length === 0 ? (
              <Text size="2" color="gray" align="center" style={{ padding: '16px 0' }}>
                {t.noRecipesAvailable}
              </Text>
            ) : (
              filtered.map((recipe) => (
                <Flex
                  key={recipe.id}
                  align="center"
                  gap="3"
                  p="2"
                  style={{
                    borderRadius: 'var(--radius-2)',
                    cursor: 'pointer',
                  }}
                  className="rt-Card"
                  onClick={() => {
                    onSelect(recipe)
                    onClose()
                  }}
                >
                  {recipe.imageUrl ? (
                    <img
                      src={recipe.imageUrl}
                      alt=""
                      style={{
                        width: 48,
                        height: 48,
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-2)',
                      }}
                    />
                  ) : (
                    <Box
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 'var(--radius-2)',
                        backgroundColor: 'var(--accent-3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text size="1" weight="bold" style={{ color: 'var(--accent-9)' }}>
                        {recipe.title.charAt(0).toUpperCase()}
                      </Text>
                    </Box>
                  )}
                  <Flex direction="column" style={{ flex: 1, minWidth: 0 }}>
                    <Text size="2" weight="medium" truncate>
                      {recipe.title}
                    </Text>
                    <Text size="1" color="gray">
                      {t.ingredientsCount(recipe.ingredients.length)}
                      {recipe.tags?.length ? ` · ${recipe.tags.join(', ')}` : ''}
                    </Text>
                  </Flex>
                </Flex>
              ))
            )}
          </Flex>
        </ScrollArea>

        <Flex justify="end" mt="3">
          <Button variant="soft" color="gray" onClick={onClose}>
            {t.cancel}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
