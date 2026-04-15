import { Link } from 'react-router-dom';
import { Heading, Text, Button, Flex, Box, Grid, Separator } from '@radix-ui/themes';
import { ReloadIcon } from '@radix-ui/react-icons';
import { RecipeCard } from '@/components/recipe-card';
import { GroceryList } from '@/components/grocery-list';
import { useWeeklyMenu } from '@/hooks/useWeeklyMenu';
import { useRecipes } from '@/hooks/useRecipes';
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

export function WeeklyViewPage() {
  const { menu, isLoading: menuLoading, generateMenu } = useWeeklyMenu();
  const { recipeCount, isLoading: recipesLoading } = useRecipes();

  const isLoading = menuLoading || recipesLoading;

  if (isLoading) {
    return (
      <Box p="4">
        <Text>Loading...</Text>
      </Box>
    );
  }

  const hasEnoughRecipes = recipeCount >= 4;

  return (
    <Box p="4">
      <Flex justify="between" align="center" mb="4">
        <Flex direction="column" gap="1">
          <Heading size="6">This Week's Menu</Heading>
          <Text size="2" color="gray">{getWeekDateRange()}</Text>
        </Flex>
        {hasEnoughRecipes && (
          <Button onClick={generateMenu}>
            <ReloadIcon /> Generate New Menu
          </Button>
        )}
      </Flex>

      {!hasEnoughRecipes ? (
        <Flex direction="column" align="center" gap="4" py="8">
          <Text size="3" color="gray">
            Add at least 4 recipes to generate a weekly menu
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
          <Grid
            columns={{ initial: '1', sm: '2' }}
            gap="4"
            mb="6"
          >
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
