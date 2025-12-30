'use client';

import { PageLayout, PageHeader } from '@/components/common';
import { RecipeGrid, CategoryFilter, RecipeDetailModal, AddBoardModal } from '@/components/boards';
import { Button } from '@/components/ui/Button';
import { useModal } from '@/stores/uiStore';
import { Plus } from 'lucide-react';

export default function BoardsPage() {
  const { open: openAddBoardModal } = useModal('addBoard');

  return (
    <PageLayout>
      <PageHeader
        title="Boards"
        description="Browse your charcuterie board recipes"
        actions={
          <Button onClick={() => openAddBoardModal()} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Board
          </Button>
        }
      />

      <div className="space-y-6">
        <CategoryFilter />
        <RecipeGrid />
      </div>

      {/* Modals */}
      <RecipeDetailModal />
      <AddBoardModal />
    </PageLayout>
  );
}
