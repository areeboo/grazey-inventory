'use client';

import { FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import { useExportShoppingListCSV, useExportShoppingListPDF } from '@/hooks/useShoppingList';
import { useToast } from '@/hooks/useToast';
import type { ShoppingListItem } from '@/types/shopping-list';

interface ExportButtonsProps {
  items: ShoppingListItem[];
  disabled?: boolean;
  className?: string;
}

export function ExportButtons({ items, disabled, className }: ExportButtonsProps) {
  const { toast } = useToast();
  const exportCSV = useExportShoppingListCSV();
  const exportPDF = useExportShoppingListPDF();

  const handleExportCSV = async () => {
    try {
      await exportCSV.mutateAsync(items);
      toast({
        type: 'success',
        title: 'CSV Downloaded',
        message: 'Shopping list exported to CSV file',
      });
    } catch (error: any) {
      toast({
        type: 'error',
        title: 'Export Failed',
        message: error.message || 'Failed to export CSV',
      });
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportPDF.mutateAsync(items);
      toast({
        type: 'success',
        title: 'Print View Opened',
        message: 'Use your browser\'s print function to save as PDF',
      });
    } catch (error: any) {
      toast({
        type: 'error',
        title: 'Export Failed',
        message: error.message || 'Failed to export PDF',
      });
    }
  };

  const isDisabled = disabled || items.length === 0;

  return (
    <div className={cn('flex gap-2', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportCSV}
        disabled={isDisabled}
        isLoading={exportCSV.isPending}
        leftIcon={<FileSpreadsheet className="h-4 w-4" />}
      >
        Export CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPDF}
        disabled={isDisabled}
        isLoading={exportPDF.isPending}
        leftIcon={<FileText className="h-4 w-4" />}
      >
        Print / PDF
      </Button>
    </div>
  );
}
