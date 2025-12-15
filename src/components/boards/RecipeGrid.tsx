'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { SkeletonCard, EmptyState } from '@/components/ui';
import { RecipeCard } from './RecipeCard';
import { useRecipeStore } from '@/stores/recipeStore';
import { useRecipes, useProductionAnalysis } from '@/hooks/useRecipes';
import { useModal } from '@/stores/uiStore';
import type { Recipe, RecipeCategory } from '@/types/recipe';

interface RecipeGridProps {
  className?: string;
}

const categoryOrder: RecipeCategory[] = ['Classic', 'Vegetarian', 'Sweet', 'Keto'];

export function RecipeGrid({ className }: RecipeGridProps) {
  const { isLoading, error, refetch } = useRecipes();
  const { data: productionAnalysis } = useProductionAnalysis();
  const recipes = useRecipeStore((state) => state.recipes);
  const filters = useRecipeStore((state) => state.filters);
  const filteredRecipes = useMemo(() => {
    return recipes.filter((rec) => {
      if (filters.search && !rec.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.category !== 'all' && rec.category !== filters.category) {
        return false;
      }
      return true;
    });
  }, [recipes, filters]);
  const categoryFilter = filters.category;
  const { open: openDetail } = useModal('recipeDetail');
  const makeableCounts = useMemo(() => {
    if (!productionAnalysis) return {} as Record<string, number>;

    const map: Record<string, number> = {};
    productionAnalysis.canMake.forEach((board) => {
      map[board.recipeId] = board.maxQuantity;
    });
    productionAnalysis.cannotMake.forEach((board) => {
      map[board.recipeId] = 0;
    });
    return map;
  }, [productionAnalysis]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        type="error"
        title="Failed to load boards"
        description="We had trouble loading your board recipes."
        action={{ label: 'Try Again', onClick: () => refetch() }}
      />
    );
  }

  if (filteredRecipes.length === 0) {
    return (
      <EmptyState
        type="empty"
        title="No Boards Found"
        description={
          categoryFilter !== 'all'
            ? `No boards in the ${categoryFilter} category.`
            : 'No board recipes available.'
        }
      />
    );
  }

  // Group recipes by category if showing all
  if (categoryFilter === 'all') {
    const grouped = filteredRecipes.reduce(
      (acc, recipe) => {
        if (!acc[recipe.category]) {
          acc[recipe.category] = [];
        }
        acc[recipe.category].push(recipe);
        return acc;
      },
      {} as Record<RecipeCategory, Recipe[]>
    );

    return (
      <div className={cn('space-y-8', className)}>
        {categoryOrder.map((category) => {
          const recipes = grouped[category];
          if (!recipes || recipes.length === 0) return null;

          return (
            <motion.section
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold font-display mb-4 flex items-center gap-2">
                <span>{getCategoryEmoji(category)}</span>
                {getCategoryLabel(category)}
                <span className="text-base font-normal text-base-content/50">
                  ({recipes.length})
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {recipes.map((recipe, index) => (
                  <motion.div
                    key={recipe._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <RecipeCard
                      recipe={recipe}
                      onViewDetails={openDetail}
                      makeableCount={makeableCounts[recipe._id]}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          );
        })}
      </div>
    );
  }

  // Single category view
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4', className)}>
      {filteredRecipes.map((recipe, index) => (
        <motion.div
          key={recipe._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <RecipeCard
            recipe={recipe}
            onViewDetails={openDetail}
            makeableCount={makeableCounts[recipe._id]}
          />
        </motion.div>
      ))}
    </div>
  );
}

function getCategoryEmoji(category: RecipeCategory): string {
  const emojis: Record<RecipeCategory, string> = {
    Classic: '🧀',
    Vegetarian: '🥬',
    Sweet: '🍯',
    Keto: '🥑',
  };
  return emojis[category] || '🍽️';
}

function getCategoryLabel(category: RecipeCategory): string {
  const labels: Record<RecipeCategory, string> = {
    Classic: 'Gone Grazey (Classic)',
    Vegetarian: 'Vegegrazian',
    Sweet: 'Sweet & Grazey',
    Keto: 'Grazey for Keto',
  };
  return labels[category] || category;
}
