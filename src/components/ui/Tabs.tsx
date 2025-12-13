'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface Tab<T = string> {
  value: T;
  label: string;
  icon?: ReactNode;
  count?: number;
}

interface TabsProps<T = string> {
  tabs: Tab<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Tabs<T = string>({
  tabs,
  value,
  onChange,
  variant = 'default',
  size = 'md',
  className,
}: TabsProps<T>) {
  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-5 py-2.5',
  };

  if (variant === 'underline') {
    return (
      <div className={cn('relative border-b border-base-200', className)}>
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={String(tab.value)}
              onClick={() => onChange(tab.value)}
              className={cn(
                'relative flex items-center gap-2 font-medium transition-colors',
                sizeClasses[size],
                tab.value === value
                  ? 'text-primary'
                  : 'text-base-content/60 hover:text-base-content'
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'px-2 py-0.5 text-xs rounded-full',
                    tab.value === value
                      ? 'bg-primary text-white'
                      : 'bg-base-200 text-base-content/60'
                  )}
                >
                  {tab.count}
                </span>
              )}
              {tab.value === value && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  transition={{ duration: 0.2 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'pills') {
    return (
      <div className={cn('inline-flex gap-1 p-1 bg-base-200 rounded-xl', className)}>
        {tabs.map((tab) => (
          <button
            key={String(tab.value)}
            onClick={() => onChange(tab.value)}
            className={cn(
              'relative flex items-center gap-2 font-medium rounded-lg transition-all duration-200',
              sizeClasses[size],
              tab.value === value
                ? 'text-white'
                : 'text-base-content/60 hover:text-base-content'
            )}
          >
            {tab.value === value && (
              <motion.div
                layoutId="tab-pill"
                className="absolute inset-0 bg-primary rounded-lg"
                transition={{ duration: 0.2 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'px-2 py-0.5 text-xs rounded-full',
                    tab.value === value
                      ? 'bg-white/20'
                      : 'bg-base-300'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
    );
  }

  // Default tabs
  return (
    <div className={cn('tabs tabs-boxed bg-base-200 p-1 rounded-xl', className)}>
      {tabs.map((tab) => (
        <button
          key={String(tab.value)}
          onClick={() => onChange(tab.value)}
          className={cn(
            'tab gap-2 rounded-lg transition-all duration-200',
            sizeClasses[size],
            tab.value === value && 'tab-active bg-primary text-white'
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                'px-2 py-0.5 text-xs rounded-full',
                tab.value === value
                  ? 'bg-white/20'
                  : 'bg-base-300'
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
