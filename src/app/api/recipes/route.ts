import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Recipe from '@/lib/db/models/Recipe';
import { createRecipeSchema } from '@/lib/utils/validations';
import { ZodError } from 'zod';

// GET /api/recipes - Get all recipes
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');

    let query: any = {};
    if (category) query.category = category;
    if (isActive !== null) query.isActive = isActive === 'true';

    const recipes = await Recipe.find(query).sort({ category: 1, displayOrder: 1 });

    return NextResponse.json(recipes, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch recipes', message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/recipes - Create new recipe
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate request body with Zod schema
    const validatedData = createRecipeSchema.parse(body);

    const recipe = await Recipe.create(validatedData);

    return NextResponse.json(recipe, { status: 201 });
  } catch (error: any) {
    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create recipe', message: error.message },
      { status: 500 }
    );
  }
}
