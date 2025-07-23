import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isDebitDue, getDaysUntilMonday } from '@/lib/utils'

export async function GET() {
  try {
    const subscriptions = await prisma.subscription.findMany({
      include: {
        customer: true,
        _count: {
          select: { payments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const enrichedSubscriptions = subscriptions.map(sub => ({
      ...sub,
      isDebitDue: sub.status === 'ACTIVE' && isDebitDue(sub.lastDebitDate),
      daysUntilNextDebit: getDaysUntilMonday()
    }))

    return NextResponse.json({ success: true, subscriptions: enrichedSubscriptions })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions', details: error.message },
      { status: 500 }
    )
  }
}