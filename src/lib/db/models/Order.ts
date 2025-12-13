import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDebitedIngredient {
  ingredientId: Types.ObjectId;
  ingredientName: string;
  quantityDebited: number;
  unit: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  recipeId: Types.ObjectId;
  recipeName: string;
  quantity: number;
  status: 'in-progress' | 'completed' | 'cancelled';
  debitedIngredients: IDebitedIngredient[];
  createdAt: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  notes?: string;
}

const DebitedIngredientSchema = new Schema<IDebitedIngredient>(
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
    quantityDebited: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    recipeId: {
      type: Schema.Types.ObjectId,
      ref: 'Recipe',
      required: true,
    },
    recipeName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'cancelled'],
      default: 'in-progress',
    },
    debitedIngredients: {
      type: [DebitedIngredientSchema],
      required: true,
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes (orderNumber index is created automatically via unique: true)
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ recipeId: 1 });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
