// AI Costing Bot Configuration
export const CHAT_API_CONFIG = {
  // Default values for AI Costing Bot requests
  defaults: {
    phone: '9999999999',
    conversationId: 2,
    newChat: false,
  },

  // Request configuration
  timeout: 30000, // 30 seconds
  retries: 3,
}

// You can override these values by setting environment variables:
// NEXT_PUBLIC_CHAT_API_PHONE
// NEXT_PUBLIC_CHAT_CONVERSATION_ID

export function getDefaultPhone(): string {
  return process.env.NEXT_PUBLIC_CHAT_API_PHONE || CHAT_API_CONFIG.defaults.phone
}

export function getDefaultConversationId(): number {
  return Number(process.env.NEXT_PUBLIC_CHAT_CONVERSATION_ID) || CHAT_API_CONFIG.defaults.conversationId
}
