'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, Hand } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores/uiStore';

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex items-center justify-between h-16 px-4 md:px-6 bg-base-100 border-b border-base-200',
        className
      )}
    >
      {/* Left side */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
          aria-label="Go to dashboard"
        >
          <Image
            src="/logo.png.jpeg"
            alt="Graze Craze Logo"
            width={44}
            height={44}
            className="rounded-full"
          />
          <div className="hidden sm:block text-left">
            <h1 className="text-xl font-bold font-display text-primary">Graze Craze</h1>
            <p className="text-xs text-base-content/60 -mt-1">Inventory Tracker</p>
          </div>
        </Link>
      </div>

      {/* Right side - Welcome message */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full border border-blue-200/50">
        <Hand className="h-5 w-5 text-blue-500" />
        <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Welcome, Amaan
        </span>
      </div>
    </header>
  );
}
