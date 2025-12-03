import { NextRequest, NextResponse } from 'next/server'

// This is a server-side API route for the AI Costing Bot
// Uses the Parksons costing bot API with proper authentication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.indusanalytics.co.in'
const API_USERNAME = process.env.NEXT_PUBLIC_API_USERNAME || 'parksonsnew'
const API_PASSWORD = process.env.NEXT_PUBLIC_API_PASSWORD || 'parksonsnew'
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || '2'
const USER_ID = process.env.NEXT_PUBLIC_USER_ID || '2'

// Generate Basic Auth header
const getBasicAuth = () => {
  const credentials = Buffer.from(`${API_USERNAME}:${API_PASSWORD}`).toString('base64')
  return `Basic ${credentials}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, conversationId, phone, userId, companyId } = body

    const COSTING_BOT_ENDPOINT = `${API_BASE_URL}/api/parksons/costingbot`

    const payload = {
      message: message || '',
      newChat: false,
      conversationId: conversationId || 2,
      phone: phone || '9999999999'
    }

    // Use dynamic userId and companyId from request, fallback to env defaults
    const finalUserId = userId || USER_ID
    const finalCompanyId = companyId || COMPANY_ID

    const response = await fetch(COSTING_BOT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getBasicAuth(),
        'CompanyID': String(finalCompanyId),
        'UserID': String(finalUserId),
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        {
          error: `API error: ${response.status} ${response.statusText}`,
          details: errorText
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to connect to AI costing bot',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
