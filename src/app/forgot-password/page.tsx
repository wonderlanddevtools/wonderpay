"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { GlowButton } from "@/components/ui/glow-button";

type ApiResponse = {
  success?: boolean;
  error?: string;
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json() as ApiResponse;
      
      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to send password reset link');
      }
      
      setSubmitted(true);
    } catch (error) {
      console.error('Error sending reset link:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center bg-default-background">
      <div className="flex w-full grow shrink-0 basis-0 flex-col items-center justify-center gap-2 px-6 py-24">
        <div className="flex w-full max-w-[576px] flex-col items-center justify-center gap-4">
          <Link href="/" className="mb-8">
            <span className="font-['Inter'] text-[48px] font-[600] leading-[52px] text-default-font text-center -tracking-[0.04em]">
              WonderPay
            </span>
          </Link>
          
          {submitted ? (
            <div className="w-full max-w-[400px] text-center">
              <h2 className="text-2xl font-semibold mb-4">Check Your Email</h2>
              <p className="text-gray-600 mb-6">
                If an account exists with this email, we&apos;ve sent instructions to reset your password.
              </p>
              <Link href="/login" className="text-blue-600 hover:text-blue-800">
                Return to Login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-semibold mb-2">Reset Your Password</h2>
              <p className="text-gray-600 mb-6 text-center">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>
              
              <form onSubmit={handleSubmit} className="w-full max-w-[400px]">
                <div className="mb-4">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                {error && (
                  <div className="mb-4 text-red-500 text-sm">
                    {error}
                  </div>
                )}
                
                <div className="flex flex-col items-center">
                  <GlowButton
                    type="submit"
                    disabled={isSubmitting}
                    glowColors={['#3B82F6', '#2563EB', '#1D4ED8', '#60A5FA']}
                    glowMode="colorShift"
                    className="w-full"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                  </GlowButton>
                  
                  <Link href="/login" className="mt-4 text-blue-600 hover:text-blue-800">
                    Back to Login
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
