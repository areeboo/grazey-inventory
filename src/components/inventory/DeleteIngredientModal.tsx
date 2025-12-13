'use client';

import { ConfirmModal } from '@/components/ui/Modal';
import { useModal } from '@/stores/uiStore';
import { useDeleteIngredient } from '@/hooks/useIngredients';
import type { Ingredient } from '@/types/ingredient';

export function DeleteIngredientModal() {
  const { isOpen, data, close } = useModal('deleteIngredient');
  const ingredient = data as Ingredient | undefined;
  const deleteIngredient = useDeleteIngredient();

  const handleConfirm = async () => {
    if (!ingredient) return;

    try {
      await deleteIngredient.mutateAsync(ingredient._id);
      close();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  if (!ingredient) return null;

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={close}
      onConfirm={handleConfirm}
      title="Delete Ingredient"
      description={`Are you sure you want to delete "${ingredient.name}"? This action cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
      variant="danger"
      isLoading={deleteIngredient.isPending}
    />
  );
}
