import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { moniteClient } from "~/server/monite/monite-client";
import { headers } from "next/headers";
import crypto from "crypto";

/**
 * Types for Monite webhook payloads
 */
interface MoniteWebhookPayload {
  event_type: string;
  entity_id: string;
  data: unknown;
  event_id?: string;
  created_at?: string;
}

interface PayableData {
  id: string;
  status?: string;
  amount?: number;
  currency?: string;
  due_date?: string;
  counterpart_id?: string;
  created_at?: string;
  updated_at?: string;
  vendor?: string;
  payment_method?: string;
  payment_terms_id?: string;
}

interface ReceivableData {
  id: string;
  status?: string;
  amount?: number;
  currency?: string;
  due_date?: string;
  counterpart_id?: string;
  created_at?: string;
  updated_at?: string;
  customer?: string;
  invoice_number?: string;
  payment_terms_id?: string;
}

interface EntityData {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
  type?: string;
  tax_id?: string;
}

interface EntityUserData {
  id: string;
  entity_id: string;
  role_id?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  email?: string;
}

// Get webhook secret from environment variables
const WEBHOOK_SECRET = process.env.MONITE_WEBHOOK_SECRET || '';

/**
 * Webhook handler for Monite events
 * This endpoint receives webhook events from Monite and processes them
 * 
 * Events we're interested in:
 * - payable.created
 * - payable.status_changed
 * - receivable.created
 * - receivable.status_changed
 * - entity.updated
 * - entity_user.created
 * - entity_user.status_changed
 */
export async function POST(request: NextRequest) {
  try {
    // Get the raw request body
    const rawBody = await request.text();
    const payload = JSON.parse(rawBody) as MoniteWebhookPayload;
    
    // Verify webhook signature if available (important for production)
    const signature = headers().get('x-monite-signature');
    
    if (WEBHOOK_SECRET && signature) {
      const isValid = verifySignature(signature, WEBHOOK_SECRET, rawBody);
      if (!isValid) {
        console.error('[Webhook] Invalid signature');
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } else if (process.env.NODE_ENV === 'production') {
      // In production, always require a valid signature
      console.error('[Webhook] Missing signature or secret');
      return NextResponse.json({ error: "Missing signature or secret" }, { status: 401 });
    }

    const eventType = payload.event_type;
    const entityId = payload.entity_id;
    const data = payload.data;
    const eventId = payload.event_id || 'unknown';

    console.log(`[Webhook] Received ${eventType} event (${eventId}) for entity ${entityId}`);

    // Log the webhook to the database for auditing and debugging
    await logWebhookEvent(entityId, eventType, eventId, rawBody);

    // Process different event types
    switch (eventType) {
      case 'payable.created':
        await handlePayableCreated(entityId, data);
        break;
        
      case 'payable.status_changed':
        await handlePayableStatusChanged(entityId, data);
        break;
        
      case 'receivable.created':
        await handleReceivableCreated(entityId, data);
        break;
        
      case 'receivable.status_changed':
        await handleReceivableStatusChanged(entityId, data);
        break;
        
      case 'entity.updated':
        await handleEntityUpdated(entityId, data);
        break;
        
      case 'entity_user.created':
        await handleEntityUserCreated(entityId, data);
        break;
        
      case 'entity_user.status_changed':
        await handleEntityUserStatusChanged(entityId, data);
        break;
        
      default:
        console.log(`[Webhook] Unhandled event type: ${eventType}`);
    }
    
    // Return a success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Webhook] Error processing webhook:", error);
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}

/**
 * Verify the webhook signature
 */
function verifySignature(signature: string, secret: string, payload: string): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
      
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('[Webhook] Error verifying signature:', error);
    return false;
  }
}

/**
 * Log webhook event to database for auditing
 */
