import { NextRequest, NextResponse } from 'next/server'
import https from 'https'
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    logger.log('🔐 Login proxy - Request body:', body)

    const requestBody = JSON.stringify(body)

    // Use native https module to allow GET with body
    const result = await new Promise<string>((resolve, reject) => {
      const options = {
        hostname: 'api.indusanalytics.co.in',
        path: '/api/GetLoginDetails',
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + Buffer.from('parksonsnew:parksonsnew').toString('base64'),
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestBody),
        },
      }

      const req = https.request(options, (res) => {
        let data = ''

        res.on('data', (chunk) => {
          data += chunk
        })

        res.on('end', () => {
          logger.log('📊 Login proxy - Response status:', res.statusCode)
          logger.log('📊 Login proxy - Response:', data)
          resolve(data)
        })
      })

      req.on('error', (error) => {
        logger.error('❌ Login proxy request error:', error)
        reject(error)
      })

      // Send the body with GET request
      req.write(requestBody)
      req.end()
    })

    return new NextResponse(result, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error: any) {
    logger.error('❌ Login proxy error:', error)
    return NextResponse.json(
      { error: 'Login failed', message: error.message },
      { status: 500 }
    )
  }
}
