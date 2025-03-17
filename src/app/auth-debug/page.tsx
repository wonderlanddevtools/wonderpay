'use client';

import React from 'react';
import { GlowButton } from '~/components/ui/glow-button';

export default function AuthDebugPage() {
  // Client component for testing authentication
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-lg p-8 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Authentication Debug</h1>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white">Test Direct Login</h2>
            <p className="text-gray-300 text-sm">Bypasses NextAuth and creates a direct debug session cookie</p>
            <p className="text-blue-300 text-sm">Try with test credentials: test@wonderpay.com / test123</p>
            
            <div className="flex gap-4 flex-col sm:flex-row">
              <input 
                type="email" 
                id="debug-email"
                placeholder="Email"
                className="px-4 py-2 rounded-md bg-white/10 border border-white/20 text-white w-full"
              />
              <input 
                type="password" 
                id="debug-password"
                placeholder="Password"
                className="px-4 py-2 rounded-md bg-white/10 border border-white/20 text-white w-full"
              />
            </div>
            
            <GlowButton 
              onClick={() => {
                const email = (document.getElementById('debug-email') as HTMLInputElement)?.value;
                const password = (document.getElementById('debug-password') as HTMLInputElement)?.value;
                
                if (!email || !password) {
                  alert('Please enter email and password');
                  return;
                }
                
                // Call debug login endpoint
                fetch('/api/auth/debug-login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email, password })
                })
                .then(res => res.json())
                .then(data => {
                  // Use type assertion for API response data
                  const typedData = data as { success?: boolean; error?: string; message?: string };
                  
                  if (typedData.success) {
                    document.getElementById('status')!.textContent = '✅ Login successful!';
                    document.getElementById('status')!.className = 'text-green-400';
                    setTimeout(() => {
                      window.location.href = '/dashboard';
                    }, 1000);
                  } else {
                    document.getElementById('status')!.textContent = `❌ Error: ${typedData.error ?? 'Unknown error'}`;
                    document.getElementById('status')!.className = 'text-red-400';
                  }
                })
                .catch(err => {
                  // Use type-safe error handling
                  const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                  document.getElementById('status')!.textContent = `❌ Error: ${errorMessage}`;
                  document.getElementById('status')!.className = 'text-red-400';
                });
              }}
              className="w-full mt-4"
            >
              Test Login
            </GlowButton>
            
            <div id="status" className="text-gray-300 text-center mt-4">Ready to test</div>
          </div>
          
          <div className="border-t border-white/10 pt-6 space-y-2">
            <h2 className="text-xl font-semibold text-white">Development Tools</h2>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-gray-300 text-sm mb-2">Bypass dashboard authentication in development mode</p>
                <GlowButton
                  onClick={() => {
                    // Set the debug-auth-bypass cookie
                    document.cookie = "debug-auth-bypass=true; path=/";
                    document.getElementById('bypass-status')!.textContent = "✅ Debug cookie set! You can now access the dashboard without login.";
                    document.getElementById('bypass-status')!.className = "text-green-400 text-sm mt-2";
                    
                    // Refresh after a short delay
                    setTimeout(() => {
                      window.location.href = "/dashboard";
                    }, 1500);
                  }}
                  className="w-full"
                  glowColors={["#4f46e5", "#3b82f6"]}
                >
                  Enable Dashboard Bypass
                </GlowButton>
                <div id="bypass-status" className="text-gray-300 text-sm mt-2">Click to enable dashboard access</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-6 space-y-2">
            <h2 className="text-xl font-semibold text-white">Session Status</h2>
            <div className="flex flex-col gap-2">
              <GlowButton
                onClick={() => {
                  // Check both NextAuth session and debug session
                  Promise.all([
                    fetch('/api/auth/session').then(res => res.json()),
                    fetch('/api/auth/debug-session').catch(() => ({ exists: false, note: 'Endpoint not available' }))
                  ])
                    .then(([nextAuthSession, debugSession]) => {
                      const resultElement = document.getElementById('session-info')!;
                      
                      // Check for debug cookie directly
                      const hasDebugCookie = document.cookie.includes('debug_session');
                      
                      // Format results nicely
                      resultElement.innerHTML = `
                        <div class="p-2 bg-slate-800 rounded text-sm font-mono">
                          <div class="mb-2">
                            <span class="text-blue-400">Debug Cookies Present:</span>
                            <br/>
                            <span class="ml-4">- Session Cookie:</span> 
                            <span class="${hasDebugCookie ? 'text-green-400' : 'text-red-400'}">
                              ${hasDebugCookie ? 'Yes ✅' : 'No ❌'}
                            </span>
                          </div>
                          <div class="mb-2">
                            <span class="text-blue-400">NextAuth Session:</span>
                            <pre class="whitespace-pre-wrap text-xs mt-1">${JSON.stringify(nextAuthSession, null, 2)}</pre>
                          </div>
                          <div>
                            <span class="text-blue-400">Debug Session:</span>
                            <pre class="whitespace-pre-wrap text-xs mt-1">${JSON.stringify(debugSession, null, 2)}</pre>
                          </div>
                        </div>
                      `;
                    })
                    .catch(err => {
                      // Use type-safe error handling
                      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                      document.getElementById('session-info')!.innerHTML = `
                        <div class="p-2 bg-red-900/50 rounded text-red-200 text-sm font-mono">
                          Error fetching session: ${errorMessage}
                        </div>
                      `;
                    });
                }}
                className="w-full mb-4"
                glowMode="pulse"
              >
                Check Session Status
              </GlowButton>
              
              <div className="flex justify-between mb-4">
                <GlowButton
                  onClick={() => {
                    window.location.href = '/dashboard';
                  }}
                  glowMode="colorShift"
                  className="w-1/2 mr-2"
                >
                  Go to Dashboard
                </GlowButton>
                
                <GlowButton
                  onClick={() => {
                    // Clear debug session cookie
                    document.cookie = 'debug_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                    document.getElementById('session-info')!.innerHTML = `
                      <div class="p-2 bg-slate-800 rounded text-sm font-mono">
                        <div class="text-green-400">Debug cookie cleared ✅</div>
                      </div>
                    `;
                    setTimeout(() => {
                      window.location.reload();
                    }, 1000);
                  }}
                  glowMode="breathe"
                  className="w-1/2 ml-2"
                >
                  Clear Debug Session
                </GlowButton>
              </div>
              
              <pre id="session-info" className="bg-black/30 p-4 rounded-md text-gray-300 text-sm overflow-auto max-h-64">
                Click button to check session
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