async function logWebhookEvent(entityId: string, eventType: string, eventId: string, payload: string) {
  try {
    // Currently just logging to console, but in production would save to database
    console.log(`[Webhook] Logging event ${eventId} of type ${eventType} for entity ${entityId}`);
    
    // Example implementation with database:
    /*
    await db.webhookLog.create({
      data: {
        eventId,
        entityId,
        eventType,
        payload,
        receivedAt: new Date(),
        processed: true
      }
    });
    */
  } catch (error) {
    console.error('[Webhook] Error logging webhook event:', error);
  }
}

/**
 * Handle a payable.created event
 */
async function handlePayableCreated(entityId: string, data: unknown) {
  try {
    const payableData = data as PayableData;
    console.log(`[Webhook] Processing payable.created for entity ${entityId} with ID ${payableData.id}`);
    
    // Find all users associated with this entity
    const users = await db.user.findMany({
      where: { 
        OR: [
          { moniteEntityId: entityId },
          { moniteEntityUserId: { not: null } }
        ]
      }
    });
    
    if (users.length === 0) {
      console.log(`[Webhook] No users found for entity ${entityId}`);
      return;
    }
    
    // In a real implementation, you might want to:
    // 1. Store the payable in your own database
    // 2. Send notifications to users
    // 3. Update UI state (e.g., through WebSockets)
    
    // Send email notification to users (if not in development)
    if (process.env.NODE_ENV === 'production') {
      await sendPayableNotification(users, payableData, 'created');
    }
    
    console.log(`[Webhook] Processed payable.created for ${users.length} users`);
  } catch (error) {
    console.error("[Webhook] Error handling payable.created:", error);
  }
}

/**
 * Handle a payable.status_changed event
 */
async function handlePayableStatusChanged(entityId: string, data: unknown) {
  try {
    const payableData = data as PayableData;
    const payableId = payableData.id;
    const newStatus = payableData.status;
    
    console.log(`[Webhook] Payable ${payableId} status changed to ${newStatus}`);
    
    // Find all users associated with this entity
    const users = await db.user.findMany({
      where: { 
        OR: [
          { moniteEntityId: entityId },
          { moniteEntityUserId: { not: null } }
        ]
      }
    });
    
    if (users.length === 0) {
      console.log(`[Webhook] No users found for entity ${entityId}`);
      return;
    }
    
    // In a real implementation, you might want to:
    // 1. Update the payable status in your own database
    // 2. Send notifications to users
    // 3. Update UI state (e.g., through WebSockets)
    
    // Send email notification for important status changes (if not in development)
    if (['paid', 'overdue', 'canceled'].includes(newStatus ?? '') && process.env.NODE_ENV === 'production') {
      await sendPayableNotification(users, payableData, 'status_changed');
    }
    
    console.log(`[Webhook] Processed status change for ${users.length} users`);
  } catch (error) {
    console.error("[Webhook] Error handling payable.status_changed:", error);
  }
}

/**
 * Handle a receivable.created event
 */
async function handleReceivableCreated(entityId: string, data: unknown) {
  try {
    const receivableData = data as ReceivableData;
    console.log(`[Webhook] Processing receivable.created for entity ${entityId} with ID ${receivableData.id}`);
    
    // Find all users associated with this entity
    const users = await db.user.findMany({
      where: { 
        OR: [
          { moniteEntityId: entityId },
          { moniteEntityUserId: { not: null } }
        ]
      }
    });
    
    if (users.length === 0) {
      console.log(`[Webhook] No users found for entity ${entityId}`);
      return;
    }
    
    // In a real implementation, you might want to:
    // 1. Store the receivable in your own database
    // 2. Send notifications to users
    // 3. Update UI state (e.g., through WebSockets)
    
    // Send email notification (if not in development)
    if (process.env.NODE_ENV === 'production') {
      await sendReceivableNotification(users, receivableData, 'created');
    }
    
    console.log(`[Webhook] Processed receivable.created for ${users.length} users`);
  } catch (error) {
    console.error("[Webhook] Error handling receivable.created:", error);
  }
}

/**
 * Handle a receivable.status_changed event
 */
