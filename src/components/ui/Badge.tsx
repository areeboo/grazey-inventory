'use client';

import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 font-medium transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'badge badge-ghost',
        primary: 'badge badge-primary text-white',
        secondary: 'badge badge-secondary text-white',
        accent: 'badge badge-accent text-neutral',
        success: 'badge badge-success text-white',
        warning: 'badge badge-warning text-neutral',
        error: 'badge badge-error text-white',
        info: 'badge badge-info text-white',
        outline: 'badge badge-outline',
        classic: 'bg-classic text-white',
        vegetarian: 'bg-vegetarian text-white',
        sweet: 'bg-sweet text-neutral',
        keto: 'bg-keto text-white',
      },
      size: {
        xs: 'badge-xs text-xs px-1.5 py-0.5',
        sm: 'badge-sm text-xs px-2 py-0.5',
        md: 'badge-md text-sm px-2.5 py-1',
        lg: 'badge-lg text-base px-3 py-1.5',
      },
      rounded: {
        default: 'rounded-lg',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      rounded: 'full',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  dot?: boolean;
}

function Badge({
  className,
  variant,
  size,
  rounded,
  icon,
  dot,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size, rounded, className }))}
      {...props}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
      )}
      {icon}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
