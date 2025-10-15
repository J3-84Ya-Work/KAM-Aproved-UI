// Chat API integration for webhook handler
import { getApiEndpoint, getDefaultPhone, getDefaultWid } from './chat-config'

// Use the local API route as a proxy to avoid CORS and mixed content issues
// In production (Vercel), this will be /api/chat
// In development, this will be http://localhost:3000/api/chat
const API_BASE_URL = '/api/chat'

export interface ChatMessage {
  phone: string
  message: string
  wid: string
  attachment?: string
}

export interface ApiResponse {
  success: boolean
  data?: any
  error?: string
}

/**
 * Send a message to the chat engine API
 * @param message - The message text to send
 * @param phone - Phone number of the sender (default: '626323361')
 * @param wid - WhatsApp ID (default: '919131299381')
 * @param attachment - Optional attachment URL
 * @returns Promise with the API response
 */
export async function sendMessage(
  message: string,
  phone: string = getDefaultPhone(),
  wid: string = getDefaultWid(),
  attachment: string = ''
): Promise<ApiResponse> {
  try {
    const payload = {
      type: 'incoming',
      data: {
        phone,
        message,
        wid,
        attachment,
      },
    }

    console.log('Sending message to API:', API_BASE_URL)
    console.log('Payload:', payload)

    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    console.log('Response status:', response.status)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Response data:', data)

    // The API returns a simple string directly, not an object
    // So we normalize it to always return the response in a consistent format
    return {
      success: true,
      data: typeof data === 'string' ? { message: data } : data,
    }
  } catch (error) {
    console.error('Error sending message to chat API:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Send a message with attachment
 */
export async function sendMessageWithAttachment(
  message: string,
  attachment: string,
  phone?: string,
  wid?: string
): Promise<ApiResponse> {
  return sendMessage(message, phone, wid, attachment)
}
