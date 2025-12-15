'use client';

import { motion } from 'framer-motion';
import { UtensilsCrossed, Eye } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CategoryBadge, getCategoryEmoji } from '@/components/common/CategoryBadge';
import type { Recipe, RecipeCategory } from '@/types/recipe';

interface RecipeCardProps {
  recipe: Recipe;
  onViewDetails: (recipe: Recipe) => void;
  className?: string;
  makeableCount?: number;
}

const categoryGradients: Record<RecipeCategory, string> = {
  Classic: 'from-classic/20 to-classic/5',
  Vegetarian: 'from-vegetarian/20 to-vegetarian/5',
  Sweet: 'from-sweet/20 to-sweet/5',
  Keto: 'from-keto/20 to-keto/5',
};

const categoryBorders: Record<RecipeCategory, string> = {
  Classic: 'border-classic/30 hover:border-classic',
  Vegetarian: 'border-vegetarian/30 hover:border-vegetarian',
  Sweet: 'border-sweet/30 hover:border-sweet',
  Keto: 'border-keto/30 hover:border-keto',
};

export function RecipeCard({ recipe, onViewDetails, className, makeableCount }: RecipeCardProps) {
  const displayableCount = typeof makeableCount === 'number' ? makeableCount : '—';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        variant="bordered"
        padding="none"
        rounded="bubble"
        className={cn(
          'group overflow-hidden border-2 transition-all duration-300',
          `bg-gradient-to-br ${categoryGradients[recipe.category]}`,
          categoryBorders[recipe.category],
          className
        )}
      >
        {/* Header with emoji */}
        <div className="relative p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getCategoryEmoji(recipe.category)}</span>
              <div>
                <h3 className="text-lg font-bold font-display text-base-content">
                  {recipe.name}
                </h3>
                <CategoryBadge category={recipe.category} size="sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Ingredients preview */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2 text-sm text-base-content/60 mb-2">
            <UtensilsCrossed className="h-4 w-4" />
            <span>{recipe.ingredients.length} ingredients</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {recipe.ingredients.slice(0, 4).map((ing, index) => (
              <span
                key={index}
                className="px-2 py-0.5 text-xs bg-base-200/80 rounded-full"
              >
                {ing.ingredientName}
              </span>
            ))}
            {recipe.ingredients.length > 4 && (
              <span className="px-2 py-0.5 text-xs bg-base-200/80 rounded-full">
                +{recipe.ingredients.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(recipe)}
            rightIcon={<Eye className="h-4 w-4" />}
            className="w-full justify-center opacity-80 group-hover:opacity-100"
          >
            View Details
          </Button>
          <p className="mt-2 text-center text-xs text-base-content/60">
            How many boards can be made:&nbsp;
            <span className="font-semibold text-base-content">{displayableCount}</span>
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
