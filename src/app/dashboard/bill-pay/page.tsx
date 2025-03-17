"use client";

import { useRef, useState } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { GlowButton } from "@/components/ui/glow-button";
import { Search, Calendar, Plus, FileText, Wallet, Loader2 } from "lucide-react";
import { usePayables } from "~/hooks/usePayables";

// Type definition for bill form
interface BillFormData {
  vendor: string;
  amount: number;
  due_date: string;
  category: string;
  payment_method: string;
  recurring: boolean;
  frequency?: string;
}

export default function BillPayPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [showAddBillForm, setShowAddBillForm] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Use our custom hook for bill pay operations
  const {
    payables,
    isLoading,
    isError,
    error,
    createPayable,
    isCreating,
    updateStatus,
    isUpdating,
    selectedStatus,
    setSelectedStatus,
    formatCurrency,
    formatDate,
    getStatusInfo,
    calculateStatistics
  } = usePayables();
  
  // Set active tab to match the hook's status filter
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedStatus(tab === "all" ? null : tab);
  };
  
  // Handle form submission
  const handleSubmitBill = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formRef.current) return;
    
    const formData = new FormData(formRef.current);
    const billData: Partial<BillFormData> = {
      vendor: formData.get("vendor") as string,
      amount: parseFloat(formData.get("amount") as string),
      due_date: formData.get("due_date") as string,
      category: formData.get("category") as string,
      payment_method: formData.get("payment_method") as string,
      recurring: formData.get("recurring") === "on",
    };
    
    if (billData.recurring) {
      billData.frequency = formData.get("frequency") as string;
    }
    
    // Call the mutation function from our hook
    createPayable(billData as any);
    
    // Reset the form and hide it
    setShowAddBillForm(false);
    formRef.current.reset();
  };
  
  // Calculate statistics based on payables data
  const stats = calculateStatistics(payables?.data ?? []);
  const totalBills = stats.totalBills;
  const totalAmount = stats.totalAmount;
  const upcomingDue = stats.upcomingDue;
  
  return (
    <div className="space-y-8">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Bill Pay</h1>
        <div className="flex gap-3">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search bills..."
            />
          </div>
          <GlowButton 
            onClick={() => setShowAddBillForm(!showAddBillForm)} 
            className="flex items-center"
            glowColors={['#3B82F6', '#60A5FA']}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Bill
          </GlowButton>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Bills" 
          value={totalBills.toString()}
          icon={<FileText className="h-6 w-6 text-blue-500" />}
          description="Active bills to pay"
        />
        <StatCard 
          title="Total Amount" 
          value={formatCurrency(totalAmount)}
          icon={<Wallet className="h-6 w-6 text-blue-500" />}
          description="Bills due this month"
        />
        <StatCard 
          title="Upcoming Due" 
          value={upcomingDue.toString()}
          icon={<Calendar className="h-6 w-6 text-blue-500" />}
          description="Bills due in next 7 days"
        />
      </div>

      {/* Show add bill form if enabled */}
      {showAddBillForm && (
        <Card className="p-6 mb-6 border border-blue-200 bg-blue-50">
          <h2 className="text-xl font-bold mb-4">Add New Bill</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Vendor/Payee</label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter vendor name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <input
                type="number"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <input
                type="date"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option>Select a category</option>
                <option>Office Supplies</option>
                <option>Utilities</option>
                <option>Software Services</option>
                <option>Marketing</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Method</label>
              <select
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option>Select payment method</option>
                <option>Bank Transfer</option>
                <option>Credit Card</option>
                <option>ACH</option>
                <option>Wire Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Recurring</label>
              <div className="mt-1 flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700">Recurring payment</span>
              </div>
            </div>
          </div>
      <form ref={formRef} onSubmit={handleSubmitBill}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Vendor/Payee</label>
            <input
              type="text"
              name="vendor"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter vendor name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <input
              type="number"
              name="amount"
              step="0.01"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Due Date</label>
            <input
              type="date"
              name="due_date"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              name="category"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            >
              <option value="">Select a category</option>
              <option>Office Supplies</option>
              <option>Utilities</option>
              <option>Software Services</option>
              <option>Marketing</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Method</label>
            <select
              name="payment_method"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            >
              <option value="">Select payment method</option>
              <option>Bank Transfer</option>
              <option>Credit Card</option>
              <option>ACH</option>
              <option>Wire Transfer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Recurring</label>
            <div className="mt-1 flex items-center">
              <input
                type="checkbox"
                name="recurring"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-700">Recurring payment</span>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button 
            type="button"
            onClick={() => setShowAddBillForm(false)} 
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <GlowButton
            type="submit"
            disabled={isCreating}
            glowColors={['#3B82F6', '#60A5FA']}
          >
            {isCreating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Save Bill
          </GlowButton>
        </div>
      </form>
        </Card>
      )}

      {/* Filter tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange("all")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "all"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            All Bills
          </button>
          <button
            onClick={() => handleTabChange("pending")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "pending"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => handleTabChange("scheduled")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "scheduled"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Scheduled
          </button>
          <button
            onClick={() => handleTabChange("paid")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "paid"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Paid
          </button>
          <button
            onClick={() => handleTabChange("overdue")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "overdue"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Overdue
          </button>
        </nav>
      </div>

      {/* Bill list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <span className="ml-2 text-gray-600">Loading bills...</span>
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-red-500">
            <p>Error loading bills: {error?.message || "Unknown error"}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
            >
              Try again
            </button>
          </div>
        ) : payables?.data && payables.data.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor/Payee
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payables.data.map((bill) => {
                const statusInfo = getStatusInfo(bill.status);
                return (
                  <tr key={bill.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{bill.vendor || "Unknown Vendor"}</div>
                      <div className="text-xs text-gray-500">
                        {bill.hasOwnProperty('recurring') && bill.recurring ? 
                          `${bill.hasOwnProperty('frequency') ? bill.frequency : "Recurring"} payment` 
                          : "One-time payment"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(bill.amount)}</div>
                      <div className="text-xs text-gray-500">{bill.payment_method}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(bill.due_date || "")}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bill.category || "Uncategorized"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => {/* Edit functionality would go here */}}
                        >
                          Edit
                        </button>
                        {bill.status !== "paid" && (
                          <button 
                            className="text-green-600 hover:text-green-900"
                            onClick={() => updateStatus({ payableId: bill.id, status: "paid" })}
                            disabled={isUpdating}
                          >
                            Pay Now
                          </button>
                        )}
                        {bill.status !== "canceled" && (
                          <button 
                            className="text-red-600 hover:text-red-900"
                            onClick={() => updateStatus({ payableId: bill.id, status: "canceled" })}
                            disabled={isUpdating}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <p>No bills found. Add a new bill to get started!</p>
          </div>
        )}
      </div>

      {/* Status info */}
      <div className="bg-green-50 border border-green-200 rounded-md p-4 text-sm text-green-700">
        <p className="font-medium">Bill Pay module is now connected to the Monite API!</p>
        <p className="mt-1">This module now provides the following functionality:</p>
        <ul className="mt-2 list-disc list-inside">
          <li>Create and manage bill payments through the Monite payables API</li>
          <li>Schedule one-time payments with accurate status tracking</li>
          <li>Filter bills by their payment status</li>
          <li>Mark bills as paid or canceled with real-time updates</li>
        </ul>
      </div>
    </div>
  );
}
