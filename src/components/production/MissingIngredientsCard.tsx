'use client';

import { motion } from 'framer-motion';
import { XCircle, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CategoryBadge, getCategoryEmoji } from '@/components/common/CategoryBadge';
import type { CannotMakeInfo } from '@/types/recipe';

interface MissingIngredientsCardProps {
  board: CannotMakeInfo;
  index?: number;
  className?: string;
}

export function MissingIngredientsCard({ board, index = 0, className }: MissingIngredientsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        variant="elevated"
        padding="md"
        rounded="lg"
        className={cn(
          'border-l-4 border-l-error bg-error/5',
          className
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getCategoryEmoji(board.category)}</span>
            <div>
              <h3 className="font-semibold text-base-content">{board.recipeName}</h3>
              <CategoryBadge category={board.category} size="xs" />
            </div>
          </div>

          <div className="flex items-center gap-1 text-error">
            <XCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Cannot make</span>
          </div>
        </div>

        {/* Missing ingredients */}
        <div className="mt-3 pt-3 border-t border-base-200 space-y-2">
          <div className="flex items-center gap-2 text-sm text-base-content/70 mb-2">
            <ShoppingCart className="h-4 w-4" />
            <span>Missing ingredients:</span>
          </div>

          {board.missingIngredients.map((ing, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-sm py-1.5 px-2 bg-base-100 rounded-lg"
            >
              <span className="font-medium">{ing.ingredientName}</span>
              <div className="flex items-center gap-2">
                <span className="text-base-content/60">
                  {ing.available} / {ing.required} {ing.unit}
                </span>
                <Badge variant="error" size="xs">
                  need {ing.shortfall}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
