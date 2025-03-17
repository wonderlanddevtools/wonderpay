"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Type definitions for Monite Payables API
interface Payable {
  id: string;
  amount: number;
  due_date?: string;
  issue_date?: string;
  status: string;
  vendor?: string;
  vendor_id?: string;
  category?: string;
  payment_method?: string;
  description?: string;
  invoice_number?: string;
}

interface PayableResponse {
  data: Payable[];
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

interface PayableStatusUpdateParams {
  payableId: string;
  status: string;
}

interface PayableStats {
  totalBills: number;
  totalAmount: number;
  upcomingDue: number;
}

/**
 * Hook for managing bills and payables through the Monite API
 */
export function usePayables() {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Get all payables with optional status filtering
  const getPayables = useQuery<PayableResponse, Error>({
    queryKey: ["payables", selectedStatus],
    queryFn: async () => {
      const url = selectedStatus
        ? `/api/monite/payables?status=${selectedStatus}`
        : "/api/monite/payables";
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.error || "Failed to fetch payables");
      }
      
      return response.json() as Promise<PayableResponse>;
    },
  });

  // Create a new payable
  const createPayable = useMutation<Payable, Error, Omit<Payable, "id">>({
    mutationFn: async (payableData) => {
      const response = await fetch("/api/monite/payables", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payableData),
      });
      
      if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.error || "Failed to create payable");
      }
      
      return response.json() as Promise<Payable>;
    },
    onSuccess: () => {
      // Invalidate payables queries to trigger a refetch
      void queryClient.invalidateQueries({ queryKey: ["payables"] });
    },
  });

  // Update a payable's status
  const updatePayableStatus = useMutation<Payable, Error, PayableStatusUpdateParams>({
    mutationFn: async ({ payableId, status }) => {
      const response = await fetch("/api/monite/payables", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payableId, status }),
      });
      
      if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.error || "Failed to update payable status");
      }
      
      return response.json() as Promise<Payable>;
    },
    onSuccess: () => {
      // Invalidate payables queries to trigger a refetch
      void queryClient.invalidateQueries({ queryKey: ["payables"] });
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
  const formatDate = (dateString: string) => {
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
          label: "Paid",
        };
      case "pending":
        return {
          color: "bg-blue-100 text-blue-800",
          label: "Pending",
        };
      case "overdue":
        return {
          color: "bg-red-100 text-red-800",
          label: "Overdue",
        };
      case "canceled":
        return {
          color: "bg-gray-100 text-gray-800",
          label: "Canceled",
        };
      case "scheduled":
        return {
          color: "bg-purple-100 text-purple-800",
          label: "Scheduled",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          label: status.charAt(0).toUpperCase() + status.slice(1),
        };
    }
  };

  // Calculate statistics based on payables data
  const calculateStatistics = (payables: Payable[] = []): PayableStats => {
    if (!payables || !Array.isArray(payables)) return {
      totalBills: 0,
      totalAmount: 0,
      upcomingDue: 0,
    };

    const totalBills = payables.length;
    const totalAmount = payables.reduce((sum, bill) => sum + (bill.amount || 0), 0);
    
    // Count bills due in the next 7 days
    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(now.getDate() + 7);
    
    const upcomingDue = payables.filter(bill => {
      if (!bill.due_date) return false;
      const dueDate = new Date(bill.due_date);
      return dueDate >= now && dueDate <= sevenDaysLater;
    }).length;

    return {
      totalBills,
      totalAmount,
      upcomingDue,
    };
  };

  return {
    // Data fetching
    payables: getPayables.data,
    isLoading: getPayables.isLoading,
    isError: getPayables.isError,
    error: getPayables.error,
    refetch: getPayables.refetch,
    
    // Mutations
    createPayable: createPayable.mutate,
    isCreating: createPayable.isPending,
    updateStatus: updatePayableStatus.mutate,
    isUpdating: updatePayableStatus.isPending,
    
    // Status filtering
    selectedStatus,
    setSelectedStatus,
    
    // Utility functions
    formatCurrency,
    formatDate,
    getStatusInfo,
    calculateStatistics,
  };
}
