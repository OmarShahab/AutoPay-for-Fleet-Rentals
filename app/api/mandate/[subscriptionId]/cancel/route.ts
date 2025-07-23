import { NextRequest, NextResponse } from 'next/server'
import { cancelMandate } from '@/lib/phonepe/service'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ subscriptionId: string }> }
) {
  try {
    const { subscriptionId } = await params
    const phonepeResponse = await cancelMandate(subscriptionId)

    return NextResponse.json({
      success: true,
      message: 'Mandate cancelled successfully',
      phonepeResponse
    })

  } catch (error: any) {
    console.error('Cancel mandate error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to cancel mandate',
        details: error.response?.data || error.message 
      },
      { status: 500 }
    )
  }
}