import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Dialog, Flex, Grid, Heading, Text } from '@radix-ui/themes';
import { PlusIcon } from '@radix-ui/react-icons';
import { useRecipes } from '@/hooks/useRecipes';
import { RecipeCard } from '@/components/recipe-card';
import { RecipeForm } from '@/components/recipe-form';
import type { Recipe } from '@/types/recipe';

export function RecipesListPage() {
  const { recipes, recipeCount, isLoading, deleteRecipe, updateRecipe } = useRecipes();
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  const handleDelete = async (id: string) => {
    await deleteRecipe(id);
  };

  const handleEditSubmit = async (data: Omit<Recipe, 'id' | 'dateAdded' | 'timesShown'>) => {
    if (!editingRecipe) return;
    await updateRecipe(editingRecipe.id, data);
    setEditingRecipe(null);
  };

  if (isLoading) {
    return (
      <Box p="4">
        <Text>Loading...</Text>
      </Box>
    );
  }

  return (
    <Box p="4">
      <Flex justify="between" align="center" mb="4">
        <Flex align="center" gap="2">
          <Heading size="6">My Recipes</Heading>
          <Text size="2" color="gray">({recipeCount})</Text>
        </Flex>
        <Button asChild>
          <Link to="/add">
            <PlusIcon /> Add Recipe
          </Link>
        </Button>
      </Flex>

      {recipes.length === 0 ? (
        <Flex direction="column" align="center" gap="4" py="8">
          <Text size="3" color="gray">No recipes yet. Add your first recipe!</Text>
          <Button asChild>
            <Link to="/add">
              <PlusIcon /> Add Recipe
            </Link>
          </Button>
        </Flex>
      ) : (
        <Grid
          gap="4"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}
        >
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onDelete={() => handleDelete(recipe.id)}
              onEdit={() => setEditingRecipe(recipe)}
            />
          ))}
        </Grid>
      )}

      <Dialog.Root open={editingRecipe !== null} onOpenChange={(open) => { if (!open) setEditingRecipe(null); }}>
        <Dialog.Content maxWidth="500px">
          <Dialog.Title>Edit Recipe</Dialog.Title>
          {editingRecipe && (
            <RecipeForm
              initialData={editingRecipe}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditingRecipe(null)}
            />
          )}
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
}
