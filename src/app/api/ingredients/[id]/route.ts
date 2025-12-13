import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Ingredient from '@/lib/db/models/Ingredient';
import { Types } from 'mongoose';
import { logIngredientDeleted } from '@/lib/utils/activityLogger';

// GET /api/ingredients/:id - Get single ingredient
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid ingredient ID' }, { status: 400 });
    }

    const ingredient = await Ingredient.findById(params.id);

    if (!ingredient) {
      return NextResponse.json({ error: 'Ingredient not found' }, { status: 404 });
    }

    return NextResponse.json(ingredient, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch ingredient', message: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/ingredients/:id - Update ingredient
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid ingredient ID' }, { status: 400 });
    }

    const body = await request.json();

    const ingredient = await Ingredient.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!ingredient) {
      return NextResponse.json({ error: 'Ingredient not found' }, { status: 404 });
    }

    return NextResponse.json(ingredient, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update ingredient', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/ingredients/:id - Delete ingredient
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid ingredient ID' }, { status: 400 });
    }

    const ingredient = await Ingredient.findByIdAndDelete(params.id);

    if (!ingredient) {
      return NextResponse.json({ error: 'Ingredient not found' }, { status: 404 });
    }

    // Log activity
    await logIngredientDeleted(params.id, ingredient.name);

    return NextResponse.json(
      { message: 'Ingredient deleted successfully', ingredient },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete ingredient', message: error.message },
      { status: 500 }
    );
  }
}
