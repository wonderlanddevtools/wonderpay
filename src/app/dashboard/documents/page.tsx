"use client";

import { useState, useRef } from "react";
import { useDocuments } from "~/hooks/useDocuments";
import { useEntities } from "~/hooks/useEntities";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "~/components/ui/table";

export default function DocumentsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedEntityId, setSelectedEntityId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [uploadFormVisible, setUploadFormVisible] = useState<boolean>(false);
  const [uploadData, setUploadData] = useState({
    name: "",
    description: "",
    tags: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Hooks
  const { entities, isLoading: isLoadingEntities } = useEntities();
  const { 
    documents, 
    isLoadingDocuments, 
    uploadDocument, 
    isUploading,
    deleteDocument,
    isDeleting,
    formatFileSize,
    getFileType,
    getDocumentIcon,
    formatDate,
    selectedDocumentId,
    setSelectedDocumentId,
    selectedDocument
  } = useDocuments(selectedEntityId);
  
  // Filter documents based on search query
  const filteredDocuments = documents.filter(doc => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      doc.name.toLowerCase().includes(query) ||
      (doc.description?.toLowerCase().includes(query) ?? false) ||
      doc.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });
  
  // Handle file upload
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill name if not already filled
      if (!uploadData.name) {
        setUploadData({
          ...uploadData,
          name: file.name
        });
      }
    }
  };
  
  // Handle upload form submission
  const handleUpload = () => {
    if (!selectedFile || !selectedEntityId) return;
    
    uploadDocument({
      file: selectedFile,
      entityId: selectedEntityId,
      name: uploadData.name || selectedFile.name,
      description: uploadData.description || undefined,
      tags: uploadData.tags ? uploadData.tags.split(',').map(tag => tag.trim()) : undefined,
    }, {
      onSuccess: () => {
        // Reset form
        setSelectedFile(null);
        setUploadData({
          name: "",
          description: "",
          tags: "",
        });
        setUploadFormVisible(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    });
  };
  
  // Handle document deletion
  const handleDelete = (documentId: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteDocument(documentId);
    }
  };
  
  if (isLoadingEntities) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Document Management</h1>
        <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Document Management</h1>
        <Button 
          onClick={() => setUploadFormVisible(!uploadFormVisible)}
          disabled={!selectedEntityId}
        >
          {uploadFormVisible ? "Cancel Upload" : "Upload Document"}
        </Button>
      </div>
      
      {/* Entity Selection */}
      <div className="mb-6">
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-2">Select Business Entity</h2>
          <p className="text-sm text-gray-500 mb-4">
            Choose an entity to view and manage its documents
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {entities.map(entity => (
              <div
                key={entity.id}
                className={`p-4 cursor-pointer transition-colors border-2 rounded-lg ${
                  selectedEntityId === entity.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-transparent hover:bg-gray-50'
                }`}
                onClick={() => setSelectedEntityId(entity.id)}
              >
                <h3 className="font-medium">{entity.name}</h3>
                <p className="text-sm text-gray-500">{entity.type === 'organization' ? 'Organization' : 'Individual'}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
      
      {/* Upload Form */}
      {uploadFormVisible && selectedEntityId && (
        <div className="mb-6">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Upload New Document</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File *
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-500 mt-1">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={uploadData.name}
                  onChange={(e) => setUploadData({...uploadData, name: e.target.value})}
                  placeholder="Document name"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                  placeholder="Document description"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={uploadData.tags}
                  onChange={(e) => setUploadData({...uploadData, tags: e.target.value})}
                  placeholder="invoice, contract, receipt"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleUpload} 
                  disabled={!selectedFile || isUploading}
                >
                  {isUploading ? "Uploading..." : "Upload Document"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
      
      {/* Document Listing */}
      {selectedEntityId && (
        <div className="mb-6">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Documents</h2>
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2 pr-8 border border-gray-300 rounded-md"
                />
                <span className="absolute right-2 top-2 text-gray-400">
                  🔍
                </span>
              </div>
            </div>
            
            {isLoadingDocuments ? (
              <div className="animate-pulse space-y-2">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {documents.length === 0 
                  ? "No documents found. Upload your first document to get started." 
                  : "No documents match your search criteria."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map(doc => (
                      <TableRow 
                        key={doc.id}
                        className={selectedDocumentId === doc.id ? "bg-blue-50" : ""}
                        onClick={() => setSelectedDocumentId(doc.id)}
                      >
                        <TableCell className="font-medium">{doc.name}</TableCell>
                        <TableCell>{getFileType(doc.type)}</TableCell>
                        <TableCell>{formatFileSize(doc.size)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {doc.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(doc.uploadedAt)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                // In a real app, this would download the file
                                alert(`Download functionality would be implemented with a real backend.`);
                              }}
                            >
                              Download
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 hover:text-red-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(doc.id);
                              }}
                              disabled={isDeleting}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </div>
      )}
      
      {/* Document Detail View */}
      {selectedDocument && (
        <div className="mb-6">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Document Details</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedDocumentId(null)}
              >
                Close
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-700">Document Information</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Name</span>
                    <span>{selectedDocument.name}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Type</span>
                    <span>{getFileType(selectedDocument.type)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Size</span>
                    <span>{formatFileSize(selectedDocument.size)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Uploaded By</span>
                    <span>{selectedDocument.uploadedBy}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Uploaded Date</span>
                    <span>{formatDate(selectedDocument.uploadedAt)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Last Updated</span>
                    <span>{formatDate(selectedDocument.updatedAt)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">Description</h3>
                <p className="mt-2 text-gray-600">
                  {selectedDocument.description ?? "No description provided."}
                </p>
                
                <h3 className="font-medium text-gray-700 mt-4">Tags</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedDocument.tags.length === 0 ? (
                    <p className="text-gray-500">No tags</p>
                  ) : (
                    selectedDocument.tags.map((tag, index) => (
                      <Badge key={index}>
                        {tag}
                      </Badge>
                    ))
                  )}
                </div>
                
                <div className="mt-6">
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      // In a real app, this would download the file
                      alert(`Download functionality would be implemented with a real backend.`);
                    }}
                  >
                    Download Document
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
