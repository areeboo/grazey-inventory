'use client';

import { PageLayout, PageHeader } from '@/components/common';
import { RecipeGrid, CategoryFilter, RecipeDetailModal } from '@/components/boards';

export default function BoardsPage() {
  return (
    <PageLayout>
      <PageHeader
        title="Boards"
        description="Browse your charcuterie board recipes"
      />

      <div className="space-y-6">
        <CategoryFilter />
        <RecipeGrid />
      </div>

      {/* Modals */}
      <RecipeDetailModal />
    </PageLayout>
  );
}
