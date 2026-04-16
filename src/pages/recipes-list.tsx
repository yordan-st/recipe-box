import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertDialog,
  Box,
  Button,
  Dialog,
  Flex,
  Grid,
  Heading,
  Text,
  TextField,
} from "@radix-ui/themes";
import { MagnifyingGlassIcon, PlusIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";
import { useRecipes } from "@/hooks/useRecipes";
import { useWeeklyMenu } from "@/hooks/useWeeklyMenu";
import { RecipeCard } from "@/components/recipe-card";
import { RecipeForm } from "@/components/recipe-form";
import { SlotPickerDialog } from "@/components/slot-picker-dialog";
import { SkeletonCard } from "@/components/skeleton-card";
import type { Recipe, RecipeFormData } from "@/types/recipe";
import { t } from "@/lib/i18n";

export function RecipesListPage() {
  const { recipes, recipeCount, isLoading, deleteRecipe, updateRecipe } =
    useRecipes();
  const { menu, setMenuSlot, menuSize } = useWeeklyMenu();
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [deletingRecipe, setDeletingRecipe] = useState<Recipe | null>(null);
  const [swappingRecipe, setSwappingRecipe] = useState<Recipe | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRecipes = searchQuery.trim()
    ? recipes.filter((r) => {
        const q = searchQuery.trim().toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          r.tags?.some((tag) => tag.toLowerCase().includes(q))
        );
      })
    : recipes;

  const handleDeleteConfirm = async () => {
    if (!deletingRecipe) return;
    await deleteRecipe(deletingRecipe.id);
    toast.success(t.recipeDeleted);
    setDeletingRecipe(null);
  };

  const handleEditSubmit = async (data: RecipeFormData) => {
    if (!editingRecipe) return;
    await updateRecipe(editingRecipe.id, data);
    toast.success(t.recipeUpdated);
    setEditingRecipe(null);
  };

  if (isLoading) {
    return (
      <Box p="4">
        <Heading size="6" mb="4">{t.myRecipes}</Heading>
        <Grid gap="4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
          {Array.from({ length: 4 }, (_, i) => <SkeletonCard key={i} />)}
        </Grid>
      </Box>
    );
  }

  return (
    <Box p="4">
      <Flex justify="between" align="center" mb="4">
        <Flex align="center" gap="2">
          <Heading size="6">{t.myRecipes}</Heading>
          <Text size="2" color="gray">
            (
            {searchQuery.trim()
              ? `${filteredRecipes.length} of ${recipeCount}`
              : recipeCount}
            )
          </Text>
        </Flex>
        <Button asChild>
          <Link to="/add">
            <PlusIcon /> {t.addRecipe}
          </Link>
        </Button>
      </Flex>

      {recipes.length > 0 && (
        <Box mb="4">
          <TextField.Root
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="2"
          >
            <TextField.Slot>
              <MagnifyingGlassIcon height="16" width="16" />
            </TextField.Slot>
          </TextField.Root>
        </Box>
      )}

      {recipes.length === 0 ? (
        <Flex direction="column" align="center" gap="4" py="8">
          <Text size="3" color="gray">
            {t.noRecipesYet}
          </Text>
          <Button asChild>
            <Link to="/add">
              <PlusIcon /> {t.addRecipe}
            </Link>
          </Button>
        </Flex>
      ) : filteredRecipes.length === 0 ? (
        <Flex direction="column" align="center" gap="2" py="8">
          <Text size="3" color="gray">
            {t.noSearchResults(searchQuery)}
          </Text>
        </Flex>
      ) : (
        <Grid
          gap="4"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          }}
        >
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onDelete={() => setDeletingRecipe(recipe)}
              onEdit={() => setEditingRecipe(recipe)}
              onSwapToMenu={() => setSwappingRecipe(recipe)}
            />
          ))}
        </Grid>
      )}

      <Dialog.Root
        open={editingRecipe !== null}
        onOpenChange={(open) => {
          if (!open) setEditingRecipe(null);
        }}
      >
        <Dialog.Content maxWidth="500px">
          <Dialog.Title>{t.editRecipeTitle}</Dialog.Title>
          {editingRecipe && (
            <RecipeForm
              initialData={editingRecipe}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditingRecipe(null)}
            />
          )}
        </Dialog.Content>
      </Dialog.Root>

      <AlertDialog.Root
        open={deletingRecipe !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingRecipe(null);
        }}
      >
        <AlertDialog.Content maxWidth="450px">
          <AlertDialog.Title>{t.deleteRecipeTitle}</AlertDialog.Title>
          <AlertDialog.Description size="2">
            {t.deleteConfirm}
          </AlertDialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">
                {t.cancel}
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button variant="solid" color="red" onClick={handleDeleteConfirm}>
                {t.deleteButton}
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>

      <SlotPickerDialog
        open={swappingRecipe !== null}
        onClose={() => setSwappingRecipe(null)}
        onSelectSlot={async (slotIndex) => {
          if (!swappingRecipe) return;
          await setMenuSlot(slotIndex, swappingRecipe.id);
          toast.success(t.addedToMenu(swappingRecipe.title, slotIndex + 1));
          setSwappingRecipe(null);
        }}
        menuRecipes={menu ?? []}
        menuSize={menuSize}
      />
    </Box>
  );
}
