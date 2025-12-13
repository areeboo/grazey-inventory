import { create } from 'zustand';
import type { Ingredient } from '@/types/ingredient';

interface IngredientFilters {
  search: string;
  category: string;
  showLowStock: boolean;
}

interface IngredientState {
  // Cache
  ingredients: Ingredient[];
  setIngredients: (ingredients: Ingredient[]) => void;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void;
  removeIngredient: (id: string) => void;
  addIngredient: (ingredient: Ingredient) => void;

  // Filters
  filters: IngredientFilters;
  setFilter: <K extends keyof IngredientFilters>(key: K, value: IngredientFilters[K]) => void;
  resetFilters: () => void;

  // Computed
  filteredIngredients: () => Ingredient[];
  lowStockIngredients: () => Ingredient[];
  ingredientById: (id: string) => Ingredient | undefined;
}

const initialFilters: IngredientFilters = {
  search: '',
  category: 'all',
  showLowStock: false,
};

export const useIngredientStore = create<IngredientState>((set, get) => ({
  // Cache
  ingredients: [],
  setIngredients: (ingredients) => set({ ingredients }),
  updateIngredient: (id, updates) =>
    set((state) => ({
      ingredients: state.ingredients.map((ing) =>
        ing._id === id ? { ...ing, ...updates } : ing
      ),
    })),
  removeIngredient: (id) =>
    set((state) => ({
      ingredients: state.ingredients.filter((ing) => ing._id !== id),
    })),
  addIngredient: (ingredient) =>
    set((state) => ({
      ingredients: [...state.ingredients, ingredient],
    })),

  // Filters
  filters: initialFilters,
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
  resetFilters: () => set({ filters: initialFilters }),

  // Computed
  filteredIngredients: () => {
    const { ingredients, filters } = get();
    return ingredients.filter((ing) => {
      // Search filter
      if (filters.search && !ing.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      // Category filter
      if (filters.category !== 'all' && ing.category !== filters.category) {
        return false;
      }
      // Low stock filter
      if (filters.showLowStock && ing.currentQuantity >= ing.lowStockThreshold) {
        return false;
      }
      return true;
    });
  },
  lowStockIngredients: () => {
    const { ingredients } = get();
    return ingredients.filter((ing) => ing.currentQuantity < ing.lowStockThreshold);
  },
  ingredientById: (id) => {
    const { ingredients } = get();
    return ingredients.find((ing) => ing._id === id);
  },
}));
