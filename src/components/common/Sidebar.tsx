'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  UtensilsCrossed,
  BarChart3,
  ShoppingCart,
  History,
  ClipboardList,
  X,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores/uiStore';
import { useOrderStore } from '@/stores/orderStore';

const navItems = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Inventory',
    href: '/inventory',
    icon: Package,
  },
  {
    label: 'Boards',
    href: '/boards',
    icon: UtensilsCrossed,
  },
  {
    label: 'Production',
    href: '/production',
    icon: BarChart3,
  },
  {
    label: 'Orders',
    href: '/orders',
    icon: ShoppingCart,
    badge: 'activeOrders',
  },
  {
    label: 'History',
    href: '/history',
    icon: History,
  },
  {
    label: 'Shopping List',
    href: '/shopping-list',
    icon: ClipboardList,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
  const activeOrderCount = useOrderStore((state) => state.activeOrders().length);

  const getBadgeValue = (badge?: string) => {
    if (badge === 'activeOrders' && activeOrderCount > 0) {
      return activeOrderCount;
    }
    return null;
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full bg-white/95 backdrop-blur-sm border-r border-base-300 shadow-lg transition-all duration-300 ease-in-out',
          'lg:static lg:z-0',
          sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:w-20 lg:translate-x-0'
        )}
      >
        {/* Mobile header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-base-200 lg:hidden">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png.jpeg"
              alt="Graze Craze Logo"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="font-bold font-display text-blue-600">Graze Craze</span>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Desktop collapse button */}
        <div className="hidden lg:flex items-center justify-end h-16 px-4 border-b border-base-200">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hover:bg-base-200"
          >
            <ChevronLeft
              className={cn(
                'h-5 w-5 transition-transform duration-300',
                !sidebarOpen && 'rotate-180'
              )}
            />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const badgeValue = getBadgeValue(item.badge);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 hover:bg-blue-700'
                    : 'text-slate-700 hover:bg-blue-100 hover:text-blue-700'
                )}
              >
                <Icon className={cn(
                  'h-5 w-5 flex-shrink-0',
                  !sidebarOpen && 'lg:mx-auto',
                  isActive && 'stroke-[2.5]'
                )} />
                <span
                  className={cn(
                    'font-medium whitespace-nowrap transition-opacity duration-200',
                    !sidebarOpen && 'lg:hidden'
                  )}
                >
                  {item.label}
                </span>
                {badgeValue && (
                  <span
                    className={cn(
                      'ml-auto px-2 py-0.5 text-xs font-bold rounded-full',
                      isActive ? 'bg-white/20 text-white' : 'bg-primary text-white',
                      !sidebarOpen && 'lg:hidden'
                    )}
                  >
                    {badgeValue}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 p-4 border-t border-base-200',
            !sidebarOpen && 'lg:hidden'
          )}
        >
          <div className="text-center text-xs text-base-content/50">
            <p>Grazey Inventory v0.1.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}
