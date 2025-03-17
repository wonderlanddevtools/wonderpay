"use client";

import { useState, useEffect } from "react";
import { Card } from "~/components/ui/card";
import { usePayables } from "~/hooks/usePayables";
import { useReceivables } from "~/hooks/useReceivables";
import { useCapital } from "~/hooks/useCapital";
import { useEntities } from "~/hooks/useEntities";
import { Badge } from "~/components/ui/badge";
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  // Hooks for data fetching
  const { payables, isLoading: isLoadingPayables } = usePayables();
  const { receivables, isLoading: isLoadingReceivables } = useReceivables();
  const { applications, isLoadingApplications } = useCapital();
  const { entities, isLoading: isLoadingEntities } = useEntities();
  
  // Derived state
  const [dashboardStats, setDashboardStats] = useState({
    totalReceivables: 0,
    totalPayables: 0,
    cashFlow: 0,
    overdue: 0,
    upcomingDue: 0,
    recentlyPaid: 0,
  });

  const [paymentStatusData, setPaymentStatusData] = useState<Array<{name: string; value: number}>>([]);
  const [monthlyData, setMonthlyData] = useState<Array<{name: string; receivables: number; payables: number; cashFlow: number}>>([]);
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  // Calculate dashboard stats when data changes
  useEffect(() => {
    if (!isLoadingPayables && !isLoadingReceivables && payables && receivables) {
      // Calculate total receivables
      const totalReceivables = receivables.reduce((sum: number, item: any) => sum + item.amount, 0);
      
      // Calculate total payables
      const totalPayables = Array.isArray(payables) 
        ? payables.reduce((sum: number, item: any) => sum + item.amount, 0)
        : 0;
      
      // Calculate cash flow (receivables - payables)
      const cashFlow = totalReceivables - totalPayables;
      
      // Calculate overdue amount
      const now = new Date();
      const overdue = receivables
        .filter((item: any) => item.due_date && new Date(item.due_date) < now && item.status === 'unpaid')
        .reduce((sum: number, item: any) => sum + item.amount, 0);
      
      // Calculate upcoming due (next 7 days)
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
      const upcomingDue = Array.isArray(payables) 
        ? payables
            .filter(
              (item: any) => 
                item.due_date && 
                new Date(item.due_date) > now && 
                new Date(item.due_date) < sevenDaysLater && 
                item.status === 'unpaid'
            )
            .reduce((sum: number, item: any) => sum + item.amount, 0)
        : 0;
      
      // Calculate recently paid (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentlyPaid = Array.isArray(payables)
        ? payables
            .filter(
              (item: any) => 
                item.status === 'paid' && 
                item.paid_date && 
                new Date(item.paid_date) > thirtyDaysAgo
            )
            .reduce((sum: number, item: any) => sum + item.amount, 0)
        : 0;
      
      setDashboardStats({
        totalReceivables,
        totalPayables,
        cashFlow,
        overdue,
        upcomingDue,
        recentlyPaid,
      });
      
      // Prepare payment status data for pie chart
      const statusCounts = {
        paid: receivables.filter((item: any) => item.status === 'paid').length,
        unpaid: receivables.filter((item: any) => item.status === 'unpaid').length,
        overdue: receivables.filter((item: any) => 
          item.status === 'unpaid' && item.due_date && new Date(item.due_date) < now
        ).length,
      };
      
      setPaymentStatusData([
        { name: 'Paid', value: statusCounts.paid },
        { name: 'Unpaid', value: statusCounts.unpaid - statusCounts.overdue },
        { name: 'Overdue', value: statusCounts.overdue }
      ]);
      
      // Prepare monthly data for bar chart
      // Group receivables by month
      const monthlyReceivables = receivables.reduce((acc: Record<string, number>, item: any) => {
        if (item.issue_date) {
          const date = new Date(item.issue_date);
          const month = date.toLocaleString('default', { month: 'short' });
          if (!acc[month]) {
            acc[month] = 0;
          }
          acc[month] += item.amount;
        }
        return acc;
      }, {});
      
      // Group payables by month
      const monthlyPayables = Array.isArray(payables) 
        ? payables.reduce((acc: Record<string, number>, item: any) => {
            if (item.issue_date) {
              const date = new Date(item.issue_date);
              const month = date.toLocaleString('default', { month: 'short' });
              if (!acc[month]) {
                acc[month] = 0;
              }
              acc[month] += item.amount;
            }
            return acc;
          }, {})
        : {};
      
      // Combine into array for chart
      const months = [...new Set([...Object.keys(monthlyReceivables), ...Object.keys(monthlyPayables)])];
      const chartData = months.map(month => ({
        name: month,
        receivables: monthlyReceivables[month] || 0,
        payables: monthlyPayables[month] || 0,
        cashFlow: (monthlyReceivables[month] || 0) - (monthlyPayables[month] || 0)
      }));
      
      setMonthlyData(chartData);
    }
  }, [payables, receivables, isLoadingPayables, isLoadingReceivables]);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Check if all data is loading
  const isLoading = isLoadingPayables || isLoadingReceivables || isLoadingApplications || isLoadingEntities;

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-pulse">
          <div className="bg-gray-200 rounded-lg h-80"></div>
          <div className="bg-gray-200 rounded-lg h-80"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Financial Overview</h1>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-4 border-l-4 border-blue-500">
          <h3 className="text-lg font-medium text-gray-500">Total Receivables</h3>
          <p className="text-2xl font-bold mt-2">{formatCurrency(dashboardStats.totalReceivables)}</p>
          <p className="text-sm text-gray-500 mt-1">
            {receivables.length} outstanding invoices
          </p>
        </Card>
        
        <Card className="p-4 border-l-4 border-red-500">
          <h3 className="text-lg font-medium text-gray-500">Total Payables</h3>
          <p className="text-2xl font-bold mt-2">{formatCurrency(dashboardStats.totalPayables)}</p>
          <p className="text-sm text-gray-500 mt-1">
            {Array.isArray(payables) ? payables.length : 0} bills to pay
          </p>
        </Card>
        
        <Card className="p-4 border-l-4 border-green-500">
          <h3 className="text-lg font-medium text-gray-500">Cash Flow</h3>
          <p className="text-2xl font-bold mt-2">
            {formatCurrency(dashboardStats.cashFlow)}
            <span className={dashboardStats.cashFlow >= 0 ? "text-green-500" : "text-red-500"}>
              {dashboardStats.cashFlow >= 0 ? " ↑" : " ↓"}
            </span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {dashboardStats.cashFlow >= 0 ? "Positive" : "Negative"} cash flow
          </p>
        </Card>
        
        <Card className="p-4 border-l-4 border-yellow-500">
          <h3 className="text-lg font-medium text-gray-500">Overdue</h3>
          <p className="text-2xl font-bold mt-2">{formatCurrency(dashboardStats.overdue)}</p>
          <p className="text-sm text-gray-500 mt-1">
            Past due receivables
          </p>
        </Card>
        
        <Card className="p-4 border-l-4 border-purple-500">
          <h3 className="text-lg font-medium text-gray-500">Due Soon</h3>
          <p className="text-2xl font-bold mt-2">{formatCurrency(dashboardStats.upcomingDue)}</p>
          <p className="text-sm text-gray-500 mt-1">
            Payments due in 7 days
          </p>
        </Card>
        
        <Card className="p-4 border-l-4 border-teal-500">
          <h3 className="text-lg font-medium text-gray-500">Recently Paid</h3>
          <p className="text-2xl font-bold mt-2">{formatCurrency(dashboardStats.recentlyPaid)}</p>
          <p className="text-sm text-gray-500 mt-1">
            Paid in last 30 days
          </p>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Invoice Status</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Monthly Cash Flow</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="receivables" name="Receivables" fill="#0088FE" />
                <Bar dataKey="payables" name="Payables" fill="#FF8042" />
                <Bar dataKey="cashFlow" name="Cash Flow" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      
      {/* Recent activity */}
      <div className="mb-8">
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {/* Combine and sort recent receivables and payables */}
            {[...receivables, ...(Array.isArray(payables) ? payables : [])]
              .sort((a: any, b: any) => 
                (b.updated_at ? new Date(b.updated_at).getTime() : 0) - 
                (a.updated_at ? new Date(a.updated_at).getTime() : 0)
              )
              .slice(0, 5)
              .map((item, index) => {
                const isReceivable = item && 'invoice_number' in item;
                const formattedDate = item.updated_at ? new Date(item.updated_at).toLocaleDateString() : '';
                
                return (
                  <div key={index} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">
                        {isReceivable ? item.customer_name : item.vendor_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {isReceivable 
                          ? `Invoice #${item.invoice_number}` 
                          : `Bill #${item.reference}`}
                        {' - '}{formattedDate}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {formatCurrency(item.amount)}
                      </span>
                      <Badge
                        className={
                          item.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : item.status === 'overdue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }
                      >
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      </div>
      
      {/* Active financing */}
      {applications.length > 0 && (
        <div className="mb-8">
          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Financing Activity</h2>
            <div className="space-y-4">
              {applications
                .sort((a: any, b: any) => 
                  (b.updated_at ? new Date(b.updated_at).getTime() : 0) - 
                  (a.updated_at ? new Date(a.updated_at).getTime() : 0)
                )
                .slice(0, 3)
                .map((app, index) => {
                  const formattedDate = app.updated_at ? new Date(app.updated_at).toLocaleDateString() : '';
                  const entityName = entities.find(e => e.id === app.entity_id)?.name || 'Unknown Entity';
                  const { label, color } = useCapital().getStatusDisplay(app.status);
                  
                  return (
                    <div key={index} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{entityName}</p>
                        <p className="text-sm text-gray-500">
                          {app.loan_request.purpose.substring(0, 50)}
                          {app.loan_request.purpose.length > 50 ? '...' : ''}
                          {' - '}{formattedDate}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {formatCurrency(app.loan_request.amount)}
                        </span>
                        <Badge
                          className={`bg-${color}-100 text-${color}-800`}
                        >
                          {label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
