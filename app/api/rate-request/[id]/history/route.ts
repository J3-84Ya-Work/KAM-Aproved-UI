import { NextRequest, NextResponse } from 'next/server'
import { getPool, sql } from '@/lib/db'
import { logger } from '@/lib/logger'

// GET /api/rate-request/[id]/history — get escalation history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const pool = await getPool()
    const result = await pool.request()
      .input('RequestId', sql.Int, parseInt(id))
      .execute('SP_GetEscalationHistory')

    return NextResponse.json({
      success: true,
      data: result.recordset || [],
    })
  } catch (error: any) {
    logger.error('GET /api/rate-request/[id]/history error:', error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
