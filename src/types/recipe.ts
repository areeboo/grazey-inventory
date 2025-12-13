import { Document, Types } from 'mongoose';

export interface IRecipeIngredient {
  ingredientId: Types.ObjectId;
  ingredientName: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface IRecipe extends Document {
  name: string;
  category: 'Classic' | 'Vegetarian' | 'Sweet' | 'Keto';
  displayOrder: number;
  ingredients: IRecipeIngredient[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Frontend-friendly types
export interface RecipeIngredient {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface Recipe {
  _id: string;
  name: string;
  category: 'Classic' | 'Vegetarian' | 'Sweet' | 'Keto';
  displayOrder: number;
  ingredients: RecipeIngredient[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RecipeCategory = 'Classic' | 'Vegetarian' | 'Sweet' | 'Keto';

export type CreateRecipeInput = {
  name: string;
  category: RecipeCategory;
  displayOrder?: number;
  ingredients: RecipeIngredient[];
  isActive?: boolean;
};

export type UpdateRecipeInput = Partial<CreateRecipeInput>;

// Production Analysis types
export interface BoardProductionInfo {
  recipeId: string;
  recipeName: string;
  category: RecipeCategory;
  maxQuantity: number;
  limitingIngredient: {
    name: string;
    available: number;
    required: number;
  };
}

export interface MissingIngredientInfo {
  ingredientId: string;
  ingredientName: string;
  required: number;
  available: number;
  shortfall: number;
  unit: string;
}

export interface CannotMakeInfo {
  recipeId: string;
  recipeName: string;
  category: RecipeCategory;
  missingIngredients: MissingIngredientInfo[];
}

export interface ProductionAnalysis {
  canMake: BoardProductionInfo[];
  cannotMake: CannotMakeInfo[];
  timestamp: string;
  totalRecipes: number;
  canMakeCount: number;
  cannotMakeCount: number;
}
