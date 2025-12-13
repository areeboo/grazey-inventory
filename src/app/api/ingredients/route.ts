import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Ingredient from '@/lib/db/models/Ingredient';
import { logIngredientCreated } from '@/lib/utils/activityLogger';

// GET /api/ingredients - Get all ingredients
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isCustom = searchParams.get('isCustom');

    let query: any = {};
    if (category) query.category = category;
    if (isCustom !== null) query.isCustom = isCustom === 'true';

    const ingredients = await Ingredient.find(query).sort({ name: 1 });

    return NextResponse.json({ data: ingredients }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch ingredients', message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/ingredients - Create new ingredient
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      name,
      category,
      isCustom = false,
      currentQuantity = 0,
      unit,
      lowStockThreshold = 4,
    } = body;

    // Validation
    if (!name || !unit) {
      return NextResponse.json(
        { error: 'Name and unit are required' },
        { status: 400 }
      );
    }

    // Check if ingredient already exists
    const existing = await Ingredient.findOne({ name });
    if (existing) {
      return NextResponse.json(
        { error: 'Ingredient with this name already exists' },
        { status: 409 }
      );
    }

    const ingredient = await Ingredient.create({
      name,
      category: category || 'Other',
      isCustom,
      currentQuantity,
      unit,
      lowStockThreshold,
    });

    // Log activity
    await logIngredientCreated(
      ingredient._id.toString(),
      ingredient.name,
      ingredient.currentQuantity
    );

    return NextResponse.json({ data: ingredient }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create ingredient', message: error.message },
      { status: 500 }
    );
  }
}
