import React from 'react';
import Link from 'next/link';
import { cn } from '~/lib/utils';
import { Card } from '~/components/ui/card';

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
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'teal'; // Added for consistency with stat cards
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
  color = 'blue', // Default to blue
}: ContactCardProps) {
  // Use title or fall back to name for backward compatibility
  const displayName = title ?? name ?? "";
  // Use imageUrl or fall back to avatar for backward compatibility
  const displayImage = imageUrl ?? avatar;
  
  // Get the color classes based on the color prop
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return { bg: 'bg-green-100', text: 'text-green-800', accent: 'before:bg-green-500' };
      case 'red':
        return { bg: 'bg-red-100', text: 'text-red-800', accent: 'before:bg-red-500' };
      case 'yellow':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', accent: 'before:bg-yellow-500' };
      case 'purple':
        return { bg: 'bg-purple-100', text: 'text-purple-800', accent: 'before:bg-purple-500' };
      case 'teal':
        return { bg: 'bg-teal-100', text: 'text-teal-800', accent: 'before:bg-teal-500' };
      case 'blue':
      default:
        return { bg: 'bg-blue-100', text: 'text-blue-800', accent: 'before:bg-blue-500' };
    }
  };
  
  const colorClasses = getColorClasses();
  
  const cardContent = (
    <Card 
      className={cn(
        'overflow-hidden relative', 
        onClick && 'cursor-pointer', 
        'before:absolute before:top-0 before:left-0 before:w-1 before:h-full',
        colorClasses.accent,
        className
      )}
    >
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
              <div className={cn("w-16 h-16 rounded-lg flex items-center justify-center text-xl font-bold", colorClasses.bg, colorClasses.text)}>
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 truncate">{displayName}</h3>
            {subtitle && (
              <p className="text-sm text-gray-600">{subtitle}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">{email}</p>
            {phone && (
              <p className="mt-1 text-sm text-gray-500">{phone}</p>
            )}
          </div>
        </div>
        
        {address && (
          <div className="mt-4 text-sm text-gray-500">
            <p className="truncate">{address}</p>
          </div>
        )}
        
        {tags && tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span 
                key={index}
                className={cn("px-2 py-1 text-xs rounded-full", colorClasses.bg, colorClasses.text)}
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
