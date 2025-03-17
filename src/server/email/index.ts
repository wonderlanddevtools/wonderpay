import crypto from "crypto";
import { db } from "~/server/db";
import { Resend } from "resend";
import { env } from "~/env";

/**
 * Initialize Resend client with API key
 */
const resendApiKey = env.RESEND_API_KEY ?? process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

/**
 * Email sending function using Resend in production and mock in development
 */
async function sendEmail(to: string, subject: string, body: string, html?: string): Promise<boolean> {
  try {
    // Log email data in all environments for debugging
    console.log(`Preparing email to ${to}`);
    console.log(`Subject: ${subject}`);
    
    // Use Resend in production or if API key is provided
    if (resend) {
      console.log('Using Resend for email delivery');
      
      try {
        // For development, use Resend's test domain
        // In production, use the verified wonderpay.app domain
        const fromEmail = process.env.NODE_ENV === 'production' 
          ? 'WonderPay <noreply@wonderpay.app>'
          : 'WonderPay <onboarding@resend.dev>';
        
        // In development, we can only send to the developer's email address
        // This is a restriction of the Resend free tier
        const toEmails = process.env.NODE_ENV === 'production'
          ? [to]
          : ['devtools@thewonderlandstudio.co'];
        
        console.log(`Sending email from: ${fromEmail}`);
        console.log(`Sending email to: ${toEmails.join(', ')}`);
        
        const response = await resend.emails.send({
          from: fromEmail,
          to: toEmails,
          subject: process.env.NODE_ENV === 'production' ? subject : `[TEST: ${to}] ${subject}`,
          text: body,
          html: html ?? convertToHtml(body),
        });
        
        // Check if response contains data.id (success case)
        if (response && 
            typeof response === 'object' && 
            'data' in response && 
            response.data && 
            typeof response.data === 'object' && 
            'id' in response.data) {
          const responseId = String(response.data.id);
          console.log(`Email sent with Resend, ID: ${responseId}`);
          return true;
        }
        
        // Handle error case
        console.error('Resend API error:', response);
        return false;
      } catch (resendError) {
        console.error('Resend API call failed:', resendError);
        return false;
      }
    } else {
      // Fall back to mock email in development
      console.log('Using mock email delivery (development mode)');
      console.log('Email body:', body);
      console.log('Note: Set RESEND_API_KEY env variable to use Resend');
      
      // Return true to simulate successful sending
      return true;
    }
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

/**
 * Helper to convert plain text to simple HTML
 */
function convertToHtml(text: string): string {
  return text
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/\s\s/g, '&nbsp;&nbsp;')
    .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
    .replace(/^(.+)$/gm, '<p>$1</p>');
}

/**
 * Sends a verification email to the user
 */
export async function sendVerificationEmail(email: string): Promise<boolean> {
  try {
    // Generate a token and an expiry date (24 hours from now)
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours
    
    // Store the token in the database
    await db.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });
    
    // Create the verification URL with fallback for development
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;
    
    // Email content
    const subject = "Verify your WonderPay account";
    const body = `
      Hello,
      
      Thank you for signing up for WonderPay!
      
      Please verify your email address by clicking the link below:
      
      ${verificationUrl}
      
      This link will expire in 24 hours.
      
      If you did not sign up for WonderPay, please ignore this email.
      
      Best regards,
      The WonderPay Team
    `;
    
    // HTML version
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verify your WonderPay account</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            color: #333333; 
            line-height: 1.6; 
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-bottom: 3px solid #0066cc;
          }
          .content {
            padding: 20px;
          }
          .button {
            display: inline-block;
            background-color: #0066cc;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 4px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>WonderPay</h1>
          </div>
          <div class="content">
            <h2>Verify your email address</h2>
            <p>Hello,</p>
            <p>Thank you for signing up for WonderPay! Please verify your email address by clicking the button below:</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p>${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you did not sign up for WonderPay, please ignore this email.</p>
            <p>Best regards,<br>The WonderPay Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} WonderPay. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Send the email
    return await sendEmail(email, subject, body, html);
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
}

/**
 * Sends a password reset email to the user
 */
export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
  try {
    // Create the reset URL with fallback for development
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
    
    // Email content
    const subject = "Reset your WonderPay password";
    const body = `
      Hello,
      
      You requested a password reset for your WonderPay account.
      
      Please click the link below to reset your password:
      
      ${resetUrl}
      
      This link will expire in 24 hours.
      
      If you did not request a password reset, please ignore this email.
      
      Best regards,
      The WonderPay Team
    `;
    
    // HTML version
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset your WonderPay password</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            color: #333333; 
            line-height: 1.6; 
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-bottom: 3px solid #0066cc;
          }
          .content {
            padding: 20px;
          }
          .button {
            display: inline-block;
            background-color: #0066cc;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 4px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>WonderPay</h1>
          </div>
          <div class="content">
            <h2>Reset your password</h2>
            <p>Hello,</p>
            <p>You requested a password reset for your WonderPay account. Please click the button below to reset your password:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p>${resetUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you did not request a password reset, please ignore this email.</p>
            <p>Best regards,<br>The WonderPay Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} WonderPay. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Send the email
    return await sendEmail(email, subject, body, html);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
}

