import { NextRequest, NextResponse } from 'next/server'
import { processWeeklyPayments } from '@/lib/cron/weekly-payments'

// Add GET handler for Vercel cron
export async function GET(request: NextRequest) {
  return handleCronRequest(request)
}

// Keep POST for manual triggers
export async function POST(request: NextRequest) {
  return handleCronRequest(request)
}

async function handleCronRequest(request: NextRequest) {
  try {
    // Optional: Add security check
    // const authHeader = request.headers.get('authorization')
    // const cronSecret = process.env.CRON_SECRET
    
    // if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }
    
    const results = await processWeeklyPayments()
    
    return NextResponse.json({
      success: true,
      message: 'Weekly payments processed',
      results
    })
  } catch (error: any) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Failed to process weekly payments', details: error.message },
      { status: 500 }
    )
  }
}