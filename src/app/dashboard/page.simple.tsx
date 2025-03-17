"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { GlowButton } from "@/components/ui/glow-button";

// Simple financial dashboard with minimal dependencies
export default function SimpleDashboardPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Financial data (static for now)
  const financialData = {
    accountBalance: "$42,380.18",
    pendingInvoices: "$75,000.00",
    pendingBills: "$50,000.00",
    recentTransactions: [
      { id: 'tx1', date: '2023-06-01', description: 'Client Payment - ABC Corp', amount: '$12,500.00', status: 'completed' },
      { id: 'tx2', date: '2023-06-03', description: 'Supplier Invoice', amount: '-$4,250.00', status: 'completed' },
      { id: 'tx3', date: '2023-06-05', description: 'Subscription Revenue', amount: '$3,750.00', status: 'completed' },
      { id: 'tx4', date: '2023-06-10', description: 'Client Payment', amount: '$8,800.00', status: 'pending' }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">WonderPay Dashboard</h1>
          <div className="flex items-center gap-4">
            {session?.user?.name && (
              <span className="text-sm text-gray-600">
                Welcome, {session.user.name}
              </span>
            )}
            <GlowButton 
              onClick={() => alert('Refreshing data...')}
              glowColors={["#4F46E5", "#2563EB"]}
              className="px-4 py-2 text-sm"
            >
              Refresh Data
            </GlowButton>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex -mb-px">
            {['overview', 'invoices', 'bills', 'reports'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-6 text-sm font-medium capitalize ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Financial summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-sm text-gray-500 mb-1">Account Balance</div>
            <div className="text-2xl font-bold text-gray-900">{financialData.accountBalance}</div>
            <div className="text-sm text-green-500 mt-2">Available for transfers and payments</div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-sm text-gray-500 mb-1">Pending Invoices</div>
            <div className="text-2xl font-bold text-gray-900">{financialData.pendingInvoices}</div>
            <div className="text-sm text-blue-500 mt-2">Expected incoming payments</div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-sm text-gray-500 mb-1">Pending Bills</div>
            <div className="text-2xl font-bold text-gray-900">{financialData.pendingBills}</div>
            <div className="text-sm text-red-500 mt-2">Outstanding payments due</div>
          </div>
        </div>

        {/* Recent transactions */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Transactions</h2>
            <GlowButton 
              onClick={() => window.location.href = '/dashboard/transactions'}
              glowColors={["#4F46E5", "#2563EB"]}
              glowMode="static"
              className="px-4 py-2 text-sm"
            >
              View All
            </GlowButton>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {financialData.recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ 
                      color: transaction.amount.startsWith('-') ? '#EF4444' : '#10B981' 
                    }}>
                      {transaction.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <GlowButton
              onClick={() => window.location.href = '/dashboard/create-invoice'}
              glowColors={["#10B981", "#059669"]}
              className="py-3"
            >
              Create Invoice
            </GlowButton>
            
            <GlowButton
              onClick={() => window.location.href = '/dashboard/pay-bill'}
              glowColors={["#3B82F6", "#2563EB"]}
              className="py-3"
            >
              Pay Bill
            </GlowButton>
            
            <GlowButton
              onClick={() => window.location.href = '/dashboard/transfer'}
              glowColors={["#8B5CF6", "#7C3AED"]}
              className="py-3"
            >
              Transfer Funds
            </GlowButton>
            
            <GlowButton
              onClick={() => window.location.href = '/dashboard/reports'}
              glowColors={["#EC4899", "#DB2777"]}
              className="py-3"
            >
              View Reports
            </GlowButton>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center">
            &copy; {new Date().getFullYear()} WonderPay. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
