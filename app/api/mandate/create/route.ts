import { NextRequest, NextResponse } from 'next/server'
import { createMandate } from '@/lib/phonepe/service'
import { sendMandateEmail } from '@/lib/email/service'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, weeklyAmount, frequency = 'WEEKLY' } = body

    if (!customerId || !weeklyAmount) {
      return NextResponse.json(
        { error: 'Customer ID and weekly amount are required' },
        { status: 400 }
      )
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    const { subscription, phonepeResponse } = await createMandate({
      customerId,
      weeklyAmount,
      frequency
    })

    // Send email with mandate URL
    // if (customer.email && subscription.mandateUrl) {
    //   await sendMandateEmail(customer.email, customer.name, subscription.mandateUrl)
    // }

    return NextResponse.json({
      success: true,
      subscription,
      phonepeResponse,
      message: 'Mandate creation initiated. Email sent with authorization link.'
    })

  } catch (error: any) {
    console.error('Mandate creation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create mandate',
        details: error.response?.data || error.message 
      },
      { status: 500 }
    )
  }
}