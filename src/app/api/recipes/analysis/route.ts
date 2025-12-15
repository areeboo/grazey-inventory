import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Recipe from '@/lib/db/models/Recipe';
import Ingredient from '@/lib/db/models/Ingredient';
import { calculateProductionAnalysis, type ProductionAnalysisResult } from '@/lib/utils/calculations';
import type { ProductionAnalysis } from '@/types/recipe';

// GET /api/recipes/analysis - Get production analysis (what can/cannot be made)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Fetch all active recipes
    const recipes = await Recipe.find({ isActive: true }).sort({
      category: 1,
      displayOrder: 1,
    });

    // Fetch all ingredients
    const ingredients = await Ingredient.find({});

    // Calculate production analysis
    const analysis = calculateProductionAnalysis(recipes, ingredients);
    const serializedAnalysis = serializeProductionAnalysis(analysis);

    return NextResponse.json(
      {
        ...serializedAnalysis,
        timestamp: new Date().toISOString(),
        totalRecipes: recipes.length,
        canMakeCount: serializedAnalysis.canMake.length,
        cannotMakeCount: serializedAnalysis.cannotMake.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to calculate production analysis', message: error.message },
      { status: 500 }
    );
  }
}

type SerializedProductionAnalysis = Pick<ProductionAnalysis, 'canMake' | 'cannotMake'>;

function serializeProductionAnalysis(analysis: ProductionAnalysisResult): SerializedProductionAnalysis {
  return {
    canMake: analysis.canMake.map((board) => ({
      recipeId: board.recipe._id.toString(),
      recipeName: board.recipe.name,
      category: board.recipe.category,
      maxQuantity: board.maxQuantity,
      limitingIngredient: {
        name: board.limitingIngredient?.name ?? 'Unknown ingredient',
        available: board.limitingIngredient?.available ?? 0,
        required: board.limitingIngredient?.neededPerBoard ?? 0,
      },
    })),
    cannotMake: analysis.cannotMake.map((board) => ({
      recipeId: board.recipe._id.toString(),
      recipeName: board.recipe.name,
      category: board.recipe.category,
      missingIngredients: board.missingIngredients.map((missing) => {
        const recipeIngredient = board.recipe.ingredients.find(
          (ingredient) => ingredient.ingredientName === missing.name
        );

        return {
          ingredientId: recipeIngredient?.ingredientId?.toString() ?? missing.name,
          ingredientName: missing.name,
          required: missing.needed,
          available: missing.available,
          shortfall: missing.shortfall,
          unit: recipeIngredient?.unit ?? '',
        };
      }),
    })),
  };
}
