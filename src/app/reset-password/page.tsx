"use client";

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GlowButton } from "@/components/ui/glow-button";

type ApiResponse = {
  success?: boolean;
  error?: string;
};

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      setError('Password is required');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!token) {
      setError('Reset token is missing');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      
      const data = await response.json() as ApiResponse;
      
      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to reset password');
      }
      
      setSubmitted(true);
    } catch (error) {
      console.error('Error resetting password:', error);
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
              <h2 className="text-2xl font-semibold mb-4">Password Reset Successful</h2>
              <p className="text-gray-600 mb-6">
                Your password has been successfully reset. You can now log in with your new password.
              </p>
              <Link href="/login">
                <GlowButton
                  glowColors={['#3B82F6', '#2563EB', '#1D4ED8', '#60A5FA']}
                  glowMode="colorShift"
                >
                  Go to Login
                </GlowButton>
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-semibold mb-2">Create New Password</h2>
              <p className="text-gray-600 mb-6 text-center">
                Please enter your new password below.
              </p>
              
              {!token && (
                <div className="w-full max-w-[400px] text-center mb-4">
                  <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md">
                    <p>Invalid or expired password reset link.</p>
                    <p className="mt-2">
                      <Link href="/forgot-password" className="text-blue-600 hover:text-blue-800">
                        Request a new reset link
                      </Link>
                    </p>
                  </div>
                </div>
              )}
              
              {token && (
                <form onSubmit={handleSubmit} className="w-full max-w-[400px]">
                  <div className="mb-4">
                    <input
                      type="password"
                      placeholder="New password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                      minLength={8}
                      required
                    />
                    <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
                  </div>
                  
                  <div className="mb-4">
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                      {isSubmitting ? 'Resetting...' : 'Reset Password'}
                    </GlowButton>
                    
                    <Link href="/login" className="mt-4 text-blue-600 hover:text-blue-800">
                      Back to Login
                    </Link>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
