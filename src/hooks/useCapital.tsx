"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Type definitions for capital data
export interface BusinessInfo {
  annual_revenue: number;
  years_in_business: number;
  industry: string;
  business_description: string;
  employee_count: number;
  current_debt?: number;
}

export interface FinancialInfo {
  monthly_revenue: number;
  monthly_expenses: number;
  outstanding_receivables: number;
  current_cash_balance: number;
  credit_score?: number;
}

export interface LoanRequest {
  amount: number;
  purpose: string;
  term_months: number;
  preferred_monthly_payment?: number;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  date_uploaded: string;
  url: string;
}

export type ApplicationStatus = 
  | "draft"
  | "submitted"
  | "under_review"
  | "additional_info_required"
  | "approved"
  | "approved_with_modifications"
  | "rejected"
  | "funded";

export interface CapitalApplication {
  id?: string;
  entity_id: string;
  status: ApplicationStatus;
  business_info: BusinessInfo;
  financial_info: FinancialInfo;
  loan_request: LoanRequest;
  documents?: Document[];
  notes?: string;
  created_at?: string;
  updated_at?: string;
  submitted_at?: string;
  reviewed_at?: string;
  approved_at?: string;
  funded_at?: string;
}

export interface ApplicationResponse {
  application: CapitalApplication;
}

export interface ApplicationsListResponse {
  data: CapitalApplication[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface CalculationRequest {
  loan_amount: number;
  term_months: number;
  interest_rate?: number;
}

export interface CalculationResponse {
  monthly_payment: number;
  total_interest: number;
  total_repayment: number;
  interest_rate: number;
  amortization_schedule: Array<{
    payment_number: number;
    payment_amount: number;
    principal_amount: number;
    interest_amount: number;
    remaining_balance: number;
  }>;
}

interface ErrorResponse {
  error: string;
  message?: string;
  details?: Record<string, unknown>;
}

/**
 * Hook for managing WonderPay Capital applications and financing
 */
export function useCapital() {
  const queryClient = useQueryClient();
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  
  // Get user's capital applications
  const getApplications = useQuery<ApplicationsListResponse, Error>({
    queryKey: ["capital-applications"],
    queryFn: async () => {
      const response = await fetch("/api/capital/applications");
      
      if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.error ?? "Failed to fetch applications");
      }
      
      return response.json() as Promise<ApplicationsListResponse>;
    },
  });

