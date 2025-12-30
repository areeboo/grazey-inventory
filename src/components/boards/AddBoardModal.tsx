'use client';

import { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Dropdown';
import { useModal } from '@/stores/uiStore';
import { useIngredients } from '@/hooks/useIngredients';
import { useCreateRecipe } from '@/hooks/useRecipes';
import { recipeCategories, ingredientUnits } from '@/lib/utils/validations';
import { getCategoryEmoji } from '@/components/common/CategoryBadge';
import type { RecipeCategory, RecipeIngredient } from '@/types/recipe';
import { Plus, Trash2, AlertCircle, ChefHat } from 'lucide-react';

interface NewIngredient {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
}

export function AddBoardModal() {
  const { isOpen, close } = useModal('addBoard');
  const { data: allIngredients } = useIngredients();
  const createRecipeMutation = useCreateRecipe();

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<RecipeCategory | ''>('');
  const [ingredients, setIngredients] = useState<NewIngredient[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when modal closes
  const handleClose = () => {
    setName('');
    setCategory('');
    setIngredients([]);
    setIsActive(true);
    close();
  };

  // Filter out ingredients that are already added
  const availableIngredients = useMemo(() => {
    if (!allIngredients) return [];
    const usedIds = new Set(ingredients.map(ing => ing.ingredientId));
    return allIngredients.filter(ing => !usedIds.has(ing._id));
  }, [allIngredients, ingredients]);

  // Validation
  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    if (!name.trim()) {
      errors.push('Board name is required');
    }

    if (!category) {
      errors.push('Category is required');
    }

    if (ingredients.length === 0) {
      errors.push('At least one ingredient is required');
    }

    ingredients.forEach(ing => {
      if (ing.quantity <= 0) {
        errors.push(`${ing.ingredientName} must have a quantity greater than 0`);
      }
    });

    return errors;
  }, [name, category, ingredients]);

  const handleAddIngredient = (ingredientId: string) => {
    const ingredient = allIngredients?.find(ing => ing._id === ingredientId);
    if (!ingredient) return;

    const newIngredient: NewIngredient = {
      ingredientId: ingredient._id,
      ingredientName: ingredient.name,
      quantity: 1,
      unit: ingredient.unit,
    };

    setIngredients(prev => [...prev, newIngredient]);
  };

  const handleUpdateIngredient = (index: number, field: keyof NewIngredient, value: any) => {
    setIngredients(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (validationErrors.length > 0 || !category) return;

    setIsSaving(true);
    try {
      const recipeIngredients: RecipeIngredient[] = ingredients.map(ing => ({
        ingredientId: ing.ingredientId,
        ingredientName: ing.ingredientName,
        quantity: ing.quantity,
        unit: ing.unit,
      }));

      await createRecipeMutation.mutateAsync({
        name: name.trim(),
        category: category as RecipeCategory,
        ingredients: recipeIngredients,
        isActive,
      });

      handleClose();
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsSaving(false);
    }
  };

  const categoryOptions = [
    { value: '', label: 'Select a category...' },
    ...recipeCategories.map(cat => ({
      value: cat,
      label: `${getCategoryEmoji(cat)} ${cat}`,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Board"
      size="lg"
    >
      <div className="space-y-6">
        {/* Board Info Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <ChefHat className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">Board Details</h4>
              <p className="text-sm text-base-content/60">Give your board a name and category</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Board Name"
              placeholder="e.g., Mediterranean Delight"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Select
              label="Category"
              options={categoryOptions}
              value={category}
              onChange={(value) => setCategory(value as RecipeCategory | '')}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="checkbox checkbox-primary"
            />
            <label htmlFor="isActive" className="text-sm cursor-pointer">
              Board is active and available for orders
            </label>
          </div>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-error/10 border border-error/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-error">Please fix the following:</p>
                <ul className="text-sm text-base-content/70 mt-1 list-disc list-inside">
                  {validationErrors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Ingredients Section */}
        <div>
          <h4 className="text-sm font-semibold text-base-content/70 uppercase tracking-wide mb-3">
            Ingredients
          </h4>

          {ingredients.length === 0 ? (
            <div className="text-center py-8 bg-base-200/30 rounded-xl border-2 border-dashed border-base-300">
              <p className="text-base-content/50">No ingredients added yet</p>
              <p className="text-sm text-base-content/40 mt-1">Use the dropdown below to add ingredients</p>
            </div>
          ) : (
            <div className="space-y-2">
              {ingredients.map((ing, index) => (
                <div
                  key={`${ing.ingredientId}-${index}`}
                  className="flex items-center justify-between py-3 px-4 rounded-xl bg-base-200/50"
                >
                  <span className="font-medium flex-1">{ing.ingredientName}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={ing.quantity}
                      onChange={(e) => handleUpdateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 text-sm border border-base-300 rounded-lg bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      min="0"
                      step="0.1"
                    />
                    <select
                      value={ing.unit}
                      onChange={(e) => handleUpdateIngredient(index, 'unit', e.target.value)}
                      className="px-2 py-1 text-sm border border-base-300 rounded-lg bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {ingredientUnits.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRemoveIngredient(index)}
                      className="text-error hover:bg-error/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add ingredient dropdown */}
          {availableIngredients.length > 0 && (
            <div className="mt-4 pt-4 border-t border-base-200">
              <div className="flex items-center gap-3">
                <Plus className="h-5 w-5 text-base-content/50" />
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddIngredient(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-base-300 rounded-xl bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  defaultValue=""
                >
                  <option value="" disabled>Add an ingredient...</option>
                  {availableIngredients.map(ing => (
                    <option key={ing._id} value={ing._id}>
                      {ing.name} ({ing.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {availableIngredients.length === 0 && allIngredients && allIngredients.length > 0 && (
            <p className="mt-4 text-sm text-base-content/50 text-center py-2">
              All available ingredients have been added.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-base-200">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={validationErrors.length > 0 || isSaving}
            isLoading={isSaving}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Board
          </Button>
        </div>
      </div>
    </Modal>
  );
}
