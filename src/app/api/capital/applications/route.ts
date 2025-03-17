/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { NextRequest, NextResponse } from 'next/server';
// Mock authentication for development

// Mock data for development
export const MOCK_APPLICATIONS = [
  {
    id: "app-001",
    entity_id: "entity-001",
    status: "approved",
    business_info: {
      annual_revenue: 500000,
      years_in_business: 5,
      industry: "Technology",
      business_description: "Software development and consulting services",
      employee_count: 12,
      current_debt: 75000
    },
    financial_info: {
      monthly_revenue: 42000,
      monthly_expenses: 35000,
      outstanding_receivables: 65000,
      current_cash_balance: 120000,
      credit_score: 720
    },
    loan_request: {
      amount: 150000,
      purpose: "Expand office space and hire additional developers",
      term_months: 36,
      preferred_monthly_payment: 5000
    },
    documents: [
      {
        id: "doc-001",
        name: "Financial Statement",
        type: "financial_statement",
        date_uploaded: "2025-01-15T10:30:00Z",
        url: "/mock/financial-statement.pdf"
      },
      {
        id: "doc-002",
        name: "Business Plan",
        type: "business_plan",
        date_uploaded: "2025-01-15T10:32:00Z",
        url: "/mock/business-plan.pdf"
      }
    ],
    notes: "Strong application with solid financials and good business plan.",
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-02-10T14:30:00Z",
    submitted_at: "2025-01-16T09:15:00Z",
    reviewed_at: "2025-02-01T11:20:00Z",
    approved_at: "2025-02-10T14:30:00Z"
  },
  {
    id: "app-002",
    entity_id: "entity-002",
    status: "under_review",
    business_info: {
      annual_revenue: 250000,
      years_in_business: 2,
      industry: "Retail",
      business_description: "Online boutique store selling handmade crafts",
      employee_count: 3,
      current_debt: 15000
    },
    financial_info: {
      monthly_revenue: 21000,
      monthly_expenses: 18000,
      outstanding_receivables: 8000,
      current_cash_balance: 35000,
      credit_score: 680
    },
    loan_request: {
      amount: 50000,
      purpose: "Inventory expansion and marketing campaign",
      term_months: 24
    },
    documents: [
      {
        id: "doc-003",
        name: "Financial Statement",
        type: "financial_statement",
        date_uploaded: "2025-02-20T15:10:00Z",
        url: "/mock/financials-globex.pdf"
      }
    ],
    notes: "Promising growth but limited history. Consider offering smaller initial amount.",
    created_at: "2025-02-20T15:00:00Z",
    updated_at: "2025-02-25T09:30:00Z",
    submitted_at: "2025-02-20T16:45:00Z",
    reviewed_at: "2025-02-25T09:30:00Z"
  },
  {
    id: "app-003",
    entity_id: "entity-003",
    status: "draft",
    business_info: {
      annual_revenue: 180000,
      years_in_business: 1,
      industry: "Consulting",
      business_description: "Independent consulting services",
      employee_count: 1
    },
    financial_info: {
      monthly_revenue: 15000,
      monthly_expenses: 8000,
      outstanding_receivables: 18000,
      current_cash_balance: 22000
    },
    loan_request: {
      amount: 30000,
      purpose: "Working capital for project expansion",
      term_months: 12
    },
    created_at: "2025-03-10T11:20:00Z",
    updated_at: "2025-03-10T11:20:00Z"
  }
];

/**
 * GET /api/capital/applications
 * List all capital applications for the current user
 */
export async function GET(req: NextRequest) {
  try {
    // For development, we're skipping authentication checks
    // In production, we would verify the user is authenticated
    
    // In a production environment, we would query the database
    // For now, return mock data
    // const applications = await prisma.capitalApplication.findMany({
    //   where: {
    //     userId: session.user.id
    //   },
    //   orderBy: {
    //     updatedAt: 'desc'
    //   }
    // });
    
    // Using mock data for development
    const applications = MOCK_APPLICATIONS;
    
    return NextResponse.json({
      data: applications,
      pagination: {
        total: applications.length,
        limit: 50,
        offset: 0
      }
    });
  } catch (error) {
    console.error("Error fetching capital applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch capital applications" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/capital/applications
 * Create a new capital application
 */
export async function POST(req: NextRequest) {
  try {
    // For development, we're skipping authentication checks
    // In production, we would verify the user is authenticated
    
    // Parse request body
    const applicationData = await req.json();
    
    // Validate required fields
    if (!applicationData.entity_id) {
      return NextResponse.json(
        { error: "Entity ID is required" },
        { status: 400 }
      );
    }
    
    // Check if entity exists
    // In a production environment, we would verify the entity exists and belongs to the user
    // For now, proceed with mock creation
    
    // Create new application
    // In production, we would insert into the database
    // const newApplication = await prisma.capitalApplication.create({
    //   data: {
    //     entityId: applicationData.entity_id,
    //     userId: session.user.id,
    //     status: 'draft',
    //     businessInfo: applicationData.business_info || {},
    //     financialInfo: applicationData.financial_info || {},
    //     loanRequest: applicationData.loan_request || {},
    //     notes: applicationData.notes
    //   }
    // });
    
    // Mock creation for development
    const newApplication = {
      id: `app-${Date.now().toString().substring(8)}`,
      entity_id: applicationData.entity_id,
      status: "draft",
      business_info: applicationData.business_info || {
        annual_revenue: 0,
        years_in_business: 0,
        industry: "",
        business_description: "",
        employee_count: 0
      },
      financial_info: applicationData.financial_info || {
        monthly_revenue: 0,
        monthly_expenses: 0,
        outstanding_receivables: 0,
        current_cash_balance: 0
      },
      loan_request: applicationData.loan_request || {
        amount: 0,
        purpose: "",
        term_months: 12
      },
      notes: applicationData.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return NextResponse.json(newApplication, { status: 201 });
  } catch (error) {
    console.error("Error creating capital application:", error);
    return NextResponse.json(
      { error: "Failed to create capital application" },
      { status: 500 }
    );
  }
}
