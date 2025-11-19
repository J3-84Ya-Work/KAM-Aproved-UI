// Drafts API integration for Draft System

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.indusanalytics.co.in'
const API_USERNAME = process.env.NEXT_PUBLIC_API_USERNAME || 'parksonsnew'
const API_PASSWORD = process.env.NEXT_PUBLIC_API_PASSWORD || 'parksonsnew'
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || '2'
const USER_ID = process.env.NEXT_PUBLIC_USER_ID || '2'
const PRODUCTION_UNIT_ID = process.env.NEXT_PUBLIC_PRODUCTION_UNIT_ID || '1'
const FINANCIAL_YEAR = process.env.NEXT_PUBLIC_FINANCIAL_YEAR || '2025-2026'

// Generate Basic Auth header
const getBasicAuth = () => {
  const credentials = btoa(`${API_USERNAME}:${API_PASSWORD}`)
  return `Basic ${credentials}`
}

export interface DraftRecord {
  DraftID: number
  DraftName: string
  Module: string
  CreatedAt: string
  UpdatedAt: string
  IsAutoSave: boolean
  UserID: number
  CompanyID: number
  // Legacy fields for backward compatibility
  inquiryNo?: string
  jobType?: string
  inputType?: string
  updatedAt?: string
  owner?: string
  customerId?: number
  customerName?: string
  createdAt?: string
  status?: string
}

export interface DraftsApiResponse {
  success: boolean
  data?: DraftRecord[]
  error?: string
}

/**
 * Fetch all draft inquiries from the API
 * @returns Promise with the API response containing draft records
 */
export async function getAllDrafts(): Promise<DraftsApiResponse> {
  try {
    // TEMPORARY: Try direct API call to test if it's a server-side blocking issue
    // This will test if requests from browser work but server-side requests don't
    const USE_DIRECT_API = true // Set to false to use proxy

    const endpoint = USE_DIRECT_API
      ? `${API_BASE_URL}/api/draftsystem/list`
      : '/api/drafts'

    console.log('=== DRAFTS API REQUEST ===')
    console.log('Endpoint:', endpoint)
    console.log('Method: GET')
    console.log('Mode:', USE_DIRECT_API ? 'Direct (from browser)' : 'Proxy (from server)')
    console.log('========================')

    const headers: Record<string, string> = USE_DIRECT_API
      ? {
          'CompanyID': COMPANY_ID,
          'UserID': USER_ID,
          'ProductionUnitID': PRODUCTION_UNIT_ID,
          'FYear': FINANCIAL_YEAR,
          'Authorization': getBasicAuth(),
        }
      : {
          'Content-Type': 'application/json',
        }

    console.log('Headers:', headers)

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: headers,
      credentials: USE_DIRECT_API ? 'include' : 'same-origin', // Include cookies for authentication
      cache: 'no-store', // Ensure fresh data on each request
    })

    console.log('=== DRAFTS API RESPONSE ===')
    console.log('Status:', response.status, response.statusText)
    console.log('OK:', response.ok)

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.log('Error Data:', errorData)
      console.log('===========================')
      throw new Error(errorData?.error || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Response Data:', data)
    console.log('Data Type:', Array.isArray(data) ? 'Array' : typeof data)
    console.log('===========================')

    // Handle different response formats
    if (Array.isArray(data)) {
      console.log('✓ Returning array data, length:', data.length)
      return {
        success: true,
        data: data,
      }
    } else if (data.data && Array.isArray(data.data)) {
      console.log('✓ Returning nested data.data array, length:', data.data.length)
      return {
        success: true,
        data: data.data,
      }
    } else if (data.success && data.data) {
      console.log('✓ Returning data.data with success flag')
      return {
        success: true,
        data: Array.isArray(data.data) ? data.data : [data.data],
      }
    }

    console.log('⚠ No data found in response, returning empty array')
    return {
      success: true,
      data: [],
    }
  } catch (error) {
    console.error('=== DRAFTS API ERROR ===')
    console.error('Error:', error)
    console.error('Error Message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('⚠️ NOTE: If you see "ConnectionString" errors, the backend API may need to whitelist your server IP')
    console.error('========================')
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Load a specific draft by ID
 * @param draftId - The ID of the draft to load
 * @returns Promise with the draft data
 */
export async function loadDraft(draftId: number): Promise<any> {
  try {
    const endpoint = `${API_BASE_URL}/api/draftsystem/load/${draftId}`

    console.log('[Load Draft API] Endpoint:', endpoint)
    console.log('[Load Draft API] Draft ID:', draftId)

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'CompanyID': COMPANY_ID,
        'UserID': USER_ID,
        'ProductionUnitID': PRODUCTION_UNIT_ID,
        'FYear': FINANCIAL_YEAR,
        'Authorization': getBasicAuth(),
      },
      credentials: 'include',
      cache: 'no-store',
    })

    console.log('[Load Draft API] Response status:', response.status)

    if (!response.ok) {
      throw new Error(`Failed to load draft: ${response.status}`)
    }

    const data = await response.json()
    console.log('[Load Draft API] Raw response:', data)
    console.log('[Load Draft API] Response keys:', Object.keys(data))

    return data
  } catch (error) {
    console.error('[Load Draft API] Error loading draft:', error)
    throw error
  }
}

