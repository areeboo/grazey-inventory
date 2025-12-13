'use client';

import { AlertTriangle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/Badge';

interface LowStockIndicatorProps {
  currentQuantity: number;
  threshold: number;
  unit?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LowStockIndicator({
  currentQuantity,
  threshold,
  unit,
  showText = true,
  size = 'md',
  className,
}: LowStockIndicatorProps) {
  const isLowStock = currentQuantity < threshold;
  const isOutOfStock = currentQuantity === 0;
  const isWarning = currentQuantity > 0 && currentQuantity < threshold;

  if (!isLowStock) {
    return null;
  }

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  if (isOutOfStock) {
    return (
      <Badge
        variant="error"
        size={size}
        className={cn('gap-1', className)}
      >
        <AlertCircle className={iconSizes[size]} />
        {showText && 'Out of Stock'}
      </Badge>
    );
  }

  if (isWarning) {
    return (
      <Badge
        variant="warning"
        size={size}
        className={cn('gap-1', className)}
      >
        <AlertTriangle className={iconSizes[size]} />
        {showText && (
          <span>
            Low Stock{unit && ` (${currentQuantity} ${unit})`}
          </span>
        )}
      </Badge>
    );
  }

  return null;
}

// Simple indicator for tables
interface StockStatusProps {
  currentQuantity: number;
  threshold: number;
  className?: string;
}

export function StockStatus({ currentQuantity, threshold, className }: StockStatusProps) {
  const isLowStock = currentQuantity < threshold;
  const isOutOfStock = currentQuantity === 0;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'w-2 h-2 rounded-full',
          isOutOfStock ? 'bg-error' : isLowStock ? 'bg-warning' : 'bg-success'
        )}
      />
      <span
        className={cn(
          'text-sm',
          isOutOfStock
            ? 'text-error font-medium'
            : isLowStock
              ? 'text-warning font-medium'
              : 'text-base-content/70'
        )}
      >
        {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
      </span>
    </div>
  );
}
