// lib/cron/weekly-payments.ts - FIXED VERSION
import { prisma } from '@/lib/prisma'
import { triggerWeeklyNotification } from '@/lib/phonepe/service'
import { generateOrderId } from '@/lib/utils'

export async function processWeeklyPayments() {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
  
  // 🔥 ONLY run on Mondays (day 1)
  if (dayOfWeek !== 1) {
    console.log(`Today is not Monday (day ${dayOfWeek}). Skipping weekly payment processing.`)
    return { message: 'Not Monday - payments only processed on Mondays' }
  }
  
  console.log('Starting Monday weekly payment processing...')
  
  // 🔥 ENHANCED LOGIC: Get subscriptions that truly need payment
  const activeSubscriptions = await prisma.subscription.findMany({
    where: {
      status: 'ACTIVE',
      OR: [
        // Never been debited (first payment)
        { lastDebitDate: null },
        // Last payment was more than 6 days ago
        { 
          lastDebitDate: { 
            lte: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
          } 
        }
      ]
    },
    include: {
      customer: true,
      // 🔥 CRITICAL: Include recent payments to double-check
      payments: {
        where: {
          status: { in: ['SUCCESS', 'PENDING'] },
          createdAt: {
            gte: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // Last 6 days
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  })

  console.log(`Found ${activeSubscriptions.length} potential subscriptions for Monday payment`)

  // 🔥 FILTER OUT subscriptions with recent payments/notifications
  const subscriptionsNeedingPayment = activeSubscriptions.filter(subscription => {
    if (subscription.payments.length > 0) {
      const recentPayment = subscription.payments[0]
      const daysSinceLastPayment = Math.floor(
        (Date.now() - recentPayment.createdAt.getTime()) / (24 * 60 * 60 * 1000)
      )
      
      if (daysSinceLastPayment < 6) {
        console.log(`Skipping ${subscription.customer.name} - payment already triggered ${daysSinceLastPayment} days ago`)
        return false
      }
    }
    return true
  })

  console.log(`After filtering recent payments: ${subscriptionsNeedingPayment.length} subscriptions need payment`)

  const results = []

  for (const subscription of subscriptionsNeedingPayment) {
    try {
      const merchantOrderId = generateOrderId()
      
      // Trigger notification - PhonePe will auto-execute after 24 hours
      const result = await triggerWeeklyNotification(subscription.id, merchantOrderId)
      
      console.log(`✅ Notification sent for ${subscription.customer.name} - ₹${subscription.weeklyAmount}`)
      
      results.push({
        subscriptionId: subscription.id,
        customerName: subscription.customer.name,
        amount: subscription.weeklyAmount,
        success: true,
        paymentId: result.payment.id,
        message: 'Monday payment notification sent successfully'
      })
      
    } catch (error: any) {
      console.error(`❌ Failed to process payment for subscription ${subscription.id}:`, error)
      
      results.push({
        subscriptionId: subscription.id,
        customerName: subscription.customer?.name || 'Unknown',
        success: false,
        error: error.message
      })
    }
  }

  const successCount = results.filter(r => r.success).length
  const failureCount = results.filter(r => !r.success).length
  
  console.log(`Monday payment processing completed:`)
  console.log(`✅ ${successCount} notifications sent successfully`)
  console.log(`❌ ${failureCount} failed`)
  console.log(`🛡️ ${activeSubscriptions.length - subscriptionsNeedingPayment.length} skipped (recent payments)`)
  console.log(`Note: PhonePe will execute actual payments automatically within 24 hours`)
  
  return {
    date: today.toISOString(),
    totalFound: activeSubscriptions.length,
    totalProcessed: subscriptionsNeedingPayment.length,
    successCount,
    failureCount,
    skippedCount: activeSubscriptions.length - subscriptionsNeedingPayment.length,
    results,
    message: 'Monday payment notifications processed with duplicate prevention. PhonePe will execute payments within 24 hours.'
  }
}