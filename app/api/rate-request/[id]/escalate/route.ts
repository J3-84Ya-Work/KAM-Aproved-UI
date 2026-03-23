import { NextRequest, NextResponse } from 'next/server'
import { getPool, sql } from '@/lib/db'
import { logger } from '@/lib/logger'
import { sendGraphEmail } from '@/lib/email'

// POST /api/rate-request/[id]/escalate — escalate a request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const requestId = parseInt(id)

    const pool = await getPool()
    const result = await pool.request()
      .input('RequestId', sql.Int, requestId)
      .execute('SP_EscalateRequest')

    const data = result.recordset?.[0]

    if (!data) {
      return NextResponse.json({ success: false, error: 'Failed to escalate request' }, { status: 500 })
    }

    logger.log('⚠️ Request escalated:', requestId, 'to level', data.CurrentLevel)

    // Send escalation email to the new responsible person
    try {
      const reqResult = await pool.request()
        .input('RequestId', sql.Int, requestId)
        .query(`
          SELECT r.RequestNumber, r.RequestMessage, r.ItemName, r.CurrentLevel,
                 r.CurrentResponsibleUserId,
                 u.FullName AS ResponsibleName, u.Email AS ResponsibleEmail,
                 u2.FullName AS RequestorName
          FROM RateRequests r
          JOIN Users u ON r.CurrentResponsibleUserId = u.UserId
          JOIN Users u2 ON r.RequestorId = u2.UserId
          WHERE r.RequestId = @RequestId
        `)

      const req = reqResult.recordset?.[0]
      if (req?.ResponsibleEmail) {
        const levelNames: Record<number, string> = { 1: 'Purchase Department', 2: 'HOD', 3: 'Vertical Head' }
        const levelName = levelNames[req.CurrentLevel] || `Level ${req.CurrentLevel}`

        const html = `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #B92221 0%, #8B0000 100%); padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: #fff; margin: 0; font-size: 24px;">ParkBuddy</h1>
              <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Escalation Alert</p>
            </div>
            <div style="background: #fff; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none;">
              <div style="background: #fef2f2; border: 1px solid #B92221; border-radius: 10px; padding: 16px; margin: 0 0 20px;">
                <p style="color: #991b1b; font-size: 14px; font-weight: 600; margin: 0;">
                  ⚠️ Rate Request ${req.RequestNumber} has been escalated to ${levelName}
                </p>
              </div>
              <p style="color: #374151; font-size: 16px; margin: 0 0 8px;">Hello <strong>${req.ResponsibleName}</strong>,</p>
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 20px;">
                A rate request from <strong>${req.RequestorName}</strong> has been escalated to you due to SLA breach.
              </p>
              ${req.ItemName ? `<p style="color: #6b7280; font-size: 13px; margin: 0 0 16px;">Item: <strong>${req.ItemName}</strong></p>` : ''}
              <p style="color: #6b7280; font-size: 13px;">Please log in to <strong>ParkBuddy</strong> to provide the rate immediately.</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
              <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">This is an automated escalation notification.</p>
            </div>
            <div style="background: #f9fafb; padding: 16px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="color: #9ca3af; font-size: 11px; margin: 0;">&copy; ${new Date().getFullYear()} Parksons Packaging Ltd.</p>
            </div>
          </div>
        `

        await sendGraphEmail({
          to: req.ResponsibleEmail,
          subject: `⚠️ Escalated — ${req.RequestNumber} — Action Required`,
          html,
        })
        logger.log('📧 Escalation email sent to:', req.ResponsibleEmail)
      }
    } catch (emailErr: any) {
      logger.error('📧 Escalation email failed (non-blocking):', emailErr.message)
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    logger.error('POST /api/rate-request/[id]/escalate error:', error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
