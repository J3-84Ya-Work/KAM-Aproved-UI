/**
 * API functions for JDO/SDO/Commercial forms
 */

const API_BASE_URL = 'https://api.indusanalytics.co.in'

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
 * Get authentication headers
 */
function getAuthHeaders() {
  const authData = getUserAuthData()
  const username = process.env.NEXT_PUBLIC_API_USERNAME || 'parksonsnew'
  const password = process.env.NEXT_PUBLIC_API_PASSWORD || 'parksonsnew'
  const basicAuth = btoa(`${username}:${password}`)

  return {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${basicAuth}`,
    'CompanyID': String(authData?.companyId || '2'),
    'UserID': String(authData?.userId || '2'),
  }
}

export interface SaveFormRequest {
  FormType: 'JDO' | 'SDO' | 'Commercial'
  FormDataJSON: string
}

export interface UpdateFormRequest {
  ID: number
  FormType: 'JDO' | 'SDO' | 'Commercial'
  FormDataJSON: string
}

export interface DeleteFormRequest {
  ID: number
}

export interface GetFormsRequest {
  FormType: 'JDO' | 'SDO' | 'Commercial'
}

/**
 * Save a new form (JDO/SDO/Commercial)
 */
export async function saveForm(data: SaveFormRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/othermaster/save-JDO-SDO`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to save form: ${errorText}`)
    }

    const result = await response.text()
    return { success: true, message: result }
  } catch (error) {
    console.error('Error saving form:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Update an existing form
 */
export async function updateForm(data: UpdateFormRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/othermaster/update-JDO-SDO`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to update form: ${errorText}`)
    }

    const result = await response.text()
    return { success: true, message: result }
  } catch (error) {
    console.error('Error updating form:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Delete a form
 */
export async function deleteForm(data: DeleteFormRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/othermaster/delete-JDO-SDO`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to delete form: ${errorText}`)
    }

    const result = await response.text()
    return { success: true, message: result }
  } catch (error) {
    console.error('Error deleting form:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Get forms by type
 */
export async function getForms(data: GetFormsRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/othermaster/get-JDO-SDO`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to get forms: ${errorText}`)
    }

    const result = await response.json()
    return { success: true, data: result }
  } catch (error) {
    console.error('Error getting forms:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Get Production Units (Plants)
 */
export async function getProductionUnits() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/othermaster/getproductionunits`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to get production units: ${errorText}`)
    }

    let data = await response.json()

    // Handle double-encoded JSON string response
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data)
        // Check if it's still a string after first parse (triple-encoded)
        if (typeof data === 'string') {
          data = JSON.parse(data)
        }
      } catch (e) {
        // Parsing failed, use data as-is
      }
    }

    // Handle different response formats
    let units = []
    if (Array.isArray(data)) {
      units = data
    } else if (data.data && Array.isArray(data.data)) {
      units = data.data
    } else if (data.Data && Array.isArray(data.Data)) {
      units = data.Data
    }

    return { success: true, data: units }
  } catch (error) {
    console.error('Error getting production units:', error)
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Get Clients (Customers)
 */
export async function getClients() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/planwindow/GetSbClient`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to get clients: ${errorText}`)
    }

    let data = await response.json()

    // Handle double-encoded JSON string response
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data)
        // Check if it's still a string after first parse (triple-encoded)
        if (typeof data === 'string') {
          data = JSON.parse(data)
        }
      } catch (e) {
        // Parsing failed, use data as-is
      }
    }

    // Handle different response formats
    let clients = []
    if (Array.isArray(data)) {
      clients = data
    } else if (data.data && Array.isArray(data.data)) {
      clients = data.data
    } else if (data.Data && Array.isArray(data.Data)) {
      clients = data.Data
    }

    return { success: true, data: clients }
  } catch (error) {
    console.error('Error getting clients:', error)
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}
