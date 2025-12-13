import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Recipe from '@/lib/db/models/Recipe';
import Ingredient from '@/lib/db/models/Ingredient';
import { calculateProductionAnalysis } from '@/lib/utils/calculations';

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

    return NextResponse.json(
      {
        ...analysis,
        timestamp: new Date().toISOString(),
        totalRecipes: recipes.length,
        canMakeCount: analysis.canMake.length,
        cannotMakeCount: analysis.cannotMake.length,
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
