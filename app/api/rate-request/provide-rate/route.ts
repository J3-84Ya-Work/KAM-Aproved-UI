import { NextRequest, NextResponse } from 'next/server'
import { getPool, sql } from '@/lib/db'
import { logger } from '@/lib/logger'
import { sendGraphEmail } from '@/lib/email'

// POST /api/rate-request/provide-rate — provide a rate for a request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestId, userId, rate } = body

    if (!requestId || !userId || !rate) {
      return NextResponse.json(
        { success: false, error: 'requestId, userId, and rate are required' },
        { status: 400 }
      )
    }

    const pool = await getPool()
    const result = await pool.request()
      .input('RequestId', sql.Int, requestId)
      .input('UserId', sql.Int, userId)
      .input('Rate', sql.NVarChar(500), String(rate))
      .execute('SP_ProvideRate')

    const data = result.recordset?.[0]

    if (!data) {
      return NextResponse.json({ success: false, error: 'Failed to provide rate' }, { status: 500 })
    }

    logger.log('✅ Rate provided for request:', requestId, 'Rate:', rate)

    // Send email notification to the original requestor
    try {
      const requestResult = await pool.request()
        .input('RequestId', sql.Int, requestId)
        .query(`
          SELECT r.RequestorId, r.RequestNumber, r.RequestMessage, r.ItemName,
                 u.FullName AS RequestorName, u.Email AS RequestorEmail,
                 u2.FullName AS ProviderName
          FROM RateRequests r
          JOIN Users u ON r.RequestorId = u.UserId
          JOIN Users u2 ON u2.UserId = @RequestId
          WHERE r.RequestId = @RequestId
        `)

      // Fix: get provider name separately
      const providerResult = await pool.request()
        .input('UserId', sql.Int, userId)
        .query('SELECT FullName FROM Users WHERE UserId = @UserId')

      const req = requestResult.recordset?.[0]
      const providerName = providerResult.recordset?.[0]?.FullName || 'Purchase Team'

      if (req?.RequestorEmail) {
        const html = `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #78BE20 0%, #005180 100%); padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: #fff; margin: 0; font-size: 24px;">ParkBuddy</h1>
              <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Rate Request Fulfilled</p>
            </div>
            <div style="background: #fff; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="color: #374151; font-size: 16px; margin: 0 0 8px;">Hello <strong>${req.RequestorName}</strong>,</p>
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 20px;">
                Your rate request <strong>${req.RequestNumber}</strong> has been answered by <strong>${providerName}</strong>.
              </p>
              <div style="background: #f0fdf4; border: 2px solid #78BE20; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 20px;">
                <p style="color: #166534; font-size: 12px; margin: 0 0 4px;">Provided Rate</p>
                <p style="color: #166534; font-size: 28px; font-weight: 800; margin: 0;">${rate}</p>
              </div>
              ${req.ItemName ? `<p style="color: #6b7280; font-size: 13px; margin: 0 0 16px;">Item: <strong>${req.ItemName}</strong></p>` : ''}
              <p style="color: #6b7280; font-size: 13px;">Please log in to <strong>ParkBuddy</strong> to view the full details.</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
              <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">This is an automated notification from ParkBuddy.</p>
            </div>
            <div style="background: #f9fafb; padding: 16px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="color: #9ca3af; font-size: 11px; margin: 0;">&copy; ${new Date().getFullYear()} Parksons Packaging Ltd.</p>
            </div>
          </div>
        `

        await sendGraphEmail({
          to: req.RequestorEmail,
          subject: `Rate Provided — ${req.RequestNumber} — ${rate}`,
          html,
        })
        logger.log('📧 Rate provided email sent to requestor:', req.RequestorEmail)
      }
    } catch (emailErr: any) {
      logger.error('📧 Rate provided email failed (non-blocking):', emailErr.message)
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    logger.error('POST /api/rate-request/provide-rate error:', error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
