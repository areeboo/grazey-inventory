'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const inputVariants = cva(
  'input w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 font-body',
  {
    variants: {
      variant: {
        default: 'input-bordered border-2 focus:border-primary',
        ghost: 'input-ghost bg-base-200',
        filled: 'bg-base-200 border-0 focus:bg-base-100',
        error: 'input-bordered border-2 border-error focus:border-error focus:ring-error/20',
      },
      inputSize: {
        sm: 'input-sm text-sm',
        md: 'input-md text-base',
        lg: 'input-lg text-lg',
      },
      rounded: {
        default: 'rounded-xl',
        full: 'rounded-full',
        bubble: 'rounded-bubble',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
      rounded: 'default',
    },
  }
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      inputSize,
      rounded,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const hasError = !!error;

    return (
      <div className="form-control w-full">
        {label && (
          <label htmlFor={inputId} className="label">
            <span className="label-text font-medium text-base-content">{label}</span>
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              inputVariants({
                variant: hasError ? 'error' : variant,
                inputSize,
                rounded,
              }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50">
              {rightIcon}
            </span>
          )}
        </div>
        {(error || helperText) && (
          <label className="label">
            <span className={cn('label-text-alt', hasError ? 'text-error' : 'text-base-content/60')}>
              {error || helperText}
            </span>
          </label>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };
