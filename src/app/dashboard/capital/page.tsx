"use client";

import { useState } from "react";
import { useCapital, CapitalApplication, ApplicationStatus, CalculationResponse } from "~/hooks/useCapital";
import { useEntities } from "~/hooks/useEntities";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

export default function CapitalPage() {
  const {
    applications,
    isLoadingApplications,
    currentApplication,
    calculateLoanTerms,
    saveApplication,
    submitApplication,
    formatCurrency,
    getStatusDisplay,
    createNewApplication,
    getApplicationProgress,
    selectedApplicationId,
    setSelectedApplicationId
  } = useCapital();

  const { entities, isLoading: isLoadingEntities } = useEntities();
  
  // UI States
  const [currentView, setCurrentView] = useState<'list' | 'form' | 'calculator'>('list');
  const [calculationResult, setCalculationResult] = useState<CalculationResponse | null>(null);
  const [formData, setFormData] = useState<CapitalApplication | null>(null);
  
  // Helper to get entity name by ID
  const getEntityName = (entityId: string): string => {
    const entity = entities.find(e => e.id === entityId);
    return entity?.name ?? 'Unknown Entity';
  };
  
  // Handle application creation
  const handleCreateApplication = () => {
    if (entities.length === 0) {
      alert("You need to create an entity first");
      return;
    }
    
    // Start with the first entity
    if (entities[0]?.id) {
      setFormData(createNewApplication(entities[0].id));
      setCurrentView('form');
    }
  };
  
  // Handle application edit
  const handleEditApplication = (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    const app = applications.find((a) => a.id === applicationId);
    if (app) {
      setFormData(app);
      setCurrentView('form');
    }
  };
  
  // Handle form submission
  const handleSaveApplication = () => {
    if (formData) {
      saveApplication(formData);
      setCurrentView('list');
    }
  };
  
  // Handle loan calculation
  const handleCalculate = () => {
    if (!formData?.loan_request?.amount || !formData?.loan_request?.term_months) {
      alert("Please enter loan amount and term");
      return;
    }
    
    if (formData) {
      calculateLoanTerms({
        loan_amount: formData.loan_request.amount,
        term_months: formData.loan_request.term_months
      }, {
        onSuccess: (data) => {
          setCalculationResult(data as CalculationResponse);
          setCurrentView('calculator');
        }
      });
    }
  };
  
  // Handle application submission
  const handleSubmitApplication = (applicationId: string) => {
    submitApplication(applicationId);
  };

  // List View
  const renderApplicationsList = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">WonderPay Capital</h1>
        <Button onClick={handleCreateApplication}>Apply for Financing</Button>
      </div>
      
      {isLoadingApplications ? (
        <p className="text-center py-8">Loading applications...</p>
      ) : applications.length === 0 ? (
        <Card className="p-8 text-center">
          <h3 className="text-xl font-semibold mb-4">No applications yet</h3>
          <p className="text-gray-600 mb-6">
            Apply for working capital to help your business grow and manage cash flow.
          </p>
          <Button onClick={handleCreateApplication}>Start Application</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {applications.map((app: CapitalApplication) => (
            <Card key={app.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{getEntityName(app.entity_id)}</h3>
                  <p className="text-gray-500">
                    Applied for {formatCurrency(app.loan_request.amount)} over {app.loan_request.term_months} months
                  </p>
                  <p className="text-gray-600 mt-2">{app.loan_request.purpose}</p>
                </div>
                <Badge className={`bg-${getStatusDisplay(app.status).color}-100 text-${getStatusDisplay(app.status).color}-800 border-${getStatusDisplay(app.status).color}-300`}>
                  {getStatusDisplay(app.status).label}
                </Badge>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div className="w-2/3">
                  <div className="bg-gray-200 h-2 rounded-full">
                    <div 
                      className={`h-2 rounded-full bg-blue-500`}
                      style={{ width: `${getApplicationProgress(app)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {app.status === 'draft' ? `${getApplicationProgress(app)}% complete` : 'Application submitted'}
                  </p>
                </div>
                <div className="flex gap-2">
                  {app.status === 'draft' && (
                    <>
                      <Button variant="outline" onClick={() => app.id && handleEditApplication(app.id)}>
                        Edit
                      </Button>
                      <Button 
                        onClick={() => app.id && handleSubmitApplication(app.id)}
                        disabled={getApplicationProgress(app) < 80}
                      >
                        Submit
                      </Button>
                    </>
                  )}
                  {app.status !== 'draft' && (
                    <Button variant="outline" onClick={() => app.id && handleEditApplication(app.id)}>
                      View
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // Type guard for formData
  const isValidFormData = (data: CapitalApplication | null): data is CapitalApplication => {
    return data !== null && 
      typeof data === 'object' && 
      'entity_id' in data && 
      'business_info' in data && 
      'financial_info' in data && 
      'loan_request' in data;
  };

  // Form View
  const renderApplicationForm = () => {
    if (!formData || !isValidFormData(formData)) return <p>Loading form...</p>;
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            {formData.id ? 'Edit Application' : 'New Application'}
          </h1>
          <Button variant="outline" onClick={() => setCurrentView('list')}>
            Back to List
          </Button>
        </div>
        
        <Card className="p-6">
          <div className="space-y-6">
            {/* Entity Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Entity</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md"
                value={formData.entity_id}
                onChange={(e) => setFormData({...formData, entity_id: e.target.value})}
                disabled={!!formData.id}
              >
                {entities.map(entity => (
                  <option key={entity.id} value={entity.id}>
                    {entity.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Business Info */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Annual Revenue</label>
                  <input 
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.business_info.annual_revenue}
                    onChange={(e) => setFormData({
                      ...formData, 
                      business_info: {
                        ...formData.business_info, 
                        annual_revenue: parseFloat(e.target.value)
                      }
                    })}
                    disabled={formData.status !== 'draft'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Years in Business</label>
                  <input 
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.business_info.years_in_business}
                    onChange={(e) => setFormData({
                      ...formData, 
                      business_info: {
                        ...formData.business_info, 
                        years_in_business: parseInt(e.target.value, 10)
                      }
                    })}
                    disabled={formData.status !== 'draft'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <input 
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.business_info.industry}
                    onChange={(e) => setFormData({
                      ...formData, 
                      business_info: {
                        ...formData.business_info, 
                        industry: e.target.value
                      }
                    })}
                    disabled={formData.status !== 'draft'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee Count</label>
                  <input 
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.business_info.employee_count}
                    onChange={(e) => setFormData({
                      ...formData, 
                      business_info: {
                        ...formData.business_info, 
                        employee_count: parseInt(e.target.value, 10)
                      }
                    })}
                    disabled={formData.status !== 'draft'}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Description</label>
                  <textarea 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.business_info.business_description}
                    onChange={(e) => setFormData({
                      ...formData, 
                      business_info: {
                        ...formData.business_info, 
                        business_description: e.target.value
                      }
                    })}
                    rows={3}
                    disabled={formData.status !== 'draft'}
                  />
                </div>
              </div>
            </div>
            
            {/* Financial Info */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Financial Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Revenue</label>
                  <input 
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.financial_info.monthly_revenue}
                    onChange={(e) => setFormData({
                      ...formData, 
                      financial_info: {
                        ...formData.financial_info, 
                        monthly_revenue: parseFloat(e.target.value)
                      }
                    })}
                    disabled={formData.status !== 'draft'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Expenses</label>
                  <input 
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.financial_info.monthly_expenses}
                    onChange={(e) => setFormData({
                      ...formData, 
                      financial_info: {
                        ...formData.financial_info, 
                        monthly_expenses: parseFloat(e.target.value)
                      }
                    })}
                    disabled={formData.status !== 'draft'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Outstanding Receivables</label>
                  <input 
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.financial_info.outstanding_receivables}
                    onChange={(e) => setFormData({
                      ...formData, 
                      financial_info: {
                        ...formData.financial_info, 
                        outstanding_receivables: parseFloat(e.target.value)
                      }
                    })}
                    disabled={formData.status !== 'draft'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Cash Balance</label>
                  <input 
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.financial_info.current_cash_balance}
                    onChange={(e) => setFormData({
                      ...formData, 
                      financial_info: {
                        ...formData.financial_info, 
                        current_cash_balance: parseFloat(e.target.value)
                      }
                    })}
                    disabled={formData.status !== 'draft'}
                  />
                </div>
              </div>
            </div>
            
            {/* Loan Request */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Loan Request</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount</label>
                  <input 
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.loan_request.amount}
                    onChange={(e) => setFormData({
                      ...formData, 
                      loan_request: {
                        ...formData.loan_request, 
                        amount: parseFloat(e.target.value)
                      }
                    })}
                    disabled={formData.status !== 'draft'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Term (Months)</label>
                  <input 
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.loan_request.term_months}
                    onChange={(e) => setFormData({
                      ...formData, 
                      loan_request: {
                        ...formData.loan_request, 
                        term_months: parseInt(e.target.value, 10)
                      }
                    })}
                    disabled={formData.status !== 'draft'}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                  <textarea 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.loan_request.purpose}
                    onChange={(e) => setFormData({
                      ...formData, 
                      loan_request: {
                        ...formData.loan_request, 
                        purpose: e.target.value
                      }
                    })}
                    rows={3}
                    disabled={formData.status !== 'draft'}
                  />
                </div>
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
              {formData.status === 'draft' && (
                <>
                  <Button variant="outline" onClick={handleCalculate}>
                    Calculate Terms
                  </Button>
                  <Button onClick={handleSaveApplication}>
                    Save Application
                  </Button>
                </>
              )}
              {formData.status !== 'draft' && (
                <Button variant="outline" onClick={() => setCurrentView('list')}>
                  Back to List
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // Calculator View
  const renderCalculator = () => {
    if (!calculationResult || !formData) return <p>Loading calculator...</p>;
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Financing Calculator</h1>
          <Button variant="outline" onClick={() => setCurrentView('form')}>
            Back to Application
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Loan Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Loan Amount</span>
                <span className="font-medium">{formatCurrency(formData.loan_request.amount)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Term</span>
                <span className="font-medium">{formData.loan_request.term_months} months</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Interest Rate</span>
                <span className="font-medium">{(calculationResult.interest_rate * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Monthly Payment</span>
                <span className="font-medium">{formatCurrency(calculationResult.monthly_payment)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Total Interest</span>
                <span className="font-medium">{formatCurrency(calculationResult.total_interest)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Total Repayment</span>
                <span className="font-medium">{formatCurrency(calculationResult.total_repayment)}</span>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Amortization Schedule</h3>
            <div className="overflow-auto max-h-96">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Payment</th>
                    <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Amount</th>
                    <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Principal</th>
                    <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Interest</th>
                    <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {calculationResult.amortization_schedule.map((item) => (
                    <tr key={item.payment_number}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {item.payment_number}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(item.payment_amount)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(item.principal_amount)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(item.interest_amount)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(item.remaining_balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={() => {
            if (formData) {
              setFormData({
                ...formData,
                loan_request: {
                  ...formData.loan_request,
                  preferred_monthly_payment: calculationResult.monthly_payment
                }
              });
              setCurrentView('form');
            }
          }}>
            Apply These Terms
          </Button>
        </div>
      </div>
    );
  };

  // Render the current view
  return (
    <div className="w-full max-w-5xl mx-auto">
      {currentView === 'list' && renderApplicationsList()}
      {currentView === 'form' && renderApplicationForm()}
      {currentView === 'calculator' && renderCalculator()}
    </div>
  );
}
