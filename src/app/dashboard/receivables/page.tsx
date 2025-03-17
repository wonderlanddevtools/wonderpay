"use client";

import { useRef, useState } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { GlowButton } from "@/components/ui/glow-button";
import { Search, Calendar, Plus, FileText, Wallet, CreditCard, Loader2 } from "lucide-react";
import { useReceivables } from "~/hooks/useReceivables";

// Type definition for invoice form
interface InvoiceFormData {
  customer: string;
  amount: number;
  issue_date: string;
  due_date: string;
  category: string;
  payment_method: string;
  description?: string;
  invoice_number?: string;
}

export default function ReceivablesPage() {
  const [showCreateInvoiceForm, setShowCreateInvoiceForm] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Use our custom hook for receivables operations
  const {
    receivables,
    filteredReceivables,
    isLoading,
    isError,
    error,
    createReceivable,
    isCreating,
    updateReceivable,
    isUpdating,
    generatePdf,
    isGeneratingPdf,
    activeTab,
    setActiveTab,
    formatCurrency,
    formatDate,
    getStatusInfo,
    calculateStatistics
  } = useReceivables();
  
  // Handle form submission
  const handleSubmitInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formRef.current) return;
    
    const formData = new FormData(formRef.current);
    const invoiceData: Partial<InvoiceFormData> = {
      customer: formData.get("customer") as string,
      amount: parseFloat(formData.get("amount") as string),
      issue_date: formData.get("issue_date") as string,
      due_date: formData.get("due_date") as string,
      category: formData.get("category") as string,
      payment_method: formData.get("payment_method") as string,
      description: formData.get("description") as string,
    };
    
    // Set status to draft or pending based on button clicked
    const submitType = formData.get("submit_type") as string;
    const status = submitType === "draft" ? "draft" : "pending";
    
    // Call the mutation function from our hook
    createReceivable({ ...invoiceData, status } as any);
    
    // Reset the form and hide it
    setShowCreateInvoiceForm(false);
    formRef.current.reset();
  };
  
  // Calculate statistics
  const stats = calculateStatistics(receivables);
  
  return (
    <div className="space-y-8">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Receivables</h1>
        <div className="flex gap-3">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search receivables..."
            />
          </div>
          <GlowButton 
            onClick={() => setShowCreateInvoiceForm(!showCreateInvoiceForm)} 
            className="flex items-center"
            glowColors={['#3B82F6', '#60A5FA']}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </GlowButton>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          title="Total Invoices" 
          value={stats.totalInvoices.toString()}
          icon={<FileText className="h-6 w-6 text-blue-500" />}
          description="Active invoices sent"
        />
        <StatCard 
          title="Total Amount" 
          value={formatCurrency(stats.totalAmount)}
          icon={<Wallet className="h-6 w-6 text-blue-500" />}
          description="All invoices"
        />
        <StatCard 
          title="Overdue Invoices" 
          value={stats.overdueInvoices.toString()}
          icon={<Calendar className="h-6 w-6 text-red-500" />}
          description="Past due invoices"
        />
        <StatCard 
          title="Overdue Amount" 
          value={formatCurrency(stats.overdueAmount)}
          icon={<CreditCard className="h-6 w-6 text-red-500" />}
          description="Overdue payments"
        />
      </div>

      {/* Show create invoice form if enabled */}
      {showCreateInvoiceForm && (
        <Card className="p-6 mb-6 border border-blue-200 bg-blue-50">
          <h2 className="text-xl font-bold mb-4">Create New Invoice</h2>
          <form ref={formRef} onSubmit={handleSubmitInvoice}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer/Client</label>
                <input
                  type="text"
                  name="customer"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter customer name"
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
                <label className="block text-sm font-medium text-gray-700">Invoice Date</label>
                <input
                  type="date"
                  name="issue_date"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  defaultValue={new Date().toISOString().split('T')[0]}
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
                  <option>Consulting Services</option>
                  <option>Software Development</option>
                  <option>Technical Support</option>
                  <option>Product Sales</option>
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
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
              <textarea
                name="description"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                rows={3}
                placeholder="Enter invoice details or notes..."
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setShowCreateInvoiceForm(false)} 
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <GlowButton
                type="submit"
                name="submit_type"
                value="draft"
                disabled={isCreating}
                glowColors={['#3B82F6', '#60A5FA']}
              >
                {isCreating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Save as Draft
              </GlowButton>
              <GlowButton
                type="submit"
                name="submit_type"
                value="send"
                disabled={isCreating}
                glowColors={['#10B981', '#34D399']}
              >
                {isCreating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Save & Send
              </GlowButton>
            </div>
          </form>
        </Card>
      )}

      {/* Filter tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("all")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "all"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            All Invoices
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "pending"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveTab("paid")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "paid"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Paid
          </button>
          <button
            onClick={() => setActiveTab("overdue")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "overdue"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Overdue
          </button>
          <button
            onClick={() => setActiveTab("draft")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "draft"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Draft
          </button>
        </nav>
      </div>

      {/* Receivables list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <span className="ml-2 text-gray-600">Loading invoices...</span>
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-red-500">
            <p>Error loading invoices: {error?.message ?? "Unknown error"}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
            >
              Try again
            </button>
          </div>
        ) : filteredReceivables.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer/Client
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReceivables.map((invoice) => {
                const statusInfo = getStatusInfo(invoice.status);
                return (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{invoice.customer ?? "Unknown Customer"}</div>
                      <div className="text-xs text-gray-500">{invoice.category ?? "Uncategorized"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{invoice.invoice_number ?? "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(invoice.amount)}</div>
                      <div className="text-xs text-gray-500">{invoice.payment_method}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(invoice.issue_date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(invoice.due_date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => generatePdf({ receivableId: invoice.id })}
                          disabled={isGeneratingPdf}
                        >
                          {isGeneratingPdf ? <Loader2 className="h-3 w-3 animate-spin" /> : (invoice.status === "draft" ? "Edit" : "View PDF")}
                        </button>
                        {invoice.status === "draft" && (
                          <button 
                            className="text-green-600 hover:text-green-900"
                            onClick={() => updateReceivable({ receivableId: invoice.id, action: "send" })}
                            disabled={isUpdating}
                          >
                            Send
                          </button>
                        )}
                        {invoice.status === "pending" && (
                          <button 
                            className="text-green-600 hover:text-green-900"
                            onClick={() => updateReceivable({ receivableId: invoice.id, action: "mark_as_paid" })}
                            disabled={isUpdating}
                          >
                            Mark Paid
                          </button>
                        )}
                        {invoice.status === "overdue" && (
                          <button 
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => alert("Reminder email will be sent to the customer.")}
                          >
                            Send Reminder
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
            <p>No invoices found. Create a new invoice to get started!</p>
          </div>
        )}
      </div>

      {/* Status info */}
      <div className="bg-green-50 border border-green-200 rounded-md p-4 text-sm text-green-700">
        <p className="font-medium">Receivables module is now connected to the Monite API!</p>
        <p className="mt-1">This module now provides the following functionality:</p>
        <ul className="mt-2 list-disc list-inside">
          <li>Create and manage invoices through the Monite receivables API</li>
          <li>Track payment status in real-time with automatic updates</li>
          <li>Generate PDF invoices for download and email</li>
          <li>Filter invoices by status with real-time data</li>
        </ul>
      </div>
    </div>
  );
}
