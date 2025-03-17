"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  Home, 
  ArrowRightLeft, 
  ArrowDownLeft, 
  FileText, 
  CreditCard, 
  Wallet, 
  Users, 
  Settings, 
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  
  // Function to check if a path is active
  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') {
      return true;
    }
    return path !== '/dashboard' && pathname.startsWith(path);
  };

  return (
    <div className="h-full w-64 flex flex-col bg-white border-r border-gray-100 shadow-sm">
      {/* Logo Section */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center">
          <div className="relative flex items-center">
            {/* Use local ladybug.svg with onError fallback */}
            <div className="relative w-10 h-10 mr-3">
              <Image 
                src="/ladybug.svg" 
                alt="WonderPay" 
                width={40} 
                height={40} 
                className="mr-3"
              />
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            </div>
          </div>
        </Link>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-4 space-y-4">
        <Link 
          href="/dashboard"
          className={cn(
            "flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-colors",
            isActive('/dashboard') 
              ? "bg-blue-50 text-blue-600" 
              : "text-gray-700 hover:bg-gray-100"
          )}
        >
          <Home size={20} />
          <span>Home</span>
        </Link>
        
        <Link 
          href="/dashboard/bill-pay"
          className={cn(
            "flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-colors",
            isActive('/dashboard/bill-pay') 
              ? "bg-blue-50 text-blue-600" 
              : "text-gray-700 hover:bg-gray-100"
          )}
        >
          <ArrowRightLeft size={20} />
          <span>Bill Pay</span>
        </Link>
        
        <Link 
          href="/dashboard/receivables"
          className={cn(
            "flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-colors",
            isActive('/dashboard/receivables') 
              ? "bg-blue-50 text-blue-600" 
              : "text-gray-700 hover:bg-gray-100"
          )}
        >
          <ArrowDownLeft size={20} />
          <span>Receivables</span>
        </Link>
        
        <Link 
          href="/dashboard/create-invoice"
          className={cn(
            "flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-colors",
            isActive('/dashboard/create-invoice') 
              ? "bg-blue-50 text-blue-600" 
              : "text-gray-700 hover:bg-gray-100"
          )}
        >
          <FileText size={20} />
          <span>Create Invoice</span>
        </Link>
        
        <Link 
          href="/dashboard/quickpay"
          className={cn(
            "flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-colors",
            isActive('/dashboard/quickpay') 
              ? "bg-blue-50 text-blue-600" 
              : "text-gray-700 hover:bg-gray-100"
          )}
        >
          <CreditCard size={20} />
          <span>QuickPay</span>
        </Link>
        
        <Link 
          href="/dashboard/capital"
          className={cn(
            "flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-colors",
            isActive('/dashboard/capital') 
              ? "bg-blue-50 text-blue-600" 
              : "text-gray-700 hover:bg-gray-100"
          )}
        >
          <Wallet size={20} />
          <span>WonderPay Capital</span>
        </Link>
        
        <Link 
          href="/dashboard/documents"
          className={cn(
            "flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-colors",
            isActive('/dashboard/documents') 
              ? "bg-blue-50 text-blue-600" 
              : "text-gray-700 hover:bg-gray-100"
          )}
        >
          <FileText size={20} />
          <span>Documents</span>
        </Link>
        
        <Link 
          href="/dashboard/clients-vendors"
          className={cn(
            "flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-colors",
            isActive('/dashboard/clients-vendors') 
              ? "bg-blue-50 text-blue-600" 
              : "text-gray-700 hover:bg-gray-100"
          )}
        >
          <Users size={20} />
          <span>Clients & Vendors</span>
        </Link>
        
        <Link 
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-colors",
            isActive('/dashboard/settings') 
              ? "bg-blue-50 text-blue-600" 
              : "text-gray-700 hover:bg-gray-100"
          )}
        >
          <Settings size={20} />
          <span>Settings</span>
        </Link>
      </nav>
      
      {/* Logout Link */}
      <div className="px-4 py-6 border-t border-gray-100">
        <Link 
          href="/api/auth/signout"
          className="flex items-center gap-3 px-4 py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          <LogOut size={20} />
          <span>Log Out</span>
        </Link>
      </div>
    </div>
  );
}
