/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/capital/calculate
 * Calculate loan terms based on requested amount and duration
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const calculationRequest = await req.json();
    
    // Validate required parameters
    if (!calculationRequest.loan_amount || !calculationRequest.term_months) {
      return NextResponse.json(
        { error: "Loan amount and term months are required" },
        { status: 400 }
      );
    }
    
    // Extract values
    const loanAmount = parseFloat(calculationRequest.loan_amount.toString());
    const termMonths = parseInt(calculationRequest.term_months.toString(), 10);
    
    // Validate values
    if (isNaN(loanAmount) || loanAmount <= 0) {
      return NextResponse.json(
        { error: "Loan amount must be a positive number" },
        { status: 400 }
      );
    }
    
    if (isNaN(termMonths) || termMonths <= 0) {
      return NextResponse.json(
        { error: "Term months must be a positive integer" },
        { status: 400 }
      );
    }
    
    // In a real system, we would have a more sophisticated calculation
    // that might take into account the applicant's credit score, business performance, etc.
    // For this demo, we'll use a simplified calculation
    
    // Determine interest rate (for demonstration)
    // Interest rate could be based on many factors like credit score, business history, etc.
    const baseRate = 0.065; // 6.5% base rate
    const interestRate = calculationRequest.interest_rate 
      ? parseFloat(calculationRequest.interest_rate.toString()) 
      : baseRate;
    
    // Monthly interest rate
    const monthlyRate = interestRate / 12;
    
    // Calculate monthly payment using the loan formula
    // P = (L * r * (1 + r)^n) / ((1 + r)^n - 1)
    // Where:
    // P = Monthly payment
    // L = Loan amount
    // r = Monthly interest rate (annual rate / 12)
    // n = Number of payments (term in months)
    const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);
    
    // Calculate total repayment
    const totalRepayment = monthlyPayment * termMonths;
    
    // Calculate total interest
    const totalInterest = totalRepayment - loanAmount;
    
    // Generate amortization schedule
    const amortizationSchedule = [];
    let remainingBalance = loanAmount;
    
    for (let paymentNumber = 1; paymentNumber <= termMonths; paymentNumber++) {
      // Calculate interest for this period
      const interestAmount = remainingBalance * monthlyRate;
      
      // Calculate principal for this period
      const principalAmount = monthlyPayment - interestAmount;
      
      // Update remaining balance
      remainingBalance -= principalAmount;
      
      // Ensure remaining balance doesn't go below zero due to rounding
      const adjustedRemainingBalance = paymentNumber === termMonths ? 0 : Math.max(0, remainingBalance);
      
      // Add to schedule
      amortizationSchedule.push({
        payment_number: paymentNumber,
        payment_amount: parseFloat(monthlyPayment.toFixed(2)),
        principal_amount: parseFloat(principalAmount.toFixed(2)),
        interest_amount: parseFloat(interestAmount.toFixed(2)),
        remaining_balance: parseFloat(adjustedRemainingBalance.toFixed(2))
      });
    }
    
    // Return calculation results
    return NextResponse.json({
      monthly_payment: parseFloat(monthlyPayment.toFixed(2)),
      total_interest: parseFloat(totalInterest.toFixed(2)),
      total_repayment: parseFloat(totalRepayment.toFixed(2)),
      interest_rate: interestRate,
      amortization_schedule: amortizationSchedule
    });
  } catch (error) {
    console.error("Error calculating loan terms:", error);
    return NextResponse.json(
      { error: "Failed to calculate loan terms" },
      { status: 500 }
    );
  }
}
