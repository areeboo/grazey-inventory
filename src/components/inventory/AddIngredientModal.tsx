'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Dropdown';
import { useModal } from '@/stores/uiStore';
import { useCreateIngredient } from '@/hooks/useIngredients';
import {
  createIngredientSchema,
  ingredientCategories,
  ingredientUnits,
  type CreateIngredientInput,
} from '@/lib/utils/validations';

export function AddIngredientModal() {
  const { isOpen, close } = useModal('addIngredient');
  const createIngredient = useCreateIngredient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateIngredientInput>({
    resolver: zodResolver(createIngredientSchema),
    defaultValues: {
      name: '',
      category: 'Other',
      unit: 'each',
      currentQuantity: 0,
      lowStockThreshold: 5,
      isCustom: false,
    },
  });

  const categoryOptions = ingredientCategories.map((cat) => ({
    value: cat,
    label: cat,
  }));

  const unitOptions = ingredientUnits.map((unit) => ({
    value: unit,
    label: unit,
  }));

  const onSubmit = async (data: CreateIngredientInput) => {
    try {
      await createIngredient.mutateAsync(data);
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
      title="Add Ingredient"
      description="Add a new ingredient to your inventory"
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
            value={watch('category')}
            onChange={(value) => setValue('category', value as typeof ingredientCategories[number])}
            error={errors.category?.message}
          />

          <Select
            label="Unit"
            options={unitOptions}
            value={watch('unit')}
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
            id="isCustom"
            className="checkbox checkbox-primary checkbox-sm"
            {...register('isCustom')}
          />
          <label htmlFor="isCustom" className="text-sm">
            This is a custom ingredient (not from default recipes)
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting || createIngredient.isPending}
          >
            Add Ingredient
          </Button>
        </div>
      </form>
    </Modal>
  );
}
