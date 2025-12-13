export type OrderStatus = 'in-progress' | 'completed' | 'cancelled';

export interface DebitedIngredient {
  ingredientId: string;
  ingredientName: string;
  quantityDebited: number;
  unit: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  recipeId: string;
  recipeName: string;
  quantity: number;
  status: OrderStatus;
  debitedIngredients: DebitedIngredient[];
  createdAt: string;
  completedAt?: string;
  cancelledAt?: string;
  notes?: string;
}

export interface CreateOrderInput {
  recipeId: string;
  quantity: number;
  notes?: string;
}

export interface OrderWithDetails extends Order {
  recipe?: {
    _id: string;
    name: string;
    category: string;
  };
}

export interface OrderFilters {
  status?: OrderStatus | 'all';
  startDate?: string;
  endDate?: string;
}
