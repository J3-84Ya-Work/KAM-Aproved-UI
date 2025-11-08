// API Configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.indusanalytics.co.in',
  username: process.env.NEXT_PUBLIC_API_USERNAME || 'parksonsnew',
  password: process.env.NEXT_PUBLIC_API_PASSWORD || 'parksonsnew',
  companyId: process.env.NEXT_PUBLIC_COMPANY_ID || '2',
  userId: process.env.NEXT_PUBLIC_USER_ID || '2',
  fyear: process.env.NEXT_PUBLIC_FYEAR || '2025-2026',
  productionUnitId: process.env.NEXT_PUBLIC_PRODUCTION_UNIT_ID || '1',
}

// Safe base64 encoder available in both browser and Node
const btoaSafe = (str: string) => {
  if (typeof globalThis !== 'undefined' && typeof (globalThis as any).btoa === 'function') {
    return (globalThis as any).btoa(str)
  }

  // Node.js / server fallback
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str).toString('base64')
  }

  throw new Error('No base64 encoder available in this environment')
}

// Generate Basic Auth header
export const getAuthHeader = () => {
  const credentials = btoaSafe(`${API_CONFIG.username}:${API_CONFIG.password}`)
  return `Basic ${credentials}`
}

// Get default headers for API requests
export const getDefaultHeaders = () => ({
  'Authorization': getAuthHeader(),
  'CompanyID': API_CONFIG.companyId,
  'UserID': API_CONFIG.userId,
  'Fyear': API_CONFIG.fyear,
  'ProductionUnitID': API_CONFIG.productionUnitId,
  'Content-Type': 'application/json',
})

// API Client helper
export const apiClient = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_CONFIG.baseUrl}/${endpoint}`, {
      method: 'GET',
      headers: getDefaultHeaders(),
    })
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    // Get raw text first
    const text = await response.text()
    try {
      // Try to parse as JSON
      let data: any = JSON.parse(text)

      // Handle double-encoded JSON (API returns JSON string instead of JSON object)
      let parseCount = 0
      // Allow more attempts for heavily escaped/double-encoded responses
      while (typeof data === 'string' && parseCount < 10) {
        try {
          data = JSON.parse(data)
        } catch (err) {
          // If inner string is not valid JSON, stop unwrapping
          break
        }
        parseCount++
      }

      return data
    } catch (e) {
      // Surface parse errors with raw text for easier debugging
      throw new Error(`Failed to parse API response: ${(e as Error).message}. Raw response: ${text}`)
    }
  },

  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_CONFIG.baseUrl}/${endpoint}`, {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    // Get raw text first
    const text = await response.text()

    try {
      // Try to parse as JSON
      let responseData = JSON.parse(text)

      // Allow repeated unwrapping for string payloads
      let parseCount = 0
      while (typeof responseData === 'string' && parseCount < 10) {
        try {
          responseData = JSON.parse(responseData)
        } catch (err) {
          break
        }
        parseCount++
      }

      return responseData
    } catch (e) {
      console.error('Failed to parse response:', e, 'Raw text:', text)
      return null
    }
  },
}

// Helper: fetch carton types (carton type comes from planwindow/GetCategoryAllocatedContents/0)
export async function fetchCartonTypes() {
  // endpoint relative to baseUrl
  const endpoint = 'api/planwindow/GetCategoryAllocatedContents/0'
  return apiClient.get(endpoint)
}

// Helper: fetch all contents allocated to a category
export async function fetchCategoryContents(categoryId: string | number) {
  if (categoryId === undefined || categoryId === null || categoryId === '') {
    throw new Error('categoryId is required')
  }

  const endpoint = `api/planwindow/GetCategoryAllocatedContents/${categoryId}`
  return apiClient.get(endpoint)
}

// Helper: fetch qualities for a given content type
export async function fetchQualities(contentType: string) {
  if (!contentType) {
    throw new Error('contentType is required')
  }

  const endpoint = `api/planwindow/quality/${String(contentType)}`
  return apiClient.get(endpoint)
}

// Helper: fetch GSM options for a given contentType, quality and thickness
export async function fetchGSM(contentType: string, quality: string, thickness = '0') {
  if (!contentType) throw new Error('contentType is required')
  if (!quality) throw new Error('quality is required')

  const endpoint = `api/planwindow/gsm/${String(contentType)}/${String(quality)}/${String(thickness)}`
  return apiClient.get(endpoint)
}

