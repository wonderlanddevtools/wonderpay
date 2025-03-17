"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard, FinancialStatGrid } from "@/components/ui/stat-card";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badge";
import { InvoiceCard } from "@/components/ui/invoice-card";
import { ContactCard, ContactList } from "@/components/ui/contact-card";

// Sample dashboard page showcasing the new modern UI design
export default function ModernDashboardPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("overview");

  // Sample data (would be fetched from API in a real implementation)
  const financialData = {
    accountBalance: "$86,924.02",
    pendingInvoices: "$4,441",
    pendingPayments: "$2,890",
    recentTransactions: [
      {
        id: "tx1",
        date: "2023-06-01",
        description: "Client Payment - Richmond Inc",
        amount: "$6,343",
        status: "paid",
      },
      {
        id: "tx2",
        date: "2023-06-03",
        description: "Supplier Invoice - Ruhter Co",
        amount: "$1,406",
        status: "pending",
      },
      {
        id: "tx3",
        date: "2023-06-05",
        description: "Monthly Subscription",
        amount: "$8,117",
        status: "overdue",
      },
    ],
    contacts: [
      { id: "c1", name: "Richmond", email: "finance@richmond.co.uk" },
      { id: "c2", name: "Melisca", email: "finance@melisca.com" },
      { id: "c3", name: "Natano Group", email: "inquiries@natano.com" },
      { id: "c4", name: "Lax Studio", email: "melvin@lax.co.id" },
      { id: "c5", name: "Ruhter", email: "purchasing@ruhter.com" },
    ],
  };

  // Table columns configuration
  const transactionColumns = [
    { header: "Date", accessor: "date" },
    { header: "Description", accessor: "description" },
    {
      header: "Amount",
      accessor: "amount",
      className: "font-medium text-right",
    },
    {
      header: "Status",
      accessor: (item: any) => (
        <StatusBadge status={item.status as any} />
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">
            Welcome back{session?.user?.name ? ", " + session.user.name : ""}
          </h1>
          <p className="text-neutral-500 mt-1">
            Here's an overview of your financial status
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-neutral-200 mb-8">
          <nav className="flex -mb-px">
            {["overview", "invoices", "bills", "reports"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-6 text-sm font-medium capitalize ${
                  activeTab === tab
                    ? "border-b-2 border-neutral-900 text-neutral-900"
                    : "text-neutral-500 hover:text-neutral-900 hover:border-neutral-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Financial summary */}
        <div className="mb-8">
          <FinancialStatGrid>
            <StatCard
              title="Account Balance"
              value={financialData.accountBalance}
              trend={{ value: "+8.2% from last month", isPositive: true }}
            />

            <StatCard
              title="Pending Invoices"
              value={financialData.pendingInvoices}
              description="Expected incoming payments"
              trend={{ value: "$265/month", isPositive: true }}
            />

            <StatCard
              title="Pending Payments"
              value={financialData.pendingPayments}
              description="Outstanding bills to pay"
              trend={{ value: "-12% from last month", isPositive: true }}
            />
          </FinancialStatGrid>
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left column (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent transactions */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Transactions</CardTitle>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={transactionColumns as any}
                  data={financialData.recentTransactions}
                  keyField="id"
                  onRowClick={(item) => console.log("Clicked:", item)}
                />
              </CardContent>
            </Card>

            {/* Quick actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Button
                    size="lg"
                    icon={
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    }
                    iconPosition="left"
                  >
                    Create Invoice
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    icon={
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 20H7M12 16V4M12 4L8 8M12 4L16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    }
                    iconPosition="left"
                  >
                    Pay Bill
                  </Button>

                  <Button
                    variant="secondary"
                    size="lg"
                    icon={
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 8L21 12M21 12L17 16M21 12H9M3 12H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    }
                    iconPosition="left"
                  >
                    Transfer Funds
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column (1/3 width) */}
          <div className="space-y-8">
            {/* Sample invoice card */}
            <InvoiceCard
              companyName="Matango Inc"
              companyEmail="finance@matango.io"
              invoiceNumber="MI-1033"
              amount="$11,000.00"
              dueDate="Jul 30, 2024"
              onPay={() => console.log("Pay invoice clicked")}
            />

            {/* Contacts */}
            <Card>
              <CardHeader>
                <CardTitle>Contacts</CardTitle>
              </CardHeader>
              <CardContent>
                <ContactList>
                  {financialData.contacts.map((contact) => (
                    <ContactCard
                      key={contact.id}
                      name={contact.name}
                      email={contact.email}
                      onClick={() => console.log("Contact clicked:", contact)}
                    />
                  ))}
                </ContactList>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
