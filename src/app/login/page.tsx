"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { GlowButton } from "@/components/ui/glow-button";
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    try {
      await signIn('credentials', { 
        email,
        password,
        callbackUrl: '/dashboard',
        redirect: true
      });
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  return (
    <div className="flex h-full w-full flex-col items-center bg-default-background">
      <div className="flex w-full grow shrink-0 basis-0 flex-col items-center justify-center gap-2 px-6 py-24">
        <div className="flex w-full max-w-[576px] flex-col items-center justify-center gap-4">
          <span className="font-['Inter'] text-[48px] font-[600] leading-[52px] text-default-font text-center -tracking-[0.04em]">
            WonderPay
          </span>
          <img
            className="h-12 w-12 flex-none object-cover"
            src="https://res.cloudinary.com/subframe/image/upload/v1736234687/uploads/4629/tju1xfldjj63cqlzrxtw.png"
            alt="WonderPay logo"
          />
          <span className="w-full font-['Inter'] text-[17px] font-[400] leading-[24px] text-subtext-color text-center -tracking-[0.01em]">
            WonderPay is a private AP &amp; AR automation platform with working
            capital solutions for a select group of companies in the music,
            entertainment and luxury hospitality industries.
          </span>
          
          {/* Login Form */}
          <div className="flex w-full max-w-[400px] flex-col gap-4 mt-6">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="flex w-full max-w-[400px] items-center justify-center gap-6 mt-6">
            <GlowButton 
              onClick={handleLogin}
              disabled={isLoading}
              glowColors={['#3B82F6', '#2563EB', '#1D4ED8', '#60A5FA']}
              glowMode="colorShift"
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </GlowButton>
            <GlowButton
              variant="secondary"
              onClick={handleSignUp}
              glowColors={['#9CA3AF', '#6B7280', '#4B5563', '#9CA3AF']}
              glowMode="pulse"
            >
              Sign Up
            </GlowButton>
          </div>
        </div>
      </div>
    </div>
  );
}
