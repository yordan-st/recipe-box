import { Dialog, Flex, Text, Button, Box } from '@radix-ui/themes'
import type { Recipe } from '@/types/recipe'
import { t } from '@/lib/i18n'

interface SlotPickerDialogProps {
  open: boolean
  onClose: () => void
  onSelectSlot: (slotIndex: number) => void
  menuRecipes: (Recipe | undefined)[]
  menuSize: number
}

export function SlotPickerDialog({
  open,
  onClose,
  onSelectSlot,
  menuRecipes,
  menuSize,
}: SlotPickerDialogProps) {
  const slots = Array.from({ length: menuSize }, (_, i) => ({
    index: i,
    recipe: menuRecipes[i],
  }))

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <Dialog.Content maxWidth="400px" onOpenAutoFocus={(e) => e.preventDefault()}>
        <Dialog.Title>{t.addToMenuTitle}</Dialog.Title>
        <Dialog.Description size="2" mb="3">
          {t.pickSlotDescription}
        </Dialog.Description>

        <Flex direction="column" gap="2">
          {slots.map(({ index, recipe }) => (
            <Button
              key={index}
              variant={recipe ? 'soft' : 'outline'}
              color={recipe ? 'gray' : 'orange'}
              style={{ justifyContent: 'flex-start' }}
              onClick={() => {
                onSelectSlot(index)
                onClose()
              }}
            >
              <Box style={{ width: 24, textAlign: 'center' }}>
                <Text size="2" weight="bold">{index + 1}</Text>
              </Box>
              <Text size="2" truncate>
                {recipe ? recipe.title : t.emptySlot}
              </Text>
            </Button>
          ))}
        </Flex>

        <Flex justify="end" mt="3">
          <Button variant="soft" color="gray" onClick={onClose}>
            {t.cancel}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
