'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EventTypeIcon } from '@/components/history/EventTypeIcon';
import type { Activity } from '@/types/activity';

interface RecentActivityProps {
  activities: Activity[];
  className?: string;
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

function getActivityTitle(activity: Activity): string {
  switch (activity.type) {
    case 'ingredient_adjustment':
      return `${activity.ingredientName} adjusted`;
    case 'ingredient_created':
      return `${activity.ingredientName} added`;
    case 'ingredient_deleted':
      return `${activity.ingredientName} deleted`;
    case 'order_created':
      return `Order ${activity.orderNumber} created`;
    case 'order_completed':
      return `Order ${activity.orderNumber} completed`;
    case 'order_cancelled':
      return `Order ${activity.orderNumber} cancelled`;
    case 'low_stock_alert':
      return `Low stock: ${activity.ingredientName}`;
    default:
      return 'Activity';
  }
}

export function RecentActivity({ activities, className }: RecentActivityProps) {
  const recentActivities = activities.slice(0, 10);

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-info" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {recentActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="bg-base-200 rounded-full p-3 mb-3">
              <Clock className="h-8 w-8 text-base-content/30" />
            </div>
            <p className="font-medium text-base-content/60">No Activity Yet</p>
            <p className="text-sm text-base-content/40 mt-1">
              Actions will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2">
            {recentActivities.map((activity, index) => (
              <motion.div
                key={activity._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200/50 transition-colors"
              >
                <EventTypeIcon
                  type={activity.type}
                  adjustment={activity.adjustment}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {getActivityTitle(activity)}
                  </p>
                </div>
                <span className="text-xs text-base-content/50 shrink-0">
                  {formatTimestamp(activity.timestamp)}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
      <div className="p-4 pt-0">
        <Link href="/history">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            View Full History
          </Button>
        </Link>
      </div>
    </Card>
  );
}
