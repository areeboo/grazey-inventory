import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Ingredient from '@/lib/db/models/Ingredient';
import Recipe from '@/lib/db/models/Recipe';
import Order from '@/lib/db/models/Order';
import type { ShoppingListItem, ShoppingListResponse } from '@/types/shopping-list';

// POST /api/shopping-list/generate - Generate shopping list
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { includeLowStock = true, productionGoals = [] } = body;

    // Get all ingredients
    const ingredients = await Ingredient.find({}).lean();
    const ingredientMap = new Map(
      ingredients.map((ing) => [ing._id.toString(), ing])
    );

    // Get in-progress orders to calculate reserved inventory
    const inProgressOrders = await Order.find({ status: 'in-progress' }).lean();
    const reservedQuantities = new Map<string, number>();

    for (const order of inProgressOrders) {
      for (const debited of order.debitedIngredients || []) {
        const currentReserved = reservedQuantities.get(debited.ingredientId.toString()) || 0;
        reservedQuantities.set(debited.ingredientId.toString(), currentReserved + debited.quantityDebited);
      }
    }

    // Calculate available inventory (current - reserved)
    const availableInventory = new Map<string, number>();
    for (const ing of ingredients) {
      const reserved = reservedQuantities.get(ing._id.toString()) || 0;
      availableInventory.set(ing._id.toString(), Math.max(0, ing.currentQuantity - reserved));
    }

    // Shopping list accumulator
    const shoppingItems = new Map<string, ShoppingListItem>();

    // 1. Add low stock items if requested
    if (includeLowStock) {
      for (const ing of ingredients) {
        const available = availableInventory.get(ing._id.toString()) || 0;

        if (available < ing.lowStockThreshold) {
          const shortfall = ing.lowStockThreshold - available;
          shoppingItems.set(ing._id.toString(), {
            ingredientId: ing._id.toString(),
            ingredientName: ing.name,
            currentQuantity: ing.currentQuantity,
            neededQuantity: ing.lowStockThreshold,
            shoppingQuantity: shortfall,
            unit: ing.unit,
            reason: 'low_stock',
            details: `Below threshold (${ing.lowStockThreshold} ${ing.unit})`,
          });
        }
      }
    }

    // 2. Calculate needs for production goals
    if (productionGoals.length > 0) {
      // Get recipes for production goals
      const recipeIds = productionGoals.map((g: { recipeId: string }) => g.recipeId);
      const recipes = await Recipe.find({ _id: { $in: recipeIds } }).lean();
      const recipeMap = new Map(recipes.map((r) => [r._id.toString(), r]));

      // Calculate total ingredients needed for all production goals
      const productionNeeds = new Map<string, { needed: number; recipes: string[] }>();

      for (const goal of productionGoals) {
        const recipe = recipeMap.get(goal.recipeId);
        if (!recipe) continue;

        for (const recipeIng of recipe.ingredients) {
          const ingId = recipeIng.ingredientId.toString();
          const needed = recipeIng.quantity * goal.quantity;

          const current = productionNeeds.get(ingId) || { needed: 0, recipes: [] };
          current.needed += needed;
          if (!current.recipes.includes(recipe.name)) {
            current.recipes.push(recipe.name);
          }
          productionNeeds.set(ingId, current);
        }
      }

      // Add shortfalls to shopping list
      for (const [ingId, needs] of Array.from(productionNeeds.entries())) {
        const ingredient = ingredientMap.get(ingId);
        if (!ingredient) continue;

        const available = availableInventory.get(ingId) || 0;
        const shortfall = Math.max(0, needs.needed - available);

        if (shortfall > 0) {
          const existing = shoppingItems.get(ingId);

          if (existing) {
            // Merge with existing low stock entry
            existing.neededQuantity = Math.max(existing.neededQuantity, needs.needed);
            existing.shoppingQuantity = Math.max(existing.shoppingQuantity, shortfall);
            existing.reason = 'both';
            existing.details = `Low stock + needed for: ${needs.recipes.join(', ')}`;
          } else {
            shoppingItems.set(ingId, {
              ingredientId: ingId,
              ingredientName: ingredient.name,
              currentQuantity: ingredient.currentQuantity,
              neededQuantity: needs.needed,
              shoppingQuantity: shortfall,
              unit: ingredient.unit,
              reason: 'production_goal',
              details: `Needed for: ${needs.recipes.join(', ')}`,
            });
          }
        }
      }
    }

    // Convert to array and sort - board-related items first, then alphabetically
    const items = Array.from(shoppingItems.values()).sort((a, b) => {
      // Priority 1: Board-related items (production_goal or both) come first
      const aPriority = a.reason === 'production_goal' || a.reason === 'both' ? 0 : 1;
      const bPriority = b.reason === 'production_goal' || b.reason === 'both' ? 0 : 1;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      // Priority 2: Alphabetical by ingredient name
      return a.ingredientName.localeCompare(b.ingredientName);
    });

    // Calculate summary
    const summary = {
      totalItems: items.length,
      lowStockItems: items.filter((i) => i.reason === 'low_stock' || i.reason === 'both').length,
      productionItems: items.filter((i) => i.reason === 'production_goal' || i.reason === 'both').length,
    };

    const response: ShoppingListResponse = {
      items,
      summary,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ data: response }, { status: 200 });
  } catch (error: any) {
    console.error('Error generating shopping list:', error);
    return NextResponse.json(
      { error: 'Failed to generate shopping list', message: error.message },
      { status: 500 }
    );
  }
}