async function handleReceivableStatusChanged(entityId: string, data: unknown) {
  try {
    const receivableData = data as ReceivableData;
    const receivableId = receivableData.id;
    const newStatus = receivableData.status;
    
    console.log(`[Webhook] Receivable ${receivableId} status changed to ${newStatus}`);
    
    // Find all users associated with this entity
    const users = await db.user.findMany({
      where: { 
        OR: [
          { moniteEntityId: entityId },
          { moniteEntityUserId: { not: null } }
        ]
      }
    });
    
    if (users.length === 0) {
      console.log(`[Webhook] No users found for entity ${entityId}`);
      return;
    }
    
    // In a real implementation, you might want to:
    // 1. Update the receivable status in your own database
    // 2. Send notifications to users
    // 3. Update UI state (e.g., through WebSockets)
    
    // Send email notification for important status changes (if not in development)
    if (['paid', 'overdue', 'canceled'].includes(newStatus ?? '') && process.env.NODE_ENV === 'production') {
      await sendReceivableNotification(users, receivableData, 'status_changed');
    }
    
    console.log(`[Webhook] Processed status change for ${users.length} users`);
  } catch (error) {
    console.error("[Webhook] Error handling receivable.status_changed:", error);
  }
}

/**
 * Handle an entity.updated event
 */
async function handleEntityUpdated(entityId: string, data: unknown) {
  try {
    const entityData = data as EntityData;
    console.log(`[Webhook] Processing entity.updated for entity ${entityId}`);
    
    // Find all users associated with this entity
    const users = await db.user.findMany({
      where: { 
        OR: [
          { moniteEntityId: entityId },
          { moniteEntityUserId: { not: null } }
        ]
      }
    });
    
    if (users.length === 0) {
      console.log(`[Webhook] No users found for entity ${entityId}`);
      return;
    }
    
    // In a real implementation, you might want to:
    // 1. Update entity details in your own database
    // 2. Send notifications to users
    // 3. Update UI state (e.g., through WebSockets)
    
    // Update entity information in our database
    const updatePromises = users.map(user => 
      db.user.update({
        where: { id: user.id },
        data: { 
          // Only update fields if they are provided in the webhook
          ...(entityData.email ? { email: entityData.email } : {}),
        }
      })
    );
    
    await Promise.all(updatePromises);
    
    console.log(`[Webhook] Processed entity update for ${users.length} users`);
  } catch (error) {
    console.error("[Webhook] Error handling entity.updated:", error);
  }
}

/**
 * Handle an entity_user.created event
 */
async function handleEntityUserCreated(entityId: string, data: unknown) {
  try {
    const entityUserData = data as EntityUserData;
    console.log(`[Webhook] Processing entity_user.created with ID ${entityUserData.id} for entity ${entityId}`);
    
    // Check if we already have a user with this email
    if (entityUserData.email) {
      const existingUser = await db.user.findFirst({
        where: { email: entityUserData.email }
      });
      
      if (existingUser) {
        // Update the existing user with the entity user ID
        await db.user.update({
          where: { id: existingUser.id },
          data: { 
            moniteEntityUserId: entityUserData.id,
            moniteEntityId: entityId
          }
        });
        
        console.log(`[Webhook] Updated existing user ${existingUser.id} with entity user ID ${entityUserData.id}`);
      } else {
        console.log(`[Webhook] No existing user found for email ${entityUserData.email}`);
        // In production, you might want to create a new user record or send an invitation
      }
    }
  } catch (error) {
    console.error("[Webhook] Error handling entity_user.created:", error);
  }
}

/**
 * Handle an entity_user.status_changed event
 */
