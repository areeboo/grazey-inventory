'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { Card } from '@/components/ui/Card';
import { SkeletonTable, EmptyState } from '@/components/ui';
import { TimelineEvent } from './TimelineEvent';
import { useHistoryStore } from '@/stores/historyStore';
import { useHistory } from '@/hooks/useHistory';

interface TimelineProps {
  className?: string;
}

export function Timeline({ className }: TimelineProps) {
  const filters = useHistoryStore((state) => state.filters);
  const { data, isLoading, error, refetch } = useHistory({
    type: filters.type === 'all' ? undefined : filters.type,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    limit: 50,
  });

  const activities = data?.data || [];

  if (isLoading) {
    return <SkeletonTable rows={8} />;
  }

  if (error) {
    return (
      <EmptyState
        type="error"
        title="Failed to load history"
        description="We had trouble loading the activity history."
        action={{ label: 'Try Again', onClick: () => refetch() }}
      />
    );
  }

  if (activities.length === 0) {
    return (
      <EmptyState
        type="empty"
        title="No Activity Yet"
        description="Activity will appear here as you manage your inventory and orders."
      />
    );
  }

  return (
    <Card padding="none" className={cn('divide-y divide-base-200', className)}>
      <div className="px-4">
        {activities.map((activity, index) => (
          <TimelineEvent
            key={activity._id}
            activity={activity}
            index={index}
          />
        ))}
      </div>

      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="p-4 text-center text-sm text-base-content/60">
          Showing {activities.length} of {data.pagination.total} events
        </div>
      )}
    </Card>
  );
}
