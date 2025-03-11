import { NextRequest, NextResponse } from "next/server";
import { 
  createBankAccount, 
  listBankAccounts, 
  deleteBankAccount,
  setDefaultBankAccount
} from "~/server/monite/monite-api";

/**
 * API route for listing bank accounts for an entity
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get("entityId");
    
    if (!entityId) {
      return NextResponse.json(
        { error: "Entity ID is required" },
        { status: 400 }
      );
    }
    
    const bankAccountsData = await listBankAccounts(entityId);
    return NextResponse.json(bankAccountsData);
  } catch (error) {
    console.error("Error listing bank accounts:", error);
    return NextResponse.json(
      { error: "Failed to list bank accounts" },
      { status: 500 }
    );
  }
}

/**
 * API route for creating a new bank account
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data.entityId) {
      return NextResponse.json(
        { error: "Entity ID is required" },
        { status: 400 }
      );
    }
    
    // Required fields validation
    if (!data.account_holder_name) {
      return NextResponse.json(
        { error: "Account holder name is required" },
        { status: 400 }
      );
    }
    
    if (!data.currency) {
      return NextResponse.json(
        { error: "Currency is required" },
        { status: 400 }
      );
    }
    
    if (!data.country) {
      return NextResponse.json(
        { error: "Country is required" },
        { status: 400 }
      );
    }
    
    // Validate account details based on country
    if (data.country === "US" && !data.account_number) {
      return NextResponse.json(
        { error: "Account number is required for US bank accounts" },
        { status: 400 }
      );
    }
    
    if (data.country === "US" && !data.routing_number) {
      return NextResponse.json(
        { error: "Routing number is required for US bank accounts" },
        { status: 400 }
      );
    }
    
    // For EU accounts, either IBAN or account number + sort code is required
    if (
      ["DE", "FR", "ES", "IT", "NL", "BE", "PT", "AT", "IE", "FI", "GR", "LU"].includes(data.country) && 
      !data.iban
    ) {
      return NextResponse.json(
        { error: "IBAN is required for EU bank accounts" },
        { status: 400 }
      );
    }
    
    // Extract entityId and remove it from the data sent to the Monite API
    const { entityId, ...bankAccountData } = data;
    
    const result = await createBankAccount(entityId, bankAccountData);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating bank account:", error);
    
    // Detailed error response
    let errorMessage = "Failed to create bank account";
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * API route for deleting a bank account
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get("entityId");
    const bankAccountId = searchParams.get("bankAccountId");
    
    if (!entityId) {
      return NextResponse.json(
        { error: "Entity ID is required" },
        { status: 400 }
      );
    }
    
    if (!bankAccountId) {
      return NextResponse.json(
        { error: "Bank account ID is required" },
        { status: 400 }
      );
    }
    
    await deleteBankAccount(entityId, bankAccountId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting bank account:", error);
    return NextResponse.json(
      { error: "Failed to delete bank account" },
      { status: 500 }
    );
  }
}

/**
 * API route for setting a bank account as default
 */
export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data.entityId) {
      return NextResponse.json(
        { error: "Entity ID is required" },
        { status: 400 }
      );
    }
    
    if (!data.bankAccountId) {
      return NextResponse.json(
        { error: "Bank account ID is required" },
        { status: 400 }
      );
    }
    
    await setDefaultBankAccount(data.entityId, data.bankAccountId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error setting default bank account:", error);
    return NextResponse.json(
      { error: "Failed to set default bank account" },
      { status: 500 }
    );
  }
}
