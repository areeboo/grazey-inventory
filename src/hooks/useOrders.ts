'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { useToast } from '@/stores/uiStore';
import { useOrderStore } from '@/stores/orderStore';
import type { Order, OrderStatus, CreateOrderInput } from '@/types/order';

// API functions
async function fetchOrders(filters?: { status?: OrderStatus | 'all' }): Promise<Order[]> {
  const params = new URLSearchParams();
  if (filters?.status && filters.status !== 'all') {
    params.append('status', filters.status);
  }

  const url = `/api/orders${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch orders');
  }

  const data = await response.json();
  return data.data || data;
}

async function fetchOrder(id: string): Promise<Order> {
  const response = await fetch(`/api/orders/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch order');
  }

  const data = await response.json();
  return data.data || data;
}

async function createOrder(input: CreateOrderInput): Promise<Order> {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    if (error.insufficientIngredients) {
      const ingList = error.insufficientIngredients
        .map((i: { name: string }) => i.name)
        .join(', ');
      throw new Error(`Insufficient ingredients: ${ingList}`);
    }
    throw new Error(error.error || 'Failed to create order');
  }

  const data = await response.json();
  return data.data || data;
}

async function completeOrder(id: string): Promise<Order> {
  const response = await fetch(`/api/orders/${id}/complete`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to complete order');
  }

  const data = await response.json();
  return data.data || data;
}

async function cancelOrder(id: string): Promise<Order> {
  const response = await fetch(`/api/orders/${id}/cancel`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to cancel order');
  }

  const data = await response.json();
  return data.data || data;
}

// Query hooks
export function useOrders(filters?: { status?: OrderStatus | 'all' }) {
  const setOrders = useOrderStore((state) => state.setOrders);

  const query = useQuery({
    queryKey: queryKeys.orders.list(filters),
    queryFn: () => fetchOrders(filters),
  });

  // Sync data to Zustand store when it changes (outside of render)
  useEffect(() => {
    if (query.data) {
      setOrders(query.data);
    }
  }, [query.data, setOrders]);

  return query;
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => fetchOrder(id),
    enabled: !!id,
  });
}

export function useActiveOrdersCount() {
  const { data: orders } = useOrders();
  return orders?.filter((o) => o.status === 'in-progress').length ?? 0;
}

// Mutation hooks
export function useCreateOrder() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const addOrder = useOrderStore((state) => state.addOrder);

  return useMutation({
    mutationFn: createOrder,
    onSuccess: (data) => {
      addOrder(data);
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.ingredients.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.analysis });
      toast.success(`Order ${data.orderNumber} created!`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useCompleteOrder() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const updateOrder = useOrderStore((state) => state.updateOrder);

  return useMutation({
    mutationFn: completeOrder,
    onSuccess: (data) => {
      updateOrder(data._id, data);
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      toast.success(`Order ${data.orderNumber} completed!`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const updateOrder = useOrderStore((state) => state.updateOrder);

  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: (data) => {
      updateOrder(data._id, data);
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.ingredients.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.analysis });
      toast.success(`Order ${data.orderNumber} cancelled. Ingredients restored.`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
