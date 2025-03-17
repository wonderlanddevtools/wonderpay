"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface DocumentMetadata {
  id: string;
  entityId: string;
  name: string;
  description?: string;
  type: string;
  size: number;
  tags: string[];
  uploadedBy: string;
  uploadedAt: string;
  updatedAt: string;
}

interface DocumentsResponse {
  documents: DocumentMetadata[];
  total: number;
}

interface UploadDocumentParams {
  file: File;
  entityId: string;
  name?: string;
  description?: string;
  tags?: string[];
  uploadedBy?: string;
}

export function useDocuments(entityId?: string) {
  const queryClient = useQueryClient();
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  
  // Fetch all documents, optionally filtered by entityId
  const {
    data,
    isLoading: isLoadingDocuments,
    isError: isErrorDocuments,
    error: errorDocuments,
  } = useQuery<DocumentsResponse>({
    queryKey: ['documents', entityId],
    queryFn: async () => {
      const url = entityId 
        ? `/api/documents?entityId=${entityId}`
        : '/api/documents';
        
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      return response.json() as Promise<DocumentsResponse>;
    },
    enabled: true,
  });

  // Get selected document
  const selectedDocument = data?.documents.find(
    (doc) => doc.id === selectedDocumentId
  );
  
  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };
  
  // Format file type for display
  const getFileType = (type: string): string => {
    const mimeToReadable: Record<string, string> = {
      'application/pdf': 'PDF',
      'application/msword': 'Word',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
      'application/vnd.ms-excel': 'Excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
      'image/jpeg': 'Image',
      'image/png': 'Image',
      'text/plain': 'Text',
      'text/csv': 'CSV',
    };
    
    return mimeToReadable[type] || type.split('/')[1] || 'Unknown';
  };
  
  // Upload document mutation
  const { 
    mutate: uploadDocument,
    isPending: isUploading,
    isError: isErrorUploading,
    error: errorUploading
  } = useMutation({
    mutationFn: async (params: UploadDocumentParams) => {
      const { file, entityId, name, description, tags, uploadedBy } = params;
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entityId', entityId);
      
      if (name) {
        formData.append('name', name);
      }
      
      if (description) {
        formData.append('description', description);
      }
      
      if (tags && tags.length > 0) {
        formData.append('tags', tags.join(','));
      }
      
      if (uploadedBy) {
        formData.append('uploadedBy', uploadedBy);
      }
      
      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload document');
      }
      
      return response.json() as Promise<DocumentMetadata>;
    },
    onSuccess: () => {
      // Invalidate the documents query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
  
  // Delete document mutation
  const {
    mutate: deleteDocument,
    isPending: isDeleting,
    isError: isErrorDeleting,
    error: errorDeleting
  } = useMutation({
    mutationFn: async (documentId: string) => {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate the documents query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      
      // Clear selected document if it was deleted
      if (selectedDocumentId) {
        setSelectedDocumentId(null);
      }
    },
  });
  
  // Get document icon based on mime type
  const getDocumentIcon = (type: string): string => {
    // We're returning a simple icon name that could be used with a component library
    const typeToIcon: Record<string, string> = {
      'application/pdf': 'file-pdf',
      'application/msword': 'file-word',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'file-word',
      'application/vnd.ms-excel': 'file-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'file-excel',
      'image/jpeg': 'file-image',
      'image/png': 'file-image',
      'text/plain': 'file-text',
      'text/csv': 'file-csv',
    };
    
    return typeToIcon[type] || 'file';
  };
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return {
    documents: data?.documents || [],
    totalDocuments: data?.total || 0,
    isLoadingDocuments,
    isErrorDocuments,
    errorDocuments,
    
    selectedDocumentId,
    setSelectedDocumentId,
    selectedDocument,
    
    uploadDocument,
    isUploading,
    isErrorUploading,
    errorUploading,
    
    deleteDocument,
    isDeleting,
    isErrorDeleting,
    errorDeleting,
    
    formatFileSize,
    getFileType,
    getDocumentIcon,
    formatDate,
  };
}
