"use client";

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { GlowButton } from "@/components/ui/glow-button";
import gsapAnimations from "@/lib/animations/gsap";
import { PublicOnlyRoute } from "@/components/auth/protected-route";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const formRef = React.useRef<HTMLDivElement>(null);
  
  // Add entrance animation with GSAP
  React.useEffect(() => {
    if (!formRef.current) return;
    
    const tl = gsapAnimations.createTimeline();
    
    tl.from(formRef.current, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: gsapAnimations.easings.smooth
    });
    
    return () => {
      tl.kill();
    };
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    console.log('Debug Test: Attempting login with debug endpoint...');
    try {
      console.log(`Debug Test: Sending login request for: ${email}`);
      // Testing alternative login approach with fetch instead of signIn
      const response = await fetch('/api/auth/debug-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const responseText = await response.text();
      console.log('Debug Test: Raw response:', responseText);
      
      interface LoginResponse {
        success?: boolean;
        error?: string;
        message?: string;
        redirectTo?: string;
        userId?: string;
        user?: {
          id: string;
          email: string;
          name?: string;
          hasMoniteEntity?: boolean;
        };
      }
      
      let data: LoginResponse;
      try {
        // Use a type assertion to fix the type issue
        data = JSON.parse(responseText) as LoginResponse;
      } catch (parseError) {
        console.error('Debug Test: Failed to parse response:', parseError);
        alert('Failed to parse server response. See console for details.');
        setIsLoading(false);
        return;
      }
      
      if (response.ok && data.success) {
        console.log('Debug Test: Login successful!', data);
        
        // Check for auth status header
        const authHeader = response.headers.get('X-Auth-Debug-Status');
        console.log('Auth header status:', authHeader);
        
        // For debugging, log session information
        console.log('Login response data:', data);
        console.log('Redirect URL:', data.redirectTo ?? '/dashboard');
        
        // Use router.prefetch before router.push to ensure data is pre-loaded and navigation is smooth
        const redirectUrl = data.redirectTo ?? '/dashboard';
        router.prefetch(redirectUrl);
        
        // Use router.replace instead of router.push to avoid adding to history stack
        // replace() is better for login redirects as it doesn't add to browser history
        router.replace(redirectUrl);
        
        // Setting a very short timeout to ensure Next.js has time to initialize the page transition
        // This helps prevent the blank screen issue
        setTimeout(() => {
          console.log('Navigation completed');
        }, 100);
      } else {
        console.error('Debug Test: Login failed:', data.error);
        alert(`Login failed: ${data.error ?? 'Please check your credentials'}`);
      }
    } catch (error) {
      console.error('Debug Test: Login error:', error);
      alert('Login failed. See browser console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  return (
    <PublicOnlyRoute 
      redirectTo="/dashboard"
      skipRedirectInDevMode={process.env.NODE_ENV === "development"}
    >
    <div className="flex h-full w-full flex-col items-center bg-default-background">
      <div className="flex w-full grow shrink-0 basis-0 flex-col items-center justify-center gap-2 px-6 py-24">
        {callbackUrl !== '/dashboard' && (
          <div className="mb-4 w-full max-w-[576px] rounded-md bg-blue-50 p-4 text-blue-800">
            <p>Please log in to access the requested page.</p>
          </div>
        )}
        <div ref={formRef} className="flex w-full max-w-[576px] flex-col items-center justify-center gap-4">
          <span className="font-['Inter'] text-[48px] font-[600] leading-[52px] text-default-font text-center -tracking-[0.04em]">
            WonderPay
          </span>
          <Image
            className="h-12 w-12 flex-none object-cover"
            src="https://res.cloudinary.com/subframe/image/upload/v1736234687/uploads/4629/tju1xfldjj63cqlzrxtw.png"
            alt="WonderPay logo"
            width={48}
            height={48}
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
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-blue-600 hover:text-blue-800 text-sm">
                Forgot password?
              </Link>
            </div>
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
    </PublicOnlyRoute>
  );
}
