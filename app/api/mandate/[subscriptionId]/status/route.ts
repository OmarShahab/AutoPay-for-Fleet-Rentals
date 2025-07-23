import { NextRequest, NextResponse } from 'next/server'
import { checkMandateStatus } from '@/lib/phonepe/service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subscriptionId: string }> }
) {
  try {
    const { subscriptionId } = await params
    const phonepeResponse = await checkMandateStatus(subscriptionId)

    return NextResponse.json({
      success: true,
      subscriptionId,
      status: phonepeResponse.state,
      phonepeResponse
    })

  } catch (error: any) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check mandate status',
        details: error.response?.data || error.message 
      },
      { status: 500 }
    )
  }
}