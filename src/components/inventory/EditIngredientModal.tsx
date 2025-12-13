'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Dropdown';
import { useModal } from '@/stores/uiStore';
import { useUpdateIngredient } from '@/hooks/useIngredients';
import {
  updateIngredientSchema,
  ingredientCategories,
  ingredientUnits,
} from '@/lib/utils/validations';
import type { Ingredient, UpdateIngredientInput } from '@/types/ingredient';

export function EditIngredientModal() {
  const { isOpen, data, close } = useModal('editIngredient');
  const ingredient = data as Ingredient | undefined;
  const updateIngredient = useUpdateIngredient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UpdateIngredientInput>({
    resolver: zodResolver(updateIngredientSchema),
  });

  useEffect(() => {
    if (ingredient) {
      reset({
        name: ingredient.name,
        category: ingredient.category,
        unit: ingredient.unit,
        currentQuantity: ingredient.currentQuantity,
        lowStockThreshold: ingredient.lowStockThreshold,
        isCustom: ingredient.isCustom,
      });
    }
  }, [ingredient, reset]);

  const categoryOptions = ingredientCategories.map((cat) => ({
    value: cat,
    label: cat,
  }));

  const unitOptions = ingredientUnits.map((unit) => ({
    value: unit,
    label: unit,
  }));

  const onSubmit = async (data: UpdateIngredientInput) => {
    if (!ingredient) return;

    try {
      await updateIngredient.mutateAsync({ id: ingredient._id, input: data });
      close();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleClose = () => {
    reset();
    close();
  };

  if (!ingredient) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Ingredient"
      description={`Update ${ingredient.name}`}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Name"
          placeholder="e.g., Brie Cheese"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Category"
            options={categoryOptions}
            value={watch('category') || ingredient.category}
            onChange={(value) => setValue('category', value as typeof ingredientCategories[number])}
            error={errors.category?.message}
          />

          <Select
            label="Unit"
            options={unitOptions}
            value={watch('unit') || ingredient.unit}
            onChange={(value) => setValue('unit', value as typeof ingredientUnits[number])}
            error={errors.unit?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Current Quantity"
            type="number"
            min={0}
            step="0.1"
            error={errors.currentQuantity?.message}
            {...register('currentQuantity', { valueAsNumber: true })}
          />

          <Input
            label="Low Stock Threshold"
            type="number"
            min={0}
            step="0.1"
            error={errors.lowStockThreshold?.message}
            {...register('lowStockThreshold', { valueAsNumber: true })}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="editIsCustom"
            className="checkbox checkbox-primary checkbox-sm"
            {...register('isCustom')}
          />
          <label htmlFor="editIsCustom" className="text-sm">
            This is a custom ingredient
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting || updateIngredient.isPending}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
