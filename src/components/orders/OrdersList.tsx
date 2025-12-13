'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { SkeletonCard, NoOrdersState } from '@/components/ui';
import { OrderCard } from './OrderCard';
import { useOrderStore } from '@/stores/orderStore';
import { useOrders } from '@/hooks/useOrders';
import { useModal } from '@/stores/uiStore';

interface OrdersListProps {
  className?: string;
}

export function OrdersList({ className }: OrdersListProps) {
  const { isLoading, error, refetch } = useOrders();
  const getFilteredOrders = useOrderStore((state) => state.filteredOrders);
  const filteredOrders = useMemo(() => getFilteredOrders(), [getFilteredOrders]);
  const { open: openCreate } = useModal('createOrder');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error mb-4">Failed to load orders</p>
        <button onClick={() => refetch()} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (filteredOrders.length === 0) {
    return <NoOrdersState onCreate={() => openCreate()} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}
    >
      {filteredOrders.map((order, index) => (
        <OrderCard key={order._id} order={order} index={index} />
      ))}
    </motion.div>
  );
}
