// Chat API integration for AI Costing Bot

// Use the local API route as a proxy to avoid CORS and mixed content issues
const API_BASE_URL = '/api/chat'

export interface ChatMessage {
  message: string
  conversationId?: number
  phone?: string
  newChat?: boolean
}

export interface ApiResponse {
  success: boolean
  data?: any
  error?: string
}

/**
 * Send a message to the AI Costing Bot
 * @param message - The message text to send
 * @param conversationId - Conversation ID (default: 2)
 * @param phone - Phone number of the sender (default: '9999999999')
 * @returns Promise with the API response
 */
export async function sendMessage(
  message: string,
  conversationId: number = 2,
  phone: string = '9999999999'
): Promise<ApiResponse> {
  try {
    const payload = {
      message,
      newChat: false,
      conversationId,
      phone,
    }

    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.error || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    return {
      success: true,
      data: data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

