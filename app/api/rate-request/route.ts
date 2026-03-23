import { NextRequest, NextResponse } from 'next/server'
import { getPool, sql } from '@/lib/db'
import { logger } from '@/lib/logger'
import { sendRateRequestEmail } from '@/lib/email'

// GET /api/rate-request — list all rate requests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || null
    const department = searchParams.get('department') || null
    const fromDate = searchParams.get('fromDate') || null
    const toDate = searchParams.get('toDate') || null

    const pool = await getPool()
    const result = await pool.request()
      .input('Status', sql.NVarChar(50), status)
      .input('Department', sql.NVarChar(100), department)
      .input('FromDate', sql.DateTime, fromDate ? new Date(fromDate) : null)
      .input('ToDate', sql.DateTime, toDate ? new Date(toDate) : null)
      .execute('SP_GetAllRateRequests')

    return NextResponse.json(result.recordset || [])
  } catch (error: any) {
    logger.error('GET /api/rate-request error:', error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/rate-request — create a new rate request + send email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      requestorId,
      department,
      requestMessage,
      assignedToEmail,
      assignedToUserId,
      ItemCode,
      ItemID,
      ItemName,
      PlantID,
      ItemGroupID,
      items,
    } = body

    if (!requestorId || !department || !requestMessage) {
      return NextResponse.json(
        { success: false, error: 'requestorId, department, and requestMessage are required' },
        { status: 400 }
      )
    }

    const pool = await getPool()

    // Create the rate request via stored procedure
    const result = await pool.request()
      .input('RequestorId', sql.Int, requestorId)
      .input('Department', sql.NVarChar(100), department)
      .input('RequestMessage', sql.NVarChar(sql.MAX), requestMessage)
      .input('ItemCode', sql.NVarChar(100), ItemCode || '')
      .input('ItemID', sql.NVarChar(100), ItemID || '')
      .input('ItemName', sql.NVarChar(500), ItemName || '')
      .input('PlantID', sql.NVarChar(50), PlantID || '0')
      .input('ItemGroupID', sql.Int, ItemGroupID || 0)
      .output('NewRequestId', sql.Int)
      .output('RequestNumber', sql.NVarChar(50))
      .execute('SP_CreateRateRequest')

    const created = result.recordset?.[0] || {
      RequestId: result.output?.NewRequestId,
      RequestNumber: result.output?.RequestNumber,
    }

    if (!created?.RequestId && !result.output?.NewRequestId) {
      return NextResponse.json({ success: false, error: 'Failed to create rate request' }, { status: 500 })
    }

    const requestId = created.RequestId || result.output?.NewRequestId
    const requestNumber = created.RequestNumber || result.output?.RequestNumber
    logger.log('✅ Rate request created:', requestId, requestNumber)

    // Override the responsible person to the specifically selected user
    // (SP assigns via escalation matrix, but user explicitly chose this person)
    if (assignedToUserId) {
      try {
        await pool.request()
          .input('RequestId', sql.Int, requestId)
          .input('AssignedUserId', sql.Int, assignedToUserId)
          .query('UPDATE RateRequests SET CurrentResponsibleUserId = @AssignedUserId WHERE RequestId = @RequestId')
        logger.log('✅ Assigned request to specific user:', assignedToUserId)
      } catch (assignErr: any) {
        logger.error('⚠️ Failed to assign to specific user (non-blocking):', assignErr.message)
      }
    }

    // Send email notification to the assigned person
    if (assignedToEmail) {
      try {
        // Get requestor name
        const requestorResult = await pool.request()
          .input('UserId', sql.Int, requestorId)
          .query('SELECT FullName, Email FROM Users WHERE UserId = @UserId')
        const requestorName = requestorResult.recordset?.[0]?.FullName || 'A team member'

        // Parse request message for email details
        const lines = requestMessage.split('\n')
        let itemGroups = '-', qualities = '-', gsmRanges = '-', mills = '', productionUnits = '-', question = requestMessage
        for (const line of lines) {
          if (line.startsWith('Item Groups:')) itemGroups = line.replace('Item Groups:', '').trim()
          if (line.startsWith('Qualities:')) qualities = line.replace('Qualities:', '').trim()
          if (line.startsWith('GSM Ranges:')) gsmRanges = line.replace('GSM Ranges:', '').trim()
          if (line.startsWith('Mill:')) mills = line.replace('Mill:', '').trim()
          if (line.startsWith('Production Units:')) productionUnits = line.replace('Production Units:', '').trim()
          if (line.startsWith('Question:')) question = line.replace('Question:', '').trim()
        }

        // Get assigned user name
        const assignedResult = await pool.request()
          .input('Email', sql.NVarChar(255), assignedToEmail)
          .query('SELECT FullName FROM Users WHERE Email = @Email AND IsActive = 1')
        const assignedName = assignedResult.recordset?.[0]?.FullName || assignedToEmail.split('@')[0]

        await sendRateRequestEmail({
          to: assignedToEmail,
          toName: assignedName,
          fromName: requestorName,
          itemGroups,
          qualities,
          gsmRanges,
          mills,
          productionUnits,
          question,
          itemCount: items?.length || 0,
        })

        logger.log('📧 Rate request email sent to:', assignedToEmail)
      } catch (emailErr: any) {
        logger.error('📧 Email notification failed (non-blocking):', emailErr.message)
      }
    }

    return NextResponse.json({
      success: true,
      data: created,
      requestId,
      requestNumber,
    })
  } catch (error: any) {
    logger.error('POST /api/rate-request error:', error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
