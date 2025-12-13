'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';

interface QuantityAdjusterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
  isLoading?: boolean;
  showInput?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function QuantityAdjuster({
  value,
  onChange,
  min = 0,
  max = 9999,
  step = 1,
  unit,
  disabled,
  isLoading,
  showInput = true,
  size = 'md',
  className,
}: QuantityAdjusterProps) {
  const [inputValue, setInputValue] = useState(value.toString());
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setInputValue(value.toString());
    }
  }, [value, isEditing]);

  const handleDecrement = useCallback(() => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  }, [value, min, step, onChange]);

  const handleIncrement = useCallback(() => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  }, [value, max, step, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(min, Math.min(max, numValue));
      onChange(clampedValue);
      setInputValue(clampedValue.toString());
    } else {
      setInputValue(value.toString());
    }
  };

  const handleInputFocus = () => {
    setIsEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === 'Escape') {
      setInputValue(value.toString());
      setIsEditing(false);
      (e.target as HTMLInputElement).blur();
    }
  };

  const sizeClasses = {
    sm: {
      button: 'btn-xs h-7 w-7',
      input: 'w-14 h-7 text-sm',
      icon: 'h-3 w-3',
    },
    md: {
      button: 'btn-sm h-9 w-9',
      input: 'w-16 h-9 text-base',
      icon: 'h-4 w-4',
    },
    lg: {
      button: 'btn-md h-11 w-11',
      input: 'w-20 h-11 text-lg',
      icon: 'h-5 w-5',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={handleDecrement}
        disabled={disabled || isLoading || value <= min}
        className={cn(
          classes.button,
          'rounded-full bg-base-200 hover:bg-error hover:text-white transition-all duration-200'
        )}
      >
        <Minus className={classes.icon} />
      </Button>

      {showInput ? (
        <div className="relative">
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            disabled={disabled || isLoading}
            min={min}
            max={max}
            step={step}
            className={cn(
              'text-center font-semibold bg-base-100 border-2 border-base-300 rounded-xl',
              'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
              'transition-all duration-200',
              classes.input,
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          />
          <AnimatePresence>
            {unit && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-base-content/50 whitespace-nowrap"
              >
                {unit}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <span className={cn('font-semibold min-w-[3rem] text-center', classes.input)}>
          {value} {unit}
        </span>
      )}

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={handleIncrement}
        disabled={disabled || isLoading || value >= max}
        className={cn(
          classes.button,
          'rounded-full bg-base-200 hover:bg-success hover:text-white transition-all duration-200'
        )}
      >
        <Plus className={classes.icon} />
      </Button>
    </div>
  );
}
