'use client';

import { motion } from 'framer-motion';
import { ShoppingCart, AlertCircle, Target, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { ShoppingListItem } from '@/types/shopping-list';

interface ShoppingListTableProps {
  items: ShoppingListItem[];
  className?: string;
}

// Extract board names from details string
function extractBoardNames(details: string): string[] {
  // Details format: "Needed for: Board A, Board B" or "Low stock + needed for: Board A, Board B"
  const match = details.match(/needed for:\s*(.+?)$/i);
  if (match && match[1]) {
    return match[1].split(',').map(s => s.trim());
  }
  return [];
}

// Render reason badges based on type
function ReasonBadges({ item }: { item: ShoppingListItem }) {
  const boards = extractBoardNames(item.details || '');

  if (item.reason === 'low_stock') {
    return (
      <Badge variant="warning" size="sm" className="gap-1">
        <AlertCircle className="h-3.5 w-3.5" />
        Low Stock
      </Badge>
    );
  }

  if (item.reason === 'production_goal') {
    return (
      <Badge variant="info" size="sm" className="gap-1">
        <Target className="h-3.5 w-3.5" />
        {boards.length > 0 ? `For: ${boards.join(', ')}` : 'Production'}
      </Badge>
    );
  }

  if (item.reason === 'both') {
    return (
      <div className="flex flex-col gap-1">
        <Badge variant="warning" size="sm" className="gap-1">
          <AlertCircle className="h-3.5 w-3.5" />
          Low Stock
        </Badge>
        <Badge variant="info" size="sm" className="gap-1">
          <Target className="h-3.5 w-3.5" />
          {boards.length > 0 ? `For: ${boards.join(', ')}` : 'Production'}
        </Badge>
      </div>
    );
  }

  return null;
}

export function ShoppingListTable({ items, className }: ShoppingListTableProps) {
  if (items.length === 0) {
    return (
      <Card className={cn('text-center py-12', className)}>
        <ShoppingCart className="h-12 w-12 mx-auto text-base-content/30 mb-4" />
        <p className="text-base-content/60">No items in shopping list</p>
        <p className="text-sm text-base-content/40 mt-1">
          Enable low stock items or add production goals to generate your list
        </p>
      </Card>
    );
  }

  return (
    <Card padding="none" className={cn('overflow-hidden', className)}>
      {/* Header */}
      <div className="bg-primary/10 px-4 py-3 border-b border-base-200">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          <span className="font-semibold text-base-content">
            {items.length} item{items.length !== 1 ? 's' : ''} to buy
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr className="bg-base-200/50">
              <th className="font-semibold">Ingredient</th>
              <th className="font-semibold text-center">Current</th>
              <th className="font-semibold text-center">Needed</th>
              <th className="font-semibold text-center text-primary">To Buy</th>
              <th className="font-semibold">Reason</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <motion.tr
                key={item.ingredientId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className="hover:bg-base-200/30"
              >
                <td>
                  <div className="font-medium">{item.ingredientName}</div>
                </td>
                <td className="text-center">
                  <span className="text-base-content/60">
                    {item.currentQuantity} {item.unit}
                  </span>
                </td>
                <td className="text-center">
                  <span className="text-base-content/80">
                    {item.neededQuantity} {item.unit}
                  </span>
                </td>
                <td className="text-center">
                  <span className="font-bold text-primary text-lg">
                    {item.shoppingQuantity}
                  </span>
                  <span className="text-sm text-base-content/60 ml-1">{item.unit}</span>
                </td>
                <td>
                  <ReasonBadges item={item} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
