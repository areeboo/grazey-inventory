'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { useToast } from '@/stores/uiStore';
import { useIngredientStore } from '@/stores/ingredientStore';
import type { Ingredient, CreateIngredientInput, UpdateIngredientInput, AdjustIngredientInput } from '@/types/ingredient';

// API functions
async function fetchIngredients(filters?: { category?: string; isCustom?: boolean }): Promise<Ingredient[]> {
  const params = new URLSearchParams();
  if (filters?.category && filters.category !== 'all') {
    params.append('category', filters.category);
  }
  if (filters?.isCustom !== undefined) {
    params.append('isCustom', String(filters.isCustom));
  }

  const url = `/api/ingredients${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch ingredients');
  }

  const data = await response.json();
  return data.data || data;
}

async function fetchIngredient(id: string): Promise<Ingredient> {
  const response = await fetch(`/api/ingredients/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch ingredient');
  }

  const data = await response.json();
  return data.data || data;
}

async function createIngredient(input: CreateIngredientInput): Promise<Ingredient> {
  const response = await fetch('/api/ingredients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create ingredient');
  }

  const data = await response.json();
  return data.data || data;
}

async function updateIngredient({
  id,
  input,
}: {
  id: string;
  input: UpdateIngredientInput;
}): Promise<Ingredient> {
  const response = await fetch(`/api/ingredients/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update ingredient');
  }

  const data = await response.json();
  return data.data || data;
}

async function deleteIngredient(id: string): Promise<void> {
  const response = await fetch(`/api/ingredients/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete ingredient');
  }
}

async function adjustIngredient({
  id,
  input,
}: {
  id: string;
  input: AdjustIngredientInput;
}): Promise<Ingredient> {
  const response = await fetch(`/api/ingredients/${id}/adjust`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to adjust ingredient');
  }

  const data = await response.json();
  return data.data || data;
}

// Query hooks
export function useIngredients(filters?: { category?: string; isCustom?: boolean }) {
  const setIngredients = useIngredientStore((state) => state.setIngredients);

  const query = useQuery({
    queryKey: queryKeys.ingredients.list(filters),
    queryFn: () => fetchIngredients(filters),
  });

  // Sync data to Zustand store when it changes (outside of render)
  useEffect(() => {
    if (query.data) {
      setIngredients(query.data);
    }
  }, [query.data, setIngredients]);

  return query;
}

export function useIngredient(id: string) {
  return useQuery({
    queryKey: queryKeys.ingredients.detail(id),
    queryFn: () => fetchIngredient(id),
    enabled: !!id,
  });
}

export function useLowStockIngredients() {
  const { data: ingredients } = useIngredients();

  return ingredients?.filter(
    (ing) => ing.currentQuantity < ing.lowStockThreshold
  ) || [];
}

// Mutation hooks
export function useCreateIngredient() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const addIngredient = useIngredientStore((state) => state.addIngredient);

  return useMutation({
    mutationFn: createIngredient,
    onSuccess: (data) => {
      addIngredient(data);
      queryClient.invalidateQueries({ queryKey: queryKeys.ingredients.all });
      toast.success(`${data.name} added to inventory`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateIngredient() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const updateStoreIngredient = useIngredientStore((state) => state.updateIngredient);

  return useMutation({
    mutationFn: updateIngredient,
    onSuccess: (data) => {
      updateStoreIngredient(data._id, data);
      queryClient.invalidateQueries({ queryKey: queryKeys.ingredients.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.analysis });
      toast.success(`${data.name} updated`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteIngredient() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const removeIngredient = useIngredientStore((state) => state.removeIngredient);

  return useMutation({
    mutationFn: deleteIngredient,
    onMutate: async (id) => {
      // Optimistic update
      removeIngredient(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ingredients.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.analysis });
      toast.success('Ingredient deleted');
    },
    onError: (error: Error) => {
      // Refetch to restore state
      queryClient.invalidateQueries({ queryKey: queryKeys.ingredients.all });
      toast.error(error.message);
    },
  });
}

export function useAdjustIngredient() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const updateStoreIngredient = useIngredientStore((state) => state.updateIngredient);

  return useMutation({
    mutationFn: adjustIngredient,
    onMutate: async ({ id, input }) => {
      // Optimistic update
      const previousIngredient = useIngredientStore.getState().ingredientById(id);
      if (previousIngredient) {
        let newQuantity = previousIngredient.currentQuantity;
        if (input.operation === 'increment') {
          newQuantity += input.adjustment;
        } else if (input.operation === 'decrement') {
          newQuantity -= input.adjustment;
        } else {
          newQuantity = input.adjustment;
        }
        updateStoreIngredient(id, { currentQuantity: Math.max(0, newQuantity) });
      }
      return { previousIngredient };
    },
    onSuccess: (data) => {
      updateStoreIngredient(data._id, data);
      queryClient.invalidateQueries({ queryKey: queryKeys.ingredients.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.analysis });
    },
    onError: (error: Error, _, context) => {
      // Rollback on error
      if (context?.previousIngredient) {
        updateStoreIngredient(
          context.previousIngredient._id,
          { currentQuantity: context.previousIngredient.currentQuantity }
        );
      }
      toast.error(error.message);
    },
  });
}
