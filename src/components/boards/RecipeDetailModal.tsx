'use client';

import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { CategoryBadge, getCategoryEmoji } from '@/components/common/CategoryBadge';
import { useModal } from '@/stores/uiStore';
import type { Recipe } from '@/types/recipe';

export function RecipeDetailModal() {
  const { isOpen, data, close } = useModal('recipeDetail');
  const recipe = data as Recipe | undefined;

  if (!recipe) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title={recipe.name}
      size="md"
    >
      <div className="space-y-6">
        {/* Header with category */}
        <div className="flex items-center gap-3">
          <span className="text-4xl">{getCategoryEmoji(recipe.category)}</span>
          <div>
            <CategoryBadge category={recipe.category} size="md" />
            <p className="text-sm text-base-content/60 mt-1">
              {recipe.ingredients.length} ingredients
            </p>
          </div>
        </div>

        {/* Ingredients list */}
        <div>
          <h4 className="text-sm font-semibold text-base-content/70 uppercase tracking-wide mb-3">
            Ingredients
          </h4>
          <div className="space-y-2">
            {recipe.ingredients.map((ing, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 px-3 bg-base-200/50 rounded-xl"
              >
                <span className="font-medium">{ing.ingredientName}</span>
                <Badge variant="outline" size="sm">
                  {ing.quantity} {ing.unit}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between pt-4 border-t border-base-200">
          <span className="text-sm text-base-content/60">Status</span>
          <Badge variant={recipe.isActive ? 'success' : 'default'} size="sm">
            {recipe.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>
    </Modal>
  );
}
