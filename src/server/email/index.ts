import crypto from "crypto";
import { db } from "~/server/db";

/**
 * Mock email sending function
 * In production, you would use a service like SendGrid, AWS SES, Resend, or Nodemailer
 */
async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  console.log(`Sending email to ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
  
  // In a real implementation, you would send an actual email here
  // For development, we'll just log the email data
  
  // Return true to simulate successful sending
  return true;
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
    
    // Send the email
    return await sendEmail(email, subject, body);
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
    
    // Send the email
    return await sendEmail(email, subject, body);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
}
