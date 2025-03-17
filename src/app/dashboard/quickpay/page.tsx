"use client";

import { useRef, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { GlowButton } from "@/components/ui/glow-button";
import { ContactCard } from "@/components/ui/contact-card";
import { 
  Search, Plus, CreditCard, ArrowUpRight, Calendar, User, DollarSign, 
  ChevronsUpDown, Check, AlertCircle, Loader2, Building, CircleCheck, Clock
} from "lucide-react";
import { useQuickPay } from "~/hooks/useQuickPay";

export default function QuickPayPage() {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [recipientSearchTerm, setRecipientSearchTerm] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [reference, setReference] = useState("");
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);
  const [showRecipients, setShowRecipients] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Use our custom hook for QuickPay operations
  const {
    paymentMethods,
    isLoadingPaymentMethods,
    recentPayments,
    isLoadingPayments,
    createPayment,
    isProcessingPayment,
    selectedRecipient,
    setSelectedRecipient,
    formatCurrency,
    formatDate,
    getPaymentMethodInfo,
    getRecipients,
    getDefaultPaymentMethod
  } = useQuickPay();
  
  // Set default payment method when loaded
  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedPaymentMethodId) {
      const defaultMethod = getDefaultPaymentMethod();
      if (defaultMethod) {
        setSelectedPaymentMethodId(defaultMethod.id);
      }
    }
  }, [paymentMethods, selectedPaymentMethodId, getDefaultPaymentMethod]);
  
  // Filter recipients based on search term
  const filteredRecipients = getRecipients().filter(recipient => {
    if (!recipientSearchTerm) return true;
    const searchTermLower = recipientSearchTerm.toLowerCase();
    return (
      recipient.name.toLowerCase().includes(searchTermLower) ||
      recipient.email.toLowerCase().includes(searchTermLower)
    );
  });
  
  // Get selected recipient details
  const selectedRecipientDetails = selectedRecipient 
    ? getRecipients().find(r => r.id === selectedRecipient) 
    : null;
  
  // Get selected payment method details
  const selectedPaymentMethod = selectedPaymentMethodId 
    ? paymentMethods.find(pm => pm.id === selectedPaymentMethodId) 
    : null;
  
  const paymentMethodInfo = getPaymentMethodInfo(selectedPaymentMethod ?? undefined);
  
  // Handle form submission
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRecipient || !selectedPaymentMethodId) {
      return;
    }
    
    // Create payment request
    const paymentData = {
      recipient_id: selectedRecipient,
      amount: parseFloat(amount),
      description,
      payment_method: selectedPaymentMethodId,
      currency,
      reference: reference || undefined,
      save_payment_method: savePaymentMethod
    };
    
    // Call the mutation function from our hook
    createPayment(paymentData);
    
    // Reset the form
    setAmount("");
    setDescription("");
    setReference("");
    setSavePaymentMethod(false);
    setShowPaymentForm(false);
  };
  
  // Calculate stats
  const totalPayments = recentPayments.length;
  const completedPayments = recentPayments.filter(p => p.status === "completed").length;
  const totalAmount = recentPayments.reduce((sum, p) => p.status === "completed" ? sum + p.amount : sum, 0);
  
  return (
    <div className="space-y-8">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">QuickPay</h1>
        <GlowButton 
          onClick={() => setShowPaymentForm(!showPaymentForm)} 
          className="flex items-center"
          glowColors={['#3B82F6', '#60A5FA']}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Payment
        </GlowButton>
      </div>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Payments" 
          value={totalPayments.toString()}
          icon={<CreditCard className="h-6 w-6 text-blue-500" />}
          description="All time"
        />
        <StatCard 
          title="Completed" 
          value={completedPayments.toString()}
          icon={<CircleCheck className="h-6 w-6 text-green-500" />}
          description="Successful payments"
        />
        <StatCard 
          title="Total Volume" 
          value={formatCurrency(totalAmount)}
          icon={<DollarSign className="h-6 w-6 text-blue-500" />}
          description="Processed successfully"
        />
      </div>
      
      {/* Payment form */}
      {showPaymentForm && (
        <Card className="p-6 mb-6 border border-blue-200 bg-blue-50">
          <h2 className="text-xl font-bold mb-4">New Payment</h2>
          <form ref={formRef} onSubmit={handleSubmitPayment}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recipient selector */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
                <div className="relative">
                  <div 
                    className="relative w-full cursor-pointer bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    onClick={() => setShowRecipients(!showRecipients)}
                  >
                    {selectedRecipientDetails ? (
                      <div className="flex items-center">
                        <span className="block truncate mr-2">
                          {selectedRecipientDetails.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({selectedRecipientDetails.email})
                        </span>
                      </div>
                    ) : (
                      <span className="block truncate text-gray-500">Select a recipient</span>
                    )}
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                    </span>
                  </div>
                  
                  {showRecipients && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto max-h-60">
                      <div className="relative p-2">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Search recipients..."
                          value={recipientSearchTerm}
                          onChange={(e) => setRecipientSearchTerm(e.target.value)}
                        />
                      </div>
                      
                      {filteredRecipients.length > 0 ? (
                        <ul className="max-h-60 overflow-auto p-2">
                          {filteredRecipients.map((recipient) => (
                            <li 
                              key={recipient.id}
                              className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-100 rounded-md ${
                                selectedRecipient === recipient.id ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                              }`}
                              onClick={() => {
                                setSelectedRecipient(recipient.id);
                                setShowRecipients(false);
                                setRecipientSearchTerm("");
                              }}
                            >
                              <div className="flex items-center">
                                <span className="ml-3 block truncate font-medium">{recipient.name}</span>
                                <span className="ml-2 truncate text-gray-500">{recipient.email}</span>
                              </div>
                              
                              {selectedRecipient === recipient.id && (
                                <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                                  <Check className="h-4 w-4 text-blue-600" />
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="py-6 text-center text-gray-500">
                          No recipients found. Please create an entity first.
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {!selectedRecipient && (
                  <p className="mt-1 text-sm text-red-600">
                    Please select a recipient to continue
                  </p>
                )}
              </div>
              
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="0.00"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">{currency}</span>
                  </div>
                </div>
              </div>
              
              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                </select>
              </div>
              
              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Payment for services"
                  required
                />
              </div>
              
              {/* Payment method */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <div className="relative">
                  <div 
                    className="relative w-full cursor-pointer bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    onClick={() => setShowPaymentMethods(!showPaymentMethods)}
                  >
                    {selectedPaymentMethod ? (
                      <div className="flex items-center">
                        {paymentMethodInfo.icon === "credit-card" && <CreditCard className="h-4 w-4 mr-2 text-gray-500" />}
                        {paymentMethodInfo.icon === "bank" && <Building className="h-4 w-4 mr-2 text-gray-500" />}
                        <span className="block truncate">{paymentMethodInfo.name}</span>
                      </div>
                    ) : (
                      <span className="block truncate text-gray-500">Select a payment method</span>
                    )}
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                    </span>
                  </div>
                  
                  {showPaymentMethods && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto max-h-60">
                      <ul className="max-h-60 overflow-auto p-2">
                        {isLoadingPaymentMethods ? (
                          <div className="py-6 text-center text-gray-500 flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Loading payment methods...
                          </div>
                        ) : paymentMethods.length > 0 ? (
                          paymentMethods.map((method) => {
                            const info = getPaymentMethodInfo(method);
                            return (
                              <li 
                                key={method.id}
                                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-100 rounded-md ${
                                  selectedPaymentMethodId === method.id ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                                }`}
                                onClick={() => {
                                  setSelectedPaymentMethodId(method.id);
                                  setShowPaymentMethods(false);
                                }}
                              >
                                <div className="flex items-center">
                                  {info.icon === "credit-card" && <CreditCard className="h-4 w-4 text-gray-500" />}
                                  {info.icon === "bank" && <Building className="h-4 w-4 text-gray-500" />}
                                  <span className="ml-3 block truncate font-medium">{info.name}</span>
                                  {method.is_default && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                      Default
                                    </span>
                                  )}
                                </div>
                                
                                {selectedPaymentMethodId === method.id && (
                                  <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                                    <Check className="h-4 w-4 text-blue-600" />
                                  </span>
                                )}
                              </li>
                            );
                          })
                        ) : (
                          <div className="py-6 text-center text-gray-500">
                            No payment methods found.
                          </div>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
                {!selectedPaymentMethodId && (
                  <p className="mt-1 text-sm text-red-600">
                    Please select a payment method to continue
                  </p>
                )}
              </div>
              
              {/* Reference (optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Reference (optional)</label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Invoice #12345"
                />
              </div>
              
              {/* Save payment method */}
              <div>
                <div className="flex items-center mt-4">
                  <input
                    id="save_payment_method"
                    type="checkbox"
                    checked={savePaymentMethod}
                    onChange={(e) => setSavePaymentMethod(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="save_payment_method" className="ml-2 block text-sm text-gray-900">
                    Save payment method for future use
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setShowPaymentForm(false)} 
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <GlowButton
                type="submit"
                disabled={isProcessingPayment || !selectedRecipient || !selectedPaymentMethodId}
                glowColors={['#10B981', '#34D399']}
              >
                {isProcessingPayment ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Process Payment
              </GlowButton>
            </div>
          </form>
        </Card>
      )}
      
      {/* Recent payments */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Payments</h2>
        
        {isLoadingPayments ? (
          <div className="flex justify-center items-center py-12 bg-white rounded-lg shadow">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <span className="ml-2 text-gray-600">Loading payment history...</span>
          </div>
        ) : recentPayments.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipient
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentPayments.map((payment) => {
                  // Get status style
                  let statusStyle = "bg-gray-100 text-gray-800";
                  let statusIcon = null;
                  
                  switch (payment.status) {
                    case "completed":
                      statusStyle = "bg-green-100 text-green-800";
                      statusIcon = <CircleCheck className="h-4 w-4 mr-1" />;
                      break;
                    case "processing":
                      statusStyle = "bg-blue-100 text-blue-800";
                      statusIcon = <Loader2 className="h-4 w-4 mr-1 animate-spin" />;
                      break;
                    case "pending":
                      statusStyle = "bg-yellow-100 text-yellow-800";
                      statusIcon = <Clock className="h-4 w-4 mr-1" />;
                      break;
                    case "failed":
                      statusStyle = "bg-red-100 text-red-800";
                      statusIcon = <AlertCircle className="h-4 w-4 mr-1" />;
                      break;
                  }
                  
                  return (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payment.recipient.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(payment.amount, payment.currency)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(payment.created_at)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full items-center ${statusStyle}`}>
                          {statusIcon}
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.reference ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-500">No payment history found. Process your first payment to get started!</p>
          </div>
        )}
      </div>
      
      {/* Feature info */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-700">
        <p className="font-medium">QuickPay is designed for fast, one-time payments</p>
        <p className="mt-1">For more complex payment needs:</p>
        <ul className="mt-2 list-disc list-inside">
          <li>Use Bill Pay for managing regular vendor payments</li>
          <li>Create proper invoices for customer billing</li>
          <li>Set up recurring payments from the Recipients page</li>
        </ul>
      </div>
    </div>
  );
}
