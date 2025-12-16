// Chat API integration for AI Costing Bot

// Use the local API route as a proxy to avoid CORS and mixed content issues
const API_BASE_URL = '/api/chat'

// Direct API URL for conversations and messages
const DIRECT_API_BASE_URL = 'https://api.indusanalytics.co.in/api/parksons'

export interface ChatMessage {
  message: string
  conversationId?: number
  phone?: string
  newChat?: boolean
  userId?: string | number
  companyId?: string | number
}

export interface ApiResponse {
  success: boolean
  data?: any
  error?: string
}

/**
 * Get user authentication data from localStorage
 */
function getUserAuthData() {
  if (typeof window === 'undefined') return null

  try {
    const authData = localStorage.getItem('userAuth')
    if (authData) {
      return JSON.parse(authData)
    }
  } catch (error) {
    console.error('Error reading user auth data:', error)
  }
  return null
}

/**
 * Send a message to the AI Costing Bot
 * @param message - The message text to send
 * @param conversationId - Conversation ID (default: 2)
 * @param phone - Phone number of the sender (default: '9999999999')
 * @param newChat - Whether this is a new chat (default: false)
 * @returns Promise with the API response
 */
export async function sendMessage(
  message: string,
  conversationId: number = 2,
  phone: string = '9999999999',
  newChat: boolean = false
): Promise<ApiResponse> {
  try {
    // Get user credentials from localStorage
    const authData = getUserAuthData()

    const payload = {
      message,
      newChat,
      conversationId,
      phone,
      // Include dynamic userId and companyId from logged-in user
      userId: authData?.userId,
      companyId: authData?.companyId,
    }

    console.log('💬 SENDING MESSAGE - Auth Data:', authData)
    console.log('💬 SENDING MESSAGE - userId:', authData?.userId, 'companyId:', authData?.companyId)
    console.log('💬 SENDING MESSAGE - Full Payload:', payload)

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

// Helper: Get auth header for direct API calls
const getAuthHeader = () => {
  const credentials = btoa('Parksonsnew:Parksonsnew')
  return `Basic ${credentials}`
}

// Helper: Get common headers for direct API
const getDirectHeaders = (userId: string = '2', companyId: string = '2') => {
  return {
    'Content-Type': 'application/json',
    'Authorization': getAuthHeader(),
    'CompanyID': companyId,
    'UserID': userId,
  }
}

export interface Conversation {
  conversationId: number
  userId: number
  userName?: string
  title?: string
  lastMessage?: string
  lastMessageTime?: string
  createdAt?: string
  updatedAt?: string
}

export interface Message {
  messageId: number
  conversationId: number
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  createdAt?: string
}

/**
 * Get all conversations for a user
 */
export async function getConversations(userId: string = '2', companyId: string = '2'): Promise<{ success: boolean; data?: Conversation[]; error?: string }> {
  try {
    console.log('[Chat API] Fetching conversations with userId:', userId, 'companyId:', companyId)
    console.log('[Chat API] URL:', `${DIRECT_API_BASE_URL}/conversations`)
    console.log('[Chat API] Headers:', getDirectHeaders(userId, companyId))

    const response = await fetch(`${DIRECT_API_BASE_URL}/conversations`, {
      method: 'GET',
      headers: getDirectHeaders(userId, companyId),
    })

    console.log('[Chat API] Response status:', response.status, response.statusText)

    const rawData = await response.json()
    console.log('[Chat API] Raw response data:', rawData)

    if (!response.ok) {
      return {
        success: false,
        error: rawData?.message || rawData?.error || 'Failed to fetch conversations'
      }
    }

    // Normalize the data to match our Conversation interface
    const dataArray = Array.isArray(rawData) ? rawData : (rawData?.data || [])

    console.log('[Chat API] First item from array:', dataArray[0])
    console.log('[Chat API] All field names in first item:', dataArray[0] ? Object.keys(dataArray[0]) : 'No items')

    const normalizedData = dataArray.map((item: any) => {
      const normalized = {
        conversationId: item.conversationId || item.id || item.conversation_id || item.ConversationId,
        userId: item.userId || item.user_id || item.UserId,
        userName: item.userName || item.user_name || item.UserName,
        title: item.title || item.Title || item.name || item.Name || item.topic || item.Topic,
        lastMessage: item.lastMessage || item.last_message || item.LastMessage || item.recentMessage,
        lastMessageTime: item.lastMessageTime || item.last_message_time || item.LastMessageTime || item.lastUpdated,
        createdAt: item.createdAt || item.created_at || item.CreatedAt,
        updatedAt: item.updatedAt || item.updated_at || item.UpdatedAt,
      }
      console.log('[Chat API] Normalized item:', normalized, 'from original:', item)
      return normalized
    })

    console.log('[Chat API] Final normalized data:', normalizedData)

    return {
      success: true,
      data: normalizedData
    }
  } catch (error: any) {
    console.error('[Chat API] Error fetching conversations:', error)
    return {
      success: false,
      error: error.message || 'Network error'
    }
  }
}

/**
 * Get messages for a specific conversation
 */
export async function getMessages(conversationId: number, userId: string = '2', companyId: string = '2'): Promise<{ success: boolean; data?: Message[]; error?: string }> {
  try {
    console.log('[Chat API] Fetching messages for conversationId:', conversationId, 'userId:', userId, 'companyId:', companyId)
    console.log('[Chat API] URL:', `${DIRECT_API_BASE_URL}/messages/${conversationId}`)

    const response = await fetch(`${DIRECT_API_BASE_URL}/messages/${conversationId}`, {
      method: 'GET',
      headers: getDirectHeaders(userId, companyId),
    })

    console.log('[Chat API] Messages response status:', response.status, response.statusText)

    const rawData = await response.json()
    console.log('[Chat API] Messages raw response data:', rawData)

    if (!response.ok) {
      return {
        success: false,
        error: rawData?.message || rawData?.error || 'Failed to fetch messages'
      }
    }

    // Normalize the data to match our Message interface
    const dataArray = Array.isArray(rawData) ? rawData : (rawData?.data || [])
    const normalizedData = dataArray.map((item: any) => ({
      messageId: item.messageId || item.id || item.message_id || item.MessageId,
      conversationId: item.conversationId || item.conversation_id || item.ConversationId || conversationId,
      role: item.role || item.Role || (item.sender === 'user' ? 'user' : 'assistant'),
      content: item.content || item.message || item.Content || item.Message || '',
      timestamp: item.timestamp || item.created_at || item.createdAt || item.Timestamp || new Date().toISOString(),
      createdAt: item.createdAt || item.created_at || item.CreatedAt,
    }))

    console.log('[Chat API] Messages normalized data:', normalizedData)

    return {
      success: true,
      data: normalizedData
    }
  } catch (error: any) {
    console.error('[Chat API] Error fetching messages:', error)
    return {
      success: false,
      error: error.message || 'Network error'
    }
  }
}

/**
 * Send message to costing bot (direct API)
 */
export async function sendCostingBotMessage(payload: any, userId: string = '2', companyId: string = '2'): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch(`${DIRECT_API_BASE_URL}/costingbot`, {
      method: 'POST',
      headers: getDirectHeaders(userId, companyId),
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data?.message || data?.error || 'Failed to send message'
      }
    }

    return {
      success: true,
      data
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error'
    }
  }
}

/**
 * Direct costing API
 */
export async function directCosting(payload: any, userId: string = '2', companyId: string = '2'): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch(`${DIRECT_API_BASE_URL}/directcosting`, {
      method: 'POST',
      headers: getDirectHeaders(userId, companyId),
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data?.message || data?.error || 'Failed to process direct costing'
      }
    }

    return {
      success: true,
      data
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error'
    }
  }
}
