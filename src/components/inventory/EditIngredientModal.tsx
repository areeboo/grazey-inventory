'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ChevronDown, ChevronUp, Plus, Trash2, Save } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Dropdown';
import { useModal, useToast } from '@/stores/uiStore';
import { useUpdateIngredient } from '@/hooks/useIngredients';
import { useRecipes, useUpdateRecipe } from '@/hooks/useRecipes';
import { getBoardsForIngredient } from '@/lib/utils/boardAssociations';
import { CategoryBadge, getCategoryEmoji } from '@/components/common/CategoryBadge';
import {
  updateIngredientSchema,
  ingredientCategories,
  ingredientUnits,
} from '@/lib/utils/validations';
import type { Ingredient, UpdateIngredientInput } from '@/types/ingredient';
import type { Recipe, RecipeCategory, RecipeIngredient } from '@/types/recipe';

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

interface BoardAssociation {
  recipeId: string;
  recipeName: string;
  category: RecipeCategory;
  quantity: number;
  unit: string;
  notes?: string;
  isNew?: boolean;
  isModified?: boolean;
  isRemoved?: boolean;
}

export function EditIngredientModal() {
  const { isOpen, data, close } = useModal('editIngredient');
  const ingredient = data as Ingredient | undefined;
  const updateIngredient = useUpdateIngredient();
  const updateRecipe = useUpdateRecipe();
  const { data: recipes = [] } = useRecipes({ isActive: true });
  const toast = useToast();
  const [showBoards, setShowBoards] = useState(true);
  const [boardAssociations, setBoardAssociations] = useState<BoardAssociation[]>([]);
  const [showAddBoard, setShowAddBoard] = useState(false);
  const [selectedBoardToAdd, setSelectedBoardToAdd] = useState<string>('');
  const [newBoardQuantity, setNewBoardQuantity] = useState<number>(1);
  const [isSavingBoards, setIsSavingBoards] = useState(false);

  // Initialize board associations when ingredient changes
  useEffect(() => {
    if (ingredient && recipes.length > 0) {
      const associations: BoardAssociation[] = [];
      recipes.forEach((recipe) => {
        const ing = recipe.ingredients.find((i) => i.ingredientId === ingredient._id);
        if (ing) {
          associations.push({
            recipeId: recipe._id,
            recipeName: recipe.name,
            category: recipe.category,
            quantity: ing.quantity,
            unit: ing.unit,
            notes: ing.notes,
            isNew: false,
            isModified: false,
            isRemoved: false,
          });
        }
      });
      setBoardAssociations(associations);
    }
  }, [ingredient, recipes]);

  // Get boards that don't have this ingredient yet
  const availableBoardsToAdd = useMemo(() => {
    if (!ingredient) return [];
    const associatedIds = new Set(
      boardAssociations.filter((a) => !a.isRemoved).map((a) => a.recipeId)
    );
    return recipes.filter((r) => !associatedIds.has(r._id));
  }, [ingredient, recipes, boardAssociations]);

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

  const hasUnsavedBoardChanges = useMemo(() => {
    return boardAssociations.some((a) => a.isNew || a.isModified || a.isRemoved);
  }, [boardAssociations]);

  const handleQuantityChange = (recipeId: string, newQuantity: number) => {
    setBoardAssociations((prev) =>
      prev.map((a) =>
        a.recipeId === recipeId
          ? { ...a, quantity: newQuantity, isModified: !a.isNew }
          : a
      )
    );
  };

  const handleNotesChange = (recipeId: string, notes: string) => {
    setBoardAssociations((prev) =>
      prev.map((a) =>
        a.recipeId === recipeId
          ? { ...a, notes: notes || undefined, isModified: !a.isNew }
          : a
      )
    );
  };

  const handleRemoveFromBoard = (recipeId: string) => {
    setBoardAssociations((prev) =>
      prev.map((a) =>
        a.recipeId === recipeId
          ? a.isNew
            ? { ...a, isRemoved: true } // Mark new ones as removed (will be filtered out)
            : { ...a, isRemoved: true }
          : a
      ).filter((a) => !(a.isNew && a.isRemoved)) // Remove new items that were removed
    );
  };

  const handleUndoRemove = (recipeId: string) => {
    setBoardAssociations((prev) =>
      prev.map((a) =>
        a.recipeId === recipeId ? { ...a, isRemoved: false } : a
      )
    );
  };

  const handleAddToBoard = () => {
    if (!selectedBoardToAdd || !ingredient) return;

    const recipe = recipes.find((r) => r._id === selectedBoardToAdd);
    if (!recipe) return;

    setBoardAssociations((prev) => [
      ...prev,
      {
        recipeId: recipe._id,
        recipeName: recipe.name,
        category: recipe.category,
        quantity: newBoardQuantity,
        unit: ingredient.unit,
        isNew: true,
        isModified: false,
        isRemoved: false,
      },
    ]);

    setSelectedBoardToAdd('');
    setNewBoardQuantity(1);
    setShowAddBoard(false);
  };

  const handleSaveBoardChanges = async () => {
    if (!ingredient) return;

    setIsSavingBoards(true);
    try {
      // Group changes by recipe
      const changedRecipes = new Map<string, Recipe>();

      // Get current recipes that need updates
      boardAssociations.forEach((assoc) => {
        if (assoc.isNew || assoc.isModified || assoc.isRemoved) {
          const recipe = recipes.find((r) => r._id === assoc.recipeId);
          if (recipe) {
            changedRecipes.set(recipe._id, { ...recipe });
          }
        }
      });

      // Apply changes to each recipe
      const entries = Array.from(changedRecipes.entries());
      for (let i = 0; i < entries.length; i++) {
        const [recipeId, recipe] = entries[i];
        const assoc = boardAssociations.find((a) => a.recipeId === recipeId);
        if (!assoc) continue;

        let updatedIngredients: RecipeIngredient[];

        if (assoc.isRemoved) {
          // Remove ingredient from recipe
          updatedIngredients = recipe.ingredients.filter(
            (ing) => ing.ingredientId !== ingredient._id
          );
        } else if (assoc.isNew) {
          // Add ingredient to recipe
          updatedIngredients = [
            ...recipe.ingredients,
            {
              ingredientId: ingredient._id,
              ingredientName: ingredient.name,
              quantity: assoc.quantity,
              unit: assoc.unit,
              notes: assoc.notes,
            },
          ];
        } else if (assoc.isModified) {
          // Update ingredient in recipe
          updatedIngredients = recipe.ingredients.map((ing) =>
            ing.ingredientId === ingredient._id
              ? {
                  ...ing,
                  quantity: assoc.quantity,
                  notes: assoc.notes,
                }
              : ing
          );
        } else {
          continue;
        }

        await updateRecipe.mutateAsync({
          id: recipeId,
          input: { ingredients: updatedIngredients },
        });
      }

      // Reset modification flags
      setBoardAssociations((prev) =>
        prev
          .filter((a) => !a.isRemoved)
          .map((a) => ({ ...a, isNew: false, isModified: false }))
      );

      toast.success('Board associations updated successfully');
    } catch (error) {
      toast.error('Failed to update board associations');
    } finally {
      setIsSavingBoards(false);
    }
  };

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
    setBoardAssociations([]);
    setShowAddBoard(false);
    setSelectedBoardToAdd('');
    close();
  };

  if (!ingredient) return null;

  const activeAssociations = boardAssociations.filter((a) => !a.isRemoved);
  const removedAssociations = boardAssociations.filter((a) => a.isRemoved);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Ingredient"
      description={`Update details for ${ingredient.name}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Edit Form */}
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

          <div className="flex justify-end gap-3 pt-2">
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

        {/* Board Associations Section */}
        <div className="border-t border-base-200 pt-4">
          <button
            type="button"
            onClick={() => setShowBoards(!showBoards)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-base-200/50 hover:bg-base-200 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">Board Associations</span>
              <span className="text-xs text-base-content/60 bg-base-300/50 px-2 py-0.5 rounded-full">
                {activeAssociations.length} board{activeAssociations.length !== 1 ? 's' : ''}
              </span>
              {hasUnsavedBoardChanges && (
                <span className="text-xs text-warning bg-warning/20 px-2 py-0.5 rounded-full">
                  Unsaved changes
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
                  {/* Active Associations */}
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                    {activeAssociations.length === 0 && removedAssociations.length === 0 ? (
                      <div className="text-center py-6 text-base-content/60">
                        <div className="p-3 bg-base-200/50 rounded-2xl inline-block mb-3">
                          <Package className="h-8 w-8 opacity-30" />
                        </div>
                        <p className="text-sm font-medium mb-1">Not used in any boards</p>
                        <p className="text-xs">Add this ingredient to a board below</p>
                      </div>
                    ) : (
                      activeAssociations.map((assoc) => (
                        <motion.div
                          key={assoc.recipeId}
                          layout
                          className={cn(
                            'p-3 rounded-xl border transition-all duration-200',
                            `bg-gradient-to-br ${categoryGradients[assoc.category]}`,
                            categoryBorders[assoc.category],
                            (assoc.isNew || assoc.isModified) && 'ring-2 ring-primary/30'
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
                                {assoc.isNew && (
                                  <span className="text-[10px] text-success bg-success/20 px-1.5 py-0.5 rounded">
                                    New
                                  </span>
                                )}
                                {assoc.isModified && (
                                  <span className="text-[10px] text-warning bg-warning/20 px-1.5 py-0.5 rounded">
                                    Modified
                                  </span>
                                )}
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
                                  {assoc.unit} per board
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

                    {/* Removed associations (with undo) */}
                    {removedAssociations.map((assoc) => (
                      <motion.div
                        key={assoc.recipeId}
                        layout
                        className="p-3 rounded-xl border border-dashed border-base-300 bg-base-200/30 opacity-60"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getCategoryEmoji(assoc.category)}</span>
                            <span className="text-sm line-through text-base-content/60">
                              {assoc.recipeName}
                            </span>
                            <span className="text-[10px] text-error bg-error/20 px-1.5 py-0.5 rounded">
                              Removed
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={() => handleUndoRemove(assoc.recipeId)}
                          >
                            Undo
                          </Button>
                        </div>
                      </motion.div>
                    ))}
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
                          : 'Add to another board'}
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

                  {/* Save Board Changes Button */}
                  {hasUnsavedBoardChanges && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="pt-2"
                    >
                      <Button
                        type="button"
                        variant="accent"
                        size="sm"
                        onClick={handleSaveBoardChanges}
                        isLoading={isSavingBoards}
                        leftIcon={<Save className="h-4 w-4" />}
                        className="w-full"
                      >
                        Save Board Changes
                      </Button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Modal>
  );
}
