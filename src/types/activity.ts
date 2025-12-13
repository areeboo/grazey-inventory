export type ActivityType =
  | 'ingredient_adjustment'
  | 'ingredient_created'
  | 'ingredient_deleted'
  | 'order_created'
  | 'order_completed'
  | 'order_cancelled'
  | 'low_stock_alert';

export interface Activity {
  _id: string;
  type: ActivityType;

  // For ingredient events
  ingredientId?: string;
  ingredientName?: string;
  oldQuantity?: number;
  newQuantity?: number;
  adjustment?: number;

  // For order events
  orderId?: string;
  orderNumber?: string;
  recipeName?: string;
  orderQuantity?: number;

  // Common
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ActivityFilters {
  type?: ActivityType | 'all';
  ingredientId?: string;
  orderId?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateActivityInput {
  type: ActivityType;
  ingredientId?: string;
  ingredientName?: string;
  oldQuantity?: number;
  newQuantity?: number;
  adjustment?: number;
  orderId?: string;
  orderNumber?: string;
  recipeName?: string;
  orderQuantity?: number;
  metadata?: Record<string, unknown>;
}
