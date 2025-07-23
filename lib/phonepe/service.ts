// lib/phonepe/service.ts - FIXED VERSION
import axios from 'axios'
import { prisma } from '@/lib/prisma'
import { PHONEPE_CONFIG } from './config'
import { generateOrderId, generateSubscriptionId, getNextMonday } from '@/lib/utils'

// Get or refresh auth token
export async function getAuthToken() {
  // Check if we have a valid token in DB
  const existingToken = await prisma.authToken.findFirst({
    where: {
      expiresAt: {
        gt: new Date()
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  if (existingToken) {
    return existingToken.token
  }

  // Get new token
  const params = new URLSearchParams({
    client_id: PHONEPE_CONFIG.CLIENT_ID,
    client_version: '1',
    client_secret: PHONEPE_CONFIG.CLIENT_SECRET,
    grant_type: 'client_credentials'
  })

  const response = await axios.post(PHONEPE_CONFIG.AUTH_URL, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })

  // Save token to DB
  await prisma.authToken.create({
    data: {
      token: response.data.access_token,
      expiresAt: new Date(response.data.expires_at * 1000)
    }
  })

  return response.data.access_token
}

// Create mandate for weekly bike rental payment
export async function createMandate({ customerId, weeklyAmount, frequency = 'WEEKLY' }: {
  customerId: string
  weeklyAmount: number
  frequency?: string
}) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId }
  })

  if (!customer) {
    throw new Error('Customer not found')
  }

  const token = await getAuthToken()
  const merchantOrderId = generateOrderId()
  const merchantSubscriptionId = generateSubscriptionId()
  const subscriptionExpiry = Date.now() + (365 * 24 * 60 * 60 * 1000)

  const payload = {
    merchantOrderId,
    amount: 200, // ₹2 for PENNY_DROP verification only
    expireAt: Date.now() + (10 * 60 * 1000),
    paymentFlow: {
      type: "SUBSCRIPTION_SETUP",
      merchantSubscriptionId,
      authWorkflowType: "PENNY_DROP", // 🔥 CHANGED: Only ₹2 verification, no immediate full payment
      amountType: "FIXED",
      maxAmount: weeklyAmount * 100, // Actual weekly amount as max
      frequency: frequency,
      expireAt: subscriptionExpiry,
      paymentMode: {
        type: "UPI_COLLECT",
        details: {
          type: "VPA",
          vpa: customer.upiId
        }
      }
    }
  }

  const response = await axios.post(
    `${PHONEPE_CONFIG.BASE_URL}/subscriptions/v2/setup`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `O-Bearer ${token}`
      }
    }
  )

  // Store subscription in DB
  const subscription = await prisma.subscription.create({
    data: {
      merchantSubscriptionId,
      customerId,
      merchantOrderId,
      phonepeOrderId: response.data.orderId,
      weeklyAmount,
      frequency,
      status: response.data.state,
      mandateUrl: response.data.intentUrl,
      nextDebitDate: getNextMonday(), // First payment on next Monday
      lastDebitDate: null // No payment has happened yet
    }
  })

  return { subscription, phonepeResponse: response.data }
}

// Check mandate status
export async function checkMandateStatus(merchantSubscriptionId: string) {
  const token = await getAuthToken()

  const response = await axios.get(
    `${PHONEPE_CONFIG.BASE_URL}/subscriptions/v2/${merchantSubscriptionId}/status?details=true`,
    {
      headers: {
        'Authorization': `O-Bearer ${token}`
      }
    }
  )

  // Update subscription status in DB
  if (response.data.state) {
    await prisma.subscription.update({
      where: { merchantSubscriptionId },
      data: {
        status: response.data.state,
        lastChecked: new Date(),
        activatedAt: response.data.state === 'ACTIVE' ? new Date() : undefined,
        scheduledForDebit: response.data.state === 'ACTIVE',
        nextDebitDate: response.data.state === 'ACTIVE' ? getNextMonday() : undefined
      }
    })
  }

  return response.data
}

// FIXED: Only trigger notify for weekly payment (PhonePe will auto-execute after 24hrs)
export async function triggerWeeklyNotification(subscriptionId: string, merchantOrderId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { customer: true }
  })

  if (!subscription || subscription.status !== 'ACTIVE') {
    throw new Error('Active subscription not found')
  }

  const token = await getAuthToken()

  // Only call NOTIFY API - PhonePe will auto-execute after 24 hours
  const notifyPayload = {
    merchantOrderId,
    amount: subscription.weeklyAmount * 100,
    expireAt: Date.now() + (48 * 60 * 60 * 1000), // 48 hours expiry
    paymentFlow: {
      type: "SUBSCRIPTION_REDEMPTION",
      merchantSubscriptionId: subscription.merchantSubscriptionId,
      redemptionRetryStrategy: "STANDARD", // Let PhonePe handle retries
      autoDebit: true // PhonePe will execute after 24 hours automatically
    }
  }

  const notifyResponse = await axios.post(
    `${PHONEPE_CONFIG.BASE_URL}/subscriptions/v2/notify`,
    notifyPayload,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `O-Bearer ${token}`
      }
    }
  )

  // Store payment record as PENDING (will be updated via webhook)
  const payment = await prisma.payment.create({
    data: {
      subscriptionId: subscription.id,
      customerId: subscription.customerId,
      customerName: subscription.customer.name,
      merchantOrderId,
      transactionId: null, // Will be set when execution happens
      amount: subscription.weeklyAmount,
      status: 'PENDING',
      type: 'AUTOMATED_WEEKLY_DEBIT' // Changed to indicate it's automated
    }
  })

  // Update subscription with next debit info
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      lastDebitDate: null, // Will be set when payment completes
      nextDebitDate: getNextMonday()
    }
  })

  return {
    payment,
    notifyResponse: notifyResponse.data,
    message: 'Notification sent. PhonePe will auto-execute payment after 24 hours.'
  }
}

// NEW: Manual execute function (only use if autoDebit is false)
export async function executeWeeklyDebit(merchantOrderId: string) {
  const token = await getAuthToken()

  const executeResponse = await axios.post(
    `${PHONEPE_CONFIG.BASE_URL}/subscriptions/v2/redeem`,
    { merchantOrderId },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `O-Bearer ${token}`
      }
    }
  )

  return executeResponse.data
}

// Cancel mandate
export async function cancelMandate(merchantSubscriptionId: string) {
  const token = await getAuthToken()

  await axios.post(
    `${PHONEPE_CONFIG.BASE_URL}/subscriptions/v2/${merchantSubscriptionId}/cancel`,
    {},
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `O-Bearer ${token}`
      }
    }
  )

  // Update subscription status
  await prisma.subscription.update({
    where: { merchantSubscriptionId },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date()
    }
  })
}