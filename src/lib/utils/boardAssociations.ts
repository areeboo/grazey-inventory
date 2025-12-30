import type { Recipe } from '@/types/recipe';

/**
 * Get all boards/recipes that use a specific ingredient
 */
export function getBoardsForIngredient(ingredientId: string, recipes: Recipe[]): Recipe[] {
  return recipes.filter((recipe) =>
    recipe.ingredients.some((ing) => ing.ingredientId === ingredientId)
  );
}

/**
 * Get board names for display (comma-separated)
 */
export function getBoardNamesForIngredient(ingredientId: string, recipes: Recipe[]): string {
  const boards = getBoardsForIngredient(ingredientId, recipes);
  if (boards.length === 0) return 'None';
  return boards.map((b) => b.name).join(', ');
}

/**
 * Get count of boards using this ingredient
 */
export function getBoardCountForIngredient(ingredientId: string, recipes: Recipe[]): number {
  return getBoardsForIngredient(ingredientId, recipes).length;
}
