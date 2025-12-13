'use client';

import { useUIStore } from '@/stores/uiStore';
import { ToastContainer } from '@/components/ui/Toast';

export function ToastProvider() {
  const toasts = useUIStore((state) => state.toasts);
  const removeToast = useUIStore((state) => state.removeToast);

  return <ToastContainer toasts={toasts} onDismiss={removeToast} />;
}
