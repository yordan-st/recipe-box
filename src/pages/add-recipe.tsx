import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Heading, Callout } from '@radix-ui/themes';
import { RecipeForm } from '@/components/recipe-form';
import { addRecipe } from '@/lib/db/operations';
import type { Recipe } from '@/types/recipe';

export function AddRecipePage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: Omit<Recipe, 'id' | 'dateAdded' | 'timesShown'>) => {
    try {
      setError(null);
      await addRecipe(data);
      navigate('/');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to add recipe');
      }
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <Box p="4">
      <Heading size="6" mb="4">Add a New Recipe</Heading>
      {error && (
        <Callout.Root color="red" mb="4">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}
      <RecipeForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </Box>
  );
}
