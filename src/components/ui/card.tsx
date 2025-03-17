import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  border?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  className,
  padding = 'medium',
  border = false,
  shadow = 'sm',
}: CardProps) {
  const paddingMap = {
    none: 'p-0',
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
  };

  const shadowMap = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl',
        paddingMap[padding],
        shadowMap[shadow],
        border && 'border border-neutral-200',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn('text-xl font-semibold text-neutral-900', className)}>
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn('text-sm text-neutral-500 mt-1', className)}>
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn('', className)}>{children}</div>;
}

export function CardFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mt-6 flex items-center', className)}>
      {children}
    </div>
  );
}
