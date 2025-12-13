import Activity, { type ActivityType, type IActivity } from '@/lib/db/models/Activity';
import type { Types } from 'mongoose';

interface ActivityInput {
  type: ActivityType;
  ingredientId?: string | Types.ObjectId;
  ingredientName?: string;
  oldQuantity?: number;
  newQuantity?: number;
  adjustment?: number;
  orderId?: string | Types.ObjectId;
  orderNumber?: string;
  recipeName?: string;
  orderQuantity?: number;
  metadata?: Record<string, unknown>;
}

export async function logActivity(input: ActivityInput): Promise<IActivity> {
  const activity = await Activity.create({
    ...input,
    timestamp: new Date(),
  });

  return activity;
}

// Helper functions for specific activity types
export async function logIngredientCreated(
  ingredientId: string,
  ingredientName: string,
  initialQuantity: number
): Promise<IActivity> {
  return logActivity({
    type: 'ingredient_created',
    ingredientId,
    ingredientName,
    newQuantity: initialQuantity,
  });
}

export async function logIngredientDeleted(
  ingredientId: string,
  ingredientName: string
): Promise<IActivity> {
  return logActivity({
    type: 'ingredient_deleted',
    ingredientId,
    ingredientName,
  });
}

export async function logIngredientAdjustment(
  ingredientId: string,
  ingredientName: string,
  oldQuantity: number,
  newQuantity: number,
  adjustment: number
): Promise<IActivity> {
  return logActivity({
    type: 'ingredient_adjustment',
    ingredientId,
    ingredientName,
    oldQuantity,
    newQuantity,
    adjustment,
  });
}

export async function logOrderCreated(
  orderId: string,
  orderNumber: string,
  recipeName: string,
  orderQuantity: number
): Promise<IActivity> {
  return logActivity({
    type: 'order_created',
    orderId,
    orderNumber,
    recipeName,
    orderQuantity,
  });
}

export async function logOrderCompleted(
  orderId: string,
  orderNumber: string,
  recipeName: string,
  orderQuantity: number
): Promise<IActivity> {
  return logActivity({
    type: 'order_completed',
    orderId,
    orderNumber,
    recipeName,
    orderQuantity,
  });
}

export async function logOrderCancelled(
  orderId: string,
  orderNumber: string,
  recipeName: string,
  orderQuantity: number
): Promise<IActivity> {
  return logActivity({
    type: 'order_cancelled',
    orderId,
    orderNumber,
    recipeName,
    orderQuantity,
  });
}

export async function logLowStockAlert(
  ingredientId: string,
  ingredientName: string,
  currentQuantity: number,
  threshold: number
): Promise<IActivity> {
  return logActivity({
    type: 'low_stock_alert',
    ingredientId,
    ingredientName,
    newQuantity: currentQuantity,
    metadata: {
      threshold,
    },
  });
}
