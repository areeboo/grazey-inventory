'use client';

import { useState, useEffect, useMemo } from 'react';
import { Sparkles, Package, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProductionGoalInput } from './ProductionGoalInput';
import { useGenerateShoppingList } from '@/hooks/useShoppingList';
import { useRecipes } from '@/hooks/useRecipes';
import { useToast } from '@/hooks/useToast';
import type { ProductionGoal, ShoppingListResponse } from '@/types/shopping-list';

interface ShoppingListGeneratorProps {
  onGenerate: (result: ShoppingListResponse) => void;
  className?: string;
}

// Local storage key for saving production goals
const STORAGE_KEY = 'grazey-production-goals';

export function ShoppingListGenerator({ onGenerate, className }: ShoppingListGeneratorProps) {
  const [includeLowStock, setIncludeLowStock] = useState(true);
  const [productionGoals, setProductionGoals] = useState<ProductionGoal[]>([]);

  const { toast } = useToast();
  const { data: recipesData } = useRecipes();
  const generateMutation = useGenerateShoppingList();

  const recipes = useMemo(() => recipesData || [], [recipesData]);

  // Load saved production goals from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate that recipes still exist
        const validGoals = parsed.filter((g: ProductionGoal) =>
          recipes.some((r) => r._id === g.recipeId)
        );
        if (validGoals.length > 0) {
          setProductionGoals(validGoals);
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, [recipes]);

  // Save production goals to localStorage when they change
  useEffect(() => {
    try {
      if (productionGoals.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(productionGoals));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, [productionGoals]);

  const handleGenerate = async () => {
    try {
      const result = await generateMutation.mutateAsync({
        includeLowStock,
        productionGoals,
      });
      onGenerate(result);

      if (result.items.length === 0) {
        toast({
          type: 'info',
          title: 'Nothing to Buy',
          message: 'All items are in stock for your current needs!',
        });
      } else {
        toast({
          type: 'success',
          title: 'Shopping List Generated',
          message: `Found ${result.items.length} item${result.items.length !== 1 ? 's' : ''} to buy`,
        });
      }
    } catch (error: any) {
      toast({
        type: 'error',
        title: 'Generation Failed',
        message: error.message || 'Failed to generate shopping list',
      });
    }
  };

  const canGenerate = includeLowStock || productionGoals.length > 0;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Low Stock Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-warning" />
            Low Stock Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="toggle toggle-primary toggle-lg"
              checked={includeLowStock}
              onChange={(e) => setIncludeLowStock(e.target.checked)}
            />
            <div>
              <p className="font-medium">Include Low Stock Items</p>
              <p className="text-sm text-base-content/60">
                Automatically add ingredients below their threshold
              </p>
            </div>
          </label>
        </CardContent>
      </Card>

      {/* Production Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-info" />
            Production Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-base-content/60 mb-4">
            Add boards you plan to make. The shopping list will include any missing ingredients.
          </p>
          <ProductionGoalInput
            recipes={recipes}
            goals={productionGoals}
            onChange={setProductionGoals}
          />
        </CardContent>
      </Card>

      {/* Generate Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleGenerate}
          disabled={!canGenerate}
          isLoading={generateMutation.isPending}
          leftIcon={<Sparkles className="h-5 w-5" />}
        >
          Generate Shopping List
        </Button>
        {!canGenerate && (
          <p className="text-sm text-base-content/50 text-center mt-2">
            Enable low stock items or add production goals to generate a list
          </p>
        )}
      </motion.div>
    </div>
  );
}
