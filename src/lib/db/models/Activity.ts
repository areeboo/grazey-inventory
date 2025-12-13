import mongoose, { Schema, Document, Types } from 'mongoose';

export type ActivityType =
  | 'ingredient_adjustment'
  | 'ingredient_created'
  | 'ingredient_deleted'
  | 'order_created'
  | 'order_completed'
  | 'order_cancelled'
  | 'low_stock_alert';

export interface IActivity extends Document {
  type: ActivityType;

  // For ingredient events
  ingredientId?: Types.ObjectId;
  ingredientName?: string;
  oldQuantity?: number;
  newQuantity?: number;
  adjustment?: number;

  // For order events
  orderId?: Types.ObjectId;
  orderNumber?: string;
  recipeName?: string;
  orderQuantity?: number;

  // Common
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

const ActivitySchema = new Schema<IActivity>(
  {
    type: {
      type: String,
      enum: [
        'ingredient_adjustment',
        'ingredient_created',
        'ingredient_deleted',
        'order_created',
        'order_completed',
        'order_cancelled',
        'low_stock_alert',
      ],
      required: true,
    },
    ingredientId: {
      type: Schema.Types.ObjectId,
      ref: 'Ingredient',
    },
    ingredientName: String,
    oldQuantity: Number,
    newQuantity: Number,
    adjustment: Number,
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
    orderNumber: String,
    recipeName: String,
    orderQuantity: Number,
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: false,
  }
);

// Indexes
ActivitySchema.index({ type: 1, timestamp: -1 });
ActivitySchema.index({ timestamp: -1 });
ActivitySchema.index({ ingredientId: 1, timestamp: -1 });
ActivitySchema.index({ orderId: 1, timestamp: -1 });

export default mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);
