import { NextRequest, NextResponse } from 'next/server'
import https from 'https'
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const UserName = searchParams.get('username')
    const Password = searchParams.get('password')

    if (!UserName || !Password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

    logger.log('🔐 Login attempt for user:', UserName)

    // Use native https module with GET method and URL parameters
    const result = await new Promise<string>((resolve, reject) => {
      const options = {
        hostname: 'api.indusanalytics.co.in',
        path: `/api/auth/GetLoginDetails/${encodeURIComponent(UserName)}/${encodeURIComponent(Password)}`,
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + Buffer.from('parksonsnew:parksonsnew').toString('base64'),
          'Content-Type': 'application/json',
        },
      }

      const req = https.request(options, (res) => {
        let data = ''

        res.on('data', (chunk) => {
          data += chunk
        })

        res.on('end', () => {
          logger.log('📊 Login API response status:', res.statusCode)
          logger.log('📊 Login API response:', data)
          resolve(data)
        })
      })

      req.on('error', (error) => {
        logger.error('❌ Login API request error:', error)
        reject(error)
      })

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
