import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { sendRateRequestEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, toName, fromName, itemGroups, qualities, gsmRanges, mills, productionUnits, question, itemCount } = body

    if (!to || !toName || !fromName) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
    }

    logger.log('📧 Sending rate request email to:', to)

    await sendRateRequestEmail({
      to,
      toName,
      fromName,
      itemGroups: itemGroups || '-',
      qualities: qualities || '-',
      gsmRanges: gsmRanges || '-',
      mills: mills || '',
      productionUnits: productionUnits || '-',
      question: question || '-',
      itemCount: itemCount || 0,
    })

    return NextResponse.json({ success: true, message: 'Email sent successfully' })
  } catch (error: any) {
    logger.error('Send rate email error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to send email' },
      { status: 500 }
    )
  }
}
