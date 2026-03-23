import { NextRequest, NextResponse } from 'next/server'
import { API_CONFIG, getAuthHeader } from '@/lib/api-config'
import { logger } from '@/lib/logger'

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  )
}

async function postToBackend(endpoint: string, body: any, userId?: string, companyId?: string, productionUnitId?: string, fYear?: string) {
  const response = await fetch(`${API_CONFIG.baseUrl}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json',
      'UserID': userId || API_CONFIG.userId,
      'CompanyID': companyId || API_CONFIG.companyId,
      'Fyear': fYear || API_CONFIG.fyear,
      'ProductionUnitID': productionUnitId || API_CONFIG.productionUnitId,
    },
    body: JSON.stringify(body),
  })

  const text = await response.text()
  logger.log(`📡 Backend response [${endpoint}]:`, text)
  try {
    let data = JSON.parse(text)
    if (typeof data === 'string') {
      try { data = JSON.parse(data) } catch {}
    }
    return data
  } catch {
    return { success: false, message: text }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'send' || action === 'resend') {
      const { deviceId, userId, companyId, productionUnitId, fYear } = body

      logger.log('📧 2FA send-otp | UserID:', userId, '| CompanyID:', companyId)

      const result = await postToBackend('api/2fa/send-otp', {
        deviceId: deviceId || 'web-login',
        ipAddress: getClientIP(request),
        userId: Number(userId),
        companyId: Number(companyId),
      }, String(userId), String(companyId), String(productionUnitId || ''), String(fYear || ''))

      return NextResponse.json(result)
    }

    if (action === 'verify') {
      const { otp, deviceId, deviceName, userId, companyId, productionUnitId, fYear } = body

      logger.log('🔐 2FA verify-otp | UserID:', userId)

      const result = await postToBackend('api/2fa/verify-otp', {
        otp,
        deviceId: deviceId || 'web-login',
        deviceName: deviceName || 'Web Browser',
        ipAddress: getClientIP(request),
        userId: Number(userId),
        companyId: Number(companyId),
      }, String(userId), String(companyId), String(productionUnitId || ''), String(fYear || ''))

      return NextResponse.json(result)
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    logger.error('2FA API error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Server error. Please try again.' },
      { status: 500 }
    )
  }
}
