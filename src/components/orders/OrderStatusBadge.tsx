'use client';

import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { OrderStatus } from '@/types/order';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const statusConfig: Record<OrderStatus, {
  label: string;
  variant: 'warning' | 'success' | 'default';
  icon: typeof Clock;
}> = {
  'in-progress': {
    label: 'In Progress',
    variant: 'warning',
    icon: Clock,
  },
  completed: {
    label: 'Completed',
    variant: 'success',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'default',
    icon: XCircle,
  },
};

export function OrderStatusBadge({ status, size = 'sm' }: OrderStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      size={size}
      icon={<Icon className="h-3 w-3" />}
    >
      {config.label}
    </Badge>
  );
}
