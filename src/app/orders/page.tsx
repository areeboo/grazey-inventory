'use client';

import { Plus } from 'lucide-react';
import { PageLayout, PageHeader } from '@/components/common';
import { Button } from '@/components/ui/Button';
import { useModal } from '@/stores/uiStore';
import {
  OrdersList,
  OrderFilters,
  CreateOrderModal,
} from '@/components/orders';

export default function OrdersPage() {
  const { open: openCreateModal } = useModal('createOrder');

  return (
    <PageLayout>
      <PageHeader
        title="Orders"
        description="Manage your board orders"
        actions={
          <Button
            variant="primary"
            leftIcon={<Plus className="h-5 w-5" />}
            onClick={() => openCreateModal()}
          >
            Create Order
          </Button>
        }
      />

      <div className="space-y-6">
        <OrderFilters />
        <OrdersList />
      </div>

      {/* Modals */}
      <CreateOrderModal />
    </PageLayout>
  );
}
