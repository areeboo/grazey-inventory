'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import type { ProductionGoal } from '@/types/shopping-list';
import type { Recipe } from '@/types/recipe';

interface ProductionGoalInputProps {
  recipes: Recipe[];
  goals: ProductionGoal[];
  onChange: (goals: ProductionGoal[]) => void;
  className?: string;
}

export function ProductionGoalInput({
  recipes,
  goals,
  onChange,
  className,
}: ProductionGoalInputProps) {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('');

  const recipeOptions = recipes
    .filter((r) => !goals.some((g) => g.recipeId === r._id))
    .map((r) => ({
      value: r._id,
      label: r.name,
    }));

  const handleAddGoal = () => {
    if (!selectedRecipeId) return;

    const recipe = recipes.find((r) => r._id === selectedRecipeId);
    if (!recipe) return;

    onChange([
      ...goals,
      {
        recipeId: recipe._id,
        recipeName: recipe.name,
        quantity: 1,
      },
    ]);
    setSelectedRecipeId('');
  };

  const handleRemoveGoal = (recipeId: string) => {
    onChange(goals.filter((g) => g.recipeId !== recipeId));
  };

  const handleQuantityChange = (recipeId: string, quantity: number) => {
    onChange(
      goals.map((g) =>
        g.recipeId === recipeId ? { ...g, quantity: Math.max(1, quantity) } : g
      )
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Add new goal */}
      <div className="flex gap-2">
        <Dropdown
          options={recipeOptions}
          value={selectedRecipeId}
          onChange={setSelectedRecipeId}
          placeholder="Select a board to plan..."
          className="flex-1"
        />
        <Button
          variant="primary"
          size="md"
          onClick={handleAddGoal}
          disabled={!selectedRecipeId}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Add
        </Button>
      </div>

      {/* Goals list */}
      <AnimatePresence mode="popLayout">
        {goals.map((goal) => (
          <motion.div
            key={goal.recipeId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 p-3 bg-base-200 rounded-xl"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-base-content truncate">{goal.recipeName}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-base-content/60">×</span>
              <Input
                type="number"
                min={1}
                value={goal.quantity}
                onChange={(e) =>
                  handleQuantityChange(goal.recipeId, parseInt(e.target.value) || 1)
                }
                inputSize="sm"
                className="w-20"
              />
            </div>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => handleRemoveGoal(goal.recipeId)}
              className="text-error hover:bg-error/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </motion.div>
        ))}
      </AnimatePresence>

      {goals.length === 0 && (
        <p className="text-sm text-base-content/50 text-center py-4">
          No production goals added yet. Select a board above to plan production.
        </p>
      )}
    </div>
  );
}
