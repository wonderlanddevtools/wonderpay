"use client";

import React from 'react';
import Link from 'next/link';
import { GlowButton } from "@/components/ui/glow-button";

export default function VerifyEmailPage() {
  return (
    <div className="flex h-full w-full flex-col items-center bg-default-background">
      <div className="flex w-full grow shrink-0 basis-0 flex-col items-center justify-center gap-2 px-6 py-24">
        <div className="flex w-full max-w-[576px] flex-col items-center justify-center gap-4">
          <Link href="/" className="mb-8">
            <span className="font-['Inter'] text-[48px] font-[600] leading-[52px] text-default-font text-center -tracking-[0.04em]">
              WonderPay
            </span>
          </Link>
          
          <div className="w-full max-w-[400px] text-center">
            <div className="mb-6 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-semibold mb-4">Verify Your Email</h2>
            <p className="text-gray-600 mb-6">
              We&apos;ve sent a verification link to your email address. Please check your inbox and click the link to verify your account.
            </p>
            <p className="text-gray-600 mb-6">
              If you don&apos;t see the email, check your spam folder or request a new verification link.
            </p>
            
            <div className="space-y-4">
              <Link href="/login">
                <GlowButton
                  glowColors={['#3B82F6', '#2563EB', '#1D4ED8', '#60A5FA']}
                  glowMode="colorShift"
                  className="w-full"
                >
                  Continue to Login
                </GlowButton>
              </Link>
              
              <button 
                className="text-sm text-blue-600 hover:text-blue-800 underline"
                onClick={() => {
                  // This would make an API call to resend the verification email
                  alert('A new verification email has been sent. Please check your inbox.');
                }}
              >
                Resend Verification Email
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
