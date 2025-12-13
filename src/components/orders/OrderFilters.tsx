'use client';

import { useMemo } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { useOrderStore } from '@/stores/orderStore';
import type { OrderStatus } from '@/types/order';

const statusTabs: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Orders' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

interface OrderFiltersProps {
  className?: string;
}

export function OrderFilters({ className }: OrderFiltersProps) {
  const statusFilter = useOrderStore((state) => state.filters.status);
  const setFilter = useOrderStore((state) => state.setFilter);
  const getOrderCounts = useOrderStore((state) => state.orderCounts);
  const orderCounts = useMemo(() => getOrderCounts(), [getOrderCounts]);

  const tabsWithCounts = statusTabs.map((tab) => ({
    ...tab,
    count: orderCounts[tab.value],
  }));

  return (
    <Tabs
      tabs={tabsWithCounts}
      value={statusFilter}
      onChange={(value) => setFilter('status', value)}
      variant="pills"
      className={className}
    />
  );
}
