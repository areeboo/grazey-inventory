'use client';

import { type ReactNode } from 'react';
import { Package, Search, ShoppingCart, ClipboardList, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from './Button';

type EmptyStateType = 'empty' | 'search' | 'cart' | 'orders' | 'error';

interface EmptyStateProps {
  type?: EmptyStateType;
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const defaultIcons: Record<EmptyStateType, typeof Package> = {
  empty: Package,
  search: Search,
  cart: ShoppingCart,
  orders: ClipboardList,
  error: AlertCircle,
};

export function EmptyState({
  type = 'empty',
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const Icon = icon ? null : defaultIcons[type];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center',
        className
      )}
    >
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-base-200 mb-6">
        {icon || (Icon && <Icon className="h-10 w-10 text-base-content/40" />)}
      </div>

      <h3 className="text-xl font-semibold font-display text-base-content mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-base-content/60 max-w-sm mb-6">{description}</p>
      )}

      {action && (
        <Button onClick={action.onClick} variant="primary">
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Pre-built empty states for common scenarios
export function NoIngredientsState({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      type="empty"
      title="No Ingredients Yet"
      description="Start by adding ingredients to your inventory to track your stock."
      action={onAdd ? { label: 'Add Ingredient', onClick: onAdd } : undefined}
    />
  );
}

export function NoOrdersState({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      type="orders"
      title="No Orders Yet"
      description="Create your first order to start tracking production."
      action={onCreate ? { label: 'Create Order', onClick: onCreate } : undefined}
    />
  );
}

export function NoResultsState({ query }: { query?: string }) {
  return (
    <EmptyState
      type="search"
      title="No Results Found"
      description={
        query
          ? `We couldn't find anything matching "${query}". Try a different search.`
          : 'Try adjusting your filters or search terms.'
      }
    />
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      type="error"
      title="Something Went Wrong"
      description="We had trouble loading this content. Please try again."
      action={onRetry ? { label: 'Try Again', onClick: onRetry } : undefined}
    />
  );
}
