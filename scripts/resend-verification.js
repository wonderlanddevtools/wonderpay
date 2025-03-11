// Need to set up environment variables to match Next.js environment
process.env.NODE_ENV = 'development';

// Use require for better compatibility
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendVerificationEmail } = require('../src/server/email');

async function resendVerificationEmail() {
  try {
    // Find the most recent user
    const user = await prisma.user.findFirst({
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!user) {
      console.error('No users found in the database');
      process.exit(1);
    }

    console.log(`Found user: ${user.email}`);
    
    // Resend verification email
    const result = await sendVerificationEmail(user.email);
    
    if (result) {
      console.log(`Verification email resent to ${user.email}`);
    } else {
      console.error(`Failed to resend verification email to ${user.email}`);
    }
  } catch (error) {
    console.error('Error resending verification email:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resendVerificationEmail();
