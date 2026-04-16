import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heading, Text, Button, Flex, Box, Grid, Separator, Select } from '@radix-ui/themes';
import { ReloadIcon, PlusIcon } from '@radix-ui/react-icons';
import { MenuSlot } from '@/components/menu-slot';
import { SkeletonCard } from '@/components/skeleton-card';
import { RecipePickerDialog } from '@/components/recipe-picker-dialog';
import { GroceryList } from '@/components/grocery-list';
import { useWeeklyMenu } from '@/hooks/useWeeklyMenu';
import { getWeekStartTimestamp } from '@/lib/algorithms/weekly-selection';
import { useRecipes } from '@/hooks/useRecipes';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import type { Recipe } from '@/types/recipe';
import { t } from '@/lib/i18n';

function getWeekDateRange(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date) =>
    d.toLocaleDateString('nl-NL', { month: 'short', day: 'numeric' });

  return `${fmt(monday)} – ${fmt(sunday)}, ${sunday.getFullYear()}`;
}

function gridColumns(menuSize: number): Record<string, string> {
  if (menuSize <= 2) return { initial: '1', sm: '2' };
  if (menuSize <= 4) return { initial: '1', sm: '2' };
  return { initial: '1', sm: '2', md: '3' };
}

export function WeeklyViewPage() {
  const {
    menu,
    isLoading: menuLoading,
    generateMenu,
    setMenuSlot,
    clearMenuSlot,
    fillRemainingSlots,
    menuSize,
  } = useWeeklyMenu();
  const { recipeCount, isLoading: recipesLoading } = useRecipes();
  const { updatePreferences } = useUserPreferences();

  const [swappingSlot, setSwappingSlot] = useState<number | null>(null);

  const isLoading = menuLoading || recipesLoading;

  if (isLoading) {
    return (
      <Box p="4">
        <Heading size="6" mb="4">{t.thisWeeksMenu}</Heading>
        <Grid columns={{ initial: '1', sm: '2' }} gap="4">
          {Array.from({ length: menuSize }, (_, i) => <SkeletonCard key={i} compact />)}
        </Grid>
      </Box>
    );
  }

  const hasEnoughRecipes = recipeCount >= menuSize;
  const filledRecipes = menu?.filter((r): r is Recipe => r !== undefined) ?? [];
  const hasEmptySlots = menu ? menu.some((r) => !r) : false;
  const excludeIds = filledRecipes.map((r) => r.id);

  const handleSwap = (slotIndex: number) => {
    setSwappingSlot(slotIndex);
  };

  const handlePickRecipe = async (recipe: Recipe) => {
    if (swappingSlot === null) return;
    await setMenuSlot(swappingSlot, recipe.id);
    setSwappingSlot(null);
  };

  return (
    <Box p="4">
      <Flex justify="between" align="center" mb="4" wrap="wrap" gap="3">
        <Flex direction="column" gap="1">
          <Heading size="6">{t.thisWeeksMenu}</Heading>
          <Text size="2" color="gray">{getWeekDateRange()}</Text>
        </Flex>
        <Flex gap="3" align="center">
          <Flex align="center" gap="2">
            <Text size="2" color="gray">{t.recipesLabel}</Text>
            <Select.Root
              value={String(menuSize)}
              onValueChange={(val) => updatePreferences({ menuSize: Number(val) })}
            >
              <Select.Trigger variant="soft" />
              <Select.Content>
                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <Select.Item key={n} value={String(n)}>
                    {n}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Flex>
          {hasEnoughRecipes && (
            <Button onClick={generateMenu}>
              <ReloadIcon /> {t.generate}
            </Button>
          )}
        </Flex>
      </Flex>

      {!hasEnoughRecipes && !menu ? (
        <Flex direction="column" align="center" gap="4" py="8">
          <Text size="3" color="gray">
            {t.needMoreRecipes(menuSize)}
          </Text>
          <Button asChild>
            <Link to="/add">{t.addRecipes}</Link>
          </Button>
        </Flex>
      ) : !menu || filledRecipes.length === 0 ? (
        <Flex direction="column" align="center" gap="4" py="8">
          <Text size="3" color="gray">
            {t.generateFirstMenu}
          </Text>
          <Button onClick={generateMenu}>
            <ReloadIcon /> {t.generateMenu}
          </Button>
        </Flex>
      ) : (
        <>
          <Grid columns={gridColumns(menuSize)} gap="4" mb="4">
            {menu.map((recipe, index) => (
              <MenuSlot
                key={index}
                recipe={recipe}
                slotIndex={index}
                onSwap={handleSwap}
                onRemove={clearMenuSlot}
              />
            ))}
          </Grid>

          {hasEmptySlots && hasEnoughRecipes && (
            <Flex justify="center" mb="4">
              <Button variant="soft" onClick={fillRemainingSlots}>
                <PlusIcon /> {t.fillEmptySlots}
              </Button>
            </Flex>
          )}

          <Separator size="4" mb="4" />

          <GroceryList recipes={filledRecipes} weekStart={getWeekStartTimestamp()} />
        </>
      )}

      <RecipePickerDialog
        open={swappingSlot !== null}
        onClose={() => setSwappingSlot(null)}
        onSelect={handlePickRecipe}
        excludeIds={excludeIds}
        title={swappingSlot !== null && menu?.[swappingSlot] ? t.swapRecipe : t.pickARecipe}
      />
    </Box>
  );
}
