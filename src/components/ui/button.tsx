import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  iconPosition?: 'left' | 'right';
  icon?: React.ReactNode;
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      iconPosition = 'right',
      icon,
      fullWidth = false,
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        'bg-neutral-900 hover:bg-neutral-800 text-white border border-transparent',
      secondary:
        'bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border border-transparent',
      outline:
        'bg-transparent hover:bg-neutral-100 text-neutral-900 border border-neutral-300',
      ghost: 'bg-transparent hover:bg-neutral-100 text-neutral-900 border border-transparent',
      link: 'bg-transparent text-neutral-900 underline-offset-4 hover:underline border border-transparent p-0 h-auto',
      danger:
        'bg-red-600 hover:bg-red-700 text-white border border-transparent',
    };

    const sizes = {
      sm: 'text-xs px-3 py-2 rounded-lg',
      md: 'text-sm px-5 py-2.5 rounded-lg',
      lg: 'text-base px-6 py-3 rounded-lg',
      icon: 'p-2 rounded-lg',
    };

    const isDisabled = disabled || isLoading;

    return (
      <button
        className={cn(
          'font-medium inline-flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:ring-offset-2',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          isDisabled && 'opacity-60 cursor-not-allowed',
          className
        )}
        disabled={isDisabled}
        ref={ref}
        {...props}
      >
        {isLoading && (
          <svg
            className={cn(
              'animate-spin -ml-1 mr-2 h-4 w-4',
              variant === 'primary' || variant === 'danger'
                ? 'text-white'
                : 'text-neutral-900'
            )}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}

        {icon && iconPosition === 'left' && !isLoading && (
          <span className="mr-2">{icon}</span>
        )}
        
        <span>{children}</span>
        
        {icon && iconPosition === 'right' && (
          <span className="ml-2">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export function IconButton({
  className,
  variant = 'primary',
  size = 'icon',
  icon,
  ...props
}: Omit<ButtonProps, 'children' | 'iconPosition'> & {
  icon: React.ReactNode;
}) {
  return (
    <Button
      className={cn('p-0 flex items-center justify-center', className)}
      variant={variant}
      size={size}
      {...props}
    >
      {icon}
    </Button>
  );
}
