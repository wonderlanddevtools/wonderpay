"use client";

import React from "react";
import { GlowEffect } from "@/components/ui/glow-effect";

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  children?: React.ReactNode;
  className?: string;
  glowColors?: string[];
  glowMode?: 'rotate' | 'pulse' | 'breathe' | 'colorShift' | 'flowHorizontal' | 'static';
}

export const GlowButton = React.forwardRef<HTMLButtonElement, GlowButtonProps>(
  function GlowButton(
    {
      variant = "primary",
      children,
      className = "",
      glowColors = variant === "primary" 
        ? ['#3B82F6', '#2563EB', '#1D4ED8', '#3B82F6'] 
        : ['#E5E7EB', '#D1D5DB', '#9CA3AF', '#E5E7EB'],
      glowMode = "colorShift",
      type = "button",
      ...otherProps
    }: GlowButtonProps,
    ref
  ) {
    // Base styles for all buttons
    const baseStyles = "relative inline-flex items-center justify-center px-4 py-2 rounded-md font-medium";
    
    // Variant-specific styles
    const variantStyles = 
      variant === "primary" 
        ? "bg-zinc-950 text-zinc-50 outline outline-1 outline-[#fff2f21f]" 
        : "bg-zinc-800 text-zinc-50 outline outline-1 outline-[#fff2f21f]";

    return (
      <div className="relative">
        <GlowEffect
          colors={glowColors}
          mode={glowMode}
          blur="soft"
          duration={3}
          scale={0.9}
        />
        <button
          className={`${baseStyles} ${variantStyles} ${className}`}
          ref={ref}
          type={type}
          {...otherProps}
        >
          {children}
        </button>
      </div>
    );
  }
);
