'use client';

import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, Edit, Trash2, Info, ChevronDown, ChevronUp, ChevronsUpDown, ChevronsDownUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SkeletonTable, NoIngredientsState } from '@/components/ui';
import { QuantityAdjuster, CategoryBadge, StockStatus } from '@/components/common';
import { useIngredientStore } from '@/stores/ingredientStore';
import { useModal } from '@/stores/uiStore';
import { useIngredients, useAdjustIngredient } from '@/hooks/useIngredients';
import { useRecipes } from '@/hooks/useRecipes';
import type { Ingredient } from '@/types/ingredient';

export function IngredientTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const { isLoading, error, refetch } = useIngredients();
  const { data: recipes = [] } = useRecipes({ isActive: true });
  const ingredients = useIngredientStore((state) => state.ingredients);
  const filters = useIngredientStore((state) => state.filters);

  const toggleExpanded = (ingredientId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(ingredientId)) {
        newSet.delete(ingredientId);
      } else {
        newSet.add(ingredientId);
      }
      return newSet;
    });
  };

  // Get IDs of ingredients with more than 2 board associations
  const expandableIngredientIds = useMemo(() => {
    return ingredients
      .filter((ing) => {
        const boardCount = recipes.filter((recipe) =>
          recipe.ingredients.some((r) => r.ingredientId === ing._id)
        ).length;
        return boardCount > 2;
      })
      .map((ing) => ing._id);
  }, [ingredients, recipes]);

  const allExpanded = expandableIngredientIds.length > 0 &&
    expandableIngredientIds.every((id) => expandedRows.has(id));

  const toggleExpandAll = () => {
    if (allExpanded) {
      setExpandedRows(new Set());
    } else {
      setExpandedRows(new Set(expandableIngredientIds));
    }
  };
  const filteredIngredients = useMemo(() => {
    return ingredients.filter((ing) => {
      // Search filter
      if (filters.search && !ing.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      // Category filter
      if (filters.category !== 'all' && ing.category !== filters.category) {
        return false;
      }
      // Low stock filter
      if (filters.showLowStock && ing.currentQuantity >= ing.lowStockThreshold) {
        return false;
      }
      return true;
    });
  }, [ingredients, filters]);
  const adjustIngredient = useAdjustIngredient();
  const { open: openEdit } = useModal('editIngredient');
  const { open: openDelete } = useModal('deleteIngredient');
  const { open: openAdd } = useModal('addIngredient');

  const handleAdjust = (id: string, adjustment: number, operation: 'increment' | 'decrement' | 'set') => {
    adjustIngredient.mutate({ id, input: { adjustment, operation } });
  };

  const columns = useMemo<ColumnDef<Ingredient>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-3"
          >
            Name
            <ArrowUpDown className="ml-1 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.getValue('name')}</span>
        ),
      },
      {
        accessorKey: 'category',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-3"
          >
            Category
            <ArrowUpDown className="ml-1 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <CategoryBadge category={row.getValue('category')} size="sm" />
        ),
      },
      {
        accessorKey: 'currentQuantity',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-3"
          >
            Quantity
            <ArrowUpDown className="ml-1 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const ingredient = row.original;
          return (
            <QuantityAdjuster
              value={ingredient.currentQuantity}
              onChange={(value) => handleAdjust(ingredient._id, value, 'set')}
              unit={ingredient.unit}
              size="sm"
              step={1}
            />
          );
        },
      },
      {
        accessorKey: 'unit',
        header: 'Unit',
        cell: ({ row }) => (
          <span className="text-base-content/70">{row.getValue('unit')}</span>
        ),
      },
      {
        accessorKey: 'lowStockThreshold',
        header: 'Threshold',
        cell: ({ row }) => (
          <span className="text-base-content/70">{row.getValue('lowStockThreshold')}</span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const ingredient = row.original;
          return (
            <StockStatus
              currentQuantity={ingredient.currentQuantity}
              threshold={ingredient.lowStockThreshold}
            />
          );
        },
      },
      {
        id: 'boards',
        header: () => (
          <div className="flex items-center gap-1.5">
            <span>Boards</span>
            <div className="group/tooltip relative">
              <Info className="h-3.5 w-3.5 text-base-content/40 hover:text-base-content/70 cursor-help" />
              <div className="absolute left-0 top-full mt-1 hidden group-hover/tooltip:block z-50 w-64">
                <div className="bg-base-content text-base-100 text-xs rounded-lg px-3 py-2 shadow-lg">
                  Shows which boards include this ingredient
                </div>
              </div>
            </div>
            {expandableIngredientIds.length > 0 && (
              <button
                type="button"
                onClick={toggleExpandAll}
                className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-base-content/50 hover:text-base-content/80 hover:bg-base-200 transition-colors"
              >
                {allExpanded ? (
                  <>
                    <ChevronsDownUp className="h-3 w-3" />
                    <span>Collapse</span>
                  </>
                ) : (
                  <>
                    <ChevronsUpDown className="h-3 w-3" />
                    <span>Expand</span>
                  </>
                )}
              </button>
            )}
          </div>
        ),
        cell: ({ row }) => {
          const ingredient = row.original;
          const associatedBoards = recipes.filter((recipe) =>
            recipe.ingredients.some((ing) => ing.ingredientId === ingredient._id)
          );
          const isEmpty = associatedBoards.length === 0;
          const isExpanded = expandedRows.has(ingredient._id);
          const hasMoreThanTwo = associatedBoards.length > 2;
          const hiddenCount = associatedBoards.length - 2;

          return (
            <div className="flex items-center gap-2 min-w-[180px] max-w-[350px]">
              <div className="flex-1 flex flex-wrap gap-1.5 items-center">
                {isEmpty ? (
                  <span className="text-xs text-base-content/40 italic">
                    None
                  </span>
                ) : (
                  <>
                    {/* Show first 2 boards, or all if expanded */}
                    {associatedBoards.slice(0, isExpanded ? associatedBoards.length : 2).map((board) => (
                      <span
                        key={board._id}
                        className="px-2 py-0.5 text-xs bg-base-200/80 rounded-full whitespace-nowrap"
                      >
                        {board.name}
                      </span>
                    ))}
                    {/* Expand button - show when collapsed and has more than 2 */}
                    {!isExpanded && hasMoreThanTwo && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(ingredient._id);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full whitespace-nowrap font-semibold active:scale-95 transition-all cursor-pointer"
                        style={{
                          backgroundColor: '#3b82f6',
                          color: '#ffffff',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                        }}
                      >
                        +{hiddenCount} more
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    )}
                    {/* Collapse button - show when expanded and has more than 2 */}
                    {isExpanded && hasMoreThanTwo && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(ingredient._id);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full whitespace-nowrap font-semibold active:scale-95 transition-all cursor-pointer"
                        style={{
                          backgroundColor: '#e5e7eb',
                          color: '#374151'
                        }}
                      >
                        Show less
                        <ChevronUp className="h-3 w-3" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const ingredient = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => openEdit(ingredient)}
                title="Edit ingredient"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => openDelete(ingredient)}
                className="text-error hover:bg-error hover:text-white"
                title="Delete ingredient"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [openEdit, openDelete, recipes, expandedRows, toggleExpanded, expandableIngredientIds, allExpanded, toggleExpandAll]
  );

  const table = useReactTable({
    data: filteredIngredients,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (isLoading) {
    return <SkeletonTable rows={8} />;
  }

  if (error) {
    return (
      <Card padding="lg" className="text-center">
        <p className="text-error mb-4">Failed to load ingredients</p>
        <Button variant="primary" onClick={() => refetch()}>
          Try Again
        </Button>
      </Card>
    );
  }

  if (filteredIngredients.length === 0) {
    return <NoIngredientsState onAdd={() => openAdd()} />;
  }

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead className="bg-base-200/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-base-content/70 font-semibold text-sm whitespace-nowrap"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            <AnimatePresence>
              {table.getRowModel().rows.map((row, index) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className="group hover:bg-base-200/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Table footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-base-200 bg-base-100">
        <p className="text-sm text-base-content/60">
          Showing {filteredIngredients.length} ingredient{filteredIngredients.length !== 1 ? 's' : ''}
        </p>
      </div>
    </Card>
  );
}
