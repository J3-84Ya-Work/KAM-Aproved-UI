// Chat API Configuration
export const CHAT_API_CONFIG = {
  // API endpoint
  endpoint: 'http://65.2.64.18:89/api/webhook/handler',

  // Default values for API requests
  defaults: {
    phone: '626323361',
    wid: '919131299381',
  },

  // Request configuration
  timeout: 30000, // 30 seconds
  retries: 3,
}

// You can override these values by setting environment variables:
// NEXT_PUBLIC_CHAT_API_ENDPOINT
// NEXT_PUBLIC_CHAT_API_PHONE
// NEXT_PUBLIC_CHAT_API_WID

export function getApiEndpoint(): string {
  return process.env.NEXT_PUBLIC_CHAT_API_ENDPOINT || CHAT_API_CONFIG.endpoint
}

export function getDefaultPhone(): string {
  return process.env.NEXT_PUBLIC_CHAT_API_PHONE || CHAT_API_CONFIG.defaults.phone
}

export function getDefaultWid(): string {
  return process.env.NEXT_PUBLIC_CHAT_API_WID || CHAT_API_CONFIG.defaults.wid
}
