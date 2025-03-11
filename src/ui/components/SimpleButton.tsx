"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  children?: React.ReactNode;
  className?: string;
}

export const SimpleButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function SimpleButton(
    {
      variant = "primary",
      children,
      className = "",
      type = "button",
      ...otherProps
    }: ButtonProps,
    ref
  ) {
    // Base styles for all buttons
    const baseStyles = "flex items-center justify-center px-4 py-2 rounded-md font-medium";
    
    // Variant-specific styles
    const variantStyles = 
      variant === "primary" 
        ? "bg-blue-600 text-white hover:bg-blue-700" 
        : "bg-gray-200 text-gray-800 hover:bg-gray-300";

    return (
      <button
        className={`${baseStyles} ${variantStyles} ${className}`}
        ref={ref}
        type={type}
        {...otherProps}
      >
        {children}
      </button>
    );
  }
);
