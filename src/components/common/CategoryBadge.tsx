'use client';

import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/Badge';

type RecipeCategory = 'Classic' | 'Vegetarian' | 'Sweet' | 'Keto' | 'Specialty';
type IngredientCategory =
  | 'Cheese'
  | 'Meat'
  | 'Fruit'
  | 'Vegetable'
  | 'Crackers'
  | 'Nuts'
  | 'Spreads'
  | 'Sweets'
  | 'Garnish'
  | 'Bread'
  | 'Other';

interface CategoryBadgeProps {
  category: RecipeCategory | IngredientCategory | string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

// Recipe category variants
const recipeCategoryVariants: Record<RecipeCategory, string> = {
  Classic: 'classic',
  Vegetarian: 'vegetarian',
  Sweet: 'sweet',
  Keto: 'keto',
  Specialty: 'primary',
};

// Ingredient category colors
const ingredientCategoryColors: Record<string, string> = {
  Cheese: 'bg-amber-400 text-amber-900',
  Meat: 'bg-red-400 text-white',
  Fruit: 'bg-pink-400 text-white',
  Vegetable: 'bg-green-400 text-white',
  Crackers: 'bg-orange-300 text-orange-900',
  Nuts: 'bg-amber-600 text-white',
  Spreads: 'bg-yellow-400 text-yellow-900',
  Sweets: 'bg-pink-300 text-pink-900',
  Garnish: 'bg-emerald-400 text-white',
  Bread: 'bg-amber-200 text-amber-900',
  Other: 'bg-gray-300 text-gray-700',
};

export function CategoryBadge({ category, size = 'sm', className }: CategoryBadgeProps) {
  // Check if it's a recipe category
  if (category in recipeCategoryVariants) {
    const variant = recipeCategoryVariants[category as RecipeCategory];
    return (
      <Badge
        variant={variant as 'classic' | 'vegetarian' | 'sweet' | 'keto' | 'primary'}
        size={size}
        className={className}
      >
        {category}
      </Badge>
    );
  }

  // It's an ingredient category
  const colorClass = ingredientCategoryColors[category] || ingredientCategoryColors.Other;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        colorClass,
        size === 'xs' && 'px-1.5 py-0.5 text-xs',
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-2.5 py-1 text-sm',
        size === 'lg' && 'px-3 py-1.5 text-base',
        className
      )}
    >
      {category}
    </span>
  );
}

// Recipe category icon helper
export function getCategoryEmoji(category: RecipeCategory): string {
  const emojis: Record<RecipeCategory, string> = {
    Classic: '🧀',
    Vegetarian: '🥬',
    Sweet: '🍯',
    Keto: '🥑',
    Specialty: '⭐',
  };
  return emojis[category] || '🍽️';
}
