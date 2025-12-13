'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Package, ShoppingBag, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Card } from '@/components/ui/Card';

interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    label: 'Create Order',
    description: 'Start a new production order',
    href: '/orders',
    icon: <Plus className="h-6 w-6" />,
    color: 'bg-blue-600 text-white',
  },
  {
    label: 'Adjust Inventory',
    description: 'Update ingredient quantities',
    href: '/inventory',
    icon: <Package className="h-6 w-6" />,
    color: 'bg-cyan-600 text-white',
  },
  {
    label: 'Shopping List',
    description: 'Generate what to buy',
    href: '/shopping-list',
    icon: <ShoppingBag className="h-6 w-6" />,
    color: 'bg-emerald-600 text-white',
  },
  {
    label: 'View Orders',
    description: 'Track active orders',
    href: '/orders',
    icon: <ClipboardList className="h-6 w-6" />,
    color: 'bg-amber-500 text-slate-900',
  },
];

interface QuickActionsProps {
  className?: string;
}

export function QuickActions({ className }: QuickActionsProps) {
  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      {quickActions.map((action, index) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + index * 0.05 }}
        >
          <Link href={action.href}>
            <Card
              hover="lift"
              className="h-full cursor-pointer group transition-all hover:shadow-lg"
            >
              <div className="flex flex-col items-center text-center p-4">
                <div
                  className={cn(
                    'p-3 rounded-xl mb-3 transition-transform group-hover:scale-110',
                    action.color
                  )}
                >
                  {action.icon}
                </div>
                <p className="font-semibold text-base-content">{action.label}</p>
                <p className="text-xs text-base-content/50 mt-1 hidden sm:block">
                  {action.description}
                </p>
              </div>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
