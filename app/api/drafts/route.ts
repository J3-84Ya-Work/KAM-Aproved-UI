import { NextRequest, NextResponse } from 'next/server'
import { logger } from "@/lib/logger"

const API_BASE_URL = 'https://api.indusanalytics.co.in'
const API_USERNAME = 'parksonsnew'
const API_PASSWORD = 'parksonsnew'
const COMPANY_ID = '2'
const USER_ID = '2'
const PRODUCTION_UNIT_ID = '1'
const FINANCIAL_YEAR = '2025-2026'

// Generate Basic Auth header
const getBasicAuth = () => {
  const credentials = Buffer.from(`${API_USERNAME}:${API_PASSWORD}`).toString('base64')
  return `Basic ${credentials}`
}

export async function GET(request: NextRequest) {
  try {
    const headers: Record<string, string> = {
      'CompanyID': String(COMPANY_ID),
      'UserID': String(USER_ID),
      'ProductionUnitID': String(PRODUCTION_UNIT_ID),
      'FYear': String(FINANCIAL_YEAR),
      'Authorization': getBasicAuth(),
    }

    logger.log('=== DRAFTS API PROXY REQUEST ===')
    logger.log('Forwarding request to:', `${API_BASE_URL}/api/draftsystem/list`)
    logger.log('Headers:', headers)

    const response = await fetch(`${API_BASE_URL}/api/draftsystem/list`, {
      method: 'GET',
      headers: headers,
      credentials: 'include', // Include cookies in the request
      cache: 'no-store',
    })

    logger.log('Response Status:', response.status)
    logger.log('Response Headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      logger.error('API Error:', errorData)
      return NextResponse.json(
        {
          success: false,
          error: errorData?.Message || errorData?.error || `HTTP error! status: ${response.status}`,
          details: errorData
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    logger.log('Success, data length:', Array.isArray(data?.data) ? data.data.length : 0)

    return NextResponse.json(data)
  } catch (error) {
    logger.error('Proxy Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}
