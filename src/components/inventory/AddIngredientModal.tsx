'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Dropdown';
import { useModal, useToast } from '@/stores/uiStore';
import { useCreateIngredient } from '@/hooks/useIngredients';
import { useRecipes, useUpdateRecipe } from '@/hooks/useRecipes';
import { CategoryBadge, getCategoryEmoji } from '@/components/common/CategoryBadge';
import {
  createIngredientSchema,
  ingredientCategories,
  ingredientUnits,
  type CreateIngredientInput,
} from '@/lib/utils/validations';
import type { RecipeCategory, RecipeIngredient } from '@/types/recipe';

const categoryGradients: Record<RecipeCategory, string> = {
  Classic: 'from-classic/20 to-classic/5',
  Vegetarian: 'from-vegetarian/20 to-vegetarian/5',
  Sweet: 'from-sweet/20 to-sweet/5',
  Keto: 'from-keto/20 to-keto/5',
};

const categoryBorders: Record<RecipeCategory, string> = {
  Classic: 'border-classic/30 hover:border-classic/50',
  Vegetarian: 'border-vegetarian/30 hover:border-vegetarian/50',
  Sweet: 'border-sweet/30 hover:border-sweet/50',
  Keto: 'border-keto/30 hover:border-keto/50',
};

interface PendingBoardAssociation {
  recipeId: string;
  recipeName: string;
  category: RecipeCategory;
  quantity: number;
  notes?: string;
}

