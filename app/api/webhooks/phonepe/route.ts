// app/api/webhooks/phonepe/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, payload } = body

    console.log('Received PhonePe webhook:', event, payload)

    // Handle different event types
    switch (event) {
      case 'subscription.setup.order.completed':
        await prisma.subscription.update({
          where: { merchantSubscriptionId: payload.paymentFlow.merchantSubscriptionId },
          data: {
            status: 'ACTIVE',
            activatedAt: new Date(),
            scheduledForDebit: true,
            lastWebhookAt: new Date()
          }
        })
        break

      case 'subscription.setup.order.failed':
        await prisma.subscription.update({
          where: { merchantSubscriptionId: payload.paymentFlow.merchantSubscriptionId },
          data: {
            status: 'FAILED',
            lastWebhookAt: new Date()
          }
        })
        break

      case 'subscription.redemption.order.completed':
      case 'subscription.redemption.transaction.completed':
        if (payload.paymentDetails?.[0]?.transactionId) {
          // 🔥 FIXED: Find payment by merchantOrderId, then update transactionId
          await prisma.payment.update({
            where: { merchantOrderId: payload.merchantOrderId },
            data: {
              transactionId: payload.paymentDetails[0].transactionId,
              status: 'SUCCESS',
              webhookReceivedAt: new Date()
            }
          })

          // Update subscription's lastDebitDate to prevent duplicates
          const payment = await prisma.payment.findUnique({
            where: { merchantOrderId: payload.merchantOrderId },
            include: { subscription: true }
          })

          if (payment) {
            await prisma.subscription.update({
              where: { id: payment.subscriptionId },
              data: {
                lastDebitDate: new Date(),
                nextDebitDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next week
              }
            })
          }
        }
        break

      case 'subscription.redemption.order.failed':
      case 'subscription.redemption.transaction.failed':
        if (payload.paymentDetails?.[0]?.transactionId) {
          // 🔥 FIXED: Find payment by merchantOrderId, then update transactionId
          await prisma.payment.update({
            where: { merchantOrderId: payload.merchantOrderId },
            data: {
              transactionId: payload.paymentDetails[0].transactionId,
              status: 'FAILED',
              webhookReceivedAt: new Date()
            }
          })
          // Note: Don't update lastDebitDate for failed payments
        }
        break

      case 'subscription.cancelled':
        await prisma.subscription.update({
          where: { merchantSubscriptionId: payload.merchantSubscriptionId },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
            lastWebhookAt: new Date()
          }
        })
        break

      case 'subscription.paused':
        await prisma.subscription.update({
          where: { merchantSubscriptionId: payload.merchantSubscriptionId },
          data: {
            status: 'PAUSED',
            scheduledForDebit: false,
            lastWebhookAt: new Date()
          }
        })
        break

      case 'subscription.unpaused':
        await prisma.subscription.update({
          where: { merchantSubscriptionId: payload.merchantSubscriptionId },
          data: {
            status: 'ACTIVE',
            scheduledForDebit: true,
            lastWebhookAt: new Date()
          }
        })
        break
    }

    return NextResponse.json({ success: true, message: 'Webhook processed' })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}