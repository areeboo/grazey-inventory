import { Document } from 'mongoose';

export interface IIngredient extends Document {
  name: string;
  category: string;
  isCustom: boolean;
  currentQuantity: number;
  unit: string;
  lowStockThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

// Frontend-friendly type (uses _id as string instead of ObjectId)
export interface Ingredient {
  _id: string;
  name: string;
  category: string;
  isCustom: boolean;
  currentQuantity: number;
  unit: string;
  lowStockThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateIngredientInput = {
  name: string;
  category: string;
  isCustom?: boolean;
  currentQuantity?: number;
  unit: string;
  lowStockThreshold?: number;
};

export type UpdateIngredientInput = Partial<CreateIngredientInput>;

export type AdjustIngredientInput = {
  adjustment: number;
  operation: 'increment' | 'decrement' | 'set';
};

export type IngredientCategory =
  | 'Cheese'
  | 'Meat'
  | 'Fruit'
  | 'Vegetable'
  | 'Crackers'
  | 'Nuts'
  | 'Spreads'
  | 'Sweets'
  | 'Garnish'
  | 'Bread'
  | 'Other';

export type IngredientUnit =
  | 'oz'
  | 'each'
  | 'slices'
  | 'cups'
  | 'container'
  | 'wedges'
  | 'stalks'
  | 'lb'
  | 'g';
