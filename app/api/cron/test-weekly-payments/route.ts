// app/api/cron/test-weekly-payments/route.ts - NEW FILE FOR TESTING
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { triggerWeeklyNotification } from '@/lib/phonepe/service'
import { generateOrderId } from '@/lib/utils'

// 🔥 TEST VERSION: Same logic as cron but bypasses Monday check
export async function POST(request: NextRequest) {
  try {
    const today = new Date()
    console.log(`🧪 TEST MODE: Running weekly payment processing on ${today.toDateString()}`)
    
    // Same logic as the real cron but without Monday restriction
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { lastDebitDate: null },
          { 
            lastDebitDate: { 
              lte: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
            } 
          }
        ]
      },
      include: {
        customer: true,
        payments: {
          where: {
            status: { in: ['SUCCESS', 'PENDING'] },
            createdAt: {
              gte: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    console.log(`🧪 Found ${activeSubscriptions.length} potential subscriptions for testing`)

    // Filter out subscriptions with recent payments
    const subscriptionsNeedingPayment = activeSubscriptions.filter(subscription => {
      if (subscription.payments.length > 0) {
        const recentPayment = subscription.payments[0]
        const daysSinceLastPayment = Math.floor(
          (Date.now() - recentPayment.createdAt.getTime()) / (24 * 60 * 60 * 1000)
        )
        
        if (daysSinceLastPayment < 6) {
          console.log(`🧪 Skipping ${subscription.customer.name} - payment already triggered ${daysSinceLastPayment} days ago`)
          return false
        }
      }
      return true
    })

    console.log(`🧪 After filtering: ${subscriptionsNeedingPayment.length} subscriptions need payment`)

    const results = []

    for (const subscription of subscriptionsNeedingPayment) {
      try {
        const merchantOrderId = generateOrderId()
        
        const result = await triggerWeeklyNotification(subscription.id, merchantOrderId)
        
        console.log(`🧪 ✅ Test notification sent for ${subscription.customer.name} - ₹${subscription.weeklyAmount}`)
        
        results.push({
          subscriptionId: subscription.id,
          customerName: subscription.customer.name,
          amount: subscription.weeklyAmount,
          success: true,
          paymentId: result.payment.id,
          message: 'TEST: Payment notification sent successfully'
        })
        
      } catch (error: any) {
        console.error(`🧪 ❌ Failed to process test payment for subscription ${subscription.id}:`, error)
        
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
    
    return NextResponse.json({
      success: true,
      testMode: true,
      date: today.toISOString(),
      totalFound: activeSubscriptions.length,
      totalProcessed: subscriptionsNeedingPayment.length,
      successCount,
      failureCount,
      skippedCount: activeSubscriptions.length - subscriptionsNeedingPayment.length,
      results,
      message: '🧪 TEST: Payment notifications processed with duplicate prevention. PhonePe will execute payments within 24 hours.'
    })
    
  } catch (error: any) {
    console.error('🧪 Test cron job error:', error)
    return NextResponse.json(
      { error: 'Failed to process test weekly payments', details: error.message },
      { status: 500 }
    )
  }
}