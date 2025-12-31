import { z } from 'zod';

// Ingredient Categories
export const ingredientCategories = [
  'Cheese',
  'Meat',
  'Fruit',
  'Vegetable',
  'Crackers',
  'Nuts',
  'Spreads',
  'Sweets',
  'Garnish',
  'Bread',
  'Other',
] as const;

export const ingredientUnits = [
  'oz',
  'each',
  'slices',
  'cups',
  'container',
  'wedges',
  'stalks',
  'lb',
  'g',
] as const;

export const recipeCategories = ['Classic', 'Vegetarian', 'Sweet', 'Keto', 'Specialty'] as const;

// Ingredient Schemas
export const createIngredientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  category: z.enum(ingredientCategories, {
    errorMap: () => ({ message: 'Please select a category' }),
  }),
  unit: z.enum(ingredientUnits, {
    errorMap: () => ({ message: 'Please select a unit' }),
  }),
  currentQuantity: z.number().min(0, 'Quantity cannot be negative'),
  lowStockThreshold: z.number().min(0, 'Threshold cannot be negative'),
  isCustom: z.boolean().optional().default(false),
});

export const updateIngredientSchema = createIngredientSchema.partial();

export const adjustIngredientSchema = z.object({
  adjustment: z.number(),
  operation: z.enum(['increment', 'decrement', 'set']),
});

// Order Schemas
export const createOrderSchema = z.object({
  recipeId: z.string().min(1, 'Please select a recipe'),
  quantity: z.number().min(1, 'Quantity must be at least 1').max(100, 'Maximum 100 boards per order'),
  notes: z.string().max(500, 'Notes too long').optional(),
});

export const updateOrderSchema = z.object({
  notes: z.string().max(500, 'Notes too long').optional(),
});

// Recipe Schemas
export const recipeIngredientSchema = z.object({
  ingredientId: z.string().min(1),
  ingredientName: z.string().min(1),
  quantity: z.number().min(0),
  unit: z.string().min(1),
  notes: z.string().optional(),
});

export const createRecipeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  category: z.enum(recipeCategories, {
    errorMap: () => ({ message: 'Please select a category' }),
  }),
  displayOrder: z.number().min(0).optional(),
  ingredients: z.array(recipeIngredientSchema).min(1, 'At least one ingredient required'),
  isActive: z.boolean().optional().default(true),
});

export const updateRecipeSchema = createRecipeSchema.partial();

// Shopping List Schemas
export const productionGoalSchema = z.object({
  recipeId: z.string().min(1),
  quantity: z.number().min(1),
});

export const generateShoppingListSchema = z.object({
  includeLowStock: z.boolean(),
  productionGoals: z.array(productionGoalSchema),
});

// Type exports
export type CreateIngredientInput = z.infer<typeof createIngredientSchema>;
export type UpdateIngredientInput = z.infer<typeof updateIngredientSchema>;
export type AdjustIngredientInput = z.infer<typeof adjustIngredientSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;
export type ProductionGoal = z.infer<typeof productionGoalSchema>;
export type GenerateShoppingListInput = z.infer<typeof generateShoppingListSchema>;
