import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
      refetchOnMount: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Query keys for consistent cache management
export const queryKeys = {
  ingredients: {
    all: ['ingredients'] as const,
    list: (filters?: Record<string, unknown>) => ['ingredients', 'list', filters] as const,
    detail: (id: string) => ['ingredients', 'detail', id] as const,
    lowStock: ['ingredients', 'lowStock'] as const,
  },
  recipes: {
    all: ['recipes'] as const,
    list: (filters?: Record<string, unknown>) => ['recipes', 'list', filters] as const,
    detail: (id: string) => ['recipes', 'detail', id] as const,
    analysis: ['recipes', 'analysis'] as const,
  },
  orders: {
    all: ['orders'] as const,
    list: (filters?: Record<string, unknown>) => ['orders', 'list', filters] as const,
    detail: (id: string) => ['orders', 'detail', id] as const,
    active: ['orders', 'active'] as const,
  },
  history: {
    all: ['history'] as const,
    list: (filters?: Record<string, unknown>) => ['history', 'list', filters] as const,
    recent: (count: number) => ['history', 'recent', count] as const,
  },
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
  },
  shoppingList: {
    generated: ['shoppingList', 'generated'] as const,
  },
} as const;
