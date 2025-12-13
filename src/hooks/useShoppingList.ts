'use client';

import { useMutation } from '@tanstack/react-query';
import type {
  GenerateShoppingListInput,
  ShoppingListResponse,
  ShoppingListItem,
} from '@/types/shopping-list';

// Generate shopping list
export function useGenerateShoppingList() {
  return useMutation({
    mutationFn: async (input: GenerateShoppingListInput): Promise<ShoppingListResponse> => {
      const response = await fetch('/api/shopping-list/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate shopping list');
      }

      const data = await response.json();
      return data.data;
    },
  });
}

// Export shopping list (CSV)
export function useExportShoppingListCSV() {
  return useMutation({
    mutationFn: async (items: ShoppingListItem[]): Promise<void> => {
      const response = await fetch('/api/shopping-list/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, format: 'csv' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to export shopping list');
      }

      // Trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `grazey-shopping-list-${formatDate()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}

// Export shopping list (PDF/Printable HTML)
export function useExportShoppingListPDF() {
  return useMutation({
    mutationFn: async (items: ShoppingListItem[]): Promise<void> => {
      const response = await fetch('/api/shopping-list/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, format: 'pdf' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to export shopping list');
      }

      // Open printable HTML in new window
      const html = await response.text();
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
      }
    },
  });
}

function formatDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
