import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-neutral-100 text-neutral-800',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
    info: 'bg-blue-50 text-blue-700',
    outline: 'bg-transparent border border-neutral-200 text-neutral-800',
  };

  const sizeStyles = {
    sm: 'text-xs px-1.5 py-0.5 rounded',
    md: 'text-xs px-2.5 py-1 rounded-md',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({
  status,
  className,
}: {
  status: 'paid' | 'pending' | 'overdue' | 'draft' | 'cancelled';
  className?: string;
}) {
  const statusMap = {
    paid: { label: 'Paid', variant: 'success' as const },
    pending: { label: 'Pending', variant: 'warning' as const },
    overdue: { label: 'Overdue', variant: 'danger' as const },
    draft: { label: 'Draft', variant: 'default' as const },
    cancelled: { label: 'Cancelled', variant: 'danger' as const },
  };

  const { label, variant } = statusMap[status];

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
