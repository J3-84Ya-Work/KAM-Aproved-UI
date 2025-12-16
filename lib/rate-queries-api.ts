import { logger } from "@/lib/logger"
// Rate Queries API Configuration - Using proxy to bypass CORS
const RATE_API_BASE_URL = '/api/rate-request'

interface RateRequest {
  requestId?: number
  requestorId: number
  department: string
  requestMessage: string
  userId?: number
  rate?: number | string
  status?: string
  createdAt?: string
  respondedAt?: string
  requestorName?: string
}

interface CreateRateRequestPayload {
  requestorId: number
  department: 'Purchase' | 'Operations' | 'Sales'
  requestMessage: string
  ItemCode?: string
  ItemID?: string
  ItemName?: string
  PlantID?: string
}

interface ProvideRatePayload {
  requestId: number
  userId: number
  rate: string
}

// Fetch all rate requests
export async function getAllRateRequests(): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const response = await fetch(`${RATE_API_BASE_URL}?path=/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data?.message || data?.error || 'Failed to fetch rate requests'
      }
    }

    return {
      success: true,
      data: Array.isArray(data) ? data : (data?.data || [])
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error'
    }
  }
}

// Fetch rate requests for a specific user
export async function getUserRateRequests(userId: number): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const response = await fetch(`${RATE_API_BASE_URL}?path=/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data?.message || data?.error || 'Failed to fetch user rate requests'
      }
    }

    return {
      success: true,
      data: Array.isArray(data) ? data : (data?.data || [])
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error'
    }
  }
}

// Create a new rate request
export async function createRateRequest(payload: CreateRateRequestPayload): Promise<{ success: boolean; data?: any; error?: string }> {
  try {

    const response = await fetch(RATE_API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: '/create',
        ...payload
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data?.message || data?.error || 'Failed to create rate request'
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

// Provide rate for a request
export async function provideRate(payload: ProvideRatePayload): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    logger.log('Endpoint:', `${RATE_API_BASE_URL} (proxy to /provide-rate)`)
    logger.log('Body:', payload)

    const response = await fetch(RATE_API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: '/provide-rate',
        ...payload
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data?.message || data?.error || JSON.stringify(data) || 'Failed to provide rate'
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

// Manually escalate a request
export async function escalateRateRequest(requestId: number): Promise<{ success: boolean; data?: any; error?: string }> {
  try {

    const response = await fetch(RATE_API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: `/${requestId}/escalate`
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data?.message || data?.error || 'Failed to escalate request'
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

// Get request history/timeline
export async function getRequestHistory(requestId: number): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {

    const response = await fetch(`${RATE_API_BASE_URL}?path=/${requestId}/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result?.message || result?.error || 'Failed to fetch request history'
      }
    }

    return {
      success: result.success !== false,
      data: Array.isArray(result.data) ? result.data : (result.data ? [result.data] : [])
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error'
    }
  }
}
