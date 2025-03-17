"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEntities } from "~/hooks/useEntities";
import { useReceivables } from "~/hooks/useReceivables";

// Type definitions for QuickPay
interface QuickPayRequest {
  recipient_id: string;
  amount: number;
  description: string;
  payment_method: string;
  currency?: string;
  reference?: string;
  save_payment_method?: boolean;
}

interface QuickPayResponse {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  updated_at: string;
  recipient: {
    id: string;
    name: string;
  };
  amount: number;
  currency: string;
  description: string;
  payment_method: string;
  reference?: string;
  transaction_id?: string;
}

interface ErrorResponse {
  error: string;
  message?: string;
  details?: Record<string, unknown>;
}

interface PaymentMethod {
  id: string;
  type: "credit_card" | "bank_account" | "ach";
  name: string;
  last4?: string;
  is_default: boolean;
  created_at: string;
}

/**
 * Hook for managing QuickPay functionality
 */
export function useQuickPay() {
  const queryClient = useQueryClient();
  const { entities, getEntityDisplayName } = useEntities();
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  
  // Get all payment methods
  const getPaymentMethods = useQuery({
    queryKey: ["payment_methods"],
    queryFn: async () => {
      const response = await fetch("/api/monite/payment-methods");
      
      if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.error ?? "Failed to fetch payment methods");
      }
      
      return response.json() as Promise<{ data: PaymentMethod[] }>;
    },
  });

  // Get recent payments
  const getRecentPayments = useQuery({
    queryKey: ["recent_payments"],
    queryFn: async () => {
      const response = await fetch("/api/monite/quickpay/history");
      
      if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.error ?? "Failed to fetch payment history");
      }
      
      return response.json() as Promise<{ data: QuickPayResponse[] }>;
    },
  });

  // Create a new payment
  const createPayment = useMutation<QuickPayResponse, Error, QuickPayRequest>({
    mutationFn: async (paymentData) => {
      const response = await fetch("/api/monite/quickpay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });
      
      if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.error ?? "Failed to process payment");
      }
      
      return response.json() as Promise<QuickPayResponse>;
    },
    onSuccess: () => {
      // Invalidate payment history queries to trigger a refetch
      void queryClient.invalidateQueries({ queryKey: ["recent_payments"] });
    },
  });
  
  // Format currency
  const formatCurrency = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get payment method display info
  const getPaymentMethodInfo = (paymentMethod?: PaymentMethod) => {
    if (!paymentMethod) return { name: "Unknown", icon: "credit-card" };
    
    const icons = {
      credit_card: "credit-card",
      bank_account: "bank",
      ach: "arrow-down-to-line"
    };
    
    let displayName = paymentMethod.name;
    if (paymentMethod.last4) {
      displayName += ` ****${paymentMethod.last4}`;
    }
    
    return {
      name: displayName,
      icon: icons[paymentMethod.type] ?? "credit-card"
    };
  };
  
  // Get recipients (from entities)
  const getRecipients = () => {
    return entities.map(entity => ({
      id: entity.id ?? "",
      name: getEntityDisplayName(entity),
      email: entity.email,
      type: entity.type
    }));
  };
  
  // Find default payment method
  const getDefaultPaymentMethod = () => {
    const methods = getPaymentMethods.data?.data ?? [];
    return methods.find(method => method.is_default) ?? methods[0];
  };
  
  return {
    // Data fetching
    paymentMethods: getPaymentMethods.data?.data ?? [],
    isLoadingPaymentMethods: getPaymentMethods.isLoading,
    recentPayments: getRecentPayments.data?.data ?? [],
    isLoadingPayments: getRecentPayments.isLoading,
    
    // Mutations
    createPayment: createPayment.mutate,
    isProcessingPayment: createPayment.isPending,
    
    // Selection state
    selectedRecipient,
    setSelectedRecipient,
    
    // Utility functions
    formatCurrency,
    formatDate,
    getPaymentMethodInfo,
    getRecipients,
    getDefaultPaymentMethod
  };
}
