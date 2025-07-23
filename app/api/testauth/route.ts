import { NextResponse } from 'next/server'
import axios from 'axios'

export async function GET() {
  try {
    console.log('Testing PhonePe auth token...')
    
    const params = new URLSearchParams({
      client_id: 'LILYPADUAT_2506101138034',
      client_version: '1',
      client_secret: 'NmU4MzUzNjEtM2VjMy00Nzk0LWE0YmItMDQ5MGJmNmNiMzU5',
      grant_type: 'client_credentials'
    })

    console.log('Calling PhonePe API...')
    
    const response = await axios.post(
      'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token',
      params,
      { 
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded' 
        },
        timeout: 30000 // 30 second timeout
      }
    )

    console.log('PhonePe API response:', response.data)

    return NextResponse.json({
      success: true,
      token: response.data.access_token,
      expires_at: response.data.expires_at,
      full_response: response.data
    })
  } catch (error: any) {
    console.error('PhonePe API error:', error.response?.data || error.message)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      status: error.response?.status,
      phonepe_response: error.response?.data,
      stack: error.stack
    }, { status: 500 })
  }
}