"use client";

import React from "react";
import { SiebarNav } from "@/ui/layouts/SiebarNav";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  Home, 
  CreditCard, 
  DollarSign,
  Users,
  Settings,
  HelpCircle,
  LogOut
} from "lucide-react";

function SidebarNav() {
  const pathname = usePathname();
  
  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Bill Pay", href: "/dashboard/bill-pay", icon: CreditCard },
    { name: "Capital", href: "/dashboard/capital", icon: DollarSign },
    { name: "Clients & Vendors", href: "/dashboard/clients-vendors", icon: Users },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];
  
  return (
    <SiebarNav>
      <div className="flex h-full w-full flex-col justify-between bg-default-background px-4 py-8">
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <div className="px-2">
            <Link href="/dashboard">
              <div className="flex items-center gap-2">
                <Image src="/logo.svg" alt="WonderPay Logo" width={32} height={32} />
                <span className="text-xl font-semibold">WonderPay</span>
              </div>
            </Link>
          </div>
          
          {/* Navigation */}
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-default-font hover:bg-neutral-100"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* Footer Items */}
        <div className="flex flex-col gap-2">
          <Link 
            href="/help"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-default-font hover:bg-neutral-100"
          >
            <HelpCircle className="h-5 w-5" />
            <span>Help & Support</span>
          </Link>
          <Link 
            href="/logout"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-default-font hover:bg-neutral-100"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </Link>
        </div>
      </div>
    </SiebarNav>
  );
}

export default SidebarNav;
