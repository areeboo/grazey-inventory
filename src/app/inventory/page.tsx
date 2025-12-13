'use client';

import { Plus } from 'lucide-react';
import { PageLayout, PageHeader } from '@/components/common';
import { Button } from '@/components/ui/Button';
import { useModal } from '@/stores/uiStore';
import {
  IngredientTable,
  IngredientFilters,
  AddIngredientModal,
  EditIngredientModal,
  DeleteIngredientModal,
} from '@/components/inventory';

export default function InventoryPage() {
  const { open: openAddModal } = useModal('addIngredient');

  return (
    <PageLayout>
      <PageHeader
        title="Inventory"
        description="Manage your ingredients and stock levels"
        actions={
          <Button
            variant="primary"
            leftIcon={<Plus className="h-5 w-5" />}
            onClick={() => openAddModal()}
          >
            Add Ingredient
          </Button>
        }
      />

      <div className="space-y-4">
        <IngredientFilters />
        <IngredientTable />
      </div>

      {/* Modals */}
      <AddIngredientModal />
      <EditIngredientModal />
      <DeleteIngredientModal />
    </PageLayout>
  );
}