export function AddIngredientModal() {
  const { isOpen, close } = useModal('addIngredient');
  const createIngredient = useCreateIngredient();
  const updateRecipe = useUpdateRecipe();
  const { data: recipes = [] } = useRecipes({ isActive: true });
  const toast = useToast();

  // Board associations state
  const [showBoards, setShowBoards] = useState(false);
  const [pendingAssociations, setPendingAssociations] = useState<PendingBoardAssociation[]>([]);
  const [showAddBoard, setShowAddBoard] = useState(false);
  const [selectedBoardToAdd, setSelectedBoardToAdd] = useState<string>('');
  const [newBoardQuantity, setNewBoardQuantity] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);

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

  const currentUnit = watch('unit');

  const categoryOptions = ingredientCategories.map((cat) => ({
    value: cat,
    label: cat,
  }));

  const unitOptions = ingredientUnits.map((unit) => ({
    value: unit,
    label: unit,
  }));

  // Get boards that haven't been added yet
  const availableBoardsToAdd = useMemo(() => {
    const addedIds = new Set(pendingAssociations.map((a) => a.recipeId));
    return recipes.filter((r) => !addedIds.has(r._id));
  }, [recipes, pendingAssociations]);

  const handleAddToBoard = () => {
    if (!selectedBoardToAdd) return;

    const recipe = recipes.find((r) => r._id === selectedBoardToAdd);
    if (!recipe) return;

    setPendingAssociations((prev) => [
      ...prev,
      {
        recipeId: recipe._id,
        recipeName: recipe.name,
        category: recipe.category,
        quantity: newBoardQuantity,
      },
    ]);

    setSelectedBoardToAdd('');
    setNewBoardQuantity(1);
    setShowAddBoard(false);
  };

  const handleRemoveFromBoard = (recipeId: string) => {
    setPendingAssociations((prev) => prev.filter((a) => a.recipeId !== recipeId));
  };

  const handleQuantityChange = (recipeId: string, newQuantity: number) => {
    setPendingAssociations((prev) =>
      prev.map((a) =>
        a.recipeId === recipeId ? { ...a, quantity: newQuantity } : a
      )
    );
  };

  const handleNotesChange = (recipeId: string, notes: string) => {
    setPendingAssociations((prev) =>
      prev.map((a) =>
        a.recipeId === recipeId ? { ...a, notes: notes || undefined } : a
      )
    );
  };

  const onSubmit = async (data: CreateIngredientInput) => {
    setIsSaving(true);
    try {
      // Step 1: Create the ingredient
      const newIngredient = await createIngredient.mutateAsync(data);

      // Step 2: Add to boards if any associations are pending
      if (pendingAssociations.length > 0) {
        for (const assoc of pendingAssociations) {
          const recipe = recipes.find((r) => r._id === assoc.recipeId);
          if (!recipe) continue;

          const newRecipeIngredient: RecipeIngredient = {
            ingredientId: newIngredient._id,
            ingredientName: newIngredient.name,
            quantity: assoc.quantity,
            unit: newIngredient.unit,
            notes: assoc.notes,
          };

          await updateRecipe.mutateAsync({
            id: recipe._id,
            input: {
              ingredients: [...recipe.ingredients, newRecipeIngredient],
            },
          });
        }

        toast.success(
          `${newIngredient.name} added to inventory and ${pendingAssociations.length} board${pendingAssociations.length > 1 ? 's' : ''}`
        );
      }

      handleClose();
    } catch (error) {
      // Error is handled by the mutation
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    reset();
    setPendingAssociations([]);
    setShowBoards(false);
    setShowAddBoard(false);
    setSelectedBoardToAdd('');
    setNewBoardQuantity(1);
    close();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Ingredient"
      description="Add a new ingredient to your inventory"
      size="lg"
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

        {/* Board Associations Section */}
        <div className="border-t border-base-200 pt-4">
          <button
            type="button"
            onClick={() => setShowBoards(!showBoards)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-base-200/50 hover:bg-base-200 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">Add to Boards</span>
              {pendingAssociations.length > 0 && (
                <span className="text-xs text-primary bg-primary/20 px-2 py-0.5 rounded-full">
                  {pendingAssociations.length} board{pendingAssociations.length !== 1 ? 's' : ''} selected
                </span>
              )}
            </div>
            {showBoards ? (
              <ChevronUp className="h-4 w-4 text-base-content/60" />
            ) : (
              <ChevronDown className="h-4 w-4 text-base-content/60" />
            )}
          </button>

          <AnimatePresence>
            {showBoards && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-3 pt-4">
                  <p className="text-xs text-base-content/60">
                    Optionally add this ingredient to one or more boards. The ingredient will be created first, then added to the selected boards.
                  </p>

                  {/* Pending Associations */}
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {pendingAssociations.length === 0 ? (
                      <div className="text-center py-4 text-base-content/50 text-sm">
                        No boards selected yet
                      </div>
                    ) : (
                      pendingAssociations.map((assoc) => (
                        <motion.div
                          key={assoc.recipeId}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={cn(
                            'p-3 rounded-xl border transition-all duration-200',
                            `bg-gradient-to-br ${categoryGradients[assoc.category]}`,
                            categoryBorders[assoc.category]
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xl flex-shrink-0 mt-1">
                              {getCategoryEmoji(assoc.category)}
                            </span>
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-sm text-base-content">
                                  {assoc.recipeName}
                                </h4>
                                <CategoryBadge category={assoc.category} size="sm" />
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min={0.1}
                                  step={0.1}
                                  value={assoc.quantity}
                                  onChange={(e) =>
                                    handleQuantityChange(assoc.recipeId, parseFloat(e.target.value) || 0)
                                  }
                                  className="input input-sm input-bordered w-20 text-center"
                                />
                                <span className="text-xs text-base-content/70">
                                  {currentUnit} per board
                                </span>
                              </div>
                              <input
                                type="text"
                                placeholder="Notes (optional)"
                                value={assoc.notes || ''}
                                onChange={(e) => handleNotesChange(assoc.recipeId, e.target.value)}
                                className="input input-sm input-bordered w-full text-xs"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleRemoveFromBoard(assoc.recipeId)}
                              className="text-error hover:bg-error hover:text-white flex-shrink-0"
                              title="Remove from board"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>

                  {/* Add to Board Section */}
                  <div className="pt-2 border-t border-base-200">
                    {!showAddBoard ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAddBoard(true)}
                        leftIcon={<Plus className="h-4 w-4" />}
                        className="w-full justify-center"
                        disabled={availableBoardsToAdd.length === 0}
                      >
                        {availableBoardsToAdd.length === 0
                          ? 'Added to all boards'
                          : 'Add to a board'}
                      </Button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3 p-3 bg-base-200/50 rounded-xl"
                      >
                        <div className="grid grid-cols-2 gap-2">
                          <Select
                            label="Board"
                            options={[
                              { value: '', label: 'Select a board...' },
                              ...availableBoardsToAdd.map((r) => ({
                                value: r._id,
                                label: `${getCategoryEmoji(r.category)} ${r.name}`,
                              })),
                            ]}
                            value={selectedBoardToAdd}
                            onChange={setSelectedBoardToAdd}
                          />
                          <Input
                            label="Quantity"
                            type="number"
                            min={0.1}
                            step={0.1}
                            value={newBoardQuantity}
                            onChange={(e) => setNewBoardQuantity(parseFloat(e.target.value) || 1)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowAddBoard(false);
                              setSelectedBoardToAdd('');
                            }}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={handleAddToBoard}
                            disabled={!selectedBoardToAdd}
                            className="flex-1"
                          >
                            Add
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting || isSaving}
          >
            {pendingAssociations.length > 0
              ? `Add Ingredient & ${pendingAssociations.length} Board${pendingAssociations.length > 1 ? 's' : ''}`
              : 'Add Ingredient'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
