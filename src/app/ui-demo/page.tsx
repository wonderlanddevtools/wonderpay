"use client";

import { GlowEffectButton } from "@/components/ui/glow-effect-demo";

export default function UIDemo() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-3xl font-bold">UI Component Demo</h1>
      
      <div className="flex flex-col items-center gap-6">
        <h2 className="text-xl font-semibold">Glow Effect Component</h2>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium">Color Shift (Default)</span>
            <GlowEffectButton />
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium">Rotate Effect</span>
            <div className="relative">
              <GlowEffect 
                colors={['#FF5733', '#33FF57', '#3357FF', '#F1C40F']} 
                mode="rotate"
                blur="soft"
                duration={5}
                scale={0.9}
              />
              <button className="relative inline-flex items-center gap-1 rounded-md bg-zinc-950 px-2.5 py-1.5 text-sm text-zinc-50 outline outline-1 outline-[#fff2f21f]">
                Rotate <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium">Pulse Effect</span>
            <div className="relative">
              <GlowEffect 
                colors={['#8A2BE2', '#FF1493', '#00BFFF']} 
                mode="pulse"
                blur="medium"
                duration={4}
                scale={1.1}
              />
              <button className="relative inline-flex items-center gap-1 rounded-md bg-zinc-950 px-2.5 py-1.5 text-sm text-zinc-50 outline outline-1 outline-[#fff2f21f]">
                Pulse <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium">Breathe Effect</span>
            <div className="relative">
              <GlowEffect 
                colors={['#4CAF50', '#2196F3', '#F44336']} 
                mode="breathe"
                blur="strong"
                duration={6}
                scale={1.0}
              />
              <button className="relative inline-flex items-center gap-1 rounded-md bg-zinc-950 px-2.5 py-1.5 text-sm text-zinc-50 outline outline-1 outline-[#fff2f21f]">
                Breathe <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium">Flow Horizontal</span>
            <div className="relative">
              <GlowEffect 
                colors={['#FF9800', '#9C27B0', '#3F51B5', '#009688']} 
                mode="flowHorizontal"
                blur="softest"
                duration={7}
                scale={0.95}
              />
              <button className="relative inline-flex items-center gap-1 rounded-md bg-zinc-950 px-2.5 py-1.5 text-sm text-zinc-50 outline outline-1 outline-[#fff2f21f]">
                Flow <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium">Static Effect</span>
            <div className="relative">
              <GlowEffect 
                colors={['#E91E63', '#FFEB3B', '#03A9F4']} 
                mode="static"
                blur="stronger"
                scale={0.85}
              />
              <button className="relative inline-flex items-center gap-1 rounded-md bg-zinc-950 px-2.5 py-1.5 text-sm text-zinc-50 outline outline-1 outline-[#fff2f21f]">
                Static <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Import at the top of the file
import { GlowEffect } from "@/components/ui/glow-effect";
import { ArrowRight } from "lucide-react";
