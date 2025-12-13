import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Activity from '@/lib/db/models/Activity';

// GET /api/history - Get activity log
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const ingredientId = searchParams.get('ingredientId');
    const orderId = searchParams.get('orderId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);

    const query: Record<string, unknown> = {};

    if (type && type !== 'all') {
      query.type = type;
    }

    if (ingredientId) {
      query.ingredientId = ingredientId;
    }

    if (orderId) {
      query.orderId = orderId;
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        (query.timestamp as Record<string, Date>).$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        (query.timestamp as Record<string, Date>).$lte = end;
      }
    }

    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      Activity.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Activity.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        data: activities,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching activity history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity history', message: error.message },
      { status: 500 }
    );
  }
}
