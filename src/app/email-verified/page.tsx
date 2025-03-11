"use client";

import React from 'react';
import Link from 'next/link';
import { GlowButton } from "@/components/ui/glow-button";

export default function EmailVerifiedPage() {
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-semibold mb-4">Email Verified Successfully</h2>
            <p className="text-gray-600 mb-6">
              Your email has been successfully verified. You can now access all features of WonderPay.
            </p>
            
            <Link href="/login">
              <GlowButton
                glowColors={['#3B82F6', '#2563EB', '#1D4ED8', '#60A5FA']}
                glowMode="colorShift"
              >
                Continue to Login
              </GlowButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
