/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

// In-memory storage for documents
// In a production environment, this would be replaced with a database
const DOCUMENTS_STORAGE: Record<string, DocumentMetadata> = {};

interface DocumentMetadata {
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
  path: string;
}

/**
 * GET /api/documents
 * List all documents or filter by entityId or tags
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const entityId = searchParams.get('entityId');
    const tags = searchParams.get('tags')?.split(',');
    
    // Filter documents based on query parameters
    let filteredDocuments = Object.values(DOCUMENTS_STORAGE);
    
    if (entityId) {
      filteredDocuments = filteredDocuments.filter(doc => doc.entityId === entityId);
    }
    
    if (tags && tags.length > 0) {
      filteredDocuments = filteredDocuments.filter(doc => 
        tags.some(tag => doc.tags.includes(tag))
      );
    }
    
    // Return filtered documents (without the path property for security)
    const safeDocuments = filteredDocuments.map(({ path, ...rest }) => rest);
    
    return NextResponse.json({
      documents: safeDocuments,
      total: safeDocuments.length
    });
  } catch (error) {
    console.error("Error listing documents:", error);
    return NextResponse.json(
      { error: "Failed to list documents" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/documents
 * Upload a new document
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }
    
    const entityId = formData.get('entityId')?.toString();
    if (!entityId) {
      return NextResponse.json(
        { error: "Entity ID is required" },
        { status: 400 }
      );
    }
    
    const name = formData.get('name')?.toString() || file.name;
    const description = formData.get('description')?.toString();
    const type = file.type;
    const size = file.size;
    const uploadedBy = formData.get('uploadedBy')?.toString() || 'user';
    const tagsString = formData.get('tags')?.toString();
    const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()) : [];
    
    // Generate a unique ID
    const documentId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    // Create upload directory if it doesn't exist
    // In a production environment, this would be a cloud storage service
    const uploadsDir = path.join(process.cwd(), 'uploads');
    await mkdir(uploadsDir, { recursive: true });
    
    // Determine file path and name
    const fileExt = path.extname(file.name);
    const fileName = `${documentId}${fileExt}`;
    const filePath = path.join(uploadsDir, fileName);
    
    // Convert the file to a Buffer and save it
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);
    
    // Save document metadata
    const documentMetadata: DocumentMetadata = {
      id: documentId,
      entityId,
      name,
      description,
      type,
      size,
      tags,
      uploadedBy,
      uploadedAt: now,
      updatedAt: now,
      path: filePath
    };
    
    DOCUMENTS_STORAGE[documentId] = documentMetadata;
    
    // Return document metadata (without path)
    const { path: _, ...safeMetadata } = documentMetadata;
    
    return NextResponse.json(safeMetadata, { status: 201 });
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/documents/:id
 * Get a specific document by ID
 */
export async function getDocument(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Check if document exists
    if (!DOCUMENTS_STORAGE[id]) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }
    
    // Return document metadata (without path)
    const { path: _, ...safeMetadata } = DOCUMENTS_STORAGE[id];
    
    return NextResponse.json(safeMetadata);
  } catch (error) {
    console.error("Error getting document:", error);
    return NextResponse.json(
      { error: "Failed to get document" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documents/:id
 * Delete a document by ID
 */
export async function deleteDocument(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Check if document exists
    if (!DOCUMENTS_STORAGE[id]) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }
    
    // Delete document from storage
    delete DOCUMENTS_STORAGE[id];
    
    // In a production environment, you would also delete the file from disk or cloud storage
    // await unlink(DOCUMENTS_STORAGE[id].path);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
