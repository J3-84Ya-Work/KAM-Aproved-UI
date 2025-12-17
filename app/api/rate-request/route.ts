import { NextRequest, NextResponse } from 'next/server'

// Proxy API route for Ask Rate requests to bypass CORS
// Use environment variable for production, fallback to localhost:5003 for development
const RATE_API_BASE_URL = process.env.RATE_API_BASE_URL || 'http://localhost:5003'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract the path after /api/rate-request
    const path = searchParams.get('path') || ''

    const url = `${RATE_API_BASE_URL}/api/raterequest${path}`

    console.log('🔄 RATE PROXY GET - URL:', url)
    console.log('🔄 RATE PROXY GET - Path param:', path)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('🔄 RATE PROXY GET - Response status:', response.status, response.statusText)

    const contentType = response.headers.get('content-type')
    console.log('🔄 RATE PROXY GET - Content-Type:', contentType)

    let data
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      const text = await response.text()
      console.log('🔄 RATE PROXY GET - Non-JSON response:', text)
      data = { error: 'Non-JSON response received', details: text }
    }

    console.log('🔄 RATE PROXY GET - Response data:', data)

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data?.message || data?.error || 'Request failed'
        },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('🔄 RATE PROXY GET - Error:', error)
    console.error('🔄 RATE PROXY GET - Error stack:', error instanceof Error ? error.stack : 'No stack')

    const errorMessage = error instanceof Error ? error.message : 'Network error'
    const isConnectionError = errorMessage.includes('ECONNREFUSED') || errorMessage.includes('fetch failed')

    return NextResponse.json(
      {
        success: false,
        error: isConnectionError
          ? `Cannot connect to Rate API at ${RATE_API_BASE_URL}. Please ensure the rate request service is running on port 5003.`
          : errorMessage
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { endpoint, ...payload } = body

    // Determine which endpoint to call
    const url = `${RATE_API_BASE_URL}/api/raterequest${endpoint}`

    console.log('🔄 RATE PROXY POST - URL:', url)
    console.log('🔄 RATE PROXY POST - Full Body Received:', body)
    console.log('🔄 RATE PROXY POST - Endpoint:', endpoint)
    console.log('🔄 RATE PROXY POST - Payload (without endpoint):', payload)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    console.log('🔄 RATE PROXY POST - Response status:', response.status, response.statusText)

    const contentType = response.headers.get('content-type')
    console.log('🔄 RATE PROXY POST - Content-Type:', contentType)

    let data
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      const text = await response.text()
      console.log('🔄 RATE PROXY POST - Non-JSON response:', text)
      data = { error: 'Non-JSON response received', details: text }
    }

    console.log('🔄 RATE PROXY POST - Response data:', data)

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data?.message || data?.error || 'Request failed'
        },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('🔄 RATE PROXY POST - Error:', error)
    console.error('🔄 RATE PROXY POST - Error stack:', error instanceof Error ? error.stack : 'No stack')

    const errorMessage = error instanceof Error ? error.message : 'Network error'
    const isConnectionError = errorMessage.includes('ECONNREFUSED') || errorMessage.includes('fetch failed')

    return NextResponse.json(
      {
        success: false,
        error: isConnectionError
          ? `Cannot connect to Rate API at ${RATE_API_BASE_URL}. Please ensure the rate request service is running on port 5003.`
          : errorMessage
      },
      { status: 500 }
    )
  }
}
