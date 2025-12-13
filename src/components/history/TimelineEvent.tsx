'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { EventTypeIcon } from './EventTypeIcon';
import type { Activity, ActivityType } from '@/types/activity';

interface TimelineEventProps {
  activity: Activity;
  index?: number;
  className?: string;
}

function getEventDescription(activity: Activity): { title: string; detail: string } {
  switch (activity.type) {
    case 'ingredient_adjustment':
      const adjustment = activity.adjustment || 0;
      const direction = adjustment >= 0 ? 'increased' : 'decreased';
      const absAdjustment = Math.abs(adjustment);
      const changeText = adjustment >= 0 ? `+${absAdjustment}` : `-${absAdjustment}`;
      return {
        title: `${activity.ingredientName} ${direction}`,
        detail: `${activity.oldQuantity} → ${activity.newQuantity} (${changeText})`,
      };

    case 'ingredient_created':
      return {
        title: `${activity.ingredientName} added`,
        detail: `Initial quantity: ${activity.newQuantity}`,
      };

    case 'ingredient_deleted':
      return {
        title: `${activity.ingredientName} deleted`,
        detail: 'Removed from inventory',
      };

    case 'order_created':
      return {
        title: `Order ${activity.orderNumber} created`,
        detail: `${activity.orderQuantity}x ${activity.recipeName}`,
      };

    case 'order_completed':
      return {
        title: `Order ${activity.orderNumber} completed`,
        detail: `${activity.orderQuantity}x ${activity.recipeName}`,
      };

    case 'order_cancelled':
      return {
        title: `Order ${activity.orderNumber} cancelled`,
        detail: `${activity.orderQuantity}x ${activity.recipeName} - Ingredients restored`,
      };

    case 'low_stock_alert':
      return {
        title: `Low stock: ${activity.ingredientName}`,
        detail: `Current: ${activity.newQuantity}, Threshold: ${(activity.metadata as { threshold: number })?.threshold || 'N/A'}`,
      };

    default:
      return {
        title: 'Activity',
        detail: activity.type,
      };
  }
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

export function TimelineEvent({ activity, index = 0, className }: TimelineEventProps) {
  const { title, detail } = getEventDescription(activity);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className={cn('flex gap-4 py-4', className)}
    >
      <EventTypeIcon
        type={activity.type}
        adjustment={activity.adjustment}
        size="md"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-base-content">{title}</p>
            <p className="text-sm text-base-content/60">{detail}</p>
          </div>
          <span className="text-xs text-base-content/50 whitespace-nowrap">
            {formatTimestamp(activity.timestamp)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
