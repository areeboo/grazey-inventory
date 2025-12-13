'use client';

import { Tabs } from '@/components/ui/Tabs';
import { useRecipeStore } from '@/stores/recipeStore';
import type { RecipeCategory } from '@/types/recipe';

const categories: { value: string; label: string }[] = [
  { value: 'all', label: 'All Boards' },
  { value: 'Classic', label: '🧀 Classic' },
  { value: 'Vegetarian', label: '🥬 Vegetarian' },
  { value: 'Sweet', label: '🍯 Sweet' },
  { value: 'Keto', label: '🥑 Keto' },
];

interface CategoryFilterProps {
  className?: string;
}

export function CategoryFilter({ className }: CategoryFilterProps) {
  const categoryFilter = useRecipeStore((state) => state.filters.category);
  const setFilter = useRecipeStore((state) => state.setFilter);

  return (
    <Tabs
      tabs={categories}
      value={categoryFilter}
      onChange={(value) => setFilter('category', value)}
      variant="pills"
      className={className}
    />
  );
}
