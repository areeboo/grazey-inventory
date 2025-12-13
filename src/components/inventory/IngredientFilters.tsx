'use client';

import { Search, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Dropdown';
import { useIngredientStore } from '@/stores/ingredientStore';
import { ingredientCategories } from '@/lib/utils/validations';

interface IngredientFiltersProps {
  className?: string;
}

export function IngredientFilters({ className }: IngredientFiltersProps) {
  const filters = useIngredientStore((state) => state.filters);
  const setFilter = useIngredientStore((state) => state.setFilter);
  const resetFilters = useIngredientStore((state) => state.resetFilters);

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...ingredientCategories.map((cat) => ({ value: cat, label: cat })),
  ];

  const hasActiveFilters = filters.search || filters.category !== 'all' || filters.showLowStock;

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row gap-3 p-4 bg-base-100 rounded-2xl border border-base-200',
        className
      )}
    >
      {/* Search */}
      <div className="flex-1">
        <Input
          placeholder="Search ingredients..."
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          rightIcon={
            filters.search ? (
              <button
                onClick={() => setFilter('search', '')}
                className="hover:text-error transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            ) : undefined
          }
          inputSize="sm"
          className="max-w-md"
        />
      </div>

      {/* Category Filter */}
      <Select
        options={categoryOptions}
        value={filters.category}
        onChange={(value) => setFilter('category', value)}
        className="w-full sm:w-48"
      />

      {/* Low Stock Toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.showLowStock}
          onChange={(e) => setFilter('showLowStock', e.target.checked)}
          className="checkbox checkbox-primary checkbox-sm"
        />
        <span className="text-sm font-medium whitespace-nowrap">Low Stock Only</span>
      </label>

      {/* Reset Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          leftIcon={<X className="h-4 w-4" />}
        >
          Clear
        </Button>
      )}
    </div>
  );
}
