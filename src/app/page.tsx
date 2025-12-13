'use client';

import { motion } from 'framer-motion';
import { PageLayout } from '@/components/common/PageLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { SkeletonTable, EmptyState } from '@/components/ui';
import {
  DashboardStats,
  LowStockAlerts,
  RecentActivity,
  ProductionCapacity,
  QuickActions,
} from '@/components/dashboard';
import { useDashboardData } from '@/hooks/useDashboardData';

export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useDashboardData();

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader
          title="Dashboard"
          description="Welcome to Grazey Inventory"
        />
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-base-100 rounded-2xl animate-pulse"
              />
            ))}
          </div>
          <SkeletonTable rows={5} />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <PageHeader
          title="Dashboard"
          description="Welcome to Grazey Inventory"
        />
        <EmptyState
          type="error"
          title="Failed to load dashboard"
          description="We had trouble loading your data."
          action={{ label: 'Try Again', onClick: () => refetch() }}
        />
      </PageLayout>
    );
  }

  const { ingredients, activities, productionAnalysis, stats } = data!;

  return (
    <PageLayout>
      <PageHeader
        title="Dashboard"
        description="Welcome to Grazey Inventory"
      />

      {/* Stats Cards */}
      <DashboardStats
        totalIngredients={stats.totalIngredients}
        lowStockCount={stats.lowStockCount}
        activeOrders={stats.activeOrders}
        boardsCanMake={stats.boardsCanMake}
        className="mb-6"
      />

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <QuickActions />
      </motion.div>

      {/* Three Column Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Low Stock Alerts */}
        <LowStockAlerts ingredients={ingredients} />

        {/* Recent Activity */}
        <RecentActivity activities={activities} />

        {/* Production Capacity */}
        <ProductionCapacity
          boards={productionAnalysis?.canMake || []}
        />
      </motion.div>
    </PageLayout>
  );
}
