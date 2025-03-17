"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Type definitions for Monite Receivables API
interface Receivable {
  id: string;
  amount: number;
  issue_date?: string;
  due_date?: string;
  status: string;
  customer?: string;
  customer_id?: string;
  category?: string;
  payment_method?: string;
  description?: string;
  invoice_number?: string;
  payment_date?: string;
}

interface ReceivableResponse {
  data: Receivable[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
  };
}

interface ErrorResponse {
  error: string;
  message?: string;
  status?: number;
}

interface ReceivableUpdateParams {
  receivableId: string;
  status?: string;
  action?: "status" | "send" | "mark_as_paid";
}

interface ReceivableStats {
  totalInvoices: number;
  totalAmount: number;
  overdueInvoices: number;
  overdueAmount: number;
}

/**
 * Hook for managing receivables (invoices) through the Monite API
 */
export function useReceivables() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("all");

  // Get all receivables with optional status filtering
  const getReceivables = useQuery<ReceivableResponse, Error>({
    queryKey: ["receivables", activeTab],
    queryFn: async () => {
      const status = activeTab !== "all" ? activeTab : undefined;
      const url = status
        ? `/api/monite/receivables?status=${status}`
        : "/api/monite/receivables";
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.error || "Failed to fetch receivables");
      }
      
      return response.json() as Promise<ReceivableResponse>;
    },
  });

  // Create a new receivable (invoice)
  const createReceivable = useMutation<Receivable, Error, Omit<Receivable, "id">>({
    mutationFn: async (receivableData) => {
      const response = await fetch("/api/monite/receivables", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(receivableData),
      });
      
      if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.error || "Failed to create receivable");
      }
      
      return response.json() as Promise<Receivable>;
    },
    onSuccess: () => {
      // Invalidate receivables queries to trigger a refetch
      void queryClient.invalidateQueries({ queryKey: ["receivables"] });
    },
  });

  // Update a receivable's status or perform other actions
  const updateReceivable = useMutation<Receivable, Error, ReceivableUpdateParams>({
    mutationFn: async ({ receivableId, status, action }) => {
      const response = await fetch("/api/monite/receivables", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ receivableId, status, action }),
      });
      
      if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.error || "Failed to update receivable");
      }
      
      return response.json() as Promise<Receivable>;
    },
    onSuccess: () => {
      // Invalidate receivables queries to trigger a refetch
      void queryClient.invalidateQueries({ queryKey: ["receivables"] });
    },
  });

  // Generate a PDF for an invoice
  const generateInvoicePdf = useMutation<{ pdf_url: string }, Error, { receivableId: string }>({
    mutationFn: async ({ receivableId }) => {
      const response = await fetch("/api/monite/receivables", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ receivableId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.error || "Failed to generate invoice PDF");
      }
      
      return response.json() as Promise<{ pdf_url: string }>;
    },
  });

  // Format currency amount for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get color and label information for a status
  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return {
          color: "bg-green-100 text-green-800",
          label: "Paid"
        };
      case "pending":
        return {
          color: "bg-blue-100 text-blue-800",
          label: "Pending"
        };
      case "overdue":
        return {
          color: "bg-red-100 text-red-800",
          label: "Overdue"
        };
      case "draft":
        return {
          color: "bg-gray-100 text-gray-800",
          label: "Draft"
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          label: status.charAt(0).toUpperCase() + status.slice(1)
        };
    }
  };

  // Calculate statistics based on receivables data
  const calculateStatistics = (receivables: Receivable[] = []): ReceivableStats => {
    if (!receivables || !Array.isArray(receivables)) return {
      totalInvoices: 0,
      totalAmount: 0,
      overdueInvoices: 0,
      overdueAmount: 0,
    };

    const totalInvoices = receivables.length;
    const totalAmount = receivables.reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
    
    // Count and sum overdue invoices
    const now = new Date();
    const overdueInvoices = receivables.filter(invoice => {
      if (!invoice.due_date || invoice.status === "paid") return false;
      const dueDate = new Date(invoice.due_date);
      return dueDate < now;
    });
    
    const overdueCount = overdueInvoices.length;
    const overdueAmount = overdueInvoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

    return {
      totalInvoices,
      totalAmount,
      overdueInvoices: overdueCount,
      overdueAmount,
    };
  };

  // Filter invoices based on active tab
  const filterInvoices = (receivables: Receivable[] = []): Receivable[] => {
    if (activeTab === "all") return receivables;
    return receivables.filter(invoice => invoice.status === activeTab);
  };

  return {
    // Data fetching
    receivables: getReceivables.data?.data ?? [],
    filteredReceivables: getReceivables.data ? filterInvoices(getReceivables.data.data) : [],
    isLoading: getReceivables.isLoading,
    isError: getReceivables.isError,
    error: getReceivables.error,
    refetch: getReceivables.refetch,
    
    // Mutations
    createReceivable: createReceivable.mutate,
    isCreating: createReceivable.isPending,
    updateReceivable: updateReceivable.mutate,
    isUpdating: updateReceivable.isPending,
    generatePdf: generateInvoicePdf.mutate,
    isGeneratingPdf: generateInvoicePdf.isPending,
    
    // Tab management
    activeTab,
    setActiveTab,
    
    // Utility functions
    formatCurrency,
    formatDate,
    getStatusInfo,
    calculateStatistics,
    filterInvoices,
  };
}
