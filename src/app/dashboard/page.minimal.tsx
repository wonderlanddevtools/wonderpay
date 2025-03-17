"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GlowButton } from "@/components/ui/glow-button";
// Import the animateValue function directly
import { animateValue } from "@/lib/animations/gsap";

// Import icons
import { 
  RefreshCw,
  AlertCircle,
  Check,
  Clock,
  X,
  ChevronDown,
  ArrowUpRight
} from "lucide-react";

// Define interfaces for financial data
interface FinancialSummary {
  accountsPayable: number;
  accountsReceivable: number;
  cashOnHand: number;
  workingCapital: number;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
}

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function DashboardPage() {
  const { data: session } = useSession();
  // Control loading states throughout the dashboard
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('day');
  
  // Add a loading overlay that will show when isLoading is true
  const LoadingOverlay = () => {
    if (!isLoading) return null;
    return (
      <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-blue-600 font-medium">Loading your financial data...</p>
        </div>
      </div>
    );
  };
  
  // Refs for GSAP animations
  const dashboardRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const transactionsRef = useRef<HTMLDivElement>(null);
  
  // Financial data states
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    accountsPayable: 50000, // Default/placeholder values
    accountsReceivable: 75000,
    cashOnHand: 42380.18,
    workingCapital: 58479.83
  });

  // Mock transactions data - will be fetched from API in production
  // Using useMemo to prevent recreating this array on each render
  const mockTransactions = React.useMemo<Transaction[]>(() => [
    { id: 'tx1', date: '2023-06-01', description: 'Client Payment - ABC Corp', amount: 12500, status: 'completed' },
    { id: 'tx2', date: '2023-06-03', description: 'Supplier Invoice - XYZ Supplies', amount: -4250, status: 'completed' },
    { id: 'tx3', date: '2023-06-05', description: 'Subscription Revenue', amount: 3750, status: 'completed' },
    { id: 'tx4', date: '2023-06-10', description: 'Client Payment - Smith LLC', amount: 8800, status: 'pending' },
    { id: 'tx5', date: '2023-06-11', description: 'Office Expenses', amount: -1250, status: 'failed' },
    { id: 'tx6', date: '2023-06-15', description: 'Quarterly Tax Payment', amount: -5680, status: 'completed' },
    { id: 'tx7', date: '2023-06-18', description: 'Client Retainer - Johnson Inc', amount: 7500, status: 'completed' },
    { id: 'tx8', date: '2023-06-22', description: 'Software Subscription', amount: -129, status: 'completed' },
    { id: 'tx9', date: '2023-06-30', description: 'Monthly Accounting Service', amount: -899, status: 'pending' }
  ], []);
  
  // Use the mock transactions data for display
  const [displayedTransactions, setDisplayedTransactions] = useState<Transaction[]>(mockTransactions);
  
  // Filter transactions based on time period
  const filterTransactionsByPeriod = useCallback(() => {
    // This would normally filter based on the activeTab (day, week, month)
    // For now, we'll just use the mock data
    setDisplayedTransactions(mockTransactions);
  }, [mockTransactions]);
  
  // Fetch financial summary data
  const fetchFinancialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In production, this would be an API call to fetch actual financial data from Monite API
      // As documented in the Monite Public Workspace: https://www.postman.com/monite/monite-public-workspace/overview
      // Using the entity_user grant type for authentication and x-monite-version header
      
      // For now, update with mock data
      setFinancialSummary({
        accountsPayable: 50000,
        accountsReceivable: 75000,
        cashOnHand: 42380.18,
        workingCapital: 58479.83
      });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (err) {
      setError("Failed to fetch financial data");
      console.error("Error fetching financial data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Fetch financial data on component mount
  useEffect(() => {
    if (session) {
      void fetchFinancialData();
    }
  }, [session, fetchFinancialData]);
  
  // Update displayed transactions when activeTab changes
  useEffect(() => {
    filterTransactionsByPeriod();
  }, [activeTab, filterTransactionsByPeriod]);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Status indicator component for transactions
  const StatusIndicator = ({ status }: { status: Transaction['status'] }) => {
    switch (status) {
      case 'completed':
        return <span className="flex items-center text-green-500"><Check className="w-4 h-4 mr-1" /> Completed</span>;
      case 'pending':
        return <span className="flex items-center text-amber-500"><Clock className="w-4 h-4 mr-1" /> Pending</span>;
      case 'failed':
        return <span className="flex items-center text-red-500"><X className="w-4 h-4 mr-1" /> Failed</span>;
      default:
        return null;
    }
  };
  
  // GSAP animations setup
  useGSAP(() => {
    if (dashboardRef.current) {
      // Animate financial metrics with the animateValue function
      // This shows how we're using the imported animateValue function
      if (!isLoading) {
        // Animate financial metrics with counters
        // Safely handle potentially null DOM elements with optional chaining
        const arElement = document.querySelector('.accounts-receivable-value');
        if (arElement) {
          animateValue({
            startValue: 0,
            endValue: financialSummary.accountsReceivable,
            duration: 1.5,
            element: arElement,
            formatter: (value) => formatCurrency(value)
          });
        }
        
        const apElement = document.querySelector('.accounts-payable-value');
        if (apElement) {
          animateValue({
            startValue: 0,
            endValue: financialSummary.accountsPayable,
            duration: 1.5,
            element: apElement,
            formatter: (value) => formatCurrency(value)
          });
        }
        
        const cohElement = document.querySelector('.cash-on-hand-value');
        if (cohElement) {
          animateValue({
            startValue: 0,
            endValue: financialSummary.cashOnHand,
            duration: 1.5,
            element: cohElement,
            formatter: (value) => formatCurrency(value)
          });
        }
        
        const wcElement = document.querySelector('.working-capital-value');
        if (wcElement) {
          animateValue({
            startValue: 0,
            endValue: financialSummary.workingCapital,
            duration: 1.5,
            element: wcElement,
            formatter: (value) => formatCurrency(value)
          });
        }
      }
      // Stagger entrance animation for all major elements
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      
      // Header animation
      timeline.from(".dashboard-header", { 
        y: -30, 
        opacity: 0, 
        duration: 0.8 
      });
      
      // Metrics cards animation with stagger
      timeline.from(".metric-card", { 
        y: 40, 
        opacity: 0, 
        stagger: 0.2, 
        duration: 0.6 
      }, "-=0.4");
      
      // Chart section
      timeline.from(".chart-section", { 
        x: -40, 
        opacity: 0, 
        duration: 0.8 
      }, "-=0.2");
      
      // Quick actions section
      timeline.from(".quick-actions", { 
        x: 40, 
        opacity: 0, 
        duration: 0.8 
      }, "-=0.6");
      
      // Transactions table
      timeline.from(".transactions-section", { 
        y: 60, 
        opacity: 0, 
        duration: 0.8 
      }, "-=0.4");
      
      // Create scroll animations for sections
      if (metricsRef.current) {
        ScrollTrigger.create({
          trigger: metricsRef.current,
          start: "top 80%",
          onEnter: () => {
            gsap.to(".metric-value", {
              opacity: 1,
              y: 0,
              stagger: 0.1,
              duration: 0.8,
              ease: "power2.out"
            });
          },
          once: true
        });
      }
      
      // Quick actions section animations
      if (quickActionsRef.current) {
        ScrollTrigger.create({
          trigger: quickActionsRef.current,
          start: "top 85%",
          onEnter: () => {
            gsap.from(".action-button", {
              y: 20,
              opacity: 0,
              stagger: 0.1,
              duration: 0.5,
              ease: "power3.out"
            });
          },
          once: true
        });
      }
      
      // Transactions section animations
      if (transactionsRef.current) {
        ScrollTrigger.create({
          trigger: transactionsRef.current,
          start: "top 90%",
          onEnter: () => {
            gsap.from(".transaction-row", {
              y: 20,
              opacity: 0,
              stagger: 0.1,
              duration: 0.5,
              ease: "power2.out"
            });
          },
          once: true
        });
      }
    }
  }, []);
  
  // Check for loading or error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-red-500">Error</h1>
        <p className="text-gray-600 mt-2">{error}</p>
        <button 
          onClick={() => void fetchFinancialData()}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2 inline" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto pt-8 pb-16" ref={dashboardRef}>
      {/* Add loading overlay */}
      <LoadingOverlay />
      <div className="max-w-full flex flex-col items-start gap-8 px-8">
        {/* Dashboard Header */}
        <div className="dashboard-header flex w-full items-start gap-4 mb-4">
          <div className="flex grow shrink-0 basis-0 flex-wrap items-start gap-2">
            <span className="text-heading-2 font-heading-2 text-default-font bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
              Financial Overview
            </span>
            {session?.user?.name && (
              <p className="text-body font-body text-subtext-color">
                Welcome back, <span className="font-semibold">{session.user.name}</span>!
              </p>
            )}
            <p className="w-full text-sm text-neutral-500 mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        
        {/* Financial Summary Cards */}
        <div ref={metricsRef} className="flex w-full flex-wrap items-start gap-6 mb-4">
          {/* Income (AR) */}
          <div className="metric-card flex min-w-[180px] grow shrink-0 basis-0 flex-col items-start gap-1 rounded-xl border border-solid border-neutral-100 bg-white px-8 py-7 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="h-2 w-1/3 absolute top-0 left-0 bg-blue-500 rounded-br-md"></div>
            <span className="relative z-10 line-clamp-1 w-full text-body font-body text-subtext-color flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full bg-blue-500"></span>
              Income (AR)
            </span>
            <span className="relative z-10 w-full text-heading-3 font-heading-3 text-default-font mt-1 accounts-receivable-value">
              {formatCurrency(financialSummary.accountsReceivable)}
            </span>
            <span className="relative z-10 w-full text-xs text-blue-500 mt-2 font-medium">
              ↑ 12.4% from last month
            </span>
          </div>
          
          {/* Bill Pay (AP) */}
          <div className="metric-card flex min-w-[180px] grow shrink-0 basis-0 flex-col items-start gap-1 rounded-xl border border-solid border-neutral-100 bg-white px-8 py-7 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="h-2 w-1/3 absolute top-0 left-0 bg-red-500 rounded-br-md"></div>
            <span className="relative z-10 line-clamp-1 w-full text-body font-body text-subtext-color flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full bg-red-500"></span>
              Bill Pay (AP)
            </span>
            <span className="relative z-10 w-full text-heading-3 font-heading-3 text-default-font mt-1 accounts-payable-value">
              {formatCurrency(financialSummary.accountsPayable)}
            </span>
            <span className="relative z-10 w-full text-xs text-red-500 mt-2 font-medium">
              ↑ 5.7% from last month
            </span>
          </div>
          
          {/* Current Balance */}
          <div className="metric-card flex min-w-[180px] grow shrink-0 basis-0 flex-col items-start gap-1 rounded-xl border border-solid border-neutral-100 bg-white px-8 py-7 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="h-2 w-1/3 absolute top-0 left-0 bg-green-500 rounded-br-md"></div>
            <span className="relative z-10 line-clamp-1 w-full text-body font-body text-subtext-color flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full bg-green-500"></span>
              Current Balance
            </span>
            <span className="relative z-10 w-full text-heading-3 font-heading-3 text-default-font mt-1 cash-on-hand-value">
              {formatCurrency(financialSummary.cashOnHand)}
            </span>
            <span className="relative z-10 w-full text-xs text-green-500 mt-2 font-medium">
              ↓ 3.2% from last month
            </span>
          </div>

          {/* Working Capital */}
          <div className="metric-card flex min-w-[180px] grow shrink-0 basis-0 flex-col items-start gap-1 rounded-xl border border-solid border-neutral-100 bg-white px-8 py-7 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="h-2 w-1/3 absolute top-0 left-0 bg-purple-500 rounded-br-md"></div>
            <span className="relative z-10 line-clamp-1 w-full text-body font-body text-subtext-color flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full bg-purple-500"></span>
              Working Capital
            </span>
            <span className="relative z-10 w-full text-heading-3 font-heading-3 text-default-font mt-1 working-capital-value">
              {formatCurrency(financialSummary.workingCapital)}
            </span>
            <span className="relative z-10 w-full text-xs text-purple-500 mt-2 font-medium">
              ↑ 8.9% from last month
            </span>
          </div>
        </div>
        
        {/* Cash Flow Chart and QuickPay */}
        <div className="flex w-full items-start gap-8 flex-col lg:flex-row pb-2">
          {/* Cash Flow Chart */}
          <div ref={chartRef} className="chart-section flex grow shrink-0 basis-0 flex-col items-start gap-6 rounded-xl border border-solid border-neutral-100 bg-white px-8 py-8 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col">
                <span className="text-heading-3 font-heading-3 text-default-font flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-indigo-500"></span>
                  Cash Flow
                </span>
                <span className="text-xs text-gray-500 mt-1">Real-time financial overview</span>
              </div>
              <div className="flex rounded-md overflow-hidden border border-indigo-200">
                <button 
                  className={`px-3 py-1.5 text-sm font-medium ${activeTab === 'day' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-600 hover:bg-indigo-50'}`}
                  onClick={() => setActiveTab('day')}
                >
                  30 Days
                </button>
                <button 
                  className={`px-3 py-1.5 text-sm font-medium ${activeTab === 'week' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-600 hover:bg-indigo-50'}`}
                  onClick={() => setActiveTab('week')}
                >
                  60 Days
                </button>
                <button 
                  className={`px-3 py-1.5 text-sm font-medium ${activeTab === 'month' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-600 hover:bg-indigo-50'}`}
                  onClick={() => setActiveTab('month')}
                >
                  90 Days
                </button>
              </div>
            </div>
            
            {/* Simplified Chart Visualization */}
            <div className="h-72 w-full relative mt-2">
              <div className="absolute inset-0 flex items-end">
                <div className="h-full w-1/8 px-1">
                  <div className="bg-blue-500 h-[60%] rounded-t-sm w-full relative group">
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-blue-700 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-1">Jan: $120,000</div>
                  </div>
                </div>
                <div className="h-full w-1/8 px-1">
                  <div className="bg-blue-500 h-[65%] rounded-t-sm w-full relative group">
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-blue-700 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-1">Feb: $130,000</div>
                  </div>
                </div>
                <div className="h-full w-1/8 px-1">
                  <div className="bg-blue-500 h-[57.5%] rounded-t-sm w-full relative group">
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-blue-700 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-1">Mar: $115,000</div>
                  </div>
                </div>
                <div className="h-full w-1/8 px-1">
                  <div className="bg-blue-500 h-[62.5%] rounded-t-sm w-full relative group">
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-blue-700 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-1">Apr: $125,000</div>
                  </div>
                </div>
                <div className="h-full w-1/8 px-1">
                  <div className="bg-blue-500 h-[55%] rounded-t-sm w-full relative group">
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-blue-700 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-1">May: $110,000</div>
                  </div>
                </div>
                <div className="h-full w-1/8 px-1">
                  <div className="bg-blue-500 h-[67.5%] rounded-t-sm w-full relative group">
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-blue-700 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-1">Jun: $135,000</div>
                  </div>
                </div>
                <div className="h-full w-1/8 px-1">
                  <div className="bg-blue-500 h-[52.5%] rounded-t-sm w-full relative group">
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-blue-700 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-1">Jul: $105,000</div>
                  </div>
                </div>
                <div className="h-full w-1/8 px-1">
                  <div className="bg-blue-500 h-[70%] rounded-t-sm w-full relative group">
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-blue-700 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-1">Aug: $140,000</div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
              </div>
            </div>
          </div>
          
          {/* QuickPay Invoice Upload */}
          <div className="quick-actions flex grow shrink-0 basis-0 flex-col items-start gap-6 rounded-xl border border-solid border-neutral-100 bg-white px-8 py-8 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col">
                <span className="text-heading-3 font-heading-3 text-default-font flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-teal-500"></span>
                  QuickPay Invoice
                </span>
                <span className="text-xs text-gray-500 mt-1">Upload and process invoices instantly</span>
              </div>
              <button className="p-1.5 rounded-full hover:bg-teal-50 transition-colors">
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            
            <div className="flex w-full flex-col items-center justify-center gap-4 h-48 border-2 border-dashed border-gray-200 rounded-lg hover:border-teal-300 transition-colors p-4">
              <div className="rounded-full bg-teal-50 p-3">
                <ArrowUpRight className="w-6 h-6 text-teal-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">Drag and drop invoice files here</p>
                <p className="text-xs text-gray-500 mt-1">Supports PDF, PNG, JPEG, CSV</p>
              </div>
              <GlowButton
                className="action-button px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-400 text-white rounded-md hover:opacity-90 transition-all shadow-sm"
                onClick={() => console.log("Upload clicked")}
                glowColors={['#14b8a6', '#2dd4bf', '#5eead4', '#14b8a6']}
                glowMode="colorShift"
              >
                Upload Files
              </GlowButton>
            </div>
          </div>
        </div>
        
        {/* Recent Transactions */}
        <div ref={transactionsRef} className="transactions-section w-full max-w-full rounded-xl border border-neutral-100 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex w-full items-center justify-between mb-6">
            <div className="flex flex-col">
              <span className="text-heading-3 font-heading-3 text-default-font">Recent Transactions</span>
              <span className="text-xs text-gray-500 mt-0.5">Your latest financial activities</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                Export
              </button>
              <button className="px-3 py-1.5 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded-md transition-colors">
                View All
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayedTransactions.map((transaction: Transaction) => (
                  <tr key={transaction.id} className="transaction-row hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-700">{formatDate(transaction.date)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{transaction.description}</td>
                    <td className="px-4 py-3 text-sm">
                      <StatusIndicator status={transaction.status} />
                    </td>
                    <td className={`px-4 py-3 text-sm text-right font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