// Stable wrapper expected by UI: getGsmAPI
// Returns an array normalized to [{ GSM, GSMID }, ...]
export async function getGsmAPI(contentType: string, quality: string, thickness = '0') {
  const res = await fetchGSM(contentType, quality, thickness)

  let items: any[] = []
  if (!res) return items
  if (Array.isArray(res)) items = res
  else if (res?.data && Array.isArray(res.data)) items = res.data
  else if (res?.Data && Array.isArray(res.Data)) items = res.Data
  else if (res?.d && Array.isArray(res.d)) items = res.d
  else if (typeof res === 'object') {
    const firstArray = Object.values(res).find((v) => Array.isArray(v))
    if (Array.isArray(firstArray)) items = firstArray as any[]
  }

  return items.map((it) => ({ GSM: it.GSM ?? it.gsm ?? it.GSMValue ?? it.value ?? String(it), GSMID: it.GSMID ?? it.GSMId ?? it.id ?? it.ID }))
}

// Helper: fetch Mill options for a given contentType, quality, gsm and thickness
export async function fetchMill(contentType: string, quality: string, gsm: string, thickness = '0') {
  if (!contentType) throw new Error('contentType is required')
  if (!quality) throw new Error('quality is required')
  if (!gsm) throw new Error('gsm is required')

  const endpoint = `api/planwindow/mill/${String(contentType)}/${String(quality)}/${String(gsm)}/${String(thickness)}`
  return apiClient.get(endpoint)
}

// Stable wrapper expected by UI: getMillAPI
// Returns an array normalized to [{ Mill, MillID }, ...]
export async function getMillAPI(contentType: string, quality: string, gsm: string, thickness = '0') {
  const res = await fetchMill(contentType, quality, gsm, thickness)

  let items: any[] = []
  if (!res) return items
  if (Array.isArray(res)) items = res
  else if (res?.data && Array.isArray(res.data)) items = res.data
  else if (res?.Data && Array.isArray(res.Data)) items = res.Data
  else if (res?.d && Array.isArray(res.d)) items = res.d
  else if (typeof res === 'object') {
    const firstArray = Object.values(res).find((v) => Array.isArray(v))
    if (Array.isArray(firstArray)) items = firstArray as any[]
  }

  return items.map((it) => ({ Mill: it.Mill ?? it.mill ?? it.Name ?? it.name ?? String(it), MillID: it.MillID ?? it.MillId ?? it.id ?? it.ID }))
}

// Helper: fetch Finish options for a given quality, gsm and mill
export async function fetchFinish(quality: string, gsm: string, mill: string) {
  if (!quality) throw new Error('quality is required')
  if (!gsm) throw new Error('gsm is required')
  if (!mill) throw new Error('mill is required')

  const endpoint = `api/planwindow/finish/${String(quality)}/${String(gsm)}/${String(mill)}`
  return apiClient.get(endpoint)
}

// Stable wrapper expected by UI: getFinishAPI
// Returns an array normalized to [{ Finish, FinishID }, ...]
export async function getFinishAPI(quality: string, gsm: string, mill: string) {
  const res = await fetchFinish(quality, gsm, mill)

  let items: any[] = []
  if (!res) return items
  if (Array.isArray(res)) items = res
  else if (res?.data && Array.isArray(res.data)) items = res.data
  else if (res?.Data && Array.isArray(res.Data)) items = res.Data
  else if (res?.d && Array.isArray(res.d)) items = res.d
  else if (typeof res === 'object') {
    const firstArray = Object.values(res).find((v) => Array.isArray(v))
    if (Array.isArray(firstArray)) items = firstArray as any[]
  }

  return items.map((it) => ({ Finish: it.Finish ?? it.finish ?? it.Name ?? it.name ?? String(it), FinishID: it.FinishID ?? it.FinishId ?? it.id ?? it.ID }))
}

// Stable wrapper expected by UI: getQualitiesAPI
// Returns an array of quality objects normalized to [{ Quality, QualityID }, ...]
export async function getQualitiesAPI(contentType: string) {
  const res = await fetchQualities(contentType)

  // Normalize various response shapes to an array
  let items: any[] = []
  if (!res) return items

  // Helper to repeatedly JSON.parse strings (unwrap multiple encoded layers)
  const unwrapJson = (input: any, maxDepth = 10): any => {
    let v = input
    let depth = 0
    while (typeof v === 'string' && depth < maxDepth) {
      try {
        v = JSON.parse(v)
      } catch (err) {
        break
      }
      depth++
    }
    return v
  }

  const r = unwrapJson(res)

  if (Array.isArray(r)) {
    items = r
  } else if (r && typeof r === 'object') {
    // Check common properties that may contain the array (possibly as a string)
    const candidates = ['data', 'Data', 'd', 'result', 'Result']
    for (const key of candidates) {
      if (key in r) {
        const val = unwrapJson((r as any)[key])
        if (Array.isArray(val)) {
          items = val
          break
        }
      }
    }

    // If still empty, try unwrapping each value of the object to find the first array
    if (items.length === 0) {
      for (const val of Object.values(r)) {
        const uv = unwrapJson(val)
        if (Array.isArray(uv)) {
          items = uv as any[]
          break
        }
      }
    }
  }

  // Final fallback: if we still have no items, try to coerce a string representation
  if (items.length === 0 && typeof res === 'string') {
    const maybe = unwrapJson(res)
    if (Array.isArray(maybe)) items = maybe
  }

  // Map to objects with at least Quality and QualityID when possible
  return items.map((it) => ({ Quality: it.Quality ?? it.quality ?? it.Name ?? it.name, QualityID: it.QualityID ?? it.QualityId ?? it.id ?? it.ID }))
}