/**
 * Save a new draft or update existing one
 * @param draftData - The draft data to save
 * @returns Promise with the save response
 */
export async function saveDraft(draftData: any): Promise<any> {
  try {
    const endpoint = `${API_BASE_URL}/api/draftsystem/save`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CompanyID': COMPANY_ID,
        'UserID': USER_ID,
        'ProductionUnitID': PRODUCTION_UNIT_ID,
        'FYear': FINANCIAL_YEAR,
        'Authorization': getBasicAuth(),
      },
      body: JSON.stringify(draftData),
      credentials: 'include',
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Failed to save draft: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error saving draft:', error)
    throw error
  }
}

/**
 * Rename a draft
 * @param draftId - The ID of the draft to rename
 * @param newName - The new name for the draft
 * @returns Promise with the rename response
 */
export async function renameDraft(draftId: number, newName: string): Promise<any> {
  try {
    const endpoint = `${API_BASE_URL}/api/draftsystem/rename/${draftId}`

    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'CompanyID': COMPANY_ID,
        'UserID': USER_ID,
        'ProductionUnitID': PRODUCTION_UNIT_ID,
        'FYear': FINANCIAL_YEAR,
        'Authorization': getBasicAuth(),
      },
      body: JSON.stringify({ newName }),
      credentials: 'include',
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Failed to rename draft: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error renaming draft:', error)
    throw error
  }
}

/**
 * Delete a draft
 * @param draftId - The ID of the draft to delete
 * @returns Promise with the delete response
 */
export async function deleteDraft(draftId: number): Promise<any> {
  try {
    const endpoint = `${API_BASE_URL}/api/draftsystem/${draftId}`

    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'CompanyID': COMPANY_ID,
        'UserID': USER_ID,
        'ProductionUnitID': PRODUCTION_UNIT_ID,
        'FYear': FINANCIAL_YEAR,
        'Authorization': getBasicAuth(),
      },
      credentials: 'include',
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Failed to delete draft: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error deleting draft:', error)
    throw error
  }
}

/**
 * Get mock draft data for development/testing
 * Use this as fallback when the API is unavailable
 */
export function getMockDrafts(): DraftRecord[] {
  return [
    {
      DraftID: 4,
      DraftName: "Quotation_Draft_07",
      Module: "Quotation",
      CreatedAt: "2025-11-19T12:16:15.893",
      UpdatedAt: "2025-11-19T12:16:15.893",
      IsAutoSave: false,
      UserID: 2,
      CompanyID: 2
    },
    {
      DraftID: 3,
      DraftName: "Quotation_Draft_03",
      Module: "Quotation",
      CreatedAt: "2025-11-19T12:15:47.8",
      UpdatedAt: "2025-11-19T12:15:47.8",
      IsAutoSave: false,
      UserID: 2,
      CompanyID: 2
    },
    {
      DraftID: 1,
      DraftName: "Quotation_Draft_01",
      Module: "Quotation",
      CreatedAt: "2025-11-18T17:19:05.853",
      UpdatedAt: "2025-11-19T12:15:14.7",
      IsAutoSave: false,
      UserID: 2,
      CompanyID: 2
    }
  ]
}
