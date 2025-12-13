import { create } from 'zustand';
import type { Activity, ActivityType } from '@/types/activity';

interface HistoryFilters {
  type: ActivityType | 'all';
  search: string;
  startDate: string | null;
  endDate: string | null;
}

interface HistoryState {
  // Cache
  activities: Activity[];
  setActivities: (activities: Activity[]) => void;
  addActivity: (activity: Activity) => void;
  prependActivities: (activities: Activity[]) => void;

  // Filters
  filters: HistoryFilters;
  setFilter: <K extends keyof HistoryFilters>(key: K, value: HistoryFilters[K]) => void;
  resetFilters: () => void;

  // Pagination
  hasMore: boolean;
  setHasMore: (hasMore: boolean) => void;

  // Computed
  filteredActivities: () => Activity[];
  recentActivities: (count?: number) => Activity[];
  activitiesByType: () => Record<ActivityType, Activity[]>;
}

const initialFilters: HistoryFilters = {
  type: 'all',
  search: '',
  startDate: null,
  endDate: null,
};

export const useHistoryStore = create<HistoryState>((set, get) => ({
  // Cache
  activities: [],
  setActivities: (activities) => set({ activities }),
  addActivity: (activity) =>
    set((state) => ({
      activities: [activity, ...state.activities],
    })),
  prependActivities: (activities) =>
    set((state) => ({
      activities: [...activities, ...state.activities],
    })),

  // Filters
  filters: initialFilters,
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
  resetFilters: () => set({ filters: initialFilters }),

  // Pagination
  hasMore: true,
  setHasMore: (hasMore) => set({ hasMore }),

  // Computed
  filteredActivities: () => {
    const { activities, filters } = get();
    return activities.filter((activity) => {
      // Type filter
      if (filters.type !== 'all' && activity.type !== filters.type) {
        return false;
      }
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesIngredient = activity.ingredientName?.toLowerCase().includes(searchLower);
        const matchesOrder = activity.orderNumber?.toLowerCase().includes(searchLower);
        const matchesRecipe = activity.recipeName?.toLowerCase().includes(searchLower);
        if (!matchesIngredient && !matchesOrder && !matchesRecipe) {
          return false;
        }
      }
      // Date filters
      if (filters.startDate) {
        const activityDate = new Date(activity.timestamp);
        const startDate = new Date(filters.startDate);
        if (activityDate < startDate) {
          return false;
        }
      }
      if (filters.endDate) {
        const activityDate = new Date(activity.timestamp);
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        if (activityDate > endDate) {
          return false;
        }
      }
      return true;
    });
  },
  recentActivities: (count = 10) => {
    const { activities } = get();
    return activities.slice(0, count);
  },
  activitiesByType: () => {
    const { activities } = get();
    const result: Record<ActivityType, Activity[]> = {
      ingredient_adjustment: [],
      ingredient_created: [],
      ingredient_deleted: [],
      order_created: [],
      order_completed: [],
      order_cancelled: [],
      low_stock_alert: [],
    };
    activities.forEach((activity) => {
      result[activity.type].push(activity);
    });
    return result;
  },
}));
