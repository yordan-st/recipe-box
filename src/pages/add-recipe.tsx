import { useNavigate } from 'react-router-dom';
import { Box, Heading } from '@radix-ui/themes';
import { RecipeForm } from '@/components/recipe-form';
import { addRecipe } from '@/lib/db/operations';
import type { Recipe } from '@/types/recipe';

export function AddRecipePage() {
  const navigate = useNavigate();

  const handleSubmit = async (data: Omit<Recipe, 'id' | 'dateAdded' | 'timesShown'>) => {
    await addRecipe(data);
    navigate('/');
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <Box p="4">
      <Heading size="6" mb="4">Add a New Recipe</Heading>
      <RecipeForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </Box>
  );
}
