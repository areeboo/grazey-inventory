'use client';

import { useUIStore } from '@/stores/uiStore';
import type { Toast } from '@/types/ui';

type ToastInput = Omit<Toast, 'id'>;

export function useToast() {
  const addToast = useUIStore((state) => state.addToast);
  const removeToast = useUIStore((state) => state.removeToast);

  return {
    toast: (options: ToastInput) => addToast(options),
    dismiss: (id: string) => removeToast(id),
    success: (title: string, message?: string, duration?: number) =>
      addToast({ type: 'success', title, message, duration }),
    error: (title: string, message?: string, duration?: number) =>
      addToast({ type: 'error', title, message, duration }),
    warning: (title: string, message?: string, duration?: number) =>
      addToast({ type: 'warning', title, message, duration }),
    info: (title: string, message?: string, duration?: number) =>
      addToast({ type: 'info', title, message, duration }),
  };
}
