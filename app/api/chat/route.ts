import { NextRequest, NextResponse } from 'next/server'

// This is a server-side API route that proxies requests to the external chat API
// This solves CORS issues and HTTP/HTTPS mixed content problems

const CHAT_API_ENDPOINT = process.env.NEXT_PUBLIC_CHAT_API_ENDPOINT || 'http://65.2.64.18:89/api/webhook/handler'

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request body
    const body = await request.json()

    console.log('Proxy: Forwarding request to chat API')
    console.log('Payload:', body)

    // Forward the request to the external chat API
    const response = await fetch(CHAT_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    console.log('Proxy: Response status:', response.status)

    if (!response.ok) {
      console.error('Proxy: API error:', response.statusText)
      return NextResponse.json(
        { error: `API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    // Get the response data
    const data = await response.json()
    console.log('Proxy: Response data:', data)

    // Return the response to the client
    return NextResponse.json(data)
  } catch (error) {
    console.error('Proxy: Error forwarding request:', error)
    return NextResponse.json(
      {
        error: 'Failed to connect to chat API',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
