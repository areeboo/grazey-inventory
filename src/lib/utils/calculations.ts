import { IRecipe } from '@/types/recipe';
import { IIngredient } from '@/types/ingredient';

export interface ProductionAnalysisResult {
  canMake: CanMakeBoard[];
  cannotMake: CannotMakeBoard[];
}

export interface CanMakeBoard {
  recipe: IRecipe;
  maxQuantity: number;
  limitingIngredient: {
    name: string;
    available: number;
    neededPerBoard: number;
  };
}

export interface CannotMakeBoard {
  recipe: IRecipe;
  missingIngredients: MissingIngredient[];
}

export interface MissingIngredient {
  name: string;
  available: number;
  needed: number;
  shortfall: number;
}

/**
 * Calculate what boards can and cannot be made with current inventory
 * Note: currentQuantity already reflects debited amounts from in-progress orders
 */
export function calculateProductionAnalysis(
  recipes: IRecipe[],
  ingredients: IIngredient[]
): ProductionAnalysisResult {
  // Create ingredient lookup map
  const ingredientMap = new Map<string, number>();
  ingredients.forEach((ing) => {
    ingredientMap.set(ing._id.toString(), ing.currentQuantity);
  });

  const canMake: CanMakeBoard[] = [];
  const cannotMake: CannotMakeBoard[] = [];

  for (const recipe of recipes) {
    const analysis = analyzeRecipe(recipe, ingredientMap);

    if (analysis.canMake) {
      canMake.push({
        recipe,
        maxQuantity: analysis.maxQuantity,
        limitingIngredient: analysis.limitingIngredient!,
      });
    } else {
      cannotMake.push({
        recipe,
        missingIngredients: analysis.missingIngredients,
      });
    }
  }

  return { canMake, cannotMake };
}

/**
 * Analyze a single recipe to see if it can be made
 */
function analyzeRecipe(
  recipe: IRecipe,
  ingredientMap: Map<string, number>
): {
  canMake: boolean;
  maxQuantity: number;
  limitingIngredient: { name: string; available: number; neededPerBoard: number } | null;
  missingIngredients: MissingIngredient[];
} {
  let maxQuantity = Infinity;
  let limitingIngredient: { name: string; available: number; neededPerBoard: number } | null =
    null;
  const missingIngredients: MissingIngredient[] = [];

  for (const recipeIng of recipe.ingredients) {
    const available = ingredientMap.get(recipeIng.ingredientId.toString()) || 0;
    const neededPerBoard = recipeIng.quantity;

    // Calculate how many boards can be made with this ingredient
    const possibleBoards = Math.floor(available / neededPerBoard);

    if (possibleBoards === 0) {
      // Cannot make any - this ingredient is missing
      missingIngredients.push({
        name: recipeIng.ingredientName,
        available,
        needed: neededPerBoard,
        shortfall: neededPerBoard - available,
      });
    }

    if (possibleBoards < maxQuantity) {
      maxQuantity = possibleBoards;
      limitingIngredient = {
        name: recipeIng.ingredientName,
        available,
        neededPerBoard,
      };
    }
  }

  return {
    canMake: maxQuantity > 0,
    maxQuantity: maxQuantity === Infinity ? 0 : maxQuantity,
    limitingIngredient,
    missingIngredients,
  };
}

/**
 * Calculate available inventory after debiting in-progress orders
 */
export function calculateAvailableInventory(
  ingredients: IIngredient[],
  activeOrders: any[] = []
): Map<string, number> {
  const availableMap = new Map<string, number>();

  // Start with current inventory
  ingredients.forEach((ing) => {
    availableMap.set(ing._id.toString(), ing.currentQuantity);
  });

  // Subtract debited amounts from in-progress orders
  // Note: When orders are created, ingredients are already debited from currentQuantity
  // However, we still track debitedIngredients for audit purposes and to enable order cancellation
  // Since currentQuantity already reflects the debit, we don't need to subtract again here
  // This function exists to support future scenarios where we might need to calculate
  // available inventory differently (e.g., for reserved but not yet debited orders)

  return availableMap;
}
