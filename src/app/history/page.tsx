'use client';

import { PageLayout, PageHeader } from '@/components/common';
import { Timeline, HistoryFilters } from '@/components/history';

export default function HistoryPage() {
  return (
    <PageLayout>
      <PageHeader
        title="History"
        description="View all activity and changes in your inventory"
      />

      <div className="space-y-4">
        <HistoryFilters />
        <Timeline />
      </div>
    </PageLayout>
  );
}
