import { NextRequest, NextResponse } from 'next/server'
import { getPool, sql } from '@/lib/db'
import { logger } from '@/lib/logger'

// GET /api/rate-request/user/[userId] — get requests for a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || null

    const pool = await getPool()
    const result = await pool.request()
      .input('UserId', sql.Int, parseInt(userId))
      .input('Status', sql.NVarChar(50), status)
      .execute('SP_GetRequestsByUserId')

    return NextResponse.json(result.recordset || [])
  } catch (error: any) {
    logger.error('GET /api/rate-request/user error:', error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
