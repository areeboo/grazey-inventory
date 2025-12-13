import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Ingredient from '@/lib/db/models/Ingredient';
import { Types } from 'mongoose';
import { logIngredientAdjustment, logLowStockAlert } from '@/lib/utils/activityLogger';

// POST /api/ingredients/:id/adjust - Adjust ingredient quantity
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid ingredient ID' }, { status: 400 });
    }

    const body = await request.json();
    const { adjustment, operation = 'increment' } = body;

    if (typeof adjustment !== 'number') {
      return NextResponse.json(
        { error: 'Adjustment must be a number' },
        { status: 400 }
      );
    }

    const ingredient = await Ingredient.findById(params.id);

    if (!ingredient) {
      return NextResponse.json({ error: 'Ingredient not found' }, { status: 404 });
    }

    let newQuantity: number;
    if (operation === 'set') {
      newQuantity = adjustment;
    } else if (operation === 'increment') {
      newQuantity = ingredient.currentQuantity + adjustment;
    } else if (operation === 'decrement') {
      newQuantity = ingredient.currentQuantity - adjustment;
    } else {
      return NextResponse.json(
        { error: 'Invalid operation. Must be "set", "increment", or "decrement"' },
        { status: 400 }
      );
    }

    if (newQuantity < 0) {
      return NextResponse.json(
        { error: 'Adjustment would result in negative quantity' },
        { status: 400 }
      );
    }

    const oldQuantity = ingredient.currentQuantity;
    ingredient.currentQuantity = newQuantity;
    await ingredient.save();

    // Log activity
    await logIngredientAdjustment(
      params.id,
      ingredient.name,
      oldQuantity,
      newQuantity,
      adjustment
    );

    // Check for low stock alert
    if (newQuantity < ingredient.lowStockThreshold && oldQuantity >= ingredient.lowStockThreshold) {
      await logLowStockAlert(
        params.id,
        ingredient.name,
        newQuantity,
        ingredient.lowStockThreshold
      );
    }

    return NextResponse.json(
      {
        message: 'Quantity adjusted successfully',
        data: ingredient,
        adjustment,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to adjust quantity', message: error.message },
      { status: 500 }
    );
  }
}
