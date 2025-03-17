import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card } from './card';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: string | number;
    isPositive: boolean;
  };
  icon?: ReactNode;
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  trend,
  icon,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-neutral-500 mb-1">{title}</p>
          <h3 className="text-2xl font-semibold text-neutral-900">
            {value}
          </h3>
          
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={cn(
                  'text-xs font-medium flex items-center',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.isPositive ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-1"
                  >
                    <path
                      d="M8 10L12 6M12 6L16 10M12 6V18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-1"
                  >
                    <path
                      d="M16 14L12 18M12 18L8 14M12 18V6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {trend.value}
              </span>
            </div>
          )}
          
          {description && (
            <p className="text-sm text-neutral-500 mt-2">{description}</p>
          )}
        </div>
        
        {icon && (
          <div className="text-neutral-500">{icon}</div>
        )}
      </div>
    </Card>
  );
}

export function FinancialStatGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {children}
    </div>
  );
}
