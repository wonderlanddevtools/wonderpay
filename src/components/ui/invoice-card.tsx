import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from './card';
import { Button } from './button';

interface InvoiceCardProps {
  className?: string;
  companyName: string;
  companyEmail?: string;
  invoiceNumber: string;
  amount: string | number;
  dueDate: string;
  logo?: React.ReactNode;
  onPay?: () => void;
}

export function InvoiceCard({
  className,
  companyName,
  companyEmail,
  invoiceNumber,
  amount,
  dueDate,
  logo,
  onPay,
}: InvoiceCardProps) {
  return (
    <Card 
      className={cn('overflow-hidden max-w-md w-full mx-auto', className)}
      shadow="md"
    >
      <div className="flex flex-col p-6">
        <div className="flex items-center mb-8">
          {logo && (
            <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-full bg-neutral-100 mr-4">
              {logo}
            </div>
          )}
          
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">
              {companyName}
            </h2>
            {companyEmail && (
              <p className="text-neutral-500 text-sm">{companyEmail}</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-neutral-500">Invoice no.</span>
            <span className="text-neutral-900 font-medium">{invoiceNumber}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-neutral-500">Amount</span>
            <span className="text-neutral-900 font-semibold text-xl">{amount}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-neutral-500">Due date</span>
            <span className="text-neutral-900 font-medium">{dueDate}</span>
          </div>
        </div>

        {onPay && (
          <div className="mt-8">
            <Button 
              fullWidth 
              size="lg" 
              onClick={onPay}
              className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-full"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
            >
              Pay
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
