import { logger } from '@/lib/logger'

const GRAPH_CONFIG = {
  tenantId: process.env.GRAPH_TENANT_ID || '',
  clientId: process.env.GRAPH_CLIENT_ID || '',
  clientSecret: process.env.GRAPH_CLIENT_SECRET || '',
  mailboxAddress: process.env.GRAPH_MAILBOX_ADDRESS || '',
  senderEmail: process.env.GRAPH_SENDER_EMAIL || '',
}

let cachedToken: { token: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 5 min buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 300000) {
    return cachedToken.token
  }

  const tokenUrl = `https://login.microsoftonline.com/${GRAPH_CONFIG.tenantId}/oauth2/v2.0/token`

  const body = new URLSearchParams({
    client_id: GRAPH_CONFIG.clientId,
    client_secret: GRAPH_CONFIG.clientSecret,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials',
  })

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!response.ok) {
    const errorText = await response.text()
    logger.error('Failed to get Graph API token:', errorText)
    throw new Error(`Failed to get access token: ${response.status}`)
  }

  const data = await response.json()
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in * 1000),
  }

  return data.access_token
}

interface SendOtpEmailParams {
  to: string
  userName: string
  otpCode: string
  expiresInMinutes?: number
}

export async function sendOtpEmail({ to, userName, otpCode, expiresInMinutes = 5 }: SendOtpEmailParams) {
  if (!GRAPH_CONFIG.tenantId || !GRAPH_CONFIG.clientId || !GRAPH_CONFIG.clientSecret) {
    throw new Error('Microsoft Graph API credentials are not configured')
  }

  const senderEmail = GRAPH_CONFIG.senderEmail || GRAPH_CONFIG.mailboxAddress
  // Use sender email as mailbox if mailbox address is invalid
  const mailboxAddress = GRAPH_CONFIG.mailboxAddress || senderEmail

  if (!mailboxAddress) {
    throw new Error('GRAPH_MAILBOX_ADDRESS is not configured')
  }

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 0;">
      <div style="background: linear-gradient(135deg, #005180 0%, #78BE20 100%); padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">ParkBuddy</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Parksons Packaging Ltd.</p>
      </div>
      <div style="background: #ffffff; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none;">
        <p style="color: #374151; font-size: 16px; margin: 0 0 8px;">Hello <strong>${userName}</strong>,</p>
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px; line-height: 1.6;">
          You requested to reset your password. Use the verification code below to proceed.
        </p>
        <div style="background: #f3f4f6; border: 2px dashed #005180; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px;">
          <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #005180; font-family: 'Courier New', monospace;">
            ${otpCode}
          </div>
        </div>
        <p style="color: #6b7280; font-size: 13px; margin: 0 0 24px; line-height: 1.5;">
          This code expires in <strong>${expiresInMinutes} minutes</strong>. If you did not request this, please ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
          This is an automated message from ParkBuddy. Do not reply to this email.
        </p>
      </div>
      <div style="background: #f9fafb; padding: 16px 24px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
        <p style="color: #9ca3af; font-size: 11px; margin: 0;">
          &copy; ${new Date().getFullYear()} Parksons Packaging Ltd. All rights reserved.
        </p>
      </div>
    </div>
  `

  const token = await getAccessToken()

  const sendMailUrl = `https://graph.microsoft.com/v1.0/users/${mailboxAddress}/sendMail`

  const mailPayload = {
    message: {
      subject: `${otpCode} — Your ParkBuddy Password Reset Code`,
      body: {
        contentType: 'HTML',
        content: html,
      },
      from: {
        emailAddress: {
          address: senderEmail,
          name: 'ParkBuddy',
        },
      },
      toRecipients: [
        {
          emailAddress: {
            address: to,
          },
        },
      ],
    },
    saveToSentItems: true,
  }

  const response = await fetch(sendMailUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mailPayload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    logger.error('Graph API sendMail failed:', errorText)
    throw new Error(`Failed to send email: ${response.status} - ${errorText}`)
  }

  logger.log('📧 OTP email sent via Graph API to:', to)
  return { messageId: `graph-${Date.now()}`, to }
}

// ─── Generic Graph Email ────────────────────────────────────────────

interface SendGraphEmailParams {
  to: string
  subject: string
  html: string
}

export async function sendGraphEmail({ to, subject, html }: SendGraphEmailParams) {
  if (!GRAPH_CONFIG.tenantId || !GRAPH_CONFIG.clientId || !GRAPH_CONFIG.clientSecret) {
    throw new Error('Microsoft Graph API credentials are not configured')
  }

  const senderEmail = GRAPH_CONFIG.senderEmail || GRAPH_CONFIG.mailboxAddress
  const mailboxAddress = GRAPH_CONFIG.mailboxAddress || senderEmail

  if (!mailboxAddress) {
    throw new Error('GRAPH_MAILBOX_ADDRESS is not configured')
  }

  const token = await getAccessToken()
  const sendMailUrl = `https://graph.microsoft.com/v1.0/users/${mailboxAddress}/sendMail`

  const mailPayload = {
    message: {
      subject,
      body: { contentType: 'HTML', content: html },
      from: { emailAddress: { address: senderEmail, name: 'ParkBuddy' } },
      toRecipients: [{ emailAddress: { address: to } }],
    },
    saveToSentItems: true,
  }

  const response = await fetch(sendMailUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mailPayload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    logger.error('Graph API sendMail failed:', errorText)
    throw new Error(`Failed to send email: ${response.status} - ${errorText}`)
  }

  logger.log('📧 Email sent via Graph API to:', to)
  return { messageId: `graph-${Date.now()}`, to }
}