// Helper: fetch operations for a domain type (LoadOperations)
export async function fetchLoadOperations(domainType: string, processPurpose?: string) {
  if (!domainType) throw new Error('domainType is required')
  const qp = processPurpose ? `?ProcessPurpose=${String(processPurpose)}` : ''
  const endpoint = `api/planwindow/LoadOperations/${String(domainType)}${qp}`
  return apiClient.get(endpoint)
}

// Stable wrapper: getLoadOperationsAPI
// Normalizes to array of operations like [{ ProcessID, ProcessName, DisplayProcessName, Rate, ... }]
export async function getLoadOperationsAPI(domainType: string, processPurpose?: string) {
  const res = await fetchLoadOperations(domainType, processPurpose)

  let items: any[] = []
  if (!res) return items
  if (Array.isArray(res)) items = res
  else if (res?.data && Array.isArray(res.data)) items = res.data
  else if (res?.Data && Array.isArray(res.Data)) items = res.Data
  else if (res?.d && Array.isArray(res.d)) items = res.d
  else if (typeof res === 'object') {
    const firstArray = Object.values(res).find((v) => Array.isArray(v))
    if (Array.isArray(firstArray)) items = firstArray as any[]
  }

  // If items look like objects or strings, coerce to stable shape
  return items.map((it) => ({
    ProcessID: it.ProcessID ?? it.ProcessId ?? it.id ?? it.ID,
    ProcessName: it.ProcessName ?? it.DisplayProcessName ?? it.Name ?? it.name ?? String(it),
    DisplayProcessName: it.DisplayProcessName ?? it.ProcessName ?? it.Name,
    Rate: it.Rate ?? it.Rate1 ?? it.RatePer ?? null,
    ...it,
  }))
}

// Helper: fetch all machines
export async function fetchAllMachines() {
  const endpoint = `api/planwindow/getallmachines`
  return apiClient.get(endpoint)
}

// Stable wrapper: getAllMachinesAPI
export async function getAllMachinesAPI() {
  const res = await fetchAllMachines()

  let items: any[] = []
  if (!res) return items
  if (Array.isArray(res)) items = res
  else if (res?.data && Array.isArray(res.data)) items = res.data
  else if (res?.Data && Array.isArray(res.Data)) items = res.Data
  else if (res?.d && Array.isArray(res.d)) items = res.d
  else if (typeof res === 'object') {
    const firstArray = Object.values(res).find((v) => Array.isArray(v))
    if (Array.isArray(firstArray)) items = firstArray as any[]
  }

  return items.map((it) => ({ MachineID: it.MachineID ?? it.MachineId ?? it.id ?? it.ID, MachineName: it.MachineName ?? it.Name ?? it.name ?? String(it), ...it }))
}

// Helper: Post Shirin_Job planning request
export async function postShirinJob(payload: any) {
  // payload expected to be a plain object following API spec
  try {
    const res = await apiClient.post('api/planwindow/Shirin_Job', payload)
    // Normalize similar to other wrappers: if wrapper returns object with data array, unwrap
    if (!res) return []
    if (Array.isArray(res)) return res
    if (res?.data && Array.isArray(res.data)) return res.data
    if (res?.Data && Array.isArray(res.Data)) return res.Data
    if (res?.d && Array.isArray(res.d)) return res.d
    // Fall back: if object, try to find first array property
    if (typeof res === 'object') {
      const firstArray = Object.values(res).find((v) => Array.isArray(v))
      if (Array.isArray(firstArray)) return firstArray as any[]
    }
    // otherwise, return as single-element array
    return [res]
  } catch (err) {
    throw err
  }
}

// ============================================================================
// CLIENT MANAGEMENT APIs
// ============================================================================

// Helper: Fetch all clients
export async function fetchClients() {
  const endpoint = 'api/planwindow/GetSbClient'
  return apiClient.get(endpoint)
}

