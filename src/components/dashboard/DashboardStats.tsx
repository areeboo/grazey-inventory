'use client';

import { Package, AlertTriangle, ClipboardList, ChefHat } from 'lucide-react';
import { StatCard } from '@/components/common/StatCard';
import { cn } from '@/lib/utils/cn';

interface DashboardStatsProps {
  totalIngredients: number;
  lowStockCount: number;
  activeOrders: number;
  boardsCanMake: number;
  className?: string;
}

export function DashboardStats({
  lowStockCount,
  activeOrders,
  boardsCanMake,
  className,
}: DashboardStatsProps) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-3 gap-4', className)}>
      <StatCard
        title="Low Stock Items"
        value={lowStockCount}
        icon={<AlertTriangle className="h-6 w-6" />}
        variant={lowStockCount > 0 ? 'warning' : 'success'}
        delay={0}
      />
      <StatCard
        title="Active Orders"
        value={activeOrders}
        icon={<ClipboardList className="h-6 w-6" />}
        variant="primary"
        delay={1}
      />
      <StatCard
        title="Boards Ready"
        value={boardsCanMake}
        icon={<ChefHat className="h-6 w-6" />}
        variant="success"
        delay={2}
      />
    </div>
  );
}
