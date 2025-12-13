'use client';

import {
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  ShoppingCart,
  CheckCircle,
  XCircle,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { ActivityType } from '@/types/activity';

interface EventTypeIconProps {
  type: ActivityType;
  adjustment?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const typeConfig: Record<ActivityType, {
  icon: LucideIcon;
  bgColor: string;
  textColor: string;
}> = {
  ingredient_adjustment: {
    icon: TrendingUp,
    bgColor: 'bg-info/20',
    textColor: 'text-info',
  },
  ingredient_created: {
    icon: Plus,
    bgColor: 'bg-success/20',
    textColor: 'text-success',
  },
  ingredient_deleted: {
    icon: Trash2,
    bgColor: 'bg-error/20',
    textColor: 'text-error',
  },
  order_created: {
    icon: ShoppingCart,
    bgColor: 'bg-primary/20',
    textColor: 'text-primary',
  },
  order_completed: {
    icon: CheckCircle,
    bgColor: 'bg-success/20',
    textColor: 'text-success',
  },
  order_cancelled: {
    icon: XCircle,
    bgColor: 'bg-base-300',
    textColor: 'text-base-content/50',
  },
  low_stock_alert: {
    icon: AlertTriangle,
    bgColor: 'bg-warning/20',
    textColor: 'text-warning',
  },
};

const sizeClasses = {
  sm: { container: 'w-8 h-8', icon: 'h-4 w-4' },
  md: { container: 'w-10 h-10', icon: 'h-5 w-5' },
  lg: { container: 'w-12 h-12', icon: 'h-6 w-6' },
};

export function EventTypeIcon({
  type,
  adjustment,
  size = 'md',
  className,
}: EventTypeIconProps) {
  // For adjustments, use TrendingUp or TrendingDown based on adjustment value
  let config = typeConfig[type];
  let Icon = config.icon;

  if (type === 'ingredient_adjustment' && adjustment !== undefined) {
    if (adjustment > 0) {
      Icon = TrendingUp;
      config = {
        ...config,
        bgColor: 'bg-success/20',
        textColor: 'text-success',
      };
    } else if (adjustment < 0) {
      Icon = TrendingDown;
      config = {
        ...config,
        bgColor: 'bg-error/20',
        textColor: 'text-error',
      };
    }
  }

  const sizes = sizeClasses[size];

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full flex-shrink-0',
        sizes.container,
        config.bgColor,
        className
      )}
    >
      <Icon className={cn(sizes.icon, config.textColor)} />
    </div>
  );
}
