'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95',
  {
    variants: {
      variant: {
        primary: 'btn btn-primary text-white shadow-bubble hover:shadow-bubble-lg',
        secondary: 'btn btn-secondary text-white',
        accent: 'btn btn-accent text-neutral',
        ghost: 'btn btn-ghost hover:bg-base-200',
        outline: 'btn btn-outline border-2 hover:bg-primary hover:text-white hover:border-primary',
        danger: 'btn btn-error text-white',
        success: 'btn btn-success text-white',
      },
      size: {
        xs: 'btn-xs text-xs px-2 py-1',
        sm: 'btn-sm text-sm px-3 py-1.5',
        md: 'btn-md text-base px-4 py-2',
        lg: 'btn-lg text-lg px-6 py-3',
        icon: 'btn-square btn-md',
        'icon-sm': 'btn-square btn-sm',
        'icon-lg': 'btn-square btn-lg',
      },
      rounded: {
        default: 'rounded-xl',
        full: 'rounded-full',
        bubble: 'rounded-bubble',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      rounded: 'default',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      rounded,
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, rounded, className }))}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
