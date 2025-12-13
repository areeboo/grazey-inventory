'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, RefreshCw, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner, EmptyState } from '@/components/ui';
import { StatCard } from '@/components/common/StatCard';
import { BoardProductionCard } from './BoardProductionCard';
import { MissingIngredientsCard } from './MissingIngredientsCard';
import { useProductionAnalysis } from '@/hooks/useRecipes';

interface ProductionAnalysisPanelProps {
  className?: string;
}

export function ProductionAnalysisPanel({ className }: ProductionAnalysisPanelProps) {
  const { data: analysis, isLoading, error, refetch, isFetching } = useProductionAnalysis();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        type="error"
        title="Failed to analyze production"
        description="We had trouble analyzing your production capacity."
        action={{ label: 'Try Again', onClick: () => refetch() }}
      />
    );
  }

  if (!analysis) return null;

  const totalBoards = analysis.canMake.reduce((sum, b) => sum + b.maxQuantity, 0);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Recipes"
          value={analysis.totalRecipes}
          icon={<TrendingUp className="h-6 w-6" />}
          variant="default"
          delay={0}
        />
        <StatCard
          title="Can Make"
          value={analysis.canMakeCount}
          icon={<CheckCircle2 className="h-6 w-6 text-white" />}
          variant="success"
          delay={1}
        />
        <StatCard
          title="Cannot Make"
          value={analysis.cannotMakeCount}
          icon={<XCircle className="h-6 w-6 text-white" />}
          variant={analysis.cannotMakeCount > 0 ? 'error' : 'default'}
          delay={2}
        />
        <StatCard
          title="Total Boards Available"
          value={totalBoards}
          icon={<TrendingUp className="h-6 w-6" />}
          variant="primary"
          delay={3}
        />
      </div>

      {/* Refresh button */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          isLoading={isFetching}
          leftIcon={<RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />}
        >
          Refresh Analysis
        </Button>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Can Make Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success/20">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <h2 className="text-lg font-bold font-display">Ready to Make</h2>
            <span className="text-sm text-base-content/60">({analysis.canMakeCount})</span>
          </div>

          <div className="space-y-3">
            {analysis.canMake.length === 0 ? (
              <Card padding="lg" className="text-center">
                <p className="text-base-content/60">
                  No boards can be made with current inventory
                </p>
              </Card>
            ) : (
              analysis.canMake.map((board, index) => (
                <BoardProductionCard key={board.recipeId} board={board} index={index} />
              ))
            )}
          </div>
        </div>

        {/* Cannot Make Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-error/20">
              <XCircle className="h-5 w-5 text-error" />
            </div>
            <h2 className="text-lg font-bold font-display">Missing Ingredients</h2>
            <span className="text-sm text-base-content/60">({analysis.cannotMakeCount})</span>
          </div>

          <div className="space-y-3">
            {analysis.cannotMake.length === 0 ? (
              <Card padding="lg" className="text-center bg-success/5 border border-success/20">
                <p className="text-success font-medium">
                  All boards can be made! 🎉
                </p>
              </Card>
            ) : (
              analysis.cannotMake.map((board, index) => (
                <MissingIngredientsCard key={board.recipeId} board={board} index={index} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Last updated */}
      <div className="text-center text-sm text-base-content/50">
        Last updated: {new Date(analysis.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}
