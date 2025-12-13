'use client';

import { motion } from 'framer-motion';
import { Calendar, Package, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OrderStatusBadge } from './OrderStatusBadge';
import { CategoryBadge, getCategoryEmoji } from '@/components/common/CategoryBadge';
import { ConfirmModal } from '@/components/ui/Modal';
import { useCompleteOrder, useCancelOrder } from '@/hooks/useOrders';
import { useState } from 'react';
import type { Order } from '@/types/order';
import type { RecipeCategory } from '@/types/recipe';

interface OrderCardProps {
  order: Order;
  index?: number;
  className?: string;
}

export function OrderCard({ order, index = 0, className }: OrderCardProps) {
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const completeOrder = useCompleteOrder();
  const cancelOrder = useCancelOrder();

  const handleComplete = async () => {
    await completeOrder.mutateAsync(order._id);
    setShowCompleteConfirm(false);
  };

  const handleCancel = async () => {
    await cancelOrder.mutateAsync(order._id);
    setShowCancelConfirm(false);
  };

  // Get category from recipe name (hacky but works for now)
  const getCategory = (): RecipeCategory => {
    if (order.recipeName.includes('Vegegrazian') || order.recipeName.toLowerCase().includes('vegetarian')) {
      return 'Vegetarian';
    }
    if (order.recipeName.includes('Sweet')) {
      return 'Sweet';
    }
    if (order.recipeName.includes('Keto')) {
      return 'Keto';
    }
    return 'Classic';
  };

  const category = getCategory();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Card
          variant="elevated"
          padding="md"
          rounded="lg"
          hover="lift"
          className={cn(
            'border-l-4',
            order.status === 'in-progress' && 'border-l-warning',
            order.status === 'completed' && 'border-l-success',
            order.status === 'cancelled' && 'border-l-base-300',
            className
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm text-base-content/60">
                  {order.orderNumber}
                </span>
                <OrderStatusBadge status={order.status} />
              </div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span>{getCategoryEmoji(category)}</span>
                {order.recipeName}
              </h3>
            </div>
            <CategoryBadge category={category} size="sm" />
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-base-content/70">
              <Package className="h-4 w-4" />
              <span>
                <strong className="text-base-content">{order.quantity}</strong> board{order.quantity > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-base-content/70">
              <Calendar className="h-4 w-4" />
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="mb-4 p-2 bg-base-200/50 rounded-lg text-sm">
              <p className="text-base-content/70">{order.notes}</p>
            </div>
          )}

          {/* Actions */}
          {order.status === 'in-progress' && (
            <div className="flex gap-2 pt-3 border-t border-base-200">
              <Button
                variant="success"
                size="sm"
                onClick={() => setShowCompleteConfirm(true)}
                leftIcon={<CheckCircle className="h-4 w-4" />}
                className="flex-1"
              >
                Complete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCancelConfirm(true)}
                leftIcon={<XCircle className="h-4 w-4" />}
                className="text-error hover:bg-error hover:text-white"
              >
                Cancel
              </Button>
            </div>
          )}

          {/* Completed/Cancelled timestamp */}
          {order.status === 'completed' && order.completedAt && (
            <div className="pt-3 border-t border-base-200 text-sm text-base-content/60">
              Completed: {new Date(order.completedAt).toLocaleString()}
            </div>
          )}
          {order.status === 'cancelled' && order.cancelledAt && (
            <div className="pt-3 border-t border-base-200 text-sm text-base-content/60">
              Cancelled: {new Date(order.cancelledAt).toLocaleString()}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Confirm Modals */}
      <ConfirmModal
        isOpen={showCompleteConfirm}
        onClose={() => setShowCompleteConfirm(false)}
        onConfirm={handleComplete}
        title="Complete Order"
        description={`Mark order ${order.orderNumber} as completed?`}
        confirmText="Complete"
        variant="info"
        isLoading={completeOrder.isPending}
      />

      <ConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancel}
        title="Cancel Order"
        description={`Cancel order ${order.orderNumber}? This will restore the debited ingredients back to inventory.`}
        confirmText="Cancel Order"
        variant="danger"
        isLoading={cancelOrder.isPending}
      />
    </>
  );
}
