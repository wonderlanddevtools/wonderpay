"use client";

import React from "react";
import { GlowButton } from "@/components/ui/glow-button";
import { useRouter } from "next/navigation";

function WonderPayLanding() {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/login");
  };

  const handleInquire = () => {
    router.push("/signup");
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
        </div>
        <div className="flex w-full items-center justify-center gap-6 mt-6">
          <GlowButton 
            onClick={handleLogin}
            glowColors={['#3B82F6', '#2563EB', '#1D4ED8', '#60A5FA']}
            glowMode="colorShift"
          >
            Log In
          </GlowButton>
          <GlowButton
            variant="secondary"
            onClick={handleInquire}
            glowColors={['#9CA3AF', '#6B7280', '#4B5563', '#9CA3AF']}
            glowMode="pulse"
          >
            Inquire
          </GlowButton>
        </div>
      </div>
    </div>
  );
}

export default WonderPayLanding;
