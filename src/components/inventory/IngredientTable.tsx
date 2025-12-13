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
import { ArrowUpDown, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SkeletonTable, NoIngredientsState } from '@/components/ui';
import { QuantityAdjuster, CategoryBadge, StockStatus } from '@/components/common';
import { useIngredientStore } from '@/stores/ingredientStore';
import { useModal } from '@/stores/uiStore';
import { useIngredients, useAdjustIngredient } from '@/hooks/useIngredients';
import type { Ingredient } from '@/types/ingredient';

export function IngredientTable() {
  const [sorting, setSorting] = useState<SortingState>([]);

  const { isLoading, error, refetch } = useIngredients();
  const ingredients = useIngredientStore((state) => state.ingredients);
  const filters = useIngredientStore((state) => state.filters);
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
        header: 'Category',
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
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => openDelete(ingredient)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-error hover:bg-error hover:text-white"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [openEdit, openDelete]
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
                    className="text-base-content/70 font-semibold text-sm"
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
