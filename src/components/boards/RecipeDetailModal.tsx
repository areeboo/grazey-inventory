'use client';

import { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CategoryBadge, getCategoryEmoji } from '@/components/common/CategoryBadge';
import { useModal, useToast } from '@/stores/uiStore';
import { useIngredients } from '@/hooks/useIngredients';
import { useUpdateRecipe, useDeleteRecipe } from '@/hooks/useRecipes';
import { ingredientUnits } from '@/lib/utils/validations';
import type { Recipe, RecipeIngredient } from '@/types/recipe';
import { Pencil, X, Plus, Trash2, Check, AlertCircle, GripVertical } from 'lucide-react';

interface EditableIngredient extends RecipeIngredient {
  isNew?: boolean;
  isRemoved?: boolean;
  isModified?: boolean;
}

export function RecipeDetailModal() {
  const { isOpen, data, close } = useModal('recipeDetail');
  const recipe = data as Recipe | undefined;
  const toast = useToast();

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedIngredients, setEditedIngredients] = useState<EditableIngredient[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all ingredients for the dropdown
  const { data: allIngredients } = useIngredients();
  const updateRecipeMutation = useUpdateRecipe();
  const deleteRecipeMutation = useDeleteRecipe();

  // Reset edit state when modal opens/closes or recipe changes
  useEffect(() => {
    if (recipe && isOpen) {
      setEditedIngredients(recipe.ingredients.map(ing => ({ ...ing })));
      setIsEditMode(false);
      setShowDeleteConfirm(false);
    }
  }, [recipe, isOpen]);

  // Filter out ingredients that are already in the recipe
  const availableIngredients = useMemo(() => {
    if (!allIngredients) return [];
    const usedIds = new Set(
      editedIngredients
        .filter(ing => !ing.isRemoved)
        .map(ing => ing.ingredientId)
    );
    return allIngredients.filter(ing => !usedIds.has(ing._id));
  }, [allIngredients, editedIngredients]);

  // Check if there are unsaved changes
  const hasChanges = useMemo(() => {
    if (!recipe) return false;
    const activeIngredients = editedIngredients.filter(ing => !ing.isRemoved);
    if (activeIngredients.length !== recipe.ingredients.length) return true;
    return editedIngredients.some(ing => ing.isNew || ing.isRemoved || ing.isModified);
  }, [recipe, editedIngredients]);

  // Validation
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    const activeIngredients = editedIngredients.filter(ing => !ing.isRemoved);

    if (activeIngredients.length === 0) {
      errors.push('At least one ingredient is required');
    }

    activeIngredients.forEach(ing => {
      if (ing.quantity <= 0) {
        errors.push(`${ing.ingredientName} must have a quantity greater than 0`);
      }
    });

    return errors;
  }, [editedIngredients]);

  const handleEnterEditMode = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    if (recipe) {
      setEditedIngredients(recipe.ingredients.map(ing => ({ ...ing })));
    }
    setIsEditMode(false);
  };

  const handleUpdateIngredient = (index: number, field: keyof EditableIngredient, value: any) => {
    setEditedIngredients(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
        isModified: !updated[index].isNew,
      };
      return updated;
    });
  };

  const handleRemoveIngredient = (index: number) => {
    setEditedIngredients(prev => {
      const updated = [...prev];
      if (updated[index].isNew) {
        // If it's new, just remove it from the array
        return updated.filter((_, i) => i !== index);
      } else {
        // If it's existing, mark as removed
        updated[index] = { ...updated[index], isRemoved: true };
        return updated;
      }
    });
  };

  const handleUndoRemove = (index: number) => {
    setEditedIngredients(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], isRemoved: false };
      return updated;
    });
  };

  const handleAddIngredient = (ingredientId: string) => {
    const ingredient = allIngredients?.find(ing => ing._id === ingredientId);
    if (!ingredient) return;

    const newIngredient: EditableIngredient = {
      ingredientId: ingredient._id,
      ingredientName: ingredient.name,
      quantity: 1,
      unit: ingredient.unit,
      isNew: true,
    };

    setEditedIngredients(prev => [...prev, newIngredient]);
  };

  const handleSave = async () => {
    if (!recipe || validationErrors.length > 0) return;

    setIsSaving(true);
    try {
      const updatedIngredients = editedIngredients
        .filter(ing => !ing.isRemoved)
        .map(({ isNew, isRemoved, isModified, ...ing }) => ing);

      await updateRecipeMutation.mutateAsync({
        id: recipe._id,
        input: { ingredients: updatedIngredients },
      });

      setIsEditMode(false);
    } catch (error) {
      // Error is handled by the mutation hook
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!recipe) return;

    setIsDeleting(true);
    try {
      await deleteRecipeMutation.mutateAsync(recipe._id);
      close();
    } catch (error) {
      // Error is handled by the mutation hook
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (isEditMode && hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        close();
      }
    } else {
      close();
    }
  };

  if (!recipe) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={recipe.name}
      size="lg"
    >
      <div className="space-y-6">
        {/* Header with category and edit button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{getCategoryEmoji(recipe.category)}</span>
            <div>
              <CategoryBadge category={recipe.category} size="md" />
              <p className="text-sm text-base-content/60 mt-1">
                {editedIngredients.filter(ing => !ing.isRemoved).length} ingredients
              </p>
            </div>
          </div>

          {!isEditMode ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEnterEditMode}
              className="gap-2"
            >
              <Pencil className="h-4 w-4" />
              Edit Board
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Badge variant="warning" size="sm" className="animate-pulse">
                Editing
              </Badge>
            </div>
          )}
        </div>

        {/* Edit Mode Banner */}
        {isEditMode && (
          <div className="bg-warning/10 border border-warning/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-warning">Edit Mode Active</p>
                <p className="text-sm text-base-content/70 mt-1">
                  You can modify ingredient quantities, add new ingredients, or remove existing ones.
                  Changes will be saved when you click &quot;Save Changes&quot;.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Validation Errors */}
        {isEditMode && validationErrors.length > 0 && (
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

        {/* Ingredients list */}
        <div>
          <h4 className="text-sm font-semibold text-base-content/70 uppercase tracking-wide mb-3">
            Ingredients
          </h4>

          <div className="space-y-2">
            {editedIngredients.map((ing, index) => (
              <div
                key={`${ing.ingredientId}-${index}`}
                className={`flex items-center justify-between py-3 px-4 rounded-xl transition-all ${
                  ing.isRemoved
                    ? 'bg-error/10 border border-error/20 opacity-60'
                    : ing.isNew
                    ? 'bg-success/10 border border-success/20'
                    : ing.isModified
                    ? 'bg-warning/10 border border-warning/20'
                    : 'bg-base-200/50'
                }`}
              >
                {isEditMode ? (
                  <>
                    <div className="flex items-center gap-3 flex-1">
                      <GripVertical className="h-4 w-4 text-base-content/30" />
                      <span className={`font-medium ${ing.isRemoved ? 'line-through' : ''}`}>
                        {ing.ingredientName}
                      </span>
                      {ing.isNew && (
                        <Badge variant="success" size="sm">New</Badge>
                      )}
                      {ing.isModified && !ing.isNew && (
                        <Badge variant="warning" size="sm">Modified</Badge>
                      )}
                      {ing.isRemoved && (
                        <Badge variant="error" size="sm">Removed</Badge>
                      )}
                    </div>

                    {!ing.isRemoved ? (
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
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUndoRemove(index)}
                        className="text-primary"
                      >
                        Undo
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <span className="font-medium">{ing.ingredientName}</span>
                    <Badge variant="outline" size="sm">
                      {ing.quantity} {ing.unit}
                    </Badge>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Add ingredient dropdown - only in edit mode */}
          {isEditMode && availableIngredients.length > 0 && (
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

          {isEditMode && availableIngredients.length === 0 && (
            <p className="mt-4 text-sm text-base-content/50 text-center py-2">
              All available ingredients are already added to this board.
            </p>
          )}
        </div>

        {/* Status - only in view mode */}
        {!isEditMode && (
          <div className="flex items-center justify-between pt-4 border-t border-base-200">
            <span className="text-sm text-base-content/60">Status</span>
            <Badge variant={recipe.isActive ? 'success' : 'default'} size="sm">
              {recipe.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        )}

        {/* Edit mode action buttons */}
        {isEditMode && (
          <div className="space-y-4 pt-4 border-t border-base-200">
            {/* Delete confirmation */}
            {showDeleteConfirm ? (
              <div className="bg-error/10 border border-error/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-error">Delete this board?</p>
                    <p className="text-sm text-base-content/70 mt-1">
                      This action cannot be undone. The board &quot;{recipe.name}&quot; will be permanently deleted.
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={isDeleting}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={handleDelete}
                        isLoading={isDeleting}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Board
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-error hover:bg-error/10 gap-2"
                  disabled={isSaving}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Board
                </Button>
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={!hasChanges || validationErrors.length > 0 || isSaving}
                    isLoading={isSaving}
                    className="gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {/* Unsaved changes indicator */}
            {!showDeleteConfirm && (
              <div className="text-sm text-center text-base-content/60">
                {hasChanges ? (
                  <span className="text-warning">You have unsaved changes</span>
                ) : (
                  <span>No changes made</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
