import mongoose, { Schema, Model } from 'mongoose';
import { IIngredient } from '@/types/ingredient';

const IngredientSchema = new Schema<IIngredient>(
  {
    name: {
      type: String,
      required: [true, 'Please provide an ingredient name'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: ['Cheese', 'Meat', 'Fruit', 'Vegetable', 'Crackers', 'Nuts', 'Spreads', 'Sweets', 'Garnish', 'Bread', 'Other'],
      default: 'Other',
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    currentQuantity: {
      type: Number,
      required: [true, 'Please provide current quantity'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    unit: {
      type: String,
      required: [true, 'Please provide a unit'],
      enum: ['oz', 'each', 'slices', 'cups', 'container', 'wedges', 'stalks', 'lb', 'g'],
    },
    lowStockThreshold: {
      type: Number,
      default: 4,
      min: [0, 'Threshold cannot be negative'],
    },
    aliases: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for alias search
IngredientSchema.index({ aliases: 1 });

// Index for faster queries (name index is created automatically via unique: true)
IngredientSchema.index({ category: 1 });

const Ingredient: Model<IIngredient> =
  mongoose.models.Ingredient || mongoose.model<IIngredient>('Ingredient', IngredientSchema);

export default Ingredient;
