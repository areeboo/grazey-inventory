'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Dropdown';
import { Button } from '@/components/ui/Button';
import { useHistoryStore } from '@/stores/historyStore';
import type { ActivityType } from '@/types/activity';

const typeOptions: { value: ActivityType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Events' },
  { value: 'ingredient_adjustment', label: 'Stock Adjustments' },
  { value: 'ingredient_created', label: 'Ingredients Added' },
  { value: 'ingredient_deleted', label: 'Ingredients Deleted' },
  { value: 'order_created', label: 'Orders Created' },
  { value: 'order_completed', label: 'Orders Completed' },
  { value: 'order_cancelled', label: 'Orders Cancelled' },
  { value: 'low_stock_alert', label: 'Low Stock Alerts' },
];

interface HistoryFiltersProps {
  className?: string;
}

export function HistoryFilters({ className }: HistoryFiltersProps) {
  const filters = useHistoryStore((state) => state.filters);
  const setFilter = useHistoryStore((state) => state.setFilter);
  const resetFilters = useHistoryStore((state) => state.resetFilters);

  const hasActiveFilters =
    filters.type !== 'all' || filters.startDate || filters.endDate || filters.search;

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row gap-3 p-4 bg-base-100 rounded-2xl border border-base-200',
        className
      )}
    >
      {/* Event Type Filter */}
      <Select
        options={typeOptions}
        value={filters.type}
        onChange={(value) => setFilter('type', value as ActivityType | 'all')}
        className="w-full sm:w-48"
      />

      {/* Date Filters */}
      <Input
        type="date"
        placeholder="Start Date"
        value={filters.startDate || ''}
        onChange={(e) => setFilter('startDate', e.target.value || null)}
        inputSize="sm"
        className="w-full sm:w-40"
      />

      <Input
        type="date"
        placeholder="End Date"
        value={filters.endDate || ''}
        onChange={(e) => setFilter('endDate', e.target.value || null)}
        inputSize="sm"
        className="w-full sm:w-40"
      />

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
