import { NextRequest, NextResponse } from 'next/server'
import { API_CONFIG, getAuthHeader } from '@/lib/api-config'
import { logger } from '@/lib/logger'
import { sendOtpEmail } from '@/lib/email'

async function postToBackend(endpoint: string, body: any) {
  const response = await fetch(`${API_CONFIG.baseUrl}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json',
      'CompanyID': API_CONFIG.companyId,
      'UserID': API_CONFIG.userId,
      'Fyear': API_CONFIG.fyear,
      'ProductionUnitID': API_CONFIG.productionUnitId,
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

    // Step 1: Generate OTP via C# backend, then send email ourselves
    if (action === 'generate') {
      const { email, userName } = body
      if (!email) {
        return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 })
      }

      logger.log('🔑 Password reset: generating OTP for', email)

      // Generate OTP from C# backend
      const result = await postToBackend('api/CommanApis/generate-otp', {
        Email: email,
        IPAddress: 'Server',
        UserAgent: 'ParkBuddy Web',
      })

      if (!result.success) {
        return NextResponse.json(result)
      }

      // Send OTP email via Microsoft Graph API
      const otpCode = result.data?.otpCode
      const expiresInMinutes = Math.floor((result.data?.validitySeconds || 300) / 60)

      if (otpCode) {
        try {
          await sendOtpEmail({
            to: email,
            userName: userName || email.split('@')[0],
            otpCode: String(otpCode),
            expiresInMinutes,
          })
          logger.log('📧 OTP email sent successfully to', email)
        } catch (emailErr: any) {
          logger.error('📧 Failed to send OTP email:', emailErr.message, emailErr.stack)
          return NextResponse.json({ success: false, message: `OTP generated but failed to send email: ${emailErr.message}` })
        }
      }

      // Don't expose OTP code to the frontend
      return NextResponse.json({
        success: true,
        message: `Verification code sent to ${email}`,
        data: { otpId: result.data?.otpId, validitySeconds: result.data?.validitySeconds },
      })
    }

    // Step 2: Validate OTP
    if (action === 'validate') {
      const { email, otpCode } = body
      if (!email || !otpCode) {
        return NextResponse.json({ success: false, message: 'Email and OTP code are required' }, { status: 400 })
      }

      logger.log('🔑 Password reset: validating OTP for', email)

      const result = await postToBackend('api/CommanApis/validate-otp', {
        Email: email,
        OTPCode: otpCode,
      })

      return NextResponse.json(result)
    }

    // Step 3: Reset password
    if (action === 'reset') {
      const { email, otpCode, newPassword } = body
      if (!email || !otpCode || !newPassword) {
        return NextResponse.json({ success: false, message: 'Email, OTP code, and new password are required' }, { status: 400 })
      }

      logger.log('🔑 Password reset: resetting password for', email)

      const result = await postToBackend('api/CommanApis/reset-password', {
        Email: email,
        OTPCode: otpCode,
        NewPassword: newPassword,
      })

      return NextResponse.json(result)
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    logger.error('Password reset API error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Server error. Please try again.' },
      { status: 500 }
    )
  }
}
