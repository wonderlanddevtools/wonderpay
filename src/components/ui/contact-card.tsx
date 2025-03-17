import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface ContactCardProps {
  name?: string;  // Keep for backward compatibility
  title?: string; // New property
  subtitle?: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string; // Keep for backward compatibility
  imageUrl?: string; // New property
  tags?: string[];
  link?: string;
  className?: string;
  onClick?: () => void;
}

export function ContactCard({
  name,
  title,
  subtitle,
  email,
  phone,
  address,
  avatar,
  imageUrl,
  tags,
  link,
  className,
  onClick,
}: ContactCardProps) {
  // Use title or fall back to name for backward compatibility
  const displayName = title || name || "";
  // Use imageUrl or fall back to avatar for backward compatibility
  const displayImage = imageUrl || avatar;
  
  const cardContent = (
    <Card className={cn('overflow-hidden', onClick && 'cursor-pointer', className)}>
      <div className="p-5">
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-4">
            {displayImage ? (
              <img
                src={displayImage}
                alt={displayName}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-neutral-200 flex items-center justify-center text-neutral-700 text-xl font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-neutral-900 truncate">{displayName}</h3>
            {subtitle && (
              <p className="text-sm text-neutral-600">{subtitle}</p>
            )}
            <p className="mt-1 text-sm text-neutral-500">{email}</p>
            {phone && (
              <p className="mt-1 text-sm text-neutral-500">{phone}</p>
            )}
          </div>
        </div>
        
        {address && (
          <div className="mt-4 text-sm text-neutral-500">
            <p className="truncate">{address}</p>
          </div>
        )}
        
        {tags && tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
  
  // If link is provided, wrap with Link
  if (link) {
    return (
      <Link href={link} className="block">
        {cardContent}
      </Link>
    );
  }
  
  // Otherwise, render with onClick if provided
  return (
    <div onClick={onClick}>
      {cardContent}
    </div>
  );
}

export function ContactList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {children}
    </div>
  );
}
