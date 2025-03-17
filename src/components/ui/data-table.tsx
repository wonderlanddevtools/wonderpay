import React from 'react';
import { cn } from '@/lib/utils';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  className?: string;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyField,
  className,
  emptyMessage = 'No data available',
  onRowClick,
  isLoading = false,
}: DataTableProps<T>) {
  const renderCell = (item: T, column: Column<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(item);
    }

    return (item[column.accessor] as React.ReactNode) || '-';
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-neutral-200 overflow-hidden">
        <div className="p-4 text-center text-neutral-500 text-sm">
          Loading...
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 overflow-hidden">
        <div className="p-4 text-center text-neutral-500 text-sm">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border border-neutral-200 overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider',
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {data.map((item) => (
              <tr
                key={String(item[keyField])}
                className={cn(
                  'hover:bg-neutral-50 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={cn(
                      'px-6 py-4 whitespace-nowrap text-sm text-neutral-900',
                      column.className
                    )}
                  >
                    {renderCell(item, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
