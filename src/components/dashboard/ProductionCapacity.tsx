'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChefHat, ArrowRight, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { BoardProductionInfo } from '@/types/recipe';

interface ProductionCapacityProps {
  boards: BoardProductionInfo[];
  className?: string;
}

export function ProductionCapacity({ boards, className }: ProductionCapacityProps) {
  const topBoards = boards.slice(0, 5);

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-success" />
          Production Capacity
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {topBoards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="bg-error/10 rounded-full p-3 mb-3">
              <ChefHat className="h-8 w-8 text-error" />
            </div>
            <p className="font-medium text-error">No Boards Available</p>
            <p className="text-sm text-base-content/50 mt-1">
              Check inventory for missing ingredients
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {topBoards.map((board, index) => (
              <motion.div
                key={board.recipeId}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="p-3 bg-success/5 rounded-xl border border-success/20"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{board.recipeName}</p>
                    <p className="text-xs text-base-content/50">
                      Limited by: {board.limitingIngredient.name}
                    </p>
                  </div>
                  <Badge variant="success" size="lg" className="shrink-0 ml-3">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {board.maxQuantity}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
      <div className="p-4 pt-0">
        <Link href="/production">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            View Production Analysis
          </Button>
        </Link>
      </div>
    </Card>
  );
}
