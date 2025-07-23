import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all active mandates
    const activeMandates = await prisma.subscription.count({
      where: { status: 'ACTIVE' }
    })

    // Get pending payments for this week
    const monday = new Date()
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
    monday.setHours(0, 0, 0, 0)

    const pendingThisWeek = await prisma.subscription.count({
      where: {
        status: 'ACTIVE',
        OR: [
          { lastDebitDate: null },
          { lastDebitDate: { lt: monday } }
        ]
      }
    })

    // Get overdue payments (more than 1 week)
    const overduePayments = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        lastDebitDate: {
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        customer: true
      }
    })

    // Calculate weeks overdue
    const overdueWithWeeks = overduePayments.map(sub => {
      const weeksSinceLastPayment = sub.lastDebitDate 
        ? Math.floor((Date.now() - sub.lastDebitDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
        : Math.floor((Date.now() - sub.createdAt.getTime()) / (7 * 24 * 60 * 60 * 1000))
      
      return {
        ...sub,
        weeksOverdue: weeksSinceLastPayment
      }
    })

    // Get total collected this month
    const firstDayOfMonth = new Date()
    firstDayOfMonth.setDate(1)
    firstDayOfMonth.setHours(0, 0, 0, 0)

    const monthlyCollection = await prisma.payment.aggregate({
      where: {
        status: 'SUCCESS',
        createdAt: { gte: firstDayOfMonth }
      },
      _sum: {
        amount: true
      }
    })

    return NextResponse.json({
      success: true,
      stats: {
        activeMandates,
        pendingThisWeek,
        overdueCount: overduePayments.length,
        overdueSubscriptions: overdueWithWeeks,
        monthlyCollection: monthlyCollection._sum.amount || 0
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats', details: error.message },
      { status: 500 }
    )
  }
}