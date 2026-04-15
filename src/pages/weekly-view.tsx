import { Link } from 'react-router-dom';
import { Heading, Text, Button, Flex, Box, Grid, Separator, Select } from '@radix-ui/themes';
import { ReloadIcon } from '@radix-ui/react-icons';
import { RecipeCard } from '@/components/recipe-card';
import { GroceryList } from '@/components/grocery-list';
import { useWeeklyMenu } from '@/hooks/useWeeklyMenu';
import { useRecipes } from '@/hooks/useRecipes';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import type { Recipe } from '@/types/recipe';

function getWeekDateRange(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return `${fmt(monday)} – ${fmt(sunday)}, ${sunday.getFullYear()}`;
}

function gridColumns(menuSize: number): Record<string, string> {
  if (menuSize <= 2) return { initial: '1', sm: '2' };
  if (menuSize <= 4) return { initial: '1', sm: '2' };
  return { initial: '1', sm: '2', md: '3' };
}

export function WeeklyViewPage() {
  const { menu, isLoading: menuLoading, generateMenu, menuSize } = useWeeklyMenu();
  const { recipeCount, isLoading: recipesLoading } = useRecipes();
  const { updatePreferences } = useUserPreferences();

  const isLoading = menuLoading || recipesLoading;

  if (isLoading) {
    return (
      <Box p="4">
        <Text>Loading...</Text>
      </Box>
    );
  }

  const hasEnoughRecipes = recipeCount >= menuSize;

  return (
    <Box p="4">
      <Flex justify="between" align="center" mb="4" wrap="wrap" gap="3">
        <Flex direction="column" gap="1">
          <Heading size="6">This Week's Menu</Heading>
          <Text size="2" color="gray">{getWeekDateRange()}</Text>
        </Flex>
        <Flex gap="3" align="center">
          <Flex align="center" gap="2">
            <Text size="2" color="gray">Recipes:</Text>
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
              <ReloadIcon /> Generate
            </Button>
          )}
        </Flex>
      </Flex>

      {!hasEnoughRecipes ? (
        <Flex direction="column" align="center" gap="4" py="8">
          <Text size="3" color="gray">
            Add at least {menuSize} recipe{menuSize !== 1 ? 's' : ''} to generate a weekly menu
          </Text>
          <Button asChild>
            <Link to="/add">Add Recipes</Link>
          </Button>
        </Flex>
      ) : !menu ? (
        <Flex direction="column" align="center" gap="4" py="8">
          <Text size="3" color="gray">
            Generate your first weekly menu!
          </Text>
          <Button onClick={generateMenu}>
            <ReloadIcon /> Generate Menu
          </Button>
        </Flex>
      ) : (
        <>
          <Grid columns={gridColumns(menuSize)} gap="4" mb="6">
            {menu.map((recipe: Recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} compact />
            ))}
          </Grid>

          <Separator size="4" mb="4" />

          <GroceryList recipes={menu} />
        </>
      )}
    </Box>
  );
}
