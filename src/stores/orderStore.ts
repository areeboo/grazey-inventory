import { create } from 'zustand';
import type { Order, OrderStatus } from '@/types/order';

interface OrderFilters {
  status: OrderStatus | 'all';
  search: string;
}

interface OrderState {
  // Cache
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  removeOrder: (id: string) => void;
  addOrder: (order: Order) => void;

  // Filters
  filters: OrderFilters;
  setFilter: <K extends keyof OrderFilters>(key: K, value: OrderFilters[K]) => void;
  resetFilters: () => void;

  // Computed
  filteredOrders: () => Order[];
  orderById: (id: string) => Order | undefined;
  activeOrders: () => Order[];
  ordersByStatus: () => Record<OrderStatus | 'all', Order[]>;
  orderCounts: () => Record<OrderStatus | 'all', number>;
}

const initialFilters: OrderFilters = {
  status: 'all',
  search: '',
};

export const useOrderStore = create<OrderState>((set, get) => ({
  // Cache
  orders: [],
  setOrders: (orders) => set({ orders }),
  updateOrder: (id, updates) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order._id === id ? { ...order, ...updates } : order
      ),
    })),
  removeOrder: (id) =>
    set((state) => ({
      orders: state.orders.filter((order) => order._id !== id),
    })),
  addOrder: (order) =>
    set((state) => ({
      orders: [order, ...state.orders],
    })),

  // Filters
  filters: initialFilters,
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
  resetFilters: () => set({ filters: initialFilters }),

  // Computed
  filteredOrders: () => {
    const { orders, filters } = get();
    return orders.filter((order) => {
      // Search filter
      if (
        filters.search &&
        !order.orderNumber.toLowerCase().includes(filters.search.toLowerCase()) &&
        !order.recipeName.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }
      // Status filter
      if (filters.status !== 'all' && order.status !== filters.status) {
        return false;
      }
      return true;
    });
  },
  orderById: (id) => {
    const { orders } = get();
    return orders.find((order) => order._id === id);
  },
  activeOrders: () => {
    const { orders } = get();
    return orders.filter((order) => order.status === 'in-progress');
  },
  ordersByStatus: () => {
    const { orders } = get();
    const result: Record<OrderStatus | 'all', Order[]> = {
      all: orders,
      'in-progress': [],
      completed: [],
      cancelled: [],
    };
    orders.forEach((order) => {
      result[order.status].push(order);
    });
    return result;
  },
  orderCounts: () => {
    const { orders } = get();
    const counts: Record<OrderStatus | 'all', number> = {
      all: orders.length,
      'in-progress': 0,
      completed: 0,
      cancelled: 0,
    };
    orders.forEach((order) => {
      counts[order.status]++;
    });
    return counts;
  },
}));
