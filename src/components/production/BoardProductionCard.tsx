'use client';

import { motion } from 'framer-motion';
import { Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CategoryBadge, getCategoryEmoji } from '@/components/common/CategoryBadge';
import type { BoardProductionInfo } from '@/types/recipe';

interface BoardProductionCardProps {
  board: BoardProductionInfo;
  index?: number;
  className?: string;
}

export function BoardProductionCard({ board, index = 0, className }: BoardProductionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        variant="elevated"
        padding="md"
        rounded="lg"
        hover="glow"
        className={cn(
          'border-l-4 border-l-success bg-success/5',
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

          <div className="text-right">
            <div className="flex items-center gap-1 text-success">
              <Check className="h-5 w-5" />
              <span className="text-2xl font-bold font-display">{board.maxQuantity}</span>
            </div>
            <span className="text-xs text-base-content/60">can make</span>
          </div>
        </div>

        {/* Limiting ingredient */}
        <div className="mt-3 pt-3 border-t border-base-200">
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-warning" />
            <span className="text-base-content/70">
              Limited by{' '}
              <span className="font-medium text-base-content">
                {board.limitingIngredient.name}
              </span>
            </span>
            <Badge variant="outline" size="xs">
              {board.limitingIngredient.available}/{board.limitingIngredient.required} available
            </Badge>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
