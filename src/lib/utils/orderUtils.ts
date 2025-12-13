import Order from '@/lib/db/models/Order';

export async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ORD-${year}`;

  // Find the last order number for this year
  const lastOrder = await Order.findOne({
    orderNumber: { $regex: `^${prefix}` },
  })
    .sort({ orderNumber: -1 })
    .lean() as { orderNumber: string } | null;

  if (!lastOrder) {
    return `${prefix}-001`;
  }

  // Extract the sequence number and increment
  const lastNumber = parseInt(lastOrder.orderNumber.split('-')[2], 10);
  const newNumber = String(lastNumber + 1).padStart(3, '0');

  return `${prefix}-${newNumber}`;
}

export function formatOrderStatus(status: string): string {
  const statusLabels: Record<string, string> = {
    'in-progress': 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return statusLabels[status] || status;
}

export function getOrderStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    'in-progress': 'warning',
    completed: 'success',
    cancelled: 'default',
  };
  return statusColors[status] || 'default';
}
