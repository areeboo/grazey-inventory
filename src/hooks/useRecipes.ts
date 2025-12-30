'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { useToast } from '@/stores/uiStore';
import { useRecipeStore } from '@/stores/recipeStore';
import type { Recipe, ProductionAnalysis, RecipeCategory, CreateRecipeInput, UpdateRecipeInput } from '@/types/recipe';

// API functions
async function fetchRecipes(filters?: { category?: string; isActive?: boolean }): Promise<Recipe[]> {
  const params = new URLSearchParams();
  if (filters?.category && filters.category !== 'all') {
    params.append('category', filters.category);
  }
  if (filters?.isActive !== undefined) {
    params.append('isActive', String(filters.isActive));
  }

  const url = `/api/recipes${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch recipes');
  }

  const data = await response.json();
  return data.data || data;
}

async function fetchRecipe(id: string): Promise<Recipe> {
  const response = await fetch(`/api/recipes/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch recipe');
  }

  const data = await response.json();
  return data.data || data;
}

async function fetchProductionAnalysis(): Promise<ProductionAnalysis> {
  const response = await fetch('/api/recipes/analysis');

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch production analysis');
  }

  return response.json();
}

// Query hooks
export function useRecipes(filters?: { category?: string; isActive?: boolean }) {
  const setRecipes = useRecipeStore((state) => state.setRecipes);

  const query = useQuery({
    queryKey: queryKeys.recipes.list(filters),
    queryFn: () => fetchRecipes(filters),
  });

  // Sync data to Zustand store when it changes (outside of render)
  useEffect(() => {
    if (query.data) {
      setRecipes(query.data);
    }
  }, [query.data, setRecipes]);

  return query;
}

export function useRecipe(id: string) {
  return useQuery({
    queryKey: queryKeys.recipes.detail(id),
    queryFn: () => fetchRecipe(id),
    enabled: !!id,
  });
}

export function useProductionAnalysis() {
  return useQuery({
    queryKey: queryKeys.recipes.analysis,
    queryFn: fetchProductionAnalysis,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

// Get recipes grouped by category
export function useRecipesByCategory() {
  const { data: recipes, ...rest } = useRecipes();

  const grouped = recipes?.reduce(
    (acc, recipe) => {
      if (!acc[recipe.category]) {
        acc[recipe.category] = [];
      }
      acc[recipe.category].push(recipe);
      return acc;
    },
    {} as Record<RecipeCategory, Recipe[]>
  );

  return {
    data: grouped,
    recipes,
    ...rest,
  };
}

// Helper hook to get makeable boards count
export function useMakeableBoardsCount() {
  const { data: analysis } = useProductionAnalysis();
  return analysis?.canMakeCount ?? 0;
}

// API function to update a recipe
async function updateRecipe(id: string, input: UpdateRecipeInput): Promise<Recipe> {
  const response = await fetch(`/api/recipes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update recipe');
  }

  const data = await response.json();
  return data.data || data;
}

// Mutation hook to update a recipe
export function useUpdateRecipe() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateRecipeInput }) =>
      updateRecipe(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.analysis });
      toast.success('Recipe updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update recipe');
    },
  });
}

// API function to create a recipe
async function createRecipe(input: CreateRecipeInput): Promise<Recipe> {
  const response = await fetch('/api/recipes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create recipe');
  }

  const data = await response.json();
  return data.data || data;
}

// Mutation hook to create a recipe
export function useCreateRecipe() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: createRecipe,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.analysis });
      toast.success(`${data.name} board created successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create recipe');
    },
  });
}

// API function to delete a recipe
async function deleteRecipe(id: string): Promise<void> {
  const response = await fetch(`/api/recipes/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete recipe');
  }
}

// Mutation hook to delete a recipe
export function useDeleteRecipe() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: deleteRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.analysis });
      toast.success('Board deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete recipe');
    },
  });
}
