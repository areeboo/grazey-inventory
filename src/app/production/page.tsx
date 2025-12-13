'use client';

import { PageLayout, PageHeader } from '@/components/common';
import { ProductionAnalysisPanel } from '@/components/production';

export default function ProductionPage() {
  return (
    <PageLayout>
      <PageHeader
        title="Production Analysis"
        description="See what boards you can make with current inventory"
      />

      <ProductionAnalysisPanel />
    </PageLayout>
  );
}
