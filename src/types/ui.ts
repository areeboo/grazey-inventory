export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message?: string;
  duration?: number;
}

export interface ModalState {
  isOpen: boolean;
  data?: unknown;
}

export type ModalName =
  | 'addIngredient'
  | 'editIngredient'
  | 'deleteIngredient'
  | 'createOrder'
  | 'orderDetail'
  | 'cancelOrder'
  | 'completeOrder'
  | 'recipeDetail';
