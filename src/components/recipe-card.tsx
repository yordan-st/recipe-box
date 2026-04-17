import {
  Card,
  Flex,
  Text,
  Heading,
  Badge,
  Box,
  Button,
  IconButton,
  DropdownMenu,
} from "@radix-ui/themes";
import {
  ExternalLinkIcon,
  CalendarIcon,
  DotsHorizontalIcon,
} from "@radix-ui/react-icons";
import { TAG_CATEGORY_COLORS } from "@/lib/tag-colors";
import type { Recipe } from "@/types/recipe";
import { t } from "@/lib/i18n";

interface RecipeCardProps {
  recipe: Recipe;
  onDelete?: (id: string) => void;
  onEdit?: (recipe: Recipe) => void;
  onSwapToMenu?: (recipe: Recipe) => void;
  compact?: boolean;
}

function RecipeInitials({ title }: { title: string }) {
  const initials = title
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  return (
    <Flex
      align="center"
      justify="center"
      style={{
        width: "100%",
        aspectRatio: "16 / 9",
        backgroundColor: "var(--accent-3)",
        borderRadius: "var(--radius-2) var(--radius-2) 0 0",
      }}
    >
      <Text size="6" weight="bold" style={{ color: "var(--accent-9)" }}>
        {initials}
      </Text>
    </Flex>
  );
}

export function RecipeCard({
  recipe,
  onDelete,
  onEdit,
  onSwapToMenu,
  compact = false,
}: RecipeCardProps) {
  if (compact) {
    return (
      <Card size="1">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            style={{
              width: "100%",
              aspectRatio: "16 / 9",
              objectFit: "cover",
              borderRadius: "var(--radius-2) var(--radius-2) 0 0",
              display: "block",
            }}
          />
        ) : (
          <RecipeInitials title={recipe.title} />
        )}
        <Box p="2">
          <Flex align="center" justify="between" gap="2">
            <Heading size="2" truncate>
              {recipe.title}
            </Heading>
            <IconButton
              size="1"
              variant="ghost"
              asChild
              aria-label={t.openRecipe}
            >
              <a href={recipe.url} target="_blank" rel="noopener noreferrer">
                <ExternalLinkIcon />
              </a>
            </IconButton>
          </Flex>
          {(recipe.dishType || recipe.diet || recipe.cuisine) && (
            <Flex gap="1" wrap="wrap" mt="1">
              {recipe.dishType && (
                <Badge variant="soft" size="1" color={TAG_CATEGORY_COLORS.dishType}>{recipe.dishType}</Badge>
              )}
              {recipe.diet && (
                <Badge variant="soft" size="1" color={TAG_CATEGORY_COLORS.diet}>{recipe.diet}</Badge>
              )}
              {recipe.cuisine && (
                <Badge variant="soft" size="1" color={TAG_CATEGORY_COLORS.cuisine}>{recipe.cuisine}</Badge>
              )}
            </Flex>
          )}
        </Box>
      </Card>
    );
  }

  return (
    <Card size="2">
      {recipe.imageUrl ? (
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          style={{
            width: "100%",
            aspectRatio: "16 / 9",
            objectFit: "cover",
            borderRadius: "var(--radius-2) var(--radius-2) 0 0",
            display: "block",
          }}
        />
      ) : (
        <RecipeInitials title={recipe.title} />
      )}
      <Box p="3">
        <Flex direction="column" gap="2">
          <Heading size="3" style={{ lineHeight: 1.3 }}>
            {recipe.title}
          </Heading>

          {(recipe.dishType || recipe.diet || recipe.cuisine) && (
            <Flex gap="1" wrap="wrap">
              {recipe.dishType && (
                <Badge variant="soft" size="1" color={TAG_CATEGORY_COLORS.dishType}>{recipe.dishType}</Badge>
              )}
              {recipe.diet && (
                <Badge variant="soft" size="1" color={TAG_CATEGORY_COLORS.diet}>{recipe.diet}</Badge>
              )}
              {recipe.cuisine && (
                <Badge variant="soft" size="1" color={TAG_CATEGORY_COLORS.cuisine}>{recipe.cuisine}</Badge>
              )}
            </Flex>
          )}

          <Text size="2" color="gray">
            {t.ingredientsCount(recipe.ingredients.length)}
          </Text>

          <Flex gap="2" align="center">
            <Button variant="soft" size="2" asChild>
              <a href={recipe.url} target="_blank" rel="noopener noreferrer">
                <ExternalLinkIcon />
                {t.openRecipe}
              </a>
            </Button>

            <Flex gap="2" ml="auto" align="center">
              {onSwapToMenu && (
                <IconButton
                  size="2"
                  variant="soft"
                  color="green"
                  onClick={() => onSwapToMenu(recipe)}
                  aria-label={t.addToMenu}
                >
                  <CalendarIcon />
                </IconButton>
              )}
              {(onEdit || onDelete) && (
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <IconButton size="2" variant="ghost" color="gray">
                      <DotsHorizontalIcon />
                    </IconButton>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content size="1">
                    {onEdit && (
                      <DropdownMenu.Item onClick={() => onEdit(recipe)}>
                        {t.editRecipe}
                      </DropdownMenu.Item>
                    )}
                    {onDelete && (
                      <DropdownMenu.Item
                        color="red"
                        onClick={() => onDelete(recipe.id)}
                      >
                        {t.deleteRecipe}
                      </DropdownMenu.Item>
                    )}
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              )}
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </Card>
  );
}
