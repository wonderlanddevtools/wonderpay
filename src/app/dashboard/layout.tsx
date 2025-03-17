"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/layout/sidebar";
import { Menu, X } from "lucide-react";
import { GlowButton } from "@/components/ui/glow-button";
import { usePathname } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { EntityUserSetup } from "@/components/monite/EntityUserSetup";

const getSectionTitle = (pathname: string): string => {
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname.startsWith("/dashboard/bill-pay")) return "Bill Pay";
  if (pathname.startsWith("/dashboard/receivables")) return "Receivables";
  if (pathname.startsWith("/dashboard/create-invoice")) return "Create Invoice";
  if (pathname.startsWith("/dashboard/quickpay")) return "QuickPay";
  if (pathname.startsWith("/dashboard/capital")) return "WonderPay Capital";
  if (pathname.startsWith("/dashboard/clients-vendors")) return "Clients & Vendors";
  if (pathname.startsWith("/dashboard/settings")) return "Settings";
  return "Dashboard";
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const sectionTitle = getSectionTitle(pathname);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };

    // Check on initial render
    checkScreenSize();

    // Add event listener
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Custom loading component for both ProtectedRoute and internal loading state
  const loadingComponent = (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em]"></div>
        <p className="mt-4 text-gray-600">Loading your dashboard...</p>
      </div>
    </div>
  );

  // Internal loading for session
  if (status === "loading") {
    return loadingComponent;
  }

  // Return the protected layout
  return (
    <ProtectedRoute 
      loading={loadingComponent}
      skipRedirectInDevMode={process.env.NODE_ENV === "development"}
    >
      <div className="flex h-screen bg-gray-50">
        {/* Static sidebar for desktop */}
        <div className="hidden lg:block w-64 h-screen flex-shrink-0">
          <Sidebar />
        </div>

        {/* Mobile sidebar - shown based on sidebarOpen state */}
        {isMobile && (
          <>
            <div 
              className={`fixed inset-y-0 left-0 z-40 w-64 transition-transform transform ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <Sidebar />
            </div>
            
            {/* Overlay */}
            {sidebarOpen && (
              <div 
                className="fixed inset-0 bg-gray-600 bg-opacity-50 z-30"
                onClick={() => setSidebarOpen(false)}
              />
            )}
            
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </>
        )}
        
        {/* Main Content */}
        <main 
          className="flex-1 overflow-y-auto"
          data-component-name="DashboardMain"
        >
        {/* Page header */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-800">{sectionTitle}</h1>
            {session?.user && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 hidden md:inline-block">
                  {session.user.email}
                </span>
                <GlowButton glowMode="static" glowColors={['#3B82F6', '#2563EB', '#1D4ED8']}>
                  Profile
                </GlowButton>
              </div>
            )}
          </div>
        </div>

        <div className="h-full w-full p-4 md:p-8 lg:p-10">
          {/* Entity User Setup component - shows only when setup is needed */}
          <EntityUserSetup />
          
          {children}
        </div>
      </main>
    </div>
    </ProtectedRoute>
  );
}
