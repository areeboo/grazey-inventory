import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Order from '@/lib/db/models/Order';
import Recipe from '@/lib/db/models/Recipe';
import Ingredient from '@/lib/db/models/Ingredient';
import { generateOrderNumber } from '@/lib/utils/orderUtils';
import { logOrderCreated } from '@/lib/utils/activityLogger';
import { createOrderSchema } from '@/lib/utils/validations';
import { ZodError } from 'zod';

// GET /api/orders - Get all orders
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query: Record<string, unknown> = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        (query.createdAt as Record<string, Date>).$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        (query.createdAt as Record<string, Date>).$lte = end;
      }
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ data: orders }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate request body with Zod schema
    const validatedData = createOrderSchema.parse(body);
    const { recipeId, quantity, notes } = validatedData;

    // Fetch the recipe
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    // Calculate required ingredients
    const debitedIngredients: Array<{
      ingredientId: string;
      ingredientName: string;
      quantityDebited: number;
      unit: string;
    }> = [];
    const insufficientIngredients: Array<{
      name: string;
      required: number;
      available: number;
    }> = [];

    // Check ingredient availability and calculate debits
    for (const recipeIng of recipe.ingredients) {
      const ingredient = await Ingredient.findById(recipeIng.ingredientId);

      if (!ingredient) {
        return NextResponse.json(
          { error: `Ingredient ${recipeIng.ingredientName} not found` },
          { status: 404 }
        );
      }

      const requiredQuantity = recipeIng.quantity * quantity;

      if (ingredient.currentQuantity < requiredQuantity) {
        insufficientIngredients.push({
          name: ingredient.name,
          required: requiredQuantity,
          available: ingredient.currentQuantity,
        });
      } else {
        debitedIngredients.push({
          ingredientId: ingredient._id.toString(),
          ingredientName: ingredient.name,
          quantityDebited: requiredQuantity,
          unit: recipeIng.unit,
        });
      }
    }

    // If any ingredients are insufficient, return error
    if (insufficientIngredients.length > 0) {
      return NextResponse.json(
        {
          error: 'Insufficient ingredients',
          insufficientIngredients,
        },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Debit ingredients (update their quantities)
    for (const debited of debitedIngredients) {
      await Ingredient.findByIdAndUpdate(
        debited.ingredientId,
        { $inc: { currentQuantity: -debited.quantityDebited } }
      );
    }

    // Create the order
    const order = await Order.create({
      orderNumber,
      recipeId,
      recipeName: recipe.name,
      quantity,
      status: 'in-progress',
      debitedIngredients,
      notes,
    });

    // Log activity
    await logOrderCreated(
      order._id.toString(),
      order.orderNumber,
      order.recipeName,
      order.quantity
    );

    return NextResponse.json({ data: order }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);

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
      { error: 'Failed to create order', message: error.message },
      { status: 500 }
    );
  }
}