async function handleEntityUserStatusChanged(entityId: string, data: unknown) {
  try {
    const entityUserData = data as EntityUserData;
    const entityUserId = entityUserData.id;
    const newStatus = entityUserData.status;
    
    console.log(`[Webhook] Entity user ${entityUserId} status changed to ${newStatus}`);
    
    // Find users with this entity user ID
    const users = await db.user.findMany({
      where: { moniteEntityUserId: entityUserId }
    });
    
    if (users.length === 0) {
      console.log(`[Webhook] No users found with entity user ID ${entityUserId}`);
      return;
    }
    
    // Update user status based on entity user status
    if (newStatus === 'active') {
      // Activate user
      const updatePromises = users.map(user => 
        db.user.update({
          where: { id: user.id },
          data: { active: true }
        })
      );
      
      await Promise.all(updatePromises);
    } else if (newStatus === 'inactive' || newStatus === 'suspended') {
      // Deactivate user
      const updatePromises = users.map(user => 
        db.user.update({
          where: { id: user.id },
          data: { active: false }
        })
      );
      
      await Promise.all(updatePromises);
    }
    
    console.log(`[Webhook] Processed entity user status change for ${users.length} users`);
  } catch (error) {
    console.error("[Webhook] Error handling entity_user.status_changed:", error);
  }
}

/**
 * Send email notification for payable events
 */
async function sendPayableNotification(users: any[], payableData: PayableData, eventType: 'created' | 'status_changed') {
  try {
    // Import email service dynamically to avoid issues in development
    const { sendPayableNotificationEmail } = await import('~/server/email');
    
    // Create notification subject and message based on event type
    let subject, message;
    if (eventType === 'created') {
      subject = `New bill received: ${payableData.vendor || 'Unknown vendor'}`;
      message = `A new bill for ${formatCurrency(payableData.amount)} has been created in your WonderPay account.`;
    } else {
      // Status changed
      subject = `Bill status updated: ${payableData.vendor || 'Unknown vendor'}`;
      message = `The status of your bill (${formatCurrency(payableData.amount)}) has been updated to ${payableData.status}.`;
    }
    
    // Send email to each user
    const emailPromises = users.map(user => 
      sendPayableNotificationEmail(
        user.email,
        subject,
        message,
        {
          payableId: payableData.id,
          amount: payableData.amount,
          vendor: payableData.vendor,
          status: payableData.status,
          dueDate: payableData.due_date
        }
      )
    );
    
    await Promise.all(emailPromises);
    
    console.log(`[Webhook] Sent payable notifications to ${users.length} users`);
  } catch (error) {
    console.error("[Webhook] Error sending payable notification:", error);
  }
}

/**
 * Send email notification for receivable events
 */
async function sendReceivableNotification(users: any[], receivableData: ReceivableData, eventType: 'created' | 'status_changed') {
  try {
    // Import email service dynamically to avoid issues in development
    const { sendReceivableNotificationEmail } = await import('~/server/email');
    
    // Create notification subject and message based on event type
    let subject, message;
    if (eventType === 'created') {
      subject = `New invoice created: ${receivableData.invoice_number || 'Unknown invoice'}`;
      message = `A new invoice for ${formatCurrency(receivableData.amount)} has been created in your WonderPay account.`;
    } else {
      // Status changed
      subject = `Invoice status updated: ${receivableData.invoice_number || 'Unknown invoice'}`;
      message = `The status of your invoice (${formatCurrency(receivableData.amount)}) has been updated to ${receivableData.status}.`;
    }
    
    // Send email to each user
    const emailPromises = users.map(user => 
      sendReceivableNotificationEmail(
        user.email,
        subject,
        message,
        {
          receivableId: receivableData.id,
          amount: receivableData.amount,
          customer: receivableData.customer,
          status: receivableData.status,
          dueDate: receivableData.due_date,
          invoiceNumber: receivableData.invoice_number
        }
      )
    );
    
    await Promise.all(emailPromises);
    
    console.log(`[Webhook] Sent receivable notifications to ${users.length} users`);
  } catch (error) {
    console.error("[Webhook] Error sending receivable notification:", error);
  }
}

/**
 * Format currency for display
 */
function formatCurrency(amount?: number): string {
  if (amount === undefined) {
    return '$0.00';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}
