'use client';

import { useQuery } from '@tanstack/react-query';
import type { Ingredient } from '@/types/ingredient';
import type { Order } from '@/types/order';
import type { Activity } from '@/types/activity';
import type { ProductionAnalysis } from '@/types/recipe';

interface DashboardData {
  ingredients: Ingredient[];
  orders: Order[];
  activities: Activity[];
  productionAnalysis: ProductionAnalysis | null;
  stats: {
    totalIngredients: number;
    lowStockCount: number;
    activeOrders: number;
    boardsCanMake: number;
  };
}

async function fetchDashboardData(): Promise<DashboardData> {
  // Fetch all data in parallel
  const [ingredientsRes, ordersRes, activitiesRes, productionRes] = await Promise.all([
    fetch('/api/ingredients'),
    fetch('/api/orders?status=in-progress'),
    fetch('/api/history?limit=10'),
    fetch('/api/recipes/analysis'),
  ]);

  // Check for failed responses
  if (!ingredientsRes.ok) {
    throw new Error(`Failed to fetch ingredients: ${ingredientsRes.status} ${ingredientsRes.statusText}`);
  }
  if (!ordersRes.ok) {
    throw new Error(`Failed to fetch orders: ${ordersRes.status} ${ordersRes.statusText}`);
  }
  if (!activitiesRes.ok) {
    throw new Error(`Failed to fetch activities: ${activitiesRes.status} ${activitiesRes.statusText}`);
  }
  if (!productionRes.ok) {
    throw new Error(`Failed to fetch production analysis: ${productionRes.status} ${productionRes.statusText}`);
  }

  const [ingredientsData, ordersData, activitiesData, productionData] = await Promise.all([
    ingredientsRes.json(),
    ordersRes.json(),
    activitiesRes.json(),
    productionRes.json(),
  ]);

  const ingredients: Ingredient[] = ingredientsData.data || [];
  const orders: Order[] = ordersData.data || [];
  const activities: Activity[] = activitiesData.data || [];
  const productionAnalysis: ProductionAnalysis | null = productionData.data || null;

  // Calculate stats
  const lowStockCount = ingredients.filter(
    (ing) => ing.currentQuantity < ing.lowStockThreshold
  ).length;

  const boardsCanMake = productionAnalysis?.canMake?.length || 0;

  return {
    ingredients,
    orders,
    activities,
    productionAnalysis,
    stats: {
      totalIngredients: ingredients.length,
      lowStockCount,
      activeOrders: orders.length,
      boardsCanMake,
    },
  };
}

export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    refetchInterval: 60000, // Refresh every 60 seconds
    staleTime: 30000, // Consider stale after 30 seconds
  });
}
