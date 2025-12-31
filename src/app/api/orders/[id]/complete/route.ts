import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Order from '@/lib/db/models/Order';
import { logOrderCompleted } from '@/lib/utils/activityLogger';
import { Types } from 'mongoose';

// POST /api/orders/:id/complete - Mark order as completed
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.status !== 'in-progress') {
      return NextResponse.json(
        { error: 'Only in-progress orders can be completed' },
        { status: 400 }
      );
    }

    // Update order status
    order.status = 'completed';
    order.completedAt = new Date();
    await order.save();

    // Log activity
    await logOrderCompleted(
      order._id.toString(),
      order.orderNumber,
      order.recipeName,
      order.quantity
    );

    return NextResponse.json({ data: order }, { status: 200 });
  } catch (error: any) {
    console.error('Error completing order:', error);
    return NextResponse.json(
      { error: 'Failed to complete order', message: error.message },
      { status: 500 }
    );
  }
}