  // Get a specific application by ID
  const getApplication = useQuery<ApplicationResponse, Error>({
    queryKey: ["capital-application", selectedApplicationId],
    queryFn: async () => {
      if (!selectedApplicationId) {
        throw new Error("No application ID provided");
      }
      
      const response = await fetch(`/api/capital/applications/${selectedApplicationId}`);
      
      if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.error ?? "Failed to fetch application");
      }
      
      return response.json() as Promise<ApplicationResponse>;
    },
    enabled: !!selectedApplicationId,
  });

  // Create or update an application
  const saveApplication = useMutation<CapitalApplication, Error, CapitalApplication>({
    mutationFn: async (applicationData) => {
      const isUpdate = !!applicationData.id;
      const url = isUpdate 
        ? `/api/capital/applications/${applicationData.id}`
        : "/api/capital/applications";
      
      const response = await fetch(url, {
        method: isUpdate ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationData),
      });
      
      if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.error ?? "Failed to save application");
      }
      
      return response.json() as Promise<CapitalApplication>;
    },
    onSuccess: (data) => {
      // Invalidate applications list queries to trigger a refetch
      void queryClient.invalidateQueries({ queryKey: ["capital-applications"] });
      
      // If this is a specific application update, invalidate that query too
      if (data.id) {
        void queryClient.invalidateQueries({ 
          queryKey: ["capital-application", data.id]
        });
      }
      
      // Auto-select newly created application
      if (data.id && !selectedApplicationId) {
        setSelectedApplicationId(data.id);
      }
    },
  });

  // Submit an application for review
  const submitApplication = useMutation<CapitalApplication, Error, string>({
    mutationFn: async (applicationId) => {
      const response = await fetch(`/api/capital/applications/${applicationId}/submit`, {
        method: "POST",
      });
      
      if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.error ?? "Failed to submit application");
      }
      
      return response.json() as Promise<CapitalApplication>;
    },
    onSuccess: (data) => {
      // Invalidate queries to refresh data
      void queryClient.invalidateQueries({ queryKey: ["capital-applications"] });
      if (data.id) {
        void queryClient.invalidateQueries({ 
          queryKey: ["capital-application", data.id]
        });
      }
    },
  });

  // Upload a document for an application
  const uploadDocument = useMutation<Document, Error, { applicationId: string, file: File, documentType: string }>({
    mutationFn: async ({ applicationId, file, documentType }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", documentType);
      
      const response = await fetch(`/api/capital/applications/${applicationId}/documents`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.error ?? "Failed to upload document");
      }
      
      return response.json() as Promise<Document>;
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific application query to refresh documents
      void queryClient.invalidateQueries({ 
        queryKey: ["capital-application", variables.applicationId]
      });
    },
  });

  // Calculate loan terms
  const calculateLoanTerms = useMutation<CalculationResponse, Error, CalculationRequest>({
    mutationFn: async (calculationRequest) => {
      const response = await fetch("/api/capital/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(calculationRequest),
      });
      
      if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.error ?? "Failed to calculate loan terms");
      }
      
      return response.json() as Promise<CalculationResponse>;
    },
  });
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
    });
  };
  
  // Get human-readable status
  const getStatusDisplay = (status: ApplicationStatus): { label: string; color: string } => {
    switch (status) {
      case "draft":
        return { label: "Draft", color: "gray" };
      case "submitted":
        return { label: "Submitted", color: "blue" };
      case "under_review":
        return { label: "Under Review", color: "yellow" };
      case "additional_info_required":
        return { label: "Additional Info Required", color: "orange" };
      case "approved":
        return { label: "Approved", color: "green" };
      case "approved_with_modifications":
        return { label: "Approved with Modifications", color: "teal" };
      case "rejected":
        return { label: "Rejected", color: "red" };
      case "funded":
        return { label: "Funded", color: "emerald" };
      default:
        return { label: "Unknown", color: "gray" };
    }
  };
  
  // Check if application can be submitted
  const canSubmitApplication = (application: CapitalApplication): boolean => {
    return (
      application.status === "draft" &&
      !!application.business_info &&
      !!application.financial_info &&
      !!application.loan_request
    );
  };
  
  // Get application progress percentage
  const getApplicationProgress = (application: CapitalApplication): number => {
    let totalFields = 0;
    let completedFields = 0;
    
    // Business info fields
    if (application.business_info) {
      totalFields += 5; // Required fields
      completedFields += Object.entries(application.business_info)
        .filter(([key, value]) => {
          // Skip optional fields
          if (key === "current_debt") return false;
          return value !== undefined && value !== null && value !== "";
        }).length;
    }
    
    // Financial info fields
    if (application.financial_info) {
      totalFields += 4; // Required fields
      completedFields += Object.entries(application.financial_info)
        .filter(([key, value]) => {
          // Skip optional fields
          if (key === "credit_score") return false;
          return value !== undefined && value !== null && value !== "";
        }).length;
    }
    
    // Loan request fields
    if (application.loan_request) {
      totalFields += 3; // Required fields
      completedFields += Object.entries(application.loan_request)
        .filter(([key, value]) => {
          // Skip optional fields
          if (key === "preferred_monthly_payment") return false;
          return value !== undefined && value !== null && value !== "";
        }).length;
    }
    
    // Documents (optional but good to have)
    if (application.documents && application.documents.length > 0) {
      completedFields += 1;
      totalFields += 1;
    }
    
    return totalFields === 0 ? 0 : Math.round((completedFields / totalFields) * 100);
  };
  
  // Create a new application with default values
  const createNewApplication = (entityId: string): CapitalApplication => {
    return {
      entity_id: entityId,
      status: "draft",
      business_info: {
        annual_revenue: 0,
        years_in_business: 0,
        industry: "",
        business_description: "",
        employee_count: 0,
      },
      financial_info: {
        monthly_revenue: 0,
        monthly_expenses: 0,
        outstanding_receivables: 0,
        current_cash_balance: 0,
      },
      loan_request: {
        amount: 0,
        purpose: "",
        term_months: 12,
      },
    };
  };
  
  return {
    // Data queries
    applications: getApplications.data?.data ?? [],
    isLoadingApplications: getApplications.isLoading,
    isErrorApplications: getApplications.isError,
    errorApplications: getApplications.error,
    
    currentApplication: getApplication.data?.application,
    isLoadingCurrentApplication: getApplication.isLoading,
    isErrorCurrentApplication: getApplication.isError,
    errorCurrentApplication: getApplication.error,
    
    // Mutations
    saveApplication: saveApplication.mutate,
    isSavingApplication: saveApplication.isPending,
    
    submitApplication: submitApplication.mutate,
    isSubmittingApplication: submitApplication.isPending,
    
    uploadDocument: uploadDocument.mutate,
    isUploadingDocument: uploadDocument.isPending,
    
    calculateLoanTerms: calculateLoanTerms.mutate,
    isCalculating: calculateLoanTerms.isPending,
    
    // Selection state
    selectedApplicationId,
    setSelectedApplicationId,
    
    // Utility functions
    formatCurrency,
    formatDate,
    getStatusDisplay,
    canSubmitApplication,
    getApplicationProgress,
    createNewApplication,
  };
}