/**
 * Sends an entity setup confirmation email to the user
 */
export async function sendEntitySetupEmail(email: string, entityId: string): Promise<boolean> {
  try {
    // Create the dashboard URL with fallback for development
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    const dashboardUrl = `${baseUrl}/dashboard`;
    
    // Email content
    const subject = "Your WonderPay entity is ready";
    const body = `
      Hello,
      
      Your WonderPay entity has been successfully set up with ID: ${entityId}
      
      You can now access all financial features in your dashboard:
      
      ${dashboardUrl}
      
      If you encounter any issues, please contact our support team.
      
      Best regards,
      The WonderPay Team
    `;
    
    // HTML version
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Your WonderPay entity is ready</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            color: #333333; 
            line-height: 1.6; 
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-bottom: 3px solid #0066cc;
          }
          .content {
            padding: 20px;
          }
          .button {
            display: inline-block;
            background-color: #0066cc;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 4px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666666;
          }
          .entity-id {
            background-color: #f7f7f7;
            padding: 10px;
            border-radius: 4px;
            border-left: 3px solid #0066cc;
            font-family: monospace;
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>WonderPay</h1>
          </div>
          <div class="content">
            <h2>Your WonderPay entity is ready</h2>
            <p>Hello,</p>
            <p>Your WonderPay entity has been successfully set up with ID:</p>
            <div class="entity-id">${entityId}</div>
            <p>You can now access all financial features in your dashboard:</p>
            <p style="text-align: center;">
              <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
            </p>
            <p>If you encounter any issues, please contact our support team.</p>
            <p>Best regards,<br>The WonderPay Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} WonderPay. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Send the email
    return await sendEmail(email, subject, body, html);
  } catch (error) {
    console.error("Error sending entity setup email:", error);
    return false;
  }
}

/**
 * Sends a payable notification email to the user
 */
export async function sendPayableNotificationEmail(
  email: string, 
  subject: string, 
  message: string,
  payableDetails: {
    payableId: string;
    amount?: number;
    vendor?: string;
    status?: string;
    dueDate?: string;
  }
): Promise<boolean> {
  try {
    // Create the payable URL with fallback for development
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    const payableUrl = `${baseUrl}/dashboard/bill-pay`;
    
    // Format amount
    const formattedAmount = payableDetails.amount 
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(payableDetails.amount)
      : 'N/A';
    
    // Format due date
    const formattedDueDate = payableDetails.dueDate
      ? new Date(payableDetails.dueDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : 'N/A';
    
    // Email content
    const body = `
      Hello,
      
      ${message}
      
      Bill Details:
      - Vendor: ${payableDetails.vendor || 'Unknown vendor'}
      - Amount: ${formattedAmount}
      - Due Date: ${formattedDueDate}
      - Status: ${payableDetails.status || 'Unknown status'}
      
      You can view and manage this bill in your WonderPay dashboard:
      
      ${payableUrl}
      
      Best regards,
      The WonderPay Team
    `;
    
    // HTML version
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            color: #333333; 
            line-height: 1.6; 
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-bottom: 3px solid #0066cc;
          }
          .content {
            padding: 20px;
          }
          .button {
            display: inline-block;
            background-color: #0066cc;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 4px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666666;
          }
          .details {
            background-color: #f7f7f7;
            padding: 15px;
            border-radius: 4px;
            margin: 15px 0;
          }
          .details-table {
            width: 100%;
            border-collapse: collapse;
          }
          .details-table td {
            padding: 8px;
            border-bottom: 1px solid #eee;
          }
          .details-table td:first-child {
            font-weight: bold;
            width: 30%;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
          }
          .status-pending {
            background-color: #e3f2fd;
            color: #0066cc;
          }
          .status-paid {
            background-color: #e8f5e9;
            color: #2e7d32;
          }
          .status-overdue {
            background-color: #ffebee;
            color: #c62828;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>WonderPay</h1>
          </div>
          <div class="content">
            <h2>${subject}</h2>
            <p>Hello,</p>
            <p>${message}</p>
            
            <div class="details">
              <h3>Bill Details</h3>
              <table class="details-table">
                <tr>
                  <td>Vendor</td>
                  <td>${payableDetails.vendor || 'Unknown vendor'}</td>
                </tr>
                <tr>
                  <td>Amount</td>
                  <td>${formattedAmount}</td>
                </tr>
                <tr>
                  <td>Due Date</td>
                  <td>${formattedDueDate}</td>
                </tr>
                <tr>
                  <td>Status</td>
                  <td>
                    <span class="status-badge status-${payableDetails.status?.toLowerCase() || 'pending'}">
                      ${payableDetails.status?.toUpperCase() || 'PENDING'}
                    </span>
                  </td>
                </tr>
              </table>
            </div>
            
            <p>You can view and manage this bill in your WonderPay dashboard:</p>
            <p style="text-align: center;">
              <a href="${payableUrl}" class="button">Go to Bill Pay</a>
            </p>
            <p>Best regards,<br>The WonderPay Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} WonderPay. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Send the email
    return await sendEmail(email, subject, body, html);
  } catch (error) {
    console.error("Error sending payable notification email:", error);
    return false;
  }
}

