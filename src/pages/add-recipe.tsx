import { useNavigate } from 'react-router-dom';
import { Box, Heading } from '@radix-ui/themes';
import { toast } from 'sonner';
import { RecipeForm } from '@/components/recipe-form';
import { addRecipe } from '@/lib/db/operations';
import type { RecipeFormData } from '@/types/recipe';
import { t } from '@/lib/i18n';

export function AddRecipePage() {
  const navigate = useNavigate();

  const handleSubmit = async (data: RecipeFormData) => {
    try {
      await addRecipe(data);
      toast.success(t.recipeAdded);
      navigate('/');
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error(t.failedToAddRecipe);
      }
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <Box p="4">
      <Heading size="6" mb="4">{t.addRecipe}</Heading>
      <RecipeForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </Box>
  );
}
