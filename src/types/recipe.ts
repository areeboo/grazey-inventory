import { Document, Types } from 'mongoose';

export type IngredientContext =
  | 'on_the_side'
  | 'primary_spread'
  | 'opposite_flavor'
  | 'condiment'
  | 'dessert_dip'
  | 'base_item'
  | 'fresh_fruit'
  | 'protein_feature'
  | 'vegetable_feature'
  | 'standalone_cup'
  | 'composite_item'
  | 'decorative_filler'
  | 'prep_only'
  | 'breakfast_condiment';

export interface IRecipeIngredient {
  ingredientId: Types.ObjectId;
  ingredientName: string;
  quantity: number;
  unit: string;
  notes?: string;
  context?: IngredientContext;
}

export interface IRecipe extends Document {
  name: string;
  category: 'Classic' | 'Vegetarian' | 'Sweet' | 'Keto' | 'Specialty';
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
  context?: IngredientContext;
}

export interface Recipe {
  _id: string;
  name: string;
  category: 'Classic' | 'Vegetarian' | 'Sweet' | 'Keto' | 'Specialty';
  displayOrder: number;
  ingredients: RecipeIngredient[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RecipeCategory = 'Classic' | 'Vegetarian' | 'Sweet' | 'Keto' | 'Specialty';

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
