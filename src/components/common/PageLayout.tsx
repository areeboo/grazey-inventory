'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { useUIStore } from '@/stores/uiStore';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

export function PageLayout({ children, className }: PageLayoutProps) {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);

  return (
    <div className="min-h-screen bg-base-200/50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main
          className={cn(
            'flex-1 min-h-[calc(100vh-4rem)] p-4 md:p-6 transition-all duration-300',
            sidebarOpen ? 'lg:ml-0' : 'lg:ml-0',
            className
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
