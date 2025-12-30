import { create } from 'zustand';
import type { Toast, ModalName } from '@/types/ui';

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Toasts
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Modals
  modals: Record<ModalName, { isOpen: boolean; data?: unknown }>;
  openModal: (name: ModalName, data?: unknown) => void;
  closeModal: (name: ModalName) => void;
  closeAllModals: () => void;
}

const initialModals: Record<ModalName, { isOpen: boolean; data?: unknown }> = {
  addIngredient: { isOpen: false },
  editIngredient: { isOpen: false },
  deleteIngredient: { isOpen: false },
  boardAssociation: { isOpen: false },
  createOrder: { isOpen: false },
  orderDetail: { isOpen: false },
  cancelOrder: { isOpen: false },
  completeOrder: { isOpen: false },
  recipeDetail: { isOpen: false },
  addBoard: { isOpen: false },
};

export const useUIStore = create<UIState>((set) => ({
  // Sidebar
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Toasts
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { ...toast, id: `toast-${Date.now()}-${Math.random().toString(36).slice(2)}` },
      ],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  clearToasts: () => set({ toasts: [] }),

  // Modals
  modals: initialModals,
  openModal: (name, data) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [name]: { isOpen: true, data },
      },
    })),
  closeModal: (name) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [name]: { isOpen: false, data: undefined },
      },
    })),
  closeAllModals: () => set({ modals: initialModals }),
}));

// Helper hooks
export const useToast = () => {
  const addToast = useUIStore((state) => state.addToast);

  return {
    success: (message: string, duration?: number) =>
      addToast({ type: 'success', message, duration }),
    error: (message: string, duration?: number) =>
      addToast({ type: 'error', message, duration }),
    warning: (message: string, duration?: number) =>
      addToast({ type: 'warning', message, duration }),
    info: (message: string, duration?: number) =>
      addToast({ type: 'info', message, duration }),
  };
};

export const useModal = (name: ModalName) => {
  const modal = useUIStore((state) => state.modals[name]);
  const openModal = useUIStore((state) => state.openModal);
  const closeModal = useUIStore((state) => state.closeModal);

  return {
    isOpen: modal.isOpen,
    data: modal.data,
    open: (data?: unknown) => openModal(name, data),
    close: () => closeModal(name),
  };
};
