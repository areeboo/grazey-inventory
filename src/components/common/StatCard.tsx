'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Card } from '@/components/ui/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  change?: {
    value: number;
    label?: string;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  className?: string;
  delay?: number;
}

const variantStyles = {
  default: 'bg-base-100',
  primary: 'bg-gradient-to-br from-blue-500 to-blue-700 text-white',
  success: 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white',
  warning: 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900',
  error: 'bg-gradient-to-br from-red-500 to-red-700 text-white',
};

export function StatCard({
  title,
  value,
  icon,
  change,
  variant = 'default',
  className,
  delay = 0,
}: StatCardProps) {
  const isPositiveChange = change && change.value > 0;
  const isNegativeChange = change && change.value < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay * 0.1 }}
    >
      <Card
        variant="elevated"
        padding="lg"
        rounded="bubble"
        hover="lift"
        className={cn(variantStyles[variant], 'relative overflow-hidden', className)}
      >
        {/* Background decoration */}
        {variant !== 'default' && (
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
        )}

        <div className="relative flex items-start justify-between">
          <div className="space-y-2">
            <p
              className={cn(
                'text-sm font-medium',
                variant === 'default' ? 'text-base-content/60' : 'text-white/80'
              )}
            >
              {title}
            </p>
            <p className="text-3xl font-bold font-display">{value}</p>
            {change && (
              <div className="flex items-center gap-1">
                {isPositiveChange && <TrendingUp className="h-4 w-4 text-success" />}
                {isNegativeChange && <TrendingDown className="h-4 w-4 text-error" />}
                <span
                  className={cn(
                    'text-sm font-medium',
                    isPositiveChange && 'text-success',
                    isNegativeChange && 'text-error',
                    !isPositiveChange && !isNegativeChange && 'text-base-content/60'
                  )}
                >
                  {change.value > 0 ? '+' : ''}
                  {change.value}
                  {change.label && ` ${change.label}`}
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div
              className={cn(
                'p-3 rounded-xl',
                variant === 'default' ? 'bg-base-200' : 'bg-white/20'
              )}
            >
              {icon}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
