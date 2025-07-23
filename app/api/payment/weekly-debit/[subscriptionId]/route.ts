// app/api/payment/weekly-debit/[subscriptionId]/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from 'next/server'
import { triggerWeeklyNotification } from '@/lib/phonepe/service'
import { generateOrderId } from '@/lib/utils'
import { prisma } from '@/lib/prisma'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ subscriptionId: string }> }
) {
  try {
    const { subscriptionId } = await params
    
    // 🔥 CRITICAL FIX: Check for recent payments to prevent duplicates
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
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

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    if (subscription.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Subscription is not active' },
        { status: 400 }
      )
    }

    // Check if payment was made recently
    if (subscription.payments.length > 0) {
      const recentPayment = subscription.payments[0]
      const daysSinceLastPayment = Math.floor(
        (Date.now() - recentPayment.createdAt.getTime()) / (24 * 60 * 60 * 1000)
      )
      
      if (daysSinceLastPayment < 6) {
        return NextResponse.json({
          error: `Payment was already triggered ${daysSinceLastPayment} days ago. Please wait until next Monday.`,
          lastPaymentDate: recentPayment.createdAt,
          daysSinceLastPayment
        }, { status: 400 })
      }
    }

    const merchantOrderId = generateOrderId()

    // Trigger notification - PhonePe will auto-execute after 24 hours
    const result = await triggerWeeklyNotification(subscriptionId, merchantOrderId)

    return NextResponse.json({
      success: true,
      ...result,
      message: 'Payment notification sent successfully. PhonePe will execute the payment automatically after 24 hours.'
    })

  } catch (error: any) {
    console.error('Weekly debit notification error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to trigger weekly payment notification',
        details: error.response?.data || error.message 
      },
      { status: 500 }
    )
  }
}