import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all customers
export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ success: true, customers })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch customers', details: error.message },
      { status: 500 }
    )
  }
}

// POST create customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, upiId, email, phone } = body

    if (!name || !upiId || !email) {
      return NextResponse.json(
        { error: 'Name, UPI ID, and email are required' },
        { status: 400 }
      )
    }

    // Check if customer with this UPI ID already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { upiId }
    })

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer with this UPI ID already exists' },
        { status: 400 }
      )
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        upiId,
        email,
        phone
      }
    })

    return NextResponse.json({ success: true, customer })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create customer', details: error.message },
      { status: 500 }
    )
  }
}