// ─── Rate Request Email ─────────────────────────────────────────────

interface SendRateRequestEmailParams {
  to: string
  toName: string
  fromName: string
  itemGroups: string
  qualities: string
  gsmRanges: string
  mills?: string
  productionUnits: string
  question: string
  itemCount: number
}

export async function sendRateRequestEmail(params: SendRateRequestEmailParams) {
  if (!GRAPH_CONFIG.tenantId || !GRAPH_CONFIG.clientId || !GRAPH_CONFIG.clientSecret) {
    throw new Error('Microsoft Graph API credentials are not configured')
  }

  const senderEmail = GRAPH_CONFIG.senderEmail || GRAPH_CONFIG.mailboxAddress
  const mailboxAddress = GRAPH_CONFIG.mailboxAddress || senderEmail

  if (!mailboxAddress) {
    throw new Error('GRAPH_MAILBOX_ADDRESS is not configured')
  }

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 0;">
      <div style="background: linear-gradient(135deg, #005180 0%, #78BE20 100%); padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">ParkBuddy</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Parksons Packaging Ltd.</p>
      </div>
      <div style="background: #ffffff; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none;">
        <p style="color: #374151; font-size: 16px; margin: 0 0 8px;">Hello <strong>${params.toName}</strong>,</p>
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 20px; line-height: 1.6;">
          <strong>${params.fromName}</strong> has requested a rate for the following items:
        </p>

        <div style="background: #f0f7ff; border: 1px solid #005180; border-radius: 10px; padding: 16px; margin: 0 0 20px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="color: #005180; font-weight: 600; padding: 4px 8px 4px 0; vertical-align: top; width: 120px;">Item Group</td>
              <td style="color: #1f2937; padding: 4px 0;">${params.itemGroups}</td>
            </tr>
            <tr>
              <td style="color: #005180; font-weight: 600; padding: 4px 8px 4px 0; vertical-align: top;">Quality</td>
              <td style="color: #1f2937; padding: 4px 0;">${params.qualities}</td>
            </tr>
            <tr>
              <td style="color: #005180; font-weight: 600; padding: 4px 8px 4px 0; vertical-align: top;">GSM Range</td>
              <td style="color: #1f2937; padding: 4px 0;">${params.gsmRanges}</td>
            </tr>
            ${params.mills ? `<tr>
              <td style="color: #005180; font-weight: 600; padding: 4px 8px 4px 0; vertical-align: top;">Mill</td>
              <td style="color: #1f2937; padding: 4px 0;">${params.mills}</td>
            </tr>` : ''}
            <tr>
              <td style="color: #005180; font-weight: 600; padding: 4px 8px 4px 0; vertical-align: top;">Production Unit</td>
              <td style="color: #1f2937; padding: 4px 0;">${params.productionUnits}</td>
            </tr>
            <tr>
              <td style="color: #005180; font-weight: 600; padding: 4px 8px 4px 0; vertical-align: top;">Total Items</td>
              <td style="color: #1f2937; padding: 4px 0;">${params.itemCount}</td>
            </tr>
          </table>
        </div>

        <div style="background: #fefce8; border: 1px solid #eab308; border-radius: 10px; padding: 16px; margin: 0 0 20px;">
          <p style="color: #854d0e; font-size: 12px; font-weight: 600; margin: 0 0 4px;">Question</p>
          <p style="color: #1f2937; font-size: 14px; margin: 0; line-height: 1.5;">${params.question}</p>
        </div>

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" bgcolor="#005180" style="border-radius: 8px;">
                    <a href="https://parkbuddy.ai/ask-rate"
                       target="_blank"
                       style="display: inline-block; padding: 14px 40px; font-family: 'Segoe UI', Arial, sans-serif; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px; background-color: #005180;">
                      Answer Query
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <p style="color: #6b7280; font-size: 13px; margin: 0 0 24px; line-height: 1.5; text-align: center;">
          Click the button above to review and respond to this rate request on <strong>ParkBuddy</strong>.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
          This is an automated notification from ParkBuddy. Do not reply to this email.
        </p>
      </div>
      <div style="background: #f9fafb; padding: 16px 24px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
        <p style="color: #9ca3af; font-size: 11px; margin: 0;">
          &copy; ${new Date().getFullYear()} Parksons Packaging Ltd. All rights reserved.
        </p>
      </div>
    </div>
  `

  const token = await getAccessToken()

  const sendMailUrl = `https://graph.microsoft.com/v1.0/users/${mailboxAddress}/sendMail`

  const mailPayload = {
    message: {
      subject: `Rate Request from ${params.fromName} — ${params.itemGroups} / ${params.qualities}`,
      body: {
        contentType: 'HTML',
        content: html,
      },
      from: {
        emailAddress: {
          address: senderEmail,
          name: 'ParkBuddy',
        },
      },
      toRecipients: [
        {
          emailAddress: {
            address: params.to,
          },
        },
      ],
    },
    saveToSentItems: true,
  }

  const response = await fetch(sendMailUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mailPayload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    logger.error('Graph API sendMail (rate request) failed:', errorText)
    throw new Error(`Failed to send email: ${response.status} - ${errorText}`)
  }

  logger.log('📧 Rate request email sent via Graph API to:', params.to)
  return { messageId: `graph-${Date.now()}`, to: params.to }
}
