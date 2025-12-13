export interface ProductionGoal {
  recipeId: string;
  recipeName: string;
  quantity: number;
}

export interface ShoppingListItem {
  ingredientId: string;
  ingredientName: string;
  currentQuantity: number;
  neededQuantity: number;
  shoppingQuantity: number;
  unit: string;
  reason: 'low_stock' | 'production_goal' | 'both';
  details?: string;
}

export interface GenerateShoppingListInput {
  includeLowStock: boolean;
  productionGoals: ProductionGoal[];
}

export interface ShoppingListResponse {
  items: ShoppingListItem[];
  summary: {
    totalItems: number;
    lowStockItems: number;
    productionItems: number;
  };
  generatedAt: string;
}

export interface ExportFormat {
  format: 'csv' | 'pdf';
}
