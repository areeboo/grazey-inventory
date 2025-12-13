'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { PageLayout } from '@/components/common/PageLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import {
  ShoppingListGenerator,
  ShoppingListTable,
  ExportButtons,
} from '@/components/shopping-list';
import type { ShoppingListResponse } from '@/types/shopping-list';

export default function ShoppingListPage() {
  const [shoppingList, setShoppingList] = useState<ShoppingListResponse | null>(null);

  return (
    <PageLayout>
      <PageHeader
        title="Shopping List"
        description="Generate a shopping list based on low stock and production goals"
        actions={
          shoppingList && shoppingList.items.length > 0 && (
            <ExportButtons items={shoppingList.items} />
          )
        }
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Generator Panel */}
        <div>
          <ShoppingListGenerator onGenerate={setShoppingList} />
        </div>

        {/* Results Panel */}
        <div>
          <AnimatePresence mode="wait">
            {shoppingList ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <Card className="text-center py-4">
                    <p className="text-2xl font-bold text-primary">
                      {shoppingList.summary.totalItems}
                    </p>
                    <p className="text-xs text-base-content/60">Total Items</p>
                  </Card>
                  <Card className="text-center py-4">
                    <p className="text-2xl font-bold text-warning">
                      {shoppingList.summary.lowStockItems}
                    </p>
                    <p className="text-xs text-base-content/60">Low Stock</p>
                  </Card>
                  <Card className="text-center py-4">
                    <p className="text-2xl font-bold text-info">
                      {shoppingList.summary.productionItems}
                    </p>
                    <p className="text-xs text-base-content/60">For Production</p>
                  </Card>
                </div>

                {/* Shopping List Table */}
                <ShoppingListTable items={shoppingList.items} />

                {/* Generated timestamp */}
                <p className="text-xs text-base-content/40 text-center">
                  Generated {new Date(shoppingList.generatedAt).toLocaleString()}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-primary/10 rounded-full p-4 mb-4">
                    <ShoppingBag className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    Ready to Generate Your List
                  </h3>
                  <p className="text-base-content/60 max-w-sm">
                    Configure your options on the left and click &quot;Generate Shopping List&quot; to see what ingredients you need to buy.
                  </p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageLayout>
  );
}
