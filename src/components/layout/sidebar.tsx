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

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const SidebarLink = ({ href, icon, label, active }: SidebarLinkProps) => {
  return (
    <Link 
      href={href} 
      className={cn(
        "flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-colors",
        active 
          ? "bg-blue-50 text-blue-600" 
          : "text-gray-700 hover:bg-gray-100"
      )}
    >
      <span className="text-[20px]">{icon}</span>
      <span>{label}</span>
    </Link>
  );
};

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
    <aside className="w-64 h-screen flex flex-col bg-white border-r border-gray-200">
      {/* Logo Section */}
      <div className="p-4 mb-4">
        <Link href="/dashboard" className="flex items-center justify-center">
          <Image 
            src="/ladybug.svg" 
            alt="WonderPay" 
            width={48} 
            height={48} 
            className="mx-auto"
          />
        </Link>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        <SidebarLink 
          href="/dashboard" 
          icon={<Home size={20} />} 
          label="Home" 
          active={isActive('/dashboard')}
        />
        <SidebarLink 
          href="/dashboard/bill-pay" 
          icon={<ArrowRightLeft size={20} />} 
          label="Bill Pay" 
          active={isActive('/dashboard/bill-pay')}
        />
        <SidebarLink 
          href="/dashboard/receivables" 
          icon={<ArrowDownLeft size={20} />} 
          label="Receivables" 
          active={isActive('/dashboard/receivables')}
        />
        <SidebarLink 
          href="/dashboard/create-invoice" 
          icon={<FileText size={20} />} 
          label="Create Invoice" 
          active={isActive('/dashboard/create-invoice')}
        />
        <SidebarLink 
          href="/dashboard/quickpay" 
          icon={<CreditCard size={20} />} 
          label="QuickPay" 
          active={isActive('/dashboard/quickpay')}
        />
        <SidebarLink 
          href="/dashboard/capital" 
          icon={<Wallet size={20} />} 
          label="WonderPay Capital" 
          active={isActive('/dashboard/capital')}
        />
        <SidebarLink 
          href="/dashboard/clients-vendors" 
          icon={<Users size={20} />} 
          label="Clients & Vendors" 
          active={isActive('/dashboard/clients-vendors')}
        />
        <SidebarLink 
          href="/dashboard/settings" 
          icon={<Settings size={20} />} 
          label="Settings" 
          active={isActive('/dashboard/settings')}
        />
      </nav>
      
      {/* Logout Link */}
      <div className="px-3 py-4 border-t border-gray-200">
        <Link 
          href="/api/auth/signout"
          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Log Out</span>
        </Link>
      </div>
    </aside>
  );
}
