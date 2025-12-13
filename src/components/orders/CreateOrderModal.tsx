'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Dropdown';
import { Badge } from '@/components/ui/Badge';
import { CategoryBadge } from '@/components/common/CategoryBadge';
import { useModal } from '@/stores/uiStore';
import { useRecipes, useProductionAnalysis } from '@/hooks/useRecipes';
import { useCreateOrder } from '@/hooks/useOrders';
import { createOrderSchema, type CreateOrderInput } from '@/lib/utils/validations';

export function CreateOrderModal() {
  const { isOpen, close } = useModal('createOrder');
  const { data: recipes } = useRecipes();
  const { data: analysis } = useProductionAnalysis();
  const createOrder = useCreateOrder();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateOrderInput>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      recipeId: '',
      quantity: 1,
      notes: '',
    },
  });

  const selectedRecipeId = watch('recipeId');
  const selectedQuantity = watch('quantity') || 1;

  // Find the selected recipe and its production info
  const selectedRecipe = useMemo(
    () => recipes?.find((r) => r._id === selectedRecipeId),
    [recipes, selectedRecipeId]
  );

  const canMakeInfo = useMemo(
    () => analysis?.canMake.find((c) => c.recipeId === selectedRecipeId),
    [analysis, selectedRecipeId]
  );

  const cannotMakeInfo = useMemo(
    () => analysis?.cannotMake.find((c) => c.recipeId === selectedRecipeId),
    [analysis, selectedRecipeId]
  );

  const maxQuantity = canMakeInfo?.maxQuantity || 0;
  const isOverLimit = selectedQuantity > maxQuantity;
  const cannotMake = !!cannotMakeInfo;

  const recipeOptions = useMemo(() => {
    if (!recipes) return [];
    return recipes.map((r) => ({
      value: r._id,
      label: r.name,
    }));
  }, [recipes]);

  const onSubmit = async (data: CreateOrderInput) => {
    try {
      await createOrder.mutateAsync(data);
      reset();
      close();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleClose = () => {
    reset();
    close();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Order"
      description="Create a new board order"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Recipe Selection */}
        <Select
          label="Select Board"
          options={[{ value: '', label: 'Choose a board...' }, ...recipeOptions]}
          value={watch('recipeId')}
          onChange={(value) => setValue('recipeId', value)}
          error={errors.recipeId?.message}
        />

        {/* Selected recipe info */}
        {selectedRecipe && (
          <div className="p-3 bg-base-200/50 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{selectedRecipe.name}</span>
              <CategoryBadge category={selectedRecipe.category} size="sm" />
            </div>

            {canMakeInfo && (
              <div className="flex items-center gap-2 text-sm text-success">
                <Badge variant="success" size="xs">
                  Max: {canMakeInfo.maxQuantity}
                </Badge>
                <span>boards available</span>
              </div>
            )}

            {cannotMake && (
              <div className="flex items-center gap-2 text-sm text-error">
                <AlertCircle className="h-4 w-4" />
                <span>Cannot make - missing ingredients</span>
              </div>
            )}
          </div>
        )}

        {/* Quantity */}
        <Input
          label="Quantity"
          type="number"
          min={1}
          max={100}
          error={errors.quantity?.message || (isOverLimit ? `Maximum available: ${maxQuantity}` : undefined)}
          {...register('quantity', { valueAsNumber: true })}
        />

        {/* Warning if over limit */}
        {isOverLimit && !cannotMake && (
          <div className="flex items-start gap-2 p-3 bg-warning/10 text-warning rounded-xl">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Insufficient inventory</p>
              <p>You can only make {maxQuantity} boards with current stock.</p>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Notes (optional)</span>
          </label>
          <textarea
            className="textarea textarea-bordered rounded-xl"
            rows={2}
            placeholder="Add any notes for this order..."
            {...register('notes')}
          />
          {errors.notes && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.notes.message}</span>
            </label>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting || createOrder.isPending}
            disabled={cannotMake || isOverLimit || !selectedRecipeId}
          >
            Create Order
          </Button>
        </div>
      </form>
    </Modal>
  );
}