/**
 * Sends a receivable notification email to the user
 */
export async function sendReceivableNotificationEmail(
  email: string, 
  subject: string, 
  message: string,
  receivableDetails: {
    receivableId: string;
    amount?: number;
    customer?: string;
    status?: string;
    dueDate?: string;
    invoiceNumber?: string;
  }
): Promise<boolean> {
  try {
    // Create the receivable URL with fallback for development
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    const receivableUrl = `${baseUrl}/dashboard/receivables`;
    
    // Format amount
    const formattedAmount = receivableDetails.amount 
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(receivableDetails.amount)
      : 'N/A';
    
    // Format due date
    const formattedDueDate = receivableDetails.dueDate
      ? new Date(receivableDetails.dueDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : 'N/A';
    
    // Email content
    const body = `
      Hello,
      
      ${message}
      
      Invoice Details:
      - Invoice Number: ${receivableDetails.invoiceNumber || 'N/A'}
      - Customer: ${receivableDetails.customer || 'Unknown customer'}
      - Amount: ${formattedAmount}
      - Due Date: ${formattedDueDate}
      - Status: ${receivableDetails.status || 'Unknown status'}
      
      You can view and manage this invoice in your WonderPay dashboard:
      
      ${receivableUrl}
      
      Best regards,
      The WonderPay Team
    `;
    
    // HTML version
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            color: #333333; 
            line-height: 1.6; 
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-bottom: 3px solid #0066cc;
          }
          .content {
            padding: 20px;
          }
          .button {
            display: inline-block;
            background-color: #0066cc;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 4px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666666;
          }
          .details {
            background-color: #f7f7f7;
            padding: 15px;
            border-radius: 4px;
            margin: 15px 0;
          }
          .details-table {
            width: 100%;
            border-collapse: collapse;
          }
          .details-table td {
            padding: 8px;
            border-bottom: 1px solid #eee;
          }
          .details-table td:first-child {
            font-weight: bold;
            width: 30%;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
          }
          .status-pending {
            background-color: #e3f2fd;
            color: #0066cc;
          }
          .status-paid {
            background-color: #e8f5e9;
            color: #2e7d32;
          }
          .status-overdue {
            background-color: #ffebee;
            color: #c62828;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>WonderPay</h1>
          </div>
          <div class="content">
            <h2>${subject}</h2>
            <p>Hello,</p>
            <p>${message}</p>
            
            <div class="details">
              <h3>Invoice Details</h3>
              <table class="details-table">
                <tr>
                  <td>Invoice Number</td>
                  <td>${receivableDetails.invoiceNumber || 'N/A'}</td>
                </tr>
                <tr>
                  <td>Customer</td>
                  <td>${receivableDetails.customer || 'Unknown customer'}</td>
                </tr>
                <tr>
                  <td>Amount</td>
                  <td>${formattedAmount}</td>
                </tr>
                <tr>
                  <td>Due Date</td>
                  <td>${formattedDueDate}</td>
                </tr>
                <tr>
                  <td>Status</td>
                  <td>
                    <span class="status-badge status-${receivableDetails.status?.toLowerCase() || 'pending'}">
                      ${receivableDetails.status?.toUpperCase() || 'PENDING'}
                    </span>
                  </td>
                </tr>
              </table>
            </div>
            
            <p>You can view and manage this invoice in your WonderPay dashboard:</p>
            <p style="text-align: center;">
              <a href="${receivableUrl}" class="button">Go to Receivables</a>
            </p>
            <p>Best regards,<br>The WonderPay Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} WonderPay. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Send the email
    return await sendEmail(email, subject, body, html);
  } catch (error) {
    console.error("Error sending receivable notification email:", error);
    return false;
  }
}
