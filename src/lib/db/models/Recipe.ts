import mongoose, { Schema, Model } from 'mongoose';
import { IRecipe, IRecipeIngredient } from '@/types/recipe';

const RecipeIngredientSchema = new Schema<IRecipeIngredient>(
  {
    ingredientId: {
      type: Schema.Types.ObjectId,
      ref: 'Ingredient',
      required: true,
    },
    ingredientName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity must be positive'],
    },
    unit: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
  },
  { _id: false }
);

const RecipeSchema = new Schema<IRecipe>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a recipe name'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: ['Classic', 'Vegetarian', 'Sweet', 'Keto'],
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    ingredients: {
      type: [RecipeIngredientSchema],
      required: [true, 'Please provide ingredients'],
      validate: {
        validator: function(ingredients: IRecipeIngredient[]) {
          return ingredients && ingredients.length > 0;
        },
        message: 'Recipe must have at least one ingredient',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries (name index is created automatically via unique: true)
RecipeSchema.index({ category: 1, displayOrder: 1 });
RecipeSchema.index({ isActive: 1 });

const Recipe: Model<IRecipe> =
  mongoose.models.Recipe || mongoose.model<IRecipe>('Recipe', RecipeSchema);

export default Recipe;
