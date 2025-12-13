import { create } from 'zustand';
import type { Recipe } from '@/types/recipe';

interface RecipeFilters {
  category: string;
  search: string;
}

interface RecipeState {
  // Cache
  recipes: Recipe[];
  setRecipes: (recipes: Recipe[]) => void;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
  removeRecipe: (id: string) => void;
  addRecipe: (recipe: Recipe) => void;

  // Filters
  filters: RecipeFilters;
  setFilter: <K extends keyof RecipeFilters>(key: K, value: RecipeFilters[K]) => void;
  resetFilters: () => void;

  // Computed
  filteredRecipes: () => Recipe[];
  recipeById: (id: string) => Recipe | undefined;
  recipesByCategory: () => Record<string, Recipe[]>;
}

const initialFilters: RecipeFilters = {
  category: 'all',
  search: '',
};

export const useRecipeStore = create<RecipeState>((set, get) => ({
  // Cache
  recipes: [],
  setRecipes: (recipes) => set({ recipes }),
  updateRecipe: (id, updates) =>
    set((state) => ({
      recipes: state.recipes.map((rec) =>
        rec._id === id ? { ...rec, ...updates } : rec
      ),
    })),
  removeRecipe: (id) =>
    set((state) => ({
      recipes: state.recipes.filter((rec) => rec._id !== id),
    })),
  addRecipe: (recipe) =>
    set((state) => ({
      recipes: [...state.recipes, recipe],
    })),

  // Filters
  filters: initialFilters,
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
  resetFilters: () => set({ filters: initialFilters }),

  // Computed
  filteredRecipes: () => {
    const { recipes, filters } = get();
    return recipes.filter((rec) => {
      // Search filter
      if (filters.search && !rec.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      // Category filter
      if (filters.category !== 'all' && rec.category !== filters.category) {
        return false;
      }
      return true;
    });
  },
  recipeById: (id) => {
    const { recipes } = get();
    return recipes.find((rec) => rec._id === id);
  },
  recipesByCategory: () => {
    const { recipes } = get();
    return recipes.reduce(
      (acc, rec) => {
        if (!acc[rec.category]) {
          acc[rec.category] = [];
        }
        acc[rec.category].push(rec);
        return acc;
      },
      {} as Record<string, Recipe[]>
    );
  },
}));
