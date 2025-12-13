'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, Package } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Ingredient } from '@/types/ingredient';

interface LowStockAlertsProps {
  ingredients: Ingredient[];
  className?: string;
}

export function LowStockAlerts({ ingredients, className }: LowStockAlertsProps) {
  const lowStockItems = ingredients.filter(
    (ing) => ing.currentQuantity < ing.lowStockThreshold
  );

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Low Stock Alerts
          {lowStockItems.length > 0 && (
            <Badge variant="warning" size="sm">
              {lowStockItems.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {lowStockItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="bg-success/10 rounded-full p-3 mb-3">
              <Package className="h-8 w-8 text-success" />
            </div>
            <p className="font-medium text-success">All Stock Levels Good!</p>
            <p className="text-sm text-base-content/50 mt-1">
              No ingredients are running low
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {lowStockItems.slice(0, 8).map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-warning/5 rounded-xl border border-warning/20"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{item.name}</p>
                  <p className="text-sm text-base-content/60">
                    Threshold: {item.lowStockThreshold} {item.unit}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="font-bold text-warning">
                    {item.currentQuantity} {item.unit}
                  </p>
                </div>
              </motion.div>
            ))}
            {lowStockItems.length > 8 && (
              <p className="text-sm text-base-content/50 text-center py-2">
                +{lowStockItems.length - 8} more items
              </p>
            )}
          </div>
        )}
      </CardContent>
      {lowStockItems.length > 0 && (
        <div className="p-4 pt-0">
          <Link href="/inventory">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              View All Inventory
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
}