// Stable wrapper: getClientsAPI
// Returns normalized array of clients
export async function getClientsAPI() {
  const res = await fetchClients()

  let items: any[] = []
  if (!res) return items
  if (Array.isArray(res)) items = res
  else if (res?.data && Array.isArray(res.data)) items = res.data
  else if (res?.Data && Array.isArray(res.Data)) items = res.Data
  else if (res?.d && Array.isArray(res.d)) items = res.d
  else if (typeof res === 'object') {
    const firstArray = Object.values(res).find((v) => Array.isArray(v))
    if (Array.isArray(firstArray)) items = firstArray as any[]
  }

  return items.map((it) => ({
    ClientID: it.LedgerId ?? it.ClientID ?? it.ClientId ?? it.id,
    ClientName: it.LedgerName ?? it.ClientName ?? it.Name ?? it.name,
    GSTNo: it.Currency ?? it.GSTNo ?? it.GST ?? '',
    ...it,
  }))
}

// Helper: Create new client
export async function createClient(clientData: {
  ClientName: string
  GSTNo?: string
  Address?: string
  Phone?: string
  Email?: string
  [key: string]: any
}) {
  const endpoint = 'api/planwindow/CreateClient'
  return apiClient.post(endpoint, clientData)
}

// Helper: Update existing client
export async function updateClient(clientId: number | string, clientData: any) {
  const endpoint = `api/planwindow/UpdateClient/${clientId}`
  return apiClient.post(endpoint, clientData)
}

// ============================================================================
// JOB MANAGEMENT APIs
// ============================================================================

// Helper: Save job data
export async function saveJob(jobData: any) {
  const endpoint = 'api/planwindow/SaveJob'
  return apiClient.post(endpoint, jobData)
}

// Helper: Fetch saved jobs
export async function fetchJobs(filters?: { clientId?: number; status?: string }) {
  let endpoint = 'api/planwindow/GetJobs'
  if (filters) {
    const params = new URLSearchParams()
    if (filters.clientId) params.append('clientId', String(filters.clientId))
    if (filters.status) params.append('status', filters.status)
    if (params.toString()) endpoint += `?${params.toString()}`
  }
  return apiClient.get(endpoint)
}

// Helper: Fetch single job by ID
export async function fetchJobById(jobId: number | string) {
  const endpoint = `api/planwindow/GetJob/${jobId}`
  return apiClient.get(endpoint)
}

// Helper: Delete job
export async function deleteJob(jobId: number | string) {
  const endpoint = `api/planwindow/DeleteJob/${jobId}`
  return apiClient.post(endpoint, {})
}

// ============================================================================
// QUOTATION/COSTING APIs
// ============================================================================

// Helper: Save quotation with costing
export async function saveQuotation(quotationData: {
  jobId?: number
  clientId?: number
  clientName?: string
  jobName?: string
  quantities?: Array<{ qty: number; costs: any }>
  selectedPlan?: any
  totalCost?: number
  [key: string]: any
}) {
  const endpoint = 'api/planwindow/SaveQuotation'
  return apiClient.post(endpoint, quotationData)
}

// Helper: Fetch quotations
export async function fetchQuotations(filters?: { clientId?: number; status?: string }) {
  let endpoint = 'api/planwindow/GetQuotations'
  if (filters) {
    const params = new URLSearchParams()
    if (filters.clientId) params.append('clientId', String(filters.clientId))
    if (filters.status) params.append('status', filters.status)
    if (params.toString()) endpoint += `?${params.toString()}`
  }
  return apiClient.get(endpoint)
}

// Helper: Fetch single quotation by ID
export async function fetchQuotationById(quotationId: number | string) {
  const endpoint = `api/planwindow/GetQuotation/${quotationId}`
  return apiClient.get(endpoint)
}

// Helper: Convert quotation to order
export async function convertQuotationToOrder(quotationId: number | string) {
  const endpoint = `api/planwindow/ConvertToOrder/${quotationId}`
  return apiClient.post(endpoint, {})
}

// ============================================================================
// DIE/TOOLING APIs
// ============================================================================

// Helper: Fetch die details
export async function fetchDieDetails(dieId: number | string) {
  const endpoint = `api/planwindow/GetDie/${dieId}`
  return apiClient.get(endpoint)
}

// Helper: Search dies by dimensions
export async function searchDies(dimensions: {
  height?: number
  length?: number
  width?: number
  tolerance?: number
}) {
  const endpoint = 'api/planwindow/SearchDies'
  return apiClient.post(endpoint, dimensions)
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Helper: Normalize API response to array
export function normalizeToArray(res: any): any[] {
  let items: any[] = []
  if (!res) return items
  if (Array.isArray(res)) items = res
  else if (res?.data && Array.isArray(res.data)) items = res.data
  else if (res?.Data && Array.isArray(res.Data)) items = res.Data
  else if (res?.d && Array.isArray(res.d)) items = res.d
  else if (typeof res === 'object') {
    const firstArray = Object.values(res).find((v) => Array.isArray(v))
    if (Array.isArray(firstArray)) items = firstArray as any[]
  }
  return items
}
