import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      leftAddon,
      rightAddon,
      fullWidth = false,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId();

    return (
      <div className={cn(fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            'relative rounded-lg',
            error && 'ring-2 ring-red-500',
            fullWidth && 'w-full'
          )}
        >
          {leftAddon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftAddon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'appearance-none block bg-white text-neutral-900 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow',
              leftAddon ? 'pl-10' : 'pl-4',
              rightAddon ? 'pr-10' : 'pr-4',
              'py-2.5 w-full text-sm leading-tight',
              error &&
                'border-red-500 focus:ring-red-500 focus:border-red-500',
              props.disabled && 'bg-neutral-100 cursor-not-allowed',
              className
            )}
            {...props}
          />
          {rightAddon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {rightAddon}
            </div>
          )}
        </div>
        {(helperText || error) && (
          <p
            className={cn(
              'mt-1 text-xs',
              error ? 'text-red-600' : 'text-neutral-500'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
