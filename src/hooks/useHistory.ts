'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { useHistoryStore } from '@/stores/historyStore';
import type { Activity, ActivityType } from '@/types/activity';

interface HistoryFilters {
  type?: ActivityType | 'all';
  ingredientId?: string;
  orderId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
  [key: string]: string | number | undefined;
}

interface HistoryResponse {
  data: Activity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

async function fetchHistory(filters?: HistoryFilters): Promise<HistoryResponse> {
  const params = new URLSearchParams();

  if (filters?.type && filters.type !== 'all') {
    params.append('type', filters.type);
  }
  if (filters?.ingredientId) {
    params.append('ingredientId', filters.ingredientId);
  }
  if (filters?.orderId) {
    params.append('orderId', filters.orderId);
  }
  if (filters?.startDate) {
    params.append('startDate', filters.startDate);
  }
  if (filters?.endDate) {
    params.append('endDate', filters.endDate);
  }
  if (filters?.limit) {
    params.append('limit', String(filters.limit));
  }
  if (filters?.page) {
    params.append('page', String(filters.page));
  }

  const url = `/api/history${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch history');
  }

  return response.json();
}

export function useHistory(filters?: HistoryFilters) {
  const setActivities = useHistoryStore((state) => state.setActivities);

  return useQuery({
    queryKey: queryKeys.history.list(filters),
    queryFn: () => fetchHistory(filters),
    select: (data) => {
      setActivities(data.data);
      return data;
    },
  });
}

export function useRecentActivity(count: number = 10) {
  return useQuery({
    queryKey: queryKeys.history.recent(count),
    queryFn: () => fetchHistory({ limit: count }),
    select: (data) => data.data,
  });
}
