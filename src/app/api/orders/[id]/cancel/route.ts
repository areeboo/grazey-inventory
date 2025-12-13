import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Order from '@/lib/db/models/Order';
import Ingredient from '@/lib/db/models/Ingredient';
import { logOrderCancelled } from '@/lib/utils/activityLogger';

// POST /api/orders/:id/cancel - Cancel order and restore ingredients
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.status !== 'in-progress') {
      return NextResponse.json(
        { error: 'Only in-progress orders can be cancelled' },
        { status: 400 }
      );
    }

    // Restore ingredients
    for (const debited of order.debitedIngredients) {
      await Ingredient.findByIdAndUpdate(
        debited.ingredientId,
        { $inc: { currentQuantity: debited.quantityDebited } }
      );
    }

    // Update order status
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    await order.save();

    // Log activity
    await logOrderCancelled(
      order._id.toString(),
      order.orderNumber,
      order.recipeName,
      order.quantity
    );

    return NextResponse.json({ data: order }, { status: 200 });
  } catch (error: any) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { error: 'Failed to cancel order', message: error.message },
      { status: 500 }
    );
  }
}